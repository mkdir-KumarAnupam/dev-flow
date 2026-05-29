import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getSandboxPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type SandboxRecord } from "../types/sandbox.js";

const SANDBOX_REGISTRY_PATH = getSandboxPath();

export async function getSandboxesFromRegistry(): Promise<SandboxRecord[]> {
  await ensureGlobalStateReady();
  const records = await readJsonSafe<SandboxRecord[]>(SANDBOX_REGISTRY_PATH, [], Array.isArray);
  return records.map(normalizeSandboxRecord);
}

export async function saveSandboxToRegistry(record: SandboxRecord) {
  await ensureGlobalStateReady();
  const records = await getSandboxesFromRegistry();
  const nextRecords = records.filter((item) => item.id !== record.id && item.path !== record.path);

  nextRecords.push(record);
  nextRecords.sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  await writeJsonSafe(SANDBOX_REGISTRY_PATH, nextRecords);
}

export function getSandboxLabel(record: SandboxRecord) {
  const context = record.course ? `${record.course} / sem ${record.semester}` : record.platform ?? record.type;
  return `${record.name} - ${context} [${record.language}]`;
}

function normalizeSandboxRecord(record: Partial<SandboxRecord>): SandboxRecord {
  return {
    id: record.id ?? `${record.type ?? "sandbox"}:${record.path ?? record.name ?? "unknown"}`,
    name: record.name ?? "untitled",
    type: record.type ?? "practice",
    path: record.path ?? "",
    language: record.language ?? "python",
    activity: record.activity ?? "experiment",
    createdAt: record.createdAt ?? new Date(0).toISOString(),
    lastOpenedAt: record.lastOpenedAt,
    semester: record.semester,
    course: record.course,
    platform: record.platform,
    difficulty: record.difficulty,
    topic: record.topic,
    tags: record.tags ?? [],
    history: record.history ?? [],
  };
}
