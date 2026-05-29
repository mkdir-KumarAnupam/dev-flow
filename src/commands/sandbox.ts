import boxen from "boxen";
import chalk from "chalk";
import { generateSandbox } from "../sandbox/generateSandbox.js";
import { promptForSandbox } from "../prompts/sandboxPrompts.js";
import { getSandboxLabel, getSandboxesFromRegistry, saveSandboxToRegistry } from "../registry/sandboxes.js";
import { openEditor } from "../workspace/openEditor.js";

export async function sandboxCommand(action?: string) {
  if (action === "history") {
    await sandboxHistoryCommand();
    return;
  }

  const record = await promptForSandbox();
  await generateSandbox(record);
  await saveSandboxToRegistry(record);

  console.log(
    boxen(
      [
        chalk.greenBright("Sandbox ready"),
        "",
        `${chalk.dim("context")} ${chalk.cyan(record.type)}`,
        `${chalk.dim("path")}    ${chalk.cyan(record.path)}`,
        `${chalk.dim("lang")}    ${chalk.cyan(record.language)}`,
      ].join("\n"),
      {
        borderColor: "#63E6BE",
        borderStyle: "round",
        padding: 1,
      }
    )
  );

  await openEditor("code", record.path);
}

export async function sandboxHistoryCommand() {
  const records = await getSandboxesFromRegistry();

  if (records.length === 0) {
    console.log(chalk.yellow("No sandbox history yet. Run `dev sandbox` first."));
    return;
  }

  console.log(
    boxen(`${chalk.cyanBright("sandbox history")}  ${chalk.dim(`${records.length} contexts`)}`, {
      title: " learning memory ",
      borderColor: "#A78BFA",
      borderStyle: "double",
      padding: 1,
    })
  );

  for (const record of records.slice(0, 20)) {
    console.log(`${chalk.green("•")} ${getSandboxLabel(record)} ${chalk.dim(record.path)}`);
  }
}

