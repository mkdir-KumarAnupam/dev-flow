import fs from "fs-extra";
import path from "node:path";
import chalk from "chalk";
import boxen from "boxen";

export async function configCommand(action?: string, key?: string, value?: string) {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const configPath = path.join(home, ".dev-cli", "config.json");
  
  await fs.ensureFile(configPath);
  let config: Record<string, string> = {};
  try {
    config = await fs.readJson(configPath);
  } catch {}

  if (action === "set" && key && value) {
    config[key] = value;
    await fs.writeJson(configPath, config, { spaces: 2 });
    console.log(chalk.green(`\u2713 Set ${chalk.whiteBright(key)} to ${chalk.dim("...")} successfully.`));
    return;
  }

  if (action === "get" && key) {
    if (config[key]) {
      console.log(`${chalk.cyan(key)} = ${config[key]}`);
    } else {
      console.log(chalk.yellow(`Key '${key}' is not set.`));
    }
    return;
  }

  if (action === "list") {
    const keys = Object.keys(config);
    if (keys.length === 0) {
      console.log(chalk.dim("Configuration is empty."));
      return;
    }
    const output = keys.map(k => `${chalk.cyan(k)} = ${chalk.dim("********")}`).join("\n");
    console.log(boxen(output, { title: " configuration ", padding: 1, borderColor: "gray" }));
    return;
  }

  console.log(chalk.red("Usage: dev config set <key> <value>"));
  console.log(chalk.red("       dev config get <key>"));
  console.log(chalk.red("       dev config list"));
}

export async function getConfig(key: string): Promise<string | undefined> {
  const home = process.env.HOME || process.env.USERPROFILE || "";
  const configPath = path.join(home, ".dev-cli", "config.json");
  try {
    const config = await fs.readJson(configPath);
    return config[key];
  } catch {
    return undefined;
  }
}
