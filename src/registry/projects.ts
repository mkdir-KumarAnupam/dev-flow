import { ensureGlobalStateReady } from "../utils/globalState.js";
import { getProjectsPath } from "../utils/paths.js";
import { readJsonSafe, writeJsonSafe } from "../utils/storage.js";
import { type ProjectRecord } from "../types/project.js";

const REGISTRY_PATH = getProjectsPath();

export async function getProjectsFromRegistry(): Promise<ProjectRecord[]> {
  await ensureGlobalStateReady();
  const projects = await readJsonSafe<ProjectRecord[]>(REGISTRY_PATH, [], Array.isArray);
  return projects.map(normalizeProjectRecord);
}

export async function saveProjectToRegistry(project: ProjectRecord) {
  await ensureGlobalStateReady();
  const projects = await getProjectsFromRegistry();
  const nextProjects = projects.filter((item) => item.path !== project.path && item.name !== project.name);

  nextProjects.push(project);
  nextProjects.sort((first, second) => second.createdAt.localeCompare(first.createdAt));

  await writeJsonSafe(REGISTRY_PATH, nextProjects);
}

export async function removeProjectFromRegistry(project: ProjectRecord) {
  await ensureGlobalStateReady();
  const projects = await getProjectsFromRegistry();
  const nextProjects = projects.filter((item) => item.path !== project.path && item.name !== project.name);

  await writeJsonSafe(REGISTRY_PATH, nextProjects);
}

export function getProjectLabel(project: ProjectRecord) {
  const tags = project.tags?.length ? ` [${project.tags.join(", ")}]` : "";
  return `${project.name} - ${project.type}${tags}`;
}

function normalizeProjectRecord(project: Partial<ProjectRecord>): ProjectRecord {
  return {
    name: project.name ?? "untitled",
    type: project.type ?? "unknown",
    description: project.description ?? "",
    path: project.path ?? "",
    editor: project.editor ?? "code",
    packageManager: project.packageManager,
    createdAt: project.createdAt ?? new Date(0).toISOString(),
    tags: project.tags ?? [],
    deployment: project.deployment,
    linear: project.linear,
    workspace: project.workspace,
  };
}
