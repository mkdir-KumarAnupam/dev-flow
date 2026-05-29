import boxen from "boxen";
import chalk from "chalk";
import { getPracticeAnalytics } from "../analytics/practiceAnalytics.js";

const palette = ["#00E5FF", "#FF4FD8", "#A78BFA", "#63E6BE", "#FBBF24", "#F87171", "#60A5FA"];
const block = "\u2588";
const dot = "o";
const idleDot = ".";

export async function renderPracticeGraph(kind = "activity") {
  const analytics = await getPracticeAnalytics();

  if (kind === "topics") {
    renderDonutGraph("Topic Distribution", analytics.topicCounts);
    return;
  }

  if (kind === "difficulty") {
    renderBarGraph("Difficulty Distribution", analytics.difficultyCounts);
    return;
  }

  if (kind === "time") {
    const timeByTopic = new Map<string, number>();

    for (const record of analytics.records) {
      for (const topic of record.topics) {
        timeByTopic.set(topic, (timeByTopic.get(topic) ?? 0) + record.timeSpentMinutes);
      }
    }

    renderBarGraph("Time By Topic", timeByTopic, "m");
    return;
  }

  renderHeatmap(analytics.activeDays);
}

function renderDonutGraph(title: string, map: Map<string, number>) {
  console.log(formatTopicDonut(title, map));
}

export function formatTopicDonut(title: string, map: Map<string, number>) {
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0 || total === 0) {
    return boxen(chalk.dim("No practice data yet."), {
        title: ` ${title} `,
        borderColor: "#00E5FF",
        borderStyle: "round",
        padding: 1,
      });
  }

  const slices = entries.map(([label, value], index) => ({
    label,
    value,
    percent: value / total,
    color: palette[index % palette.length],
  }));
  const ring = buildDonutRing(slices, total);
  const legend = slices.map((slice) => {
    const percent = `${(slice.percent * 100).toFixed(slice.percent < 0.1 ? 1 : 0)}%`;
    const color = chalk.hex(slice.color);
    const meterWidth = 12;
    const meter = color(block.repeat(Math.max(1, Math.round(slice.percent * meterWidth))).padEnd(meterWidth));

    return `${color(dot)} ${chalk.cyan(slice.label.padEnd(16))} ${chalk.white(String(slice.value).padStart(2))} ${chalk.dim(percent.padStart(6))}  ${meter}`;
  });
  const strongest = entries[0];

  return boxen(
    [
      ...ring,
      "",
      `${chalk.dim("dominant")} ${chalk.white(strongest[0])}   ${chalk.dim("unique")} ${chalk.whiteBright(String(entries.length))}   ${chalk.dim("hits")} ${chalk.whiteBright(String(total))}`,
      "",
      ...legend,
    ].join("\n"),
    {
      title: ` ${title} `,
      borderColor: "#00E5FF",
      borderStyle: "double",
      padding: { top: 1, bottom: 1, left: 2, right: 2 },
    }
  );
}

function buildDonutRing(slices: Array<{ color: string; percent: number }>, total: number) {
  const width = 27;
  const height = 13;
  const centerX = (width - 1) / 2;
  const centerY = (height - 1) / 2;
  const outerRadius = 6.4;
  const innerRadius = 4.1;
  const rows: string[] = [];

  const cumulative = slices.reduce<number[]>((acc, slice) => {
    const last = acc.length ? acc[acc.length - 1] : 0;
    acc.push(last + slice.percent * Math.PI * 2);
    return acc;
  }, []);

  for (let y = 0; y < height; y += 1) {
    const line: string[] = [];
    for (let x = 0; x < width; x += 1) {
      const dx = x - centerX;
      const dy = (y - centerY) * 2;
      const radius = Math.sqrt(dx * dx + dy * dy);

      if (radius < innerRadius || radius > outerRadius) {
        line.push(" ");
        continue;
      }

      const angle = Math.atan2(dy, dx);
      const normalized = angle < -Math.PI / 2 ? angle + Math.PI * 2 : angle;
      const offset = normalized + Math.PI / 2;
      const sliceIndex = cumulative.findIndex((value) => offset <= value);
      const index = sliceIndex === -1 ? slices.length - 1 : sliceIndex;
      const color = slices[index]?.color;

      line.push(color ? chalk.hex(color)(dot) : dot);
    }
    rows.push(line.join(" "));
  }

  return rows;
}


function renderBarGraph(title: string, map: Map<string, number>, suffix = "") {
  const max = Math.max(1, ...map.values());
  const rows = [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], index) => {
      const width = Math.max(1, Math.round((value / max) * 24));
      return `${chalk.cyan(label.padEnd(16))} ${chalk.hex(palette[index % palette.length])(block.repeat(width))} ${value}${suffix}`;
    });

  console.log(
    boxen(rows.length ? rows.join("\n") : chalk.dim("No practice data yet."), {
      title: ` ${title} `,
      borderColor: "#00E5FF",
      borderStyle: "round",
      padding: 1,
    })
  );
}

function renderHeatmap(days: Set<string>) {
  console.log(formatDayHeatmap("Activity Matrix", days));
}

export function formatDayHeatmap(title: string, days: Set<string>) {
  const today = new Date();
  const daysToShow = 56;
  const columns = 14;
  const rowsCount = Math.ceil(daysToShow / columns);
  const cells: string[] = [];

  for (let index = daysToShow - 1; index >= 0; index -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    const active = days.has(day.toISOString().slice(0, 10));
    cells.push(active ? chalk.hex("#22C55E")(dot) : chalk.hex("#343A5E")(idleDot));
  }

  const rows = Array.from({ length: rowsCount }, (_, row) => cells.slice(row * columns, row * columns + columns).join("  "));

  return boxen(`${rows.join("\n")}\n\n${chalk.dim("last 56 days, left to right")}`, {
      title: ` ${title} `,
      borderColor: "#63E6BE",
      borderStyle: "round",
      padding: 1,
    });
}
