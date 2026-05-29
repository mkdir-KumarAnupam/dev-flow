import fs from "fs-extra";
import inquirer from "inquirer";
import path from "node:path";
import {
  type SandboxActivity,
  type SandboxLanguage,
  type SandboxRecord,
  type SandboxType,
} from "../types/sandbox.js";
import { getSandboxDirectory } from "../utils/paths.js";
import { toKebabCase } from "../utils/text.js";

const languageChoices: Array<{ name: string; value: SandboxLanguage }> = [
  { name: "C++", value: "cpp" },
  { name: "Java", value: "java" },
  { name: "Python", value: "python" },
  { name: "SQL", value: "sql" },
  { name: "JavaScript", value: "javascript" },
  { name: "C", value: "c" },
];

const activityChoices: Array<{ name: string; value: SandboxActivity }> = [
  { name: "Assignment", value: "assignment" },
  { name: "Lab", value: "lab" },
  { name: "Viva Practice", value: "viva-practice" },
  { name: "DSA Practice", value: "dsa-practice" },
  { name: "Mini Project", value: "mini-project" },
  { name: "Exam Revision", value: "exam-revision" },
  { name: "Experiment", value: "experiment" },
];

export async function promptForSandbox(): Promise<SandboxRecord> {
  const { type } = await inquirer.prompt<{ type: SandboxType }>([
    {
      type: "select",
      name: "type",
      message: "What type of sandbox?",
      choices: [
        { name: "University Flow", value: "university" },
        { name: "Competitive Coding", value: "competitive" },
        { name: "Sandbox Practice", value: "practice" },
        { name: "Interview Prep", value: "interview" },
        { name: "Research / Experiments", value: "research" },
      ],
    },
  ]);

  if (type === "university") {
    return promptForUniversitySandbox();
  }

  if (type === "competitive") {
    return promptForCompetitiveSandbox();
  }

  return promptForScratchSandbox(type);
}

async function promptForUniversitySandbox(): Promise<SandboxRecord> {
  const sandboxRoot = getSandboxDirectory();
  const { semester } = await inquirer.prompt<{ semester: number }>([
    {
      type: "select",
      name: "semester",
      message: "Select semester:",
      choices: Array.from({ length: 8 }, (_, index) => ({
        name: `Semester ${index + 1}`,
        value: index + 1,
      })),
    },
  ]);

  const semesterPath = path.join(sandboxRoot, "university", `sem-${semester}`);
  const existingCourses = await getExistingCourses(semesterPath);
  const { courseChoice } = await inquirer.prompt<{ courseChoice: string }>([
    {
      type: "select",
      name: "courseChoice",
      message: "Select course:",
      choices: [
        ...existingCourses.map((course) => ({ name: course, value: course })),
        { name: "Create New Course", value: "__new" },
      ],
    },
  ]);

  const course = courseChoice === "__new" ? await promptForNewCourse() : courseChoice;
  const common = await promptForLanguageAndActivity("sql");
  const name = await promptForSandboxName(common.activity);
  const courseSlug = toKebabCase(course);
  const sandboxPath = path.join(semesterPath, courseSlug, toKebabCase(name));

  return createBaseRecord({
    name,
    type: "university",
    path: sandboxPath,
    semester,
    course,
    ...common,
  });
}

async function promptForCompetitiveSandbox(): Promise<SandboxRecord> {
  const answers = await inquirer.prompt<{
    platform: SandboxRecord["platform"];
    difficulty: SandboxRecord["difficulty"];
    topic: string;
    language: SandboxLanguage;
    problemName: string;
  }>([
    {
      type: "select",
      name: "platform",
      message: "Platform:",
      choices: ["leetcode", "codeforces", "codechef", "hackerrank"],
      default: "leetcode",
    },
    {
      type: "select",
      name: "difficulty",
      message: "Difficulty:",
      choices: ["easy", "medium", "hard"],
      default: "medium",
    },
    {
      type: "select",
      name: "topic",
      message: "Topic:",
      choices: ["arrays", "dp", "graphs", "trees", "sliding-window", "binary-search", "greedy"],
      default: "arrays",
    },
    {
      type: "select",
      name: "language",
      message: "Language:",
      choices: languageChoices.filter((choice) => ["cpp", "java", "python"].includes(choice.value)),
      default: "cpp",
    },
    {
      type: "input",
      name: "problemName",
      message: "Problem / session name:",
      default: "practice-session",
      filter: (value: string) => toKebabCase(value),
    },
  ]);

  const sandboxPath = path.join(
    getSandboxDirectory(),
    "competitive",
    answers.platform ?? "platform",
    answers.topic,
    answers.problemName
  );

  return createBaseRecord({
    name: answers.problemName,
    type: "competitive",
    path: sandboxPath,
    activity: "dsa-practice",
    language: answers.language,
    platform: answers.platform,
    difficulty: answers.difficulty,
    topic: answers.topic,
  });
}

async function promptForScratchSandbox(type: SandboxType): Promise<SandboxRecord> {
  const common = await promptForLanguageAndActivity(type === "research" ? "python" : "javascript");
  const name = await promptForSandboxName(common.activity);
  const sandboxPath = path.join(getSandboxDirectory(), type === "research" ? "research" : "scratch", toKebabCase(name));

  return createBaseRecord({
    name,
    type,
    path: sandboxPath,
    ...common,
  });
}

async function promptForLanguageAndActivity(defaultLanguage: SandboxLanguage) {
  return inquirer.prompt<{ language: SandboxLanguage; activity: SandboxActivity }>([
    {
      type: "select",
      name: "language",
      message: "Select language:",
      choices: languageChoices,
      default: defaultLanguage,
    },
    {
      type: "select",
      name: "activity",
      message: "Select activity type:",
      choices: activityChoices,
      default: "experiment",
    },
  ]);
}

async function promptForSandboxName(activity: SandboxActivity) {
  const { name } = await inquirer.prompt<{ name: string }>([
    {
      type: "input",
      name: "name",
      message: "Sandbox name:",
      default: activity,
      filter: (value: string) => toKebabCase(value),
      validate: (value: string) => value.length > 0 || "Sandbox name is required",
    },
  ]);

  return name;
}

async function promptForNewCourse() {
  const { course } = await inquirer.prompt<{ course: string }>([
    {
      type: "input",
      name: "course",
      message: "Course name:",
      default: "DBMS",
      validate: (value: string) => value.trim().length > 0 || "Course name is required",
    },
  ]);

  return course.trim();
}

async function getExistingCourses(semesterPath: string) {
  if (!(await fs.pathExists(semesterPath))) {
    return [];
  }

  const entries = await fs.readdir(semesterPath, { withFileTypes: true });
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
}

function createBaseRecord(record: Omit<SandboxRecord, "id" | "createdAt" | "history">): SandboxRecord {
  return {
    ...record,
    id: `${record.type}:${record.path}`,
    createdAt: new Date().toISOString(),
    tags: record.tags ?? [],
    history: [
      {
        action: "created",
        at: new Date().toISOString(),
      },
    ],
  };
}
