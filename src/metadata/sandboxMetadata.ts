import fs from "fs-extra";
import path from "node:path";
import { type SandboxRecord } from "../types/sandbox.js";

export const SANDBOX_METADATA_FILE = ".sandbox.json";

export async function writeSandboxMetadata(record: SandboxRecord) {
  await fs.writeJson(path.join(record.path, SANDBOX_METADATA_FILE), record, { spaces: 2 });
}

export async function readSandboxMetadata(directory: string): Promise<SandboxRecord | undefined> {
  const metadataPath = path.join(directory, SANDBOX_METADATA_FILE);

  if (!(await fs.pathExists(metadataPath))) {
    return undefined;
  }

  return fs.readJson(metadataPath);
}

