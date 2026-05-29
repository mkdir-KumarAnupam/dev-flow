import boxen from "boxen";
import chalk from "chalk";

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const bootStates = [
  { runtime: "booting", signal: "idea", primary: "#00E5FF", scan: "----------", nodes: ["*", ".", ".", "."], fill: 1 },
  { runtime: "linking", signal: "prompt", primary: "#63E6BE", scan: "###-------", nodes: ["*", "*", ".", "."], fill: 2 },
  { runtime: "syncing", signal: "generate", primary: "#A78BFA", scan: "######----", nodes: ["*", "*", "*", "."], fill: 3 },
  { runtime: "online", signal: "ship", primary: "#FF4FD8", scan: "##########", nodes: ["*", "*", "*", "*"], fill: 5 },
];

export function renderDevHeader(state = bootStates[bootStates.length - 1]) {
  console.log(buildDevHeader(state));
}

export async function playLaunchSequence() {
  for (let cycle = 0; cycle < 2; cycle += 1) {
    for (const state of bootStates) {
      console.clear();
      console.log(buildDevHeader(state));
      await sleep(cycle === 0 ? 130 : 90);
    }
  }
}

export function renderCreationMap(projectName: string) {
  console.log(
    boxen(
      [
        `${chalk.cyanBright("creating")} ${chalk.bold(projectName)}`,
        "",
        `${chalk.hex("#00E5FF")("prompt")}    ${chalk.dim("->")} ${chalk.green("generate")}  ${chalk.dim("->")} ${chalk.hex("#A78BFA")("metadata")}  ${chalk.dim("->")} ${chalk.hex("#5E6AD2")("kanban")}`,
        `${chalk.dim("inputs")}       ${chalk.dim("files")}         ${chalk.dim(".devmeta")}      ${chalk.dim("Linear")}`,
        "",
        `${chalk.yellow("registry")} ${chalk.dim("<-")} ${chalk.blue("workspace")} ${chalk.dim("<-")} ${chalk.green("git")} ${chalk.dim("<-")} ${chalk.hex("#A78BFA")("editor")}`,
      ].join("\n"),
      {
        title: " launch map ",
        padding: {
          top: 1,
          bottom: 1,
          left: 2,
          right: 2,
        },
        borderColor: "#63E6BE",
        borderStyle: "round",
      }
    )
  );
}

export function renderStage(title: string, detail: string) {
  console.log(
    boxen(`${chalk.bold(title)}\n${chalk.dim(detail)}`, {
      padding: 1,
      borderColor: "gray",
      borderStyle: "single",
    })
  );
}

export function renderCompletion(projectPath: string, linearUrl?: string) {
  const lines = [
    chalk.greenBright("Environment online"),
    "",
    `${chalk.dim("path")}   ${chalk.cyan(projectPath)}`,
  ];

  if (linearUrl) {
    lines.push(`${chalk.dim("linear")} ${chalk.hex("#5E6AD2")(linearUrl)}`);
  }

  console.log(
    boxen(lines.join("\n"), {
      padding: 1,
      borderColor: "green",
      borderStyle: "double",
    })
  );
}

function buildDevHeader(state: (typeof bootStates)[number]) {
  const accent = chalk.hex("#00E5FF");
  const hot = chalk.hex("#FF4FD8");
  const violet = chalk.hex("#A78BFA");
  const green = chalk.hex("#63E6BE");
  const muted = chalk.hex("#8A90B8");
  const ghost = chalk.hex("#4B5177");
  const pulse = chalk.hex(state.primary);
  const nodes = state.nodes.map((node) => pulse(node)).join(ghost("--"));
  const logo = buildFilledLogo(state.fill);

  const body = [
    `${ghost("/")} ${muted("runtime")} ${pulse(state.runtime.padEnd(7))} ${ghost("---------")} ${pulse(state.scan)} ${ghost("---------")} ${accent("v1")}`,
    "",
    `${logo[0]}   ${chalk.whiteBright("Workflow OS")} ${ghost("::")} ${nodes}`,
    `${logo[1]}   ${muted("idea")} ${ghost("->")} ${green("env")} ${ghost("->")} ${violet("workspace")}`,
    `${logo[2]}   ${ghost("--------------------------------")}`,
    `${logo[3]}   ${accent("start")} ${chalk.white("build")}   ${violet("open")} ${chalk.white("resume")}   ${green("restore")} ${chalk.white("boot")}`,
    `${logo[4]}   ${hot("linear")} ${chalk.white("kanban")}   ${accent("registry")} ${chalk.white("indexed")}`,
    `${logo[5]}   ${muted("terminal-first / keyboard-first")}`,
    "",
    `${ghost("\\")} ${muted("signal")} ${accent("prompt")} ${ghost("->")} ${green("generate")} ${ghost("->")} ${violet("orchestrate")} ${ghost("->")} ${pulse(state.signal)}`,
  ].join("\n");

  return boxen(body, {
    title: chalk.cyanBright(" dev://workflow-os "),
    titleAlignment: "center",
    padding: {
      top: 1,
      bottom: 1,
      left: 2,
      right: 2,
    },
    margin: 0,
    borderColor: state.primary,
    borderStyle: "double",
  });
}

function buildFilledLogo(fill: number) {
  const cyan = chalk.hex("#00E5FF");
  const pink = chalk.hex("#FF4FD8");
  const violet = chalk.hex("#A78BFA");
  const ghost = chalk.hex("#242A44");
  const layers = [
    ["██████╗  ███████╗██╗   ██╗", cyan],
    ["██╔══██╗ ██╔════╝██║   ██║", cyan],
    ["██║  ██║ █████╗  ██║   ██║", pink],
    ["██║  ██║ ██╔══╝  ╚██╗ ██╔╝", pink],
    ["██████╔╝ ███████╗ ╚████╔╝ ", violet],
    ["╚═════╝  ╚══════╝  ╚═══╝  ", violet],
  ] as const;

  return layers.map(([line, color], index) => {
    if (index <= fill) {
      return color(line);
    }

    return ghost(line.replace(/[^\s]/g, "░"));
  });
}
