import fs from "fs-extra";
import path from "node:path";
import { type ProblemRecord } from "../types/problem.js";

export const PROBLEM_METADATA_FILE = ".problem.json";

export async function writeProblemMetadata(record: ProblemRecord) {
  await fs.writeJson(path.join(record.path, PROBLEM_METADATA_FILE), record, { spaces: 2 });
}

export async function readProblemMetadata(directory: string): Promise<ProblemRecord | undefined> {
  const metadataPath = path.join(directory, PROBLEM_METADATA_FILE);

  if (!(await fs.pathExists(metadataPath))) {
    return undefined;
  }

  return fs.readJson(metadataPath);
}

export async function findProblemRoot(start: string): Promise<string | undefined> {
  let current = start;

  while (true) {
    if (await fs.pathExists(path.join(current, PROBLEM_METADATA_FILE))) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}

