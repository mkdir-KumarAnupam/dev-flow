import fs from "fs-extra";
import path from "node:path";
import { execa } from "execa";
import { type DevSessionRecord, type ResumeFriction } from "../types/session.js";

export async function estimateResumeFriction(session: DevSessionRecord): Promise<ResumeFriction> {
  const checks: ResumeFriction["checks"] = [];

  checks.push(
    (await fs.pathExists(session.path))
      ? { label: "workspace", status: "ok", detail: "Workspace path exists." }
      : { label: "workspace", status: "bad", detail: "Workspace path is missing." }
  );

  if (await fs.pathExists(path.join(session.path, "package.json"))) {
    checks.push(
      (await fs.pathExists(path.join(session.path, "node_modules")))
        ? { label: "dependencies", status: "ok", detail: "node_modules exists." }
        : { label: "dependencies", status: "warn", detail: "package.json exists but node_modules is missing." }
    );
  }

  if (await fs.pathExists(path.join(session.path, ".env.example"))) {
    checks.push(
      (await fs.pathExists(path.join(session.path, ".env")))
        ? { label: "environment", status: "ok", detail: ".env exists." }
        : { label: "environment", status: "warn", detail: ".env.example exists but .env is missing." }
    );
  }

  const branch = await git(session.path, ["branch", "--show-current"]);

  if (session.branch && branch && branch !== session.branch) {
    checks.push({ label: "branch", status: "warn", detail: `Current branch is ${branch}; session was ${session.branch}.` });
  } else if (session.branch) {
    checks.push({ label: "branch", status: "ok", detail: `Branch ${session.branch} is available.` });
  }

  const status = await git(session.path, ["status", "--short"]);

  if (status === undefined) {
    checks.push({ label: "git", status: "warn", detail: "Not a git repository or git is unavailable." });
  } else if (status.trim()) {
    checks.push({ label: "worktree", status: "warn", detail: "Uncommitted changes are present." });
  } else {
    checks.push({ label: "worktree", status: "ok", detail: "Worktree is clean." });
  }

  const bad = checks.filter((check) => check.status === "bad").length;
  const warn = checks.filter((check) => check.status === "warn").length;
  const level = bad > 0 || warn >= 3 ? "HIGH" : warn > 0 ? "MEDIUM" : "LOW";

  return { level, checks };
}

async function git(workspacePath: string, args: string[]) {
  const result = await execa("git", args, {
    cwd: workspacePath,
    reject: false,
    windowsHide: true,
  });

  return result.exitCode === 0 ? result.stdout : undefined;
}
