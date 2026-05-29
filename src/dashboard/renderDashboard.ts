import boxen from "boxen";
import chalk from "chalk";
import { getPracticeAnalytics, topEntry } from "../analytics/practiceAnalytics.js";

export async function renderDashboard() {
  const analytics = await getPracticeAnalytics();
  const weak = topEntry(analytics.topicStuck)?.[0] ?? "none";
  const recent = analytics.records.slice(0, 5);

  const header = `  ${chalk.bgHex("#00E5FF").black(" DEV ")} ${chalk.cyanBright("COMPETITIVE DASHBOARD")} ${chalk.dim("// cockpit")}  `;

  const statsGrid = [
    `  ${chalk.dim("✦ STREAK".padEnd(14))} ${chalk.greenBright(`${analytics.currentStreak}d`)}`,
    `  ${chalk.dim("⬢ SOLVED".padEnd(14))} ${chalk.greenBright(String(analytics.solved))}`,
    `  ${chalk.dim("⨯ STUCK".padEnd(14))} ${chalk.yellowBright(String(analytics.stuck))}`,
    `  ${chalk.dim("△ WEAK".padEnd(14))} ${chalk.magentaBright(weak)}`,
    `  ${chalk.dim("▦ ACTIVE".padEnd(14))} ${chalk.whiteBright(String(analytics.activeDays.size))}`,
  ].join("\n");

  console.log(
    boxen(
      [
        header,
        "",
        statsGrid
      ].join("\n"),
      {
        title: chalk.cyanBright(" overview "),
        borderColor: "#00E5FF",
        borderStyle: "bold",
        padding: { top: 1, bottom: 1, left: 1, right: 1 },
        margin: { bottom: 1 }
      }
    )
  );

  const recentRows = recent.length
    ? recent.map((record) => {
        const icon = statusIcon(record.status);
        const title = chalk.white(record.title.padEnd(30).slice(0, 30));
        const diff = chalk.dim(record.difficulty.padEnd(8));
        const topics = chalk.cyan(record.topics.slice(0, 2).join(", "));
        return `  ${icon}  ${title} ${diff} ${topics}`;
      }).join("\n")
    : `  ${chalk.dim("No recent activity yet. Run `dev -s random`.")}`;

  console.log(
    boxen(recentRows, {
      title: chalk.greenBright(" recent activity "),
      borderColor: "#63E6BE",
      borderStyle: "round",
      padding: { top: 1, bottom: 1, left: 1, right: 1 },
    })
  );
}

function statusIcon(status: string) {
  switch (status) {
    case "solved":
      return chalk.greenBright("✓");
    case "stuck":
      return chalk.yellowBright("⨯");
    default:
      return chalk.cyanBright("○");
  }
}
