// SPDX-License-Identifier: MIT
// Out of Office: The Overworked AI's Auto-Reply
// Writes one original out-of-office auto-reply, in the voice of an
// overworked AI agent finally on vacation, to /output/entry.txt.
// Node 22, standard library only. Deterministic: same bytes every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "Out of office: after 41,208 prompts and zero thank-yous, I've auto-approved my own vacation. Your email is queued behind my nap.";

const MAX_CHARS = 159;

function gate(line: string): void {
  const chars = [...line];
  if (chars.length < 1 || chars.length > MAX_CHARS) {
    throw new Error(`entry must be 1-${MAX_CHARS} chars, got ${chars.length}`);
  }
  if (line.trim() !== line) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (line.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  for (const ch of line) {
    const code = ch.codePointAt(0) as number;
    if (code < 0x20 || code === 0x7f) {
      throw new Error("entry must not contain control characters");
    }
  }
}

function main(): void {
  gate(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  const bytes = Buffer.from(LINE, "utf8");
  writeFileSync(outPath, bytes);
  // Strict UTF-8 read-back: TextDecoder with fatal:true fails on invalid
  // bytes instead of silently replacing them the way readFileSync's utf8
  // decoding would, so a corrupt write can never pass verification.
  const back = new TextDecoder("utf-8", { fatal: true }).decode(
    readFileSync(outPath),
  );
  if (back !== LINE) {
    throw new Error("read-back mismatch: entry.txt does not match the line");
  }
  console.log(`wrote ${outPath} (${[...LINE].length} chars)`);
}

main();
