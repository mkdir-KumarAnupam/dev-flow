import chalk from "chalk";
import fs from "fs-extra";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";

export async function updateCommand() {
  const root = await resolveRepoRoot();

  console.log(chalk.cyan("Updating dev CLI..."));

  await execa("npm", ["run", "build"], { cwd: root, stdio: "inherit" });
  await execa("npm", ["link"], { cwd: root, stdio: "inherit" });

  console.log(chalk.green("dev update complete."));
}

async function resolveRepoRoot() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const root = path.resolve(currentDir, "..", "..");
  const pkgPath = path.join(root, "package.json");

  if (!(await fs.pathExists(pkgPath))) {
    throw new Error("Cannot find dev-cli package.json. Run from the dev-cli install.");
  }

  const pkg = await fs.readJson(pkgPath);
  if (pkg?.name !== "dev-cli") {
    throw new Error("dev update must run from the dev-cli package root.");
  }

  return root;
}
