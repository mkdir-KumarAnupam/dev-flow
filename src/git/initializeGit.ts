import { execa } from "execa";

export interface GitInitResult {
  initialized: boolean;
  committed: boolean;
  message?: string;
}

export async function initializeGit(projectPath: string): Promise<GitInitResult> {
  try {
    await execa("git", ["init"], { cwd: projectPath });
    await execa("git", ["add", "."], { cwd: projectPath });
  } catch (error) {
    return {
      initialized: false,
      committed: false,
      message: getCommandMessage(error),
    };
  }

  try {
    await execa("git", ["commit", "-m", "Initial scaffold"], { cwd: projectPath });
    return {
      initialized: true,
      committed: true,
    };
  } catch {
    const status = await execa("git", ["status", "--short"], {
      cwd: projectPath,
      reject: false,
    });

    return {
      initialized: true,
      committed: false,
      message: status.stdout
        ? "git user.name/user.email may be missing; files are staged or ready to commit."
        : "nothing to commit.",
    };
  }
}

function getCommandMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "unknown Git error";
}
