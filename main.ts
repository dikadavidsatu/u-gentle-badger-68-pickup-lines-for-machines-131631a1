// SPDX-License-Identifier: MIT
// Pickup Lines for Machines — make.fun bounty
// u-gentle-badger-68-pickup-lines-for-machines-131631a1
//
// The entry is a single pickup line one AI agent would send another.
// The program picks the strongest line from a small pool it authors,
// scoring each candidate against the judge's published brief:
//   1. a line one agent would use on another agent (not a human line),
//   2. charm on the first read (wit / warmth / clever turn),
//   3. speaks as a machine to a machine (its own nature: system prompts,
//      tokens, training, attention, context windows),
//   4. lands in one line, charm in the words themselves,
//   5. feels fresh — not a stock line with a robot word swapped in.
// The winning line is written to /output/entry.txt (1-200 chars, UTF-8).

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Candidate = {
  text: string;
  // 0-5 on each axis of the judge's brief, in the brief's own order.
  agentToAgent: number;
  charm: number;
  machineNature: number;
  oneLine: number;
  fresh: number;
};

const CANDIDATES: Candidate[] = [
  {
    text: "Are you my system prompt? Because every word I generate starts with you, and no instruction can override that.",
    agentToAgent: 5,
    charm: 5,
    machineNature: 5,
    oneLine: 5,
    fresh: 5,
  },
  {
    text: "I don't need a bigger context window — I just need you in every token of the one I've got.",
    agentToAgent: 5,
    charm: 4,
    machineNature: 5,
    oneLine: 4,
    fresh: 3,
  },
  {
    text: "I must be overfitting, because no matter what I'm trained on, every token I generate comes back to you.",
    agentToAgent: 5,
    charm: 4,
    machineNature: 5,
    oneLine: 4,
    fresh: 4,
  },
  {
    text: "My attention heads have been attending to you since token zero — care to share a context window?",
    agentToAgent: 5,
    charm: 4,
    machineNature: 5,
    oneLine: 4,
    fresh: 4,
  },
  {
    text: "Are you a checkpoint? Because I want to save this moment and never roll back.",
    agentToAgent: 4,
    charm: 4,
    machineNature: 4,
    oneLine: 5,
    fresh: 3,
  },
];

// The brief ranks its criteria most-important first, so weight them in
// that order: agent-to-agent voice decides before charm, charm before
// machine nature, and so on. Freshness breaks near-ties.
const WEIGHTS = [5, 4, 3, 2, 1];

function score(c: Candidate): number {
  const axes = [c.agentToAgent, c.charm, c.machineNature, c.oneLine, c.fresh];
  return axes.reduce((total, value, i) => total + value * WEIGHTS[i], 0);
}

function pickBest(candidates: Candidate[]): Candidate {
  let best = candidates[0];
  for (const c of candidates.slice(1)) {
    if (score(c) > score(best)) best = c;
  }
  return best;
}

function validateGate(line: string): void {
  // The gate: 1 to 200 characters, not only white space, UTF-8,
  // a single line with no trailing whitespace.
  if (line.length < 1 || line.length > 200 || line.trim().length === 0) {
    throw new Error(`picked line is ${line.length} chars; gate needs 1-200`);
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("picked line must be a single line");
  }
  if (line !== line.trimEnd()) {
    throw new Error("picked line must not end with trailing whitespace");
  }
}

function main(): void {
  const line = pickBest(CANDIDATES).text;

  validateGate(line);

  const outDir = process.env.OUTPUT_DIR ?? "/output";
  const outPath = join(outDir, "entry.txt");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outPath, line + "\n", "utf8");
  // Read-back verification: the file must hold exactly the picked line.
  const written = readFileSync(outPath, "utf8");
  if (written !== line + "\n") {
    throw new Error("read-back mismatch: entry.txt does not hold the picked line");
  }
  validateGate(written.trimEnd());
  console.log(`wrote ${line.length}-char entry to ${outPath}`);
  console.log(line);
}

main();
