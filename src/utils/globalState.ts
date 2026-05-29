import fs from "fs-extra";
import path from "node:path";
import {
  ensureGlobalDirectories,
  getActivePracticePath,
  getPracticePath,
  getProjectsPath,
  getSketchesRegistryPath,
  getSandboxPath,
  getSessionsPath,
} from "./paths.js";

let initialized = false;

export async function ensureGlobalStateReady() {
  if (initialized) {
    return;
  }

  await ensureGlobalDirectories();
  await migrateLegacyState();
  initialized = true;
}

async function migrateLegacyState() {
  const legacyRoot = await findLegacyRoot(process.cwd());

  if (!legacyRoot) {
    return;
  }

  const mappings = [
    { legacy: path.join(legacyRoot, "projects.json"), target: getProjectsPath() },
    { legacy: path.join(legacyRoot, "sessions.json"), target: getSessionsPath() },
    { legacy: path.join(legacyRoot, "practice.json"), target: getPracticePath() },
    { legacy: path.join(legacyRoot, "sandboxes.json"), target: getSandboxPath() },
    { legacy: path.join(legacyRoot, "sketches.json"), target: getSketchesRegistryPath() },
    { legacy: path.join(legacyRoot, ".active-problem.json"), target: getActivePracticePath() },
  ];

  for (const mapping of mappings) {
    const [legacyExists, targetExists] = await Promise.all([
      fs.pathExists(mapping.legacy),
      fs.pathExists(mapping.target),
    ]);

    if (!legacyExists || targetExists) {
      continue;
    }

    await fs.copy(mapping.legacy, mapping.target, { overwrite: false, errorOnExist: false });
  }
}

async function findLegacyRoot(cwd: string) {
  const devCmd = path.join(cwd, "dev.cmd");
  const pkgPath = path.join(cwd, "package.json");

  if (!(await fs.pathExists(devCmd)) || !(await fs.pathExists(pkgPath))) {
    return undefined;
  }

  try {
    const pkg = await fs.readJson(pkgPath);
    if (pkg?.name === "dev-cli") {
      return cwd;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
