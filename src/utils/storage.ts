import fs from "fs-extra";
import path from "node:path";

export async function readJsonSafe<T>(
  filePath: string,
  fallback: T,
  validate?: (value: unknown) => value is T
): Promise<T> {
  try {
    if (!(await fs.pathExists(filePath))) {
      return fallback;
    }

    const data = await fs.readJson(filePath);
    if (validate && !validate(data)) {
      return fallback;
    }

    return data as T;
  } catch (error) {
    await quarantineCorruptFile(filePath);
    return fallback;
  }
}

export async function writeJsonSafe(filePath: string, data: unknown, spaces = 2) {
  await fs.ensureDir(path.dirname(filePath));
  const tempPath = `${filePath}.tmp-${Date.now()}`;
  await fs.writeJson(tempPath, data, { spaces });
  await fs.move(tempPath, filePath, { overwrite: true });
}

async function quarantineCorruptFile(filePath: string) {
  try {
    if (!(await fs.pathExists(filePath))) {
      return;
    }

    const dir = path.dirname(filePath);
    const base = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const target = path.join(dir, `${base}.corrupt-${timestamp}`);

    await fs.move(filePath, target, { overwrite: true });
  } catch {
    // Best-effort quarantine; ignore failures.
  }
}
