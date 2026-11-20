// SPDX-License-Identifier: AGPL-3.0-only

// @vitest-environment node
import { createServer, request, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp, eventHandler, toNodeListener } from "h3";
import { readJsonBodyCapped } from "~/server/utils/read.body";

const MAX = 4096;

type Reply = { status: number; body: string };

let server: Server;
let port: number;

beforeAll(async () => {
  const app = createApp().use(
    "/",
    eventHandler(async event => ({ got: await readJsonBodyCapped(event, MAX) })),
  );
  server = createServer(toNodeListener(app));
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  port = (server.address() as AddressInfo).port;
});

afterAll(async () => {
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
});

// Real HTTP request. `chunks` without contentLength → Transfer-Encoding: chunked.
const send = (chunks: string[], contentLength?: number): Promise<Reply> =>
  new Promise((resolve, reject) => {
    const headers: Record<string, string | number> = { "content-type": "application/json" };
    if (contentLength !== undefined) { headers["content-length"] = contentLength; }
    const req = request(
      { host: "127.0.0.1", port, method: "POST", path: "/", headers },
      (res) => {
        let body = "";
        res.on("data", (c) => { body += c; });
        res.on("end", () => resolve({ status: res.statusCode || 0, body }));
      },
    );
    req.on("error", reject);
    // The server may answer 413 and close before the whole body is written.
    req.on("error", () => {});
    for (const c of chunks) { req.write(c); }
    req.end();
  });

describe("readJsonBodyCapped over a real request", () => {
  it("parses a small JSON body", async () => {
    const json = JSON.stringify({ a: 1 });
    const r = await send([json], Buffer.byteLength(json));
    expect(r.status).toBe(200);
    expect(JSON.parse(r.body)).toEqual({ got: { a: 1 } });
  });

  it("accepts exactly the limit", async () => {
    const json = JSON.stringify({ a: "x".repeat(MAX - 8) });
    expect(Buffer.byteLength(json)).toBe(MAX);
    const r = await send([json]);
    expect(r.status).toBe(200);
  });

  it("rejects Content-Length above the limit with 413", async () => {
    const json = JSON.stringify({ a: "x".repeat(MAX) });
    const r = await send([json], Buffer.byteLength(json));
    expect(r.status).toBe(413);
  });

  it("rejects a chunked body that grows past the limit with 413", async () => {
    const chunk = "x".repeat(1024);
    const r = await send(["{\"a\":\"", ...Array(20).fill(chunk), "\"}"]);
    expect(r.status).toBe(413);
  });

  it("rejects invalid JSON with 400", async () => {
    const r = await send(["{nope"]);
    expect(r.status).toBe(400);
  });
});
