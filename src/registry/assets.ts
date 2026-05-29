import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getAssetsPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type AssetRecord } from "../types/asset.js";

const REGISTRY_PATH = getAssetsPath();

export async function getAssetsFromRegistry(): Promise<AssetRecord[]> {
  await ensureGlobalStateReady();
  const assets = await readJsonSafe<AssetRecord[]>(REGISTRY_PATH, [], Array.isArray);
  return assets;
}

export async function appendAssetsToRegistry(records: AssetRecord[]) {
  if (!records.length) {
    return;
  }

  await ensureGlobalStateReady();
  const existing = await getAssetsFromRegistry();
  const next = [...records, ...existing];

  next.sort((first, second) => second.importedAt.localeCompare(first.importedAt));
  await writeJsonSafe(REGISTRY_PATH, next);
}
