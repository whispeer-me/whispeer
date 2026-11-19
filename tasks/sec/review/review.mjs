// Whole-branch security review by Claude Fable 5.2 → tasks/sec/REVIEW.md
// Usage: node tasks/sec/review/review.mjs   (key from ~/.config/whispeer-review.env)
import { execSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import Anthropic from "@anthropic-ai/sdk";

const envFile = `${os.homedir()}/.config/whispeer-review.env`;
if (!process.env.ANTHROPIC_API_KEY && fs.existsSync(envFile)) {
  const m = fs.readFileSync(envFile, "utf8").match(/^ANTHROPIC_API_KEY=(.+)$/m);
  if (m) { process.env.ANTHROPIC_API_KEY = m[1].trim(); }
}

const root = execSync("git rev-parse --show-toplevel").toString().trim();
process.chdir(root);
const sh = cmd => execSync(cmd, { maxBuffer: 64 * 1024 * 1024 }).toString();

const exclude = ":(exclude)package-lock.json :(exclude)tasks/** :(exclude)public/**";
const diff = sh(`git diff main...HEAD -- . ${exclude}`);
const files = sh("git ls-files -- server composables pages components utils types migrations nuxt.config.ts package.json Dockerfile entrypoint.sh tests")
  .split("\n").filter(Boolean);
const sources = files.map(f => `<file path="${f}">\n${fs.readFileSync(f, "utf8")}\n</file>`).join("\n");
const design = fs.readFileSync("tasks/sec/DESIGN.md", "utf8");

const prompt = `You are reviewing a security-hardening branch of Whispeer, a Nuxt 3 app for sharing short expiring messages. The goal: nobody but the holder of the link (plus passphrase, if set) can read a message — not the server, database, analytics, or someone tampering with stored data.

<design>
${design}
</design>

<branch_diff base="main">
${diff}
</branch_diff>

<current_sources>
${sources}
</current_sources>

Review the current code against the goal and the design. Look for real, concrete problems: crypto misuse (key/IV/salt handling, KDF, AAD, encoding, randomness), anything that lets plaintext, the link key or the passphrase reach the server, logs, analytics, referrers or history; burn-after-read races or bypasses; expiry gaps; API validation holes; rate-limit bypass; CSP/header gaps; XSS; dependency issues; tests that don't actually test what they claim. Verify each finding against the code before reporting it; skip style nits.

Output markdown only, in this shape:
# Fable review
## MUST (exploitable or breaks the goal)
## SHOULD (real weakness, fix now)
## NIT (optional)
Each finding: **title** — file:line — what is wrong, concrete failure scenario, suggested fix. Empty section → "None." End with a 3-line overall verdict.`;

const client = new Anthropic();
const stream = client.beta.messages.stream({
  model: "claude-fable-5-2",
  max_tokens: 64000,
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
  output_config: { effort: "high" },
  messages: [{ role: "user", content: prompt }],
});
const msg = await stream.finalMessage();

if (msg.stop_reason === "refusal") {
  console.error("Refused:", msg.stop_details);
  process.exit(1);
}
const text = msg.content.filter(b => b.type === "text").map(b => b.text).join("\n");
fs.writeFileSync("tasks/sec/REVIEW.md", text + "\n");
console.log(`Wrote tasks/sec/REVIEW.md (model ${msg.model}, stop ${msg.stop_reason}, in ${msg.usage.input_tokens} / out ${msg.usage.output_tokens} tokens)`);
