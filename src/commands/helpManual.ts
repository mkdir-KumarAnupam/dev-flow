import boxen from "boxen";
import chalk from "chalk";

export async function helpManualCommand() {
  const cyan = chalk.hex("#00E5FF");
  const violet = chalk.hex("#A78BFA");
  const green = chalk.hex("#63E6BE");
  const pink = chalk.hex("#FF4FD8");
  const dim = chalk.hex("#8A90B8");

  console.log(
    boxen(
      [
        `${cyan("dev")} ${chalk.whiteBright("manual")}`,
        dim("terminal-native engineering + learning operating environment"),
        "",
        `${green("project")} -> ${violet("workspace")} -> ${pink("ship")}`,
        `${green("sandbox")} -> ${violet("practice")} -> ${pink("memory")}`,
      ].join("\n"),
      {
        title: " dev://manual ",
        titleAlignment: "center",
        padding: { top: 1, bottom: 1, left: 2, right: 2 },
        borderColor: "#00E5FF",
        borderStyle: "double",
      }
    )
  );

  renderSection("Core Flow", [
    ["dev start", "Create a configured project environment"],
    ["dev open", "Fuzzy open projects and sandbox contexts"],
    ["dev restore", "Open editor and restore the dev server"],
    ["dev session", "Save a momentum checkpoint with next action"],
    ["dev resume", "Resume an interrupted engineering flow state"],
    ["dev sketch", "Capture a visual sketch for the current context"],
    ["dev update", "Rebuild and relink the dev CLI"],
    ["dev projects", "Manage projects, deployment status, delete/open"],
    ["dev workspace", "Show workspace health dashboard"],
  ]);

  renderSection("Sandbox Mode", [
    ["dev sandbox", "Create a learning sandbox"],
    ["dev -s run", "Run current sandbox with automatic language detection"],
    ["dev -s watch", "Watch current sandbox and rerun on source changes"],
    ["dev -s random hard dp", "Assign a filtered practice problem"],
    ["dev -s done", "Mark current problem solved"],
    ["dev -s stuck", "Mark current problem stuck"],
    ["dev -s stats", "Show competitive stats"],
    ["dev -s graph topics", "Render terminal progress graphs"],
    ["dev -s semester 4", "Show semester dashboard"],
    ["dev -s history", "Show practice history"],
  ]);

  renderSection("Competitive Cockpit", [
    ["dev profile", "Show practice cockpit, heatmap, topic graph"],
    ["dev dashboard", "Show practice command center"],
    ["dev -s review", "Show attempted/stuck revisit queue"],
    ["dev -s history arrays", "Filter practice history"],
  ]);

  renderSection("Shipping", [
    ["dev ship", "Run lint/test/commit/push/PR/deploy pipeline"],
    ["dev projects", "Change deployment status interactively"],
    ["dev palette", "Open command palette"],
  ]);

  renderSection("Useful Env", [
    ["LINEAR_API_KEY", "Create Linear projects/issues"],
    ["LINEAR_TEAM_ID", "Target Linear team"],
    ["DEV_CODE_CMD", "Custom VS Code command path"],
    ["DEV_PROJECTS_DIR", "Override projects directory"],
    ["DEV_SANDBOX_DIR", "Override sandbox directory"],
  ]);
}

function renderSection(title: string, rows: Array<[string, string]>) {
  const body = rows
    .map(([command, description]) => `${chalk.cyan(command.padEnd(22))} ${chalk.dim(description)}`)
    .join("\n");

  console.log(
    boxen(body, {
      title: ` ${title} `,
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderColor: "#A78BFA",
      borderStyle: "round",
    })
  );
}
