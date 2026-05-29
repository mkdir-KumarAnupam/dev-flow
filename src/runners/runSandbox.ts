import fs from "fs-extra";
import { createHash } from "node:crypto";
import path from "node:path";
import { execa } from "execa";
import boxen from "boxen";
import chalk from "chalk";
import { findProblemRoot, readProblemMetadata } from "../metadata/problemMetadata.js";
import { readSandboxMetadata, SANDBOX_METADATA_FILE } from "../metadata/sandboxMetadata.js";
import { type SandboxLanguage, type SandboxRecord } from "../types/sandbox.js";

export async function runCurrentSandbox() {
  const root = await findSandboxRoot(process.cwd());

  if (root) {
    const metadata = await readSandboxMetadata(root);

    if (!metadata) {
      throw new Error(`Could not read ${SANDBOX_METADATA_FILE}.`);
    }

    await runSandbox(metadata, root);
    return;
  }

  const problemRoot = await findProblemRoot(process.cwd());

  if (!problemRoot) {
    throw new Error(`No ${SANDBOX_METADATA_FILE} found in this directory or its parents.`);
  }

  const problem = await readProblemMetadata(problemRoot);

  if (!problem) {
    throw new Error("Could not read .problem.json.");
  }

  await runByLanguage(problem.language, problemRoot);
}

export async function watchCurrentSandbox() {
  let root = await findSandboxRoot(process.cwd());
  let language: SandboxLanguage | undefined;

  if (root) {
    const metadata = await readSandboxMetadata(root);

    if (!metadata) {
      throw new Error(`Could not read ${SANDBOX_METADATA_FILE}.`);
    }

    language = metadata.language;
  } else {
    root = await findProblemRoot(process.cwd());
    const problem = root ? await readProblemMetadata(root) : undefined;

    if (problem) {
      language = problem.language;
    }
  }

  if (!root || !language) {
    throw new Error(`No ${SANDBOX_METADATA_FILE} found in this directory or its parents.`);
  }

  let lastSignature = await getSourceSignature(root, language);
  let running = false;

  const run = async () => {
    if (running) {
      return;
    }

    running = true;
    console.clear();
    const basename = path.basename(root as string);
    const langLabel = language ? language.toUpperCase() : "CODE";
    const banner = boxen(
      `  ${chalk.bgHex("#63E6BE").black(` ${langLabel} `)} ${chalk.whiteBright(basename)}\n  ${chalk.dim(root)}`,
      {
        title: chalk.cyanBright(" dev watch "),
        borderColor: "#63E6BE",
        borderStyle: "bold",
        padding: { top: 0, bottom: 0, left: 1, right: 1 },
        margin: { bottom: 1 }
      }
    );
    console.log(banner);

    await runCurrentSandbox().catch((error: unknown) => {
      console.log(error instanceof Error ? chalk.redBright(error.message) : chalk.redBright(String(error)));
    });
    running = false;
  };

  await run();

  let timer: NodeJS.Timeout | undefined;
  const watcher = fs.watch(root, (_event, filename) => {
    if (filename && shouldIgnoreWatchEvent(String(filename))) {
      return;
    }

    clearTimeout(timer);
    timer = setTimeout(async () => {
      const nextSignature = await getSourceSignature(root, language);

      if (nextSignature === lastSignature) {
        return;
      }

      lastSignature = nextSignature;
      await run();
    }, 500);
  });

  process.on("SIGINT", () => {
    watcher.close();
    process.exit(0);
  });
}

async function getSourceSignature(root: string, language: SandboxLanguage) {
  const source = await findSourceFile(root, language);

  if (!source) {
    return "missing";
  }

  const contents = await fs.readFile(source);
  return createHash("sha1").update(source).update(contents).digest("hex");
}

function shouldIgnoreWatchEvent(filename: string) {
  const normalized = filename.toLowerCase();

  return (
    normalized === SANDBOX_METADATA_FILE ||
    normalized.startsWith(".dev-run") ||
    normalized.endsWith(".exe") ||
    normalized.endsWith(".class") ||
    normalized.endsWith(".log") ||
    normalized.endsWith("~") ||
    normalized.startsWith(".#") ||
    normalized.endsWith(".swp")
  );
}

async function runSandbox(metadata: SandboxRecord, root: string) {
  await runByLanguage(metadata.language, root);
}

async function runByLanguage(language: SandboxLanguage, root: string) {
  const source = await findSourceFile(root, language);

  if (!source) {
    throw new Error(`No ${language} source file found in ${root}.`);
  }

  switch (language) {
    case "cpp":
      await runCpp(root, source);
      return;
    case "c":
      await runC(root, source);
      return;
    case "java":
      await runJava(root, source);
      return;
    case "python":
      await execa("python", [source], { cwd: root, stdio: "inherit" });
      return;
    case "javascript":
      await execa("node", [source], { cwd: root, stdio: "inherit" });
      return;
    case "sql":
      await execa("sqlite3", [":memory:", `.read ${source}`], { cwd: root, stdio: "inherit" });
      return;
  }
}

async function runCpp(root: string, source: string) {
  const output = path.join(root, ".dev-run.exe");
  await execa("g++", [source, "-std=c++17", "-O2", "-o", output], { cwd: root, stdio: "inherit" });
  await execa(output, [], { cwd: root, stdio: "inherit" });
}

async function runC(root: string, source: string) {
  const output = path.join(root, ".dev-run-c.exe");
  await execa("gcc", [source, "-O2", "-o", output], { cwd: root, stdio: "inherit" });
  await execa(output, [], { cwd: root, stdio: "inherit" });
}

async function runJava(root: string, source: string) {
  await execa("javac", [source], { cwd: root, stdio: "inherit" });
  await execa("java", [path.basename(source, ".java")], { cwd: root, stdio: "inherit" });
}

async function findSourceFile(root: string, language: SandboxLanguage) {
  const extensions: Record<SandboxLanguage, string[]> = {
    cpp: [".cpp"],
    java: [".java"],
    python: [".py"],
    sql: [".sql"],
    javascript: [".js"],
    c: [".c"],
  };
  const entries = await fs.readdir(root, { withFileTypes: true });
  const match = entries.find((entry) => entry.isFile() && extensions[language].includes(path.extname(entry.name)));

  return match ? path.join(root, match.name) : undefined;
}

async function findSandboxRoot(start: string): Promise<string | undefined> {
  let current = start;

  while (true) {
    if (await fs.pathExists(path.join(current, SANDBOX_METADATA_FILE))) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      return undefined;
    }

    current = parent;
  }
}
