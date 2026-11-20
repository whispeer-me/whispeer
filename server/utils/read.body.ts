// SPDX-License-Identifier: AGPL-3.0-only

import { createError, getRequestHeader, readRawBody, setResponseHeader, type H3Event } from "h3";

const tooLarge = (event: H3Event) => {
  // The rest of the body is never read: close the connection after replying.
  setResponseHeader(event, "connection", "close");
  return createError({ statusCode: 413, statusMessage: "Payload Too Large" });
};

// Reads a JSON body with a hard byte cap, also for chunked bodies (no
// Content-Length), stopping as soon as the cap is passed. Throws 413 when too
// large, 400 when not JSON.
export const readJsonBodyCapped = async (event: H3Event, max: number): Promise<unknown> => {
  const length = getRequestHeader(event, "content-length");
  if (length !== undefined && !(Number(length) <= max)) {
    throw tooLarge(event);
  }

  const req = event.node.req;
  let raw: Buffer;
  if ("body" in req || "rawBody" in req || "__unenv__" in req) {
    // Internal/in-memory request (Nitro local fetch): body is already buffered.
    const body = await readRawBody(event, false);
    raw = body ? Buffer.from(body) : Buffer.alloc(0);
    if (raw.length > max) { throw tooLarge(event); }
  } else {
    raw = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      let size = 0;
      const stop = () => {
        req.off("data", onData);
        req.off("end", onEnd);
        req.off("error", onError);
      };
      const onData = (chunk: Buffer) => {
        size += chunk.length;
        if (size > max) {
          stop();
          req.pause();
          reject(tooLarge(event));
          return;
        }
        chunks.push(chunk);
      };
      const onEnd = () => { stop(); resolve(Buffer.concat(chunks)); };
      const onError = (err: Error) => { stop(); reject(err); };
      req.on("data", onData);
      req.on("end", onEnd);
      req.on("error", onError);
    });
  }

  try {
    return JSON.parse(raw.toString("utf8"));
  } catch {
    throw createError({ statusCode: 400, statusMessage: "Bad Request" });
  }
};
