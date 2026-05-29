import boxen from "boxen";
import chalk from "chalk";
import { getSandboxesFromRegistry } from "../registry/sandboxes.js";

export async function semesterCommand(value: string) {
  const semester = Number(value);

  if (!Number.isInteger(semester) || semester < 1 || semester > 8) {
    console.log(chalk.yellow("Usage: dev semester <1-8>"));
    return;
  }

  const records = (await getSandboxesFromRegistry()).filter((record) => record.semester === semester);
  const courses = new Set(records.map((record) => record.course).filter(Boolean));

  console.log(
    boxen(
      [
        `${chalk.cyanBright(`semester ${semester}`)}`,
        "",
        `${chalk.dim("courses")} ${chalk.whiteBright(String(courses.size))}`,
        `${chalk.dim("contexts")} ${chalk.whiteBright(String(records.length))}`,
      ].join("\n"),
      {
        title: " university ",
        borderColor: "#00E5FF",
        borderStyle: "double",
        padding: 1,
      }
    )
  );

  for (const course of courses) {
    const courseRecords = records.filter((record) => record.course === course);
    console.log(chalk.green(`\n${course}`));

    for (const record of courseRecords.slice(0, 8)) {
      console.log(`  ${chalk.dim("•")} ${record.name} ${chalk.dim(record.activity)} ${chalk.cyan(record.language)}`);
    }
  }
}

