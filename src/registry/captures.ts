import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getCapturesPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type CaptureRecord } from "../types/capture.js";

const REGISTRY_PATH = getCapturesPath();

export async function getCapturesFromRegistry(): Promise<CaptureRecord[]> {
  await ensureGlobalStateReady();
  return readJsonSafe<CaptureRecord[]>(REGISTRY_PATH, [], Array.isArray);
}

export async function appendCapturesToRegistry(records: CaptureRecord[]) {
  if (!records.length) {
    return;
  }

  await ensureGlobalStateReady();
  const existing = await getCapturesFromRegistry();
  const next = [...records, ...existing];

  next.sort((first, second) => second.capturedAt.localeCompare(first.capturedAt));
  await writeJsonSafe(REGISTRY_PATH, next);
}

export async function getCapturesForSessionOrContext(sessionId: string | undefined, contextPath: string) {
  const captures = await getCapturesFromRegistry();
  if (sessionId) {
    const bySession = captures.filter((capture) => capture.sessionId === sessionId);
    if (bySession.length) {
      return bySession;
    }
  }

  return captures.filter((capture) => capture.contextPath === contextPath);
}
