#!/usr/bin/env node

import { Command } from "commander";
import { bannerCommand, bannerMotionCommand } from "./commands/banner.js";
import { captureCommand } from "./commands/capture.js";
import { trackAssetCommand } from "./commands/asset.js";
import { competitiveSandboxCommand } from "./commands/competitive.js";
import { dashboardCommand } from "./commands/dashboard.js";
import { helpManualCommand } from "./commands/helpManual.js";
import { openCommand } from "./commands/open.js";
import { paletteCommand } from "./commands/palette.js";
import { projectsCommand } from "./commands/projects.js";
import { profileCommand } from "./commands/profile.js";
import { resumeCommand } from "./commands/resume.js";
import { restoreCommand } from "./commands/restore.js";
import { runCommand } from "./commands/run.js";
import { sandboxCommand } from "./commands/sandbox.js";
import { semesterCommand } from "./commands/semester.js";
import { sessionCommand } from "./commands/session.js";
import { shipCommand } from "./commands/ship.js";
import { sketchCommand } from "./commands/sketch.js";
import { startCommand } from "./commands/start.js";
import { updateCommand } from "./commands/update.js";
import { watchCommand } from "./commands/watch.js";
import { workspaceCommand } from "./commands/workspace.js";
import { focusCommand } from "./commands/focus.js";
import { configCommand } from "./commands/config.js";
import { commandAction, commandActionVariadic } from "./utils/commandAction.js";

const program = new Command();

program
  .name("dev")
  .description("Developer workflow operating system")
  .version("1.0.0")
  .option("-s, --sandbox", "Use sandbox command mode")
  .addHelpText(
    "after",
    `

Sandbox mode:
  dev -s run                 Run the current sandbox
  dev -s watch               Watch and rerun the current sandbox
  dev -s semester <number>   Show a semester dashboard
  dev -s history [filters]   Show practice history
  dev -s random [filters]    Assign a random practice problem
  dev -s done                Mark current problem solved
  dev -s stuck               Mark current problem stuck
  dev -s stats               Show competitive stats
  dev -s graph [kind]        Show terminal practice graph
  dev -s race                Start Ghost Racing HUD
  dev -s new                 Create a sandbox
`
  );

program
  .command("start")
  .description("Start a new development project")
  .action(commandAction(startCommand));

program
  .command("sandbox [action]")
  .description("Create or inspect sandbox learning contexts")
  .action(commandAction(sandboxCommand));

program
  .command("open")
  .description("Open a registered project or sandbox context")
  .action(commandAction(openCommand));

program
  .command("restore")
  .description("Restore a project workspace")
  .action(commandAction(restoreCommand));

program
  .command("session")
  .description("Save an engineering momentum checkpoint")
  .action(commandAction(sessionCommand));

program
  .command("update")
  .description("Rebuild and relink the dev CLI")
  .action(commandAction(updateCommand));

program
  .command("sketch [title]")
  .description("Capture a visual sketch for the current context")
  .action(commandAction(sketchCommand));

program
  .command("resume")
  .description("Resume a saved engineering flow state")
  .action(commandAction(resumeCommand));

program
  .command("ship")
  .description("Run a project shipping pipeline")
  .action(commandAction(shipCommand));

program
  .command("profile")
  .description("Show competitive coding profile")
  .action(commandAction(profileCommand));

program
  .command("capture [label]")
  .description("Capture visual workflow context")
  .action(commandActionVariadic((label?: string) => captureCommand(label)));

program
  .command("dashboard")
  .description("Show competitive coding dashboard")
  .action(commandAction(dashboardCommand));

program
  .command("asset")
  .description("Track and import workflow assets")
  .command("track [path]")
  .description("Watch a directory and attach new assets to a context")
  .action(commandActionVariadic((pathArg?: string) => trackAssetCommand(pathArg)));

program
  .command("palette")
  .alias("p")
  .description("Open the built-in command palette")
  .action(commandAction(paletteCommand));

program
  .command("workspace")
  .description("Show the terminal workspace dashboard")
  .action(commandAction(workspaceCommand));

program
  .command("projects")
  .description("Show all registered projects")
  .option("--no-action", "Only render the dashboard")
  .action(commandAction(projectsCommand));

program
  .command("banner")
  .description("Preview the dev terminal graphics")
  .option("--motion", "Play the launch animation")
  .action(
    commandAction((options: { motion?: boolean }) =>
      options.motion ? bannerMotionCommand() : bannerCommand()
    )
  );

program
  .command("focus [duration]")
  .description("Initiate a telemetry-tracked flow state session (e.g. 90m) or view 'report'")
  .option("--no-hud", "Disable HUD")
  .action(commandActionVariadic((duration?: string) => focusCommand(duration)));

program
  .command("help-manual")
  .alias("manual")
  .description("Show the full dev help manual")
  .action(commandAction(helpManualCommand));

program
  .argument("[sandboxArgs...]", "Sandbox action and filters when using -s/--sandbox")
  .action(
    commandActionVariadic((sandboxArgs: string[] = []) => {
      if (!program.opts<{ sandbox?: boolean }>().sandbox) {
        program.help();
        return;
      }

      const [sandboxAction, ...sandboxValues] = sandboxArgs;

      switch (sandboxAction) {
        case "run":
          return runCommand();
        case "watch":
          return watchCommand();
        case "semester":
          const sandboxValue = sandboxValues[0];
          if (!sandboxValue) {
            console.log("Usage: dev -s semester <number>");
            return;
          }

          return semesterCommand(sandboxValue);
        case "history":
          return competitiveSandboxCommand("history", sandboxValues);
        case "contexts":
          return sandboxCommand("history");
        case "random":
        case "next":
        case "daily":
        case "done":
        case "stuck":
        case "stats":
        case "review":
        case "revisit":
        case "graph":
        case "race":
          return competitiveSandboxCommand(sandboxAction, sandboxValues);
        case undefined:
        case "new":
        case "create":
          return sandboxCommand();
        default:
          console.log(`Unknown sandbox action: ${sandboxAction}`);
          console.log("Usage: dev -s [random|done|stuck|stats|graph|race|run|watch|semester <number>|history|new]");
      }
    })
  );

program
  .command("config")
  .description("Manage CLI configuration (e.g. API keys)")
  .argument("[action]", "Action (set, get, list)")
  .argument("[key]", "Config key")
  .argument("[value]", "Config value")
  .action(configCommand);

program.parse(process.argv);
