import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getSketchesRegistryPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type SketchRecord } from "../types/sketch.js";

const REGISTRY_PATH = getSketchesRegistryPath();

export async function getSketchesFromRegistry(): Promise<SketchRecord[]> {
  await ensureGlobalStateReady();
  const records = await readJsonSafe<SketchRecord[]>(REGISTRY_PATH, [], Array.isArray);
  return records.map(normalizeSketchRecord);
}

export async function saveSketchToRegistry(record: SketchRecord) {
  await ensureGlobalStateReady();
  const records = await getSketchesFromRegistry();
  const next = records.filter((item) => item.id !== record.id);

  next.push(record);
  next.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));

  await writeJsonSafe(REGISTRY_PATH, next);
}

export async function getSketchesForContext(contextPath: string) {
  const records = await getSketchesFromRegistry();
  return records.filter((record) => record.contextPath === contextPath);
}

export async function getSketchesForSession(sessionId?: string) {
  if (!sessionId) {
    return [];
  }

  const records = await getSketchesFromRegistry();
  return records.filter((record) => record.sessionId === sessionId);
}

function normalizeSketchRecord(record: Partial<SketchRecord>): SketchRecord {
  const now = new Date(0).toISOString();

  return {
    id: record.id ?? "unknown",
    title: record.title ?? "Untitled Sketch",
    slug: record.slug ?? "sketch",
    filePath: record.filePath,
    url: record.url ?? "https://excalidraw.com",
    project: record.project ?? "unknown",
    contextKind: record.contextKind ?? "workspace",
    contextPath: record.contextPath ?? "",
    sessionId: record.sessionId,
    branch: record.branch,
    tags: record.tags ?? [],
    problem: record.problem,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
  };
}
