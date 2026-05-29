import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getActivePracticePath as getActivePracticeFilePath, getPracticePath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type ProblemRecord } from "../types/problem.js";

const PRACTICE_REGISTRY_PATH = getPracticePath();
const ACTIVE_PRACTICE_PATH = getActivePracticeFilePath();

export async function getPracticeRecords(): Promise<ProblemRecord[]> {
  await ensureGlobalStateReady();
  return readJsonSafe<ProblemRecord[]>(PRACTICE_REGISTRY_PATH, [], Array.isArray);
}

export async function savePracticeRecord(record: ProblemRecord) {
  await ensureGlobalStateReady();
  const records = await getPracticeRecords();
  const next = records.filter((item) => item.path !== record.path);

  next.push(record);
  next.sort((first, second) => second.startedAt.localeCompare(first.startedAt));

  await writeJsonSafe(PRACTICE_REGISTRY_PATH, next);
}

export async function setActivePracticeRecord(record: ProblemRecord) {
  await ensureGlobalStateReady();
  await writeJsonSafe(
    ACTIVE_PRACTICE_PATH,
    {
      path: record.path,
      title: record.title,
      platform: record.platform,
      activatedAt: new Date().toISOString(),
    }
  );
}

export async function getActivePracticePath(): Promise<string | undefined> {
  await ensureGlobalStateReady();
  const active = await readJsonSafe<{ path?: unknown }>(ACTIVE_PRACTICE_PATH, {});
  return typeof active.path === "string" ? active.path : undefined;
}
