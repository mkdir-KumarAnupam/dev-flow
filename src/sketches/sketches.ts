import { findProblemRoot, readProblemMetadata } from "../metadata/problemMetadata.js";
import { getSketchesForContext, getSketchesFromRegistry, saveSketchToRegistry } from "../registry/sketches.js";
import { getActivePracticePath } from "../registry/practice.js";
import { type ProblemRecord } from "../types/problem.js";
import { type SketchRecord } from "../types/sketch.js";
import { ensureGlobalStateReady } from "../utils/globalState.js";
import { type DetectedContext } from "../continuity/contextDetection.js";

const EXCALIDRAW_URL = "https://excalidraw.com";
const DEFAULT_TITLE = "Sketch";

export interface SketchContextInput {
  context: DetectedContext;
  sessionId?: string;
  title?: string;
}

export async function createOrOpenSketch(input: SketchContextInput): Promise<SketchRecord> {
  await ensureGlobalStateReady();
  const problem = await resolveProblemContext();
  const title = normalizeTitle(input.title, input.context, problem);
  const slug = toSlug(title);
  const existing = await findExistingSketch(input.context.path, slug);

  if (existing && existing.contextPath === input.context.path) {
    const updated: SketchRecord = {
      ...existing,
      sessionId: input.sessionId ?? existing.sessionId,
      updatedAt: new Date().toISOString(),
    };

    await saveSketchToRegistry(updated);
    return updated;
  }

  const url = existing?.url && existing.url !== EXCALIDRAW_URL ? existing.url : EXCALIDRAW_URL;
  const now = new Date().toISOString();
  const record: SketchRecord = {
    id: `${input.context.path}:${slug}`,
    title,
    slug,
    url,
    project: input.context.project,
    contextKind: input.context.contextKind,
    contextPath: input.context.path,
    sessionId: input.sessionId,
    branch: input.context.branch,
    tags: buildTags(problem),
    problem: problem ? toProblemContext(problem) : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await saveSketchToRegistry(record);
  return record;
}

export async function getSketchesForSessionOrContext(sessionId: string | undefined, contextPath: string) {
  const sessionSketches = await getSketchesForContext(contextPath);
  if (!sessionId) {
    return sessionSketches;
  }

  const registrySketches = await getSketchesFromRegistry();
  const direct = registrySketches.filter((record) => record.sessionId === sessionId);
  return direct.length ? direct : sessionSketches;
}

export async function getRecentSketchesForContext(contextPath: string, since: Date) {
  const records = await getSketchesForContext(contextPath);
  return records.filter((record) => new Date(record.updatedAt).getTime() >= since.getTime());
}

export function getSketchDisplayLabel(record: SketchRecord) {
  const project = record.project ? `${record.project} · ` : "";
  const problem = record.problem ? ` · ${record.problem.slug}` : "";
  return `${record.title} (${project}${record.contextKind}${problem})`;
}

async function resolveProblemContext(): Promise<ProblemRecord | undefined> {
  const root = (await findProblemRoot(process.cwd())) ?? (await getActivePracticePath());
  if (!root) {
    return undefined;
  }

  return readProblemMetadata(root);
}

async function findExistingSketch(contextPath: string, slug: string) {
  const records = await getSketchesForContext(contextPath);
  const direct = records.find((record) => record.slug === slug);
  if (direct) {
    return direct;
  }

  const all = await getSketchesFromRegistry();
  return all.find((record) => record.slug === slug);
}

function buildTags(problem?: ProblemRecord) {
  if (!problem) {
    return [];
  }

  return [problem.platform, problem.difficulty, ...problem.topics].filter(Boolean) as string[];
}

function toProblemContext(problem: ProblemRecord) {
  return {
    title: problem.title,
    slug: problem.slug,
    platform: problem.platform,
    difficulty: problem.difficulty,
    topics: problem.topics,
  };
}

function normalizeTitle(title: string | undefined, context: DetectedContext, problem?: ProblemRecord) {
  const cleaned = title?.trim();
  if (cleaned) {
    return cleaned;
  }

  if (problem) {
    return problem.title;
  }

  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-");
  return `${context.project || DEFAULT_TITLE}-${timestamp}`;
}

function toSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "sketch";
}
