import boxen from "boxen";
import chalk from "chalk";
import { getAchievements } from "../achievements/achievements.js";
import { getPracticeAnalytics, topEntry } from "../analytics/practiceAnalytics.js";
import { formatTopicDonut } from "../graphs/renderGraphs.js";
import { type ProblemRecord } from "../types/problem.js";

const palette = ["#00E5FF", "#FF4FD8", "#A78BFA", "#63E6BE", "#FBBF24", "#F87171", "#60A5FA"];
const block = "■";
const idleBlock = "□";

export async function renderProfile() {
  const analytics = await getPracticeAnalytics();
  const favoriteTopic = topEntry(analytics.topicCounts)?.[0] ?? "none";
  const platform = topEntry(analytics.platformCounts)?.[0] ?? "none";
  const hours = Math.round((analytics.totalMinutes / 60) * 10) / 10;
  const solveRate = analytics.attempted === 0 ? 0 : Math.round((analytics.solved / analytics.attempted) * 100);
  const achievements = getAchievements(analytics);
  const name = process.env.USERNAME ?? process.env.USER ?? "dev";

  console.log(
    boxen(
      [
        `  ${chalk.bgHex("#A78BFA").black(` ${name.toUpperCase()} `)} ${chalk.whiteBright("COMPETITIVE PROFILE")} ${chalk.dim("// memory")}`,
        "",
        renderStatRail([
          ["⬢ SOLVED", analytics.solved, "#63E6BE"],
          ["○ ATTEMPTED", analytics.attempted, "#00E5FF"],
          ["✦ STREAK", `${analytics.currentStreak}d`, "#22C55E"],
          ["◷ TIME", `${hours}h`, "#FF4FD8"],
          ["▲ RATE", `${solveRate}%`, "#FBBF24"],
        ]),
        "",
        chalk.cyanBright(" ◇ activity pulse"),
        renderHeatmap(analytics.activeDays),
        "",
        chalk.cyanBright(" ◇ difficulty mix"),
        ...renderDifficultyRows(analytics.difficultyCounts),
        "",
        chalk.cyanBright(" ◇ signal"),
        `  ${chalk.dim("◆ favorite".padEnd(14))} ${chalk.white(favoriteTopic)}   ${chalk.dim("◆ platform".padEnd(14))} ${chalk.white(platform)}`,
        `  ${chalk.dim("◆ languages".padEnd(14))} ${chalk.white([...analytics.languages].join(", ") || "none yet")}`,
        "",
        chalk.cyanBright(" ◇ recent activity"),
        ...renderRecentRows(analytics.records),
        "",
        chalk.cyanBright(" ◇ unlocked"),
        renderAchievementChips(achievements),
      ].join("\n"),
      {
        title: chalk.magentaBright(" cockpit "),
        borderColor: "#A78BFA",
        borderStyle: "bold",
        padding: { top: 1, bottom: 1, left: 1, right: 1 },
      }
    )
  );

  console.log(formatTopicDonut("topic distribution", analytics.topicCounts));
}

function renderStatRail(stats: Array<[string, string | number, string]>) {
  return "  " + stats
    .map(([label, value, color]) => `${chalk.dim(label)} ${chalk.bgHex(color).black(` ${value} `)}`)
    .join("   ");
}

function renderHeatmap(days: Set<string>) {
  const today = new Date();
  const daysToShow = 56;
  const columns = 14;
  const rowsCount = Math.ceil(daysToShow / columns);
  const cells: string[] = [];

  for (let index = daysToShow - 1; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    const active = days.has(day.toISOString().slice(0, 10));
    // Provide a gradient based on some randomness or just solid for active
    cells.push(active ? chalk.hex("#22C55E")(block) : chalk.hex("#1E1E2E")(block));
  }

  const rows = Array.from({ length: rowsCount }, (_, row) => `  ${cells.slice(row * columns, row * columns + columns).join(" ")}`);

  return `${rows.join("\n")}\n  ${chalk.dim("last 56 days")}`;
}

function renderDifficultyRows(map: Map<string, number>) {
  const order = ["easy", "medium", "hard"];
  const total = order.reduce((sum, key) => sum + (map.get(key) ?? 0), 0);

  if (total === 0) {
    return [chalk.dim("  no difficulty data yet")];
  }

  return order.map((difficulty, index) => {
    const value = map.get(difficulty) ?? 0;
    const percent = total === 0 ? 0 : Math.round((value / total) * 100);
    const color = chalk.hex(palette[(index + 3) % palette.length]);
    const meterCount = Math.max(1, Math.round((percent / 100) * 20));
    const meter = value === 0 ? chalk.dim(".".repeat(20)) : color("█".repeat(meterCount).padEnd(20, "░"));

    return `  ${chalk.white(difficulty.padEnd(8))} ${meter} ${chalk.dim(`${value} / ${percent}%`)}`;
  });
}

function renderRecentRows(records: ProblemRecord[]) {
  const rows = records.slice(0, 5).map((record) => {
    const status = statusIcon(record.status);
    const topic = record.topics[0] ?? "general";
    return `  ${status} ${chalk.white(record.title.padEnd(30).slice(0, 30))} ${chalk.dim(record.platform.padEnd(12))} ${chalk.magenta(topic)}`;
  });

  return rows.length ? rows : [chalk.dim("  no recent sessions yet")];
}

function renderAchievementChips(achievements: string[]) {
  if (achievements.length === 0) {
    return chalk.dim("  keep solving to unlock your first badge");
  }

  return `  ${achievements.map((a) => chalk.bgHex("#FBBF24").black(` ${a} `)).join(" ")}`;
}

function statusIcon(status: string) {
  switch (status) {
    case "solved":
      return chalk.greenBright("✓");
    case "stuck":
      return chalk.yellowBright("⨯");
    case "attempted":
      return chalk.cyanBright("○");
    default:
      return chalk.dim("·");
  }
}

