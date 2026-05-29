import fs from "fs-extra";
import path from "node:path";
import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getSessionsPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type DevSessionRecord } from "../types/session.js";

export const SESSION_FILE = ".session.json";

const SESSION_REGISTRY_PATH = getSessionsPath();

export async function getSessionsFromRegistry(): Promise<DevSessionRecord[]> {
  await ensureGlobalStateReady();
  const sessions = await readJsonSafe<DevSessionRecord[]>(SESSION_REGISTRY_PATH, [], Array.isArray);
  return sessions.map(normalizeSessionRecord);
}

export async function saveSessionToRegistry(session: DevSessionRecord) {
  await ensureGlobalStateReady();
  const sessions = await getSessionsFromRegistry();
  const next = sessions.filter((item) => item.id !== session.id);

  next.push(session);
  next.sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));

  await writeJsonSafe(SESSION_REGISTRY_PATH, next);
}

export async function writeLocalSession(session: DevSessionRecord) {
  try {
    await writeJsonSafe(path.join(session.path, SESSION_FILE), session);
  } catch (error) {
    const code = error instanceof Error ? (error as NodeJS.ErrnoException).code : undefined;
    if (code === "EPERM" || code === "EACCES") {
      return;
    }

    throw error;
  }
}

export async function readLocalSession(workspacePath: string): Promise<DevSessionRecord | undefined> {
  const sessionPath = path.join(workspacePath, SESSION_FILE);

  if (!(await fs.pathExists(sessionPath))) {
    return undefined;
  }

  const session = await readJsonSafe<Partial<DevSessionRecord> | undefined>(sessionPath, undefined);
  return session ? normalizeSessionRecord(session) : undefined;
}

export async function appendCapturesToSession(workspacePath: string, captureIds: string[]) {
  if (!captureIds.length) {
    return;
  }

  const session = await readLocalSession(workspacePath);
  if (!session) {
    return;
  }

  const merged = new Set([...(session.captures ?? []), ...captureIds]);
  const updated: DevSessionRecord = {
    ...session,
    captures: [...merged],
    updatedAt: new Date().toISOString(),
  };

  await writeLocalSession(updated);
  await saveSessionToRegistry(updated);
}

export async function appendAssetsToSession(workspacePath: string, assetIds: string[]) {
  if (!assetIds.length) {
    return;
  }

  const session = await readLocalSession(workspacePath);
  if (!session) {
    return;
  }

  const merged = new Set([...(session.assets ?? []), ...assetIds]);
  const updated: DevSessionRecord = {
    ...session,
    assets: [...merged],
    updatedAt: new Date().toISOString(),
  };

  await writeLocalSession(updated);
  await saveSessionToRegistry(updated);
}

function normalizeSessionRecord(session: Partial<DevSessionRecord>): DevSessionRecord {
  const now = new Date().toISOString();

  return {
    id: session.id ?? `${session.path ?? process.cwd()}:${session.createdAt ?? now}`,
    project: session.project ?? path.basename(session.path ?? process.cwd()),
    contextKind: session.contextKind ?? "workspace",
    path: session.path ?? process.cwd(),
    branch: session.branch,
    status: session.status ?? "paused",
    summary: session.summary ?? "",
    nextAction: session.nextAction ?? "Decide the next concrete step.",
    notes: session.notes,
    openFiles: session.openFiles ?? [],
    runningServices: session.runningServices ?? [],
    sketches: session.sketches ?? [],
    assets: session.assets ?? [],
    captures: session.captures ?? [],
    startedAt: session.startedAt ?? now,
    endedAt: session.endedAt ?? now,
    durationMinutes: session.durationMinutes ?? 0,
    tags: session.tags ?? [],
    editor: session.editor ?? "code",
    createdAt: session.createdAt ?? now,
    updatedAt: session.updatedAt ?? now,
  };
}
