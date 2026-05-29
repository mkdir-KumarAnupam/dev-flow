import fs from "fs-extra";
import { closeSync, openSync } from "node:fs";
import path from "node:path";
import { execa } from "execa";
import { type PackageManager, type ProjectType } from "../types/project.js";

export interface DevServerResult {
  command: string;
  pid?: number;
  startedAt?: string;
  status: "running" | "not-started" | "failed";
  logFile?: string;
  message?: string;
}

export async function startDevServer(
  projectPath: string,
  projectType: ProjectType,
  packageManager: PackageManager
): Promise<DevServerResult> {
  if (!supportsDevServer(projectType)) {
    return {
      command: "",
      status: "not-started",
      message: "This project type does not have a default dev server.",
    };
  }

  const command = getDevServerCommand(packageManager);
  const devDirectory = path.join(projectPath, ".dev");
  const logFile = path.join(devDirectory, "dev-server.log");

  await fs.ensureDir(devDirectory);
  const available = await execa(command.binary, ["--version"], {
    reject: false,
    stdio: "ignore",
    windowsHide: true,
  });

  if (available.exitCode !== 0) {
    return {
      command: [command.binary, ...command.args].join(" "),
      status: "failed",
      logFile,
      message: `Package manager not available: ${command.binary}`,
    };
  }

  if (process.platform === "win32") {
    return startWindowsTerminalServer(projectPath, command);
  }

  const stdout = openSync(logFile, "a");
  const stderr = openSync(logFile, "a");

  try {
    const subprocess = execa(command.binary, command.args, {
      cwd: projectPath,
      detached: true,
      stdio: ["ignore", stdout, stderr] as any,
      windowsHide: false,
      reject: false,
    });

    subprocess.unref();

    return {
      command: [command.binary, ...command.args].join(" "),
      pid: subprocess.pid,
      startedAt: new Date().toISOString(),
      status: subprocess.pid ? "running" : "failed",
      logFile,
      message: subprocess.pid ? undefined : "Dev server process did not return a PID.",
    };
  } finally {
    closeSync(stdout);
    closeSync(stderr);
  }
}

async function startWindowsTerminalServer(
  projectPath: string,
  command: { binary: string; args: string[] }
): Promise<DevServerResult> {
  const displayCommand = [command.binary, ...command.args].join(" ");
  const title = `dev server - ${path.basename(projectPath)}`;
  const shellCommand = [
    `$Host.UI.RawUI.WindowTitle = '${escapePowerShell(title)}'`,
    `Set-Location -LiteralPath '${escapePowerShell(projectPath)}'`,
    `Write-Host 'dev server: ${escapePowerShell(displayCommand)}' -ForegroundColor Cyan`,
    displayCommand,
  ].join("; ");

  const result = await execa(
    "powershell.exe",
    [
      "-NoProfile",
      "-Command",
      `$p = Start-Process powershell.exe -PassThru -ArgumentList @('-NoExit','-NoProfile','-Command','${escapePowerShell(shellCommand)}'); $p.Id`,
    ],
    {
      reject: false,
      windowsHide: true,
    }
  );

  const pid = Number(result.stdout.trim());

  return {
    command: displayCommand,
    pid: Number.isFinite(pid) ? pid : undefined,
    startedAt: new Date().toISOString(),
    status: Number.isFinite(pid) ? "running" : "failed",
    message: Number.isFinite(pid) ? "Started in a separate terminal window." : result.stderr || result.stdout,
  };
}

export function getDevServerCommand(packageManager: PackageManager) {
  switch (packageManager) {
    case "npm":
      return { binary: "npm", args: ["run", "dev"] };
    case "pnpm":
      return { binary: "pnpm", args: ["dev"] };
    case "yarn":
      return { binary: "yarn", args: ["dev"] };
    case "bun":
      return { binary: "bun", args: ["run", "dev"] };
  }
}

export async function stopDevServer(pid?: number) {
  if (!pid) {
    return false;
  }

  if (process.platform === "win32") {
    const result = await execa("taskkill", ["/PID", String(pid), "/T", "/F"], {
      reject: false,
      windowsHide: true,
    });

    return result.exitCode === 0;
  }

  try {
    process.kill(-pid, "SIGTERM");
    return true;
  } catch {
    try {
      process.kill(pid, "SIGTERM");
      return true;
    } catch {
      return false;
    }
  }
}

function supportsDevServer(projectType: ProjectType) {
  return ["nextjs", "react-vite", "express-api", "mern-stack"].includes(projectType);
}

function escapePowerShell(value: string) {
  return value.replace(/'/g, "''");
}
