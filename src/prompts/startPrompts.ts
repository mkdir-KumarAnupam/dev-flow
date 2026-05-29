import inquirer from "inquirer";
import { getLinearTeams } from "../integrations/linear.js";
import { type LinearPriority, type ProjectAnswers, type ProjectType } from "../types/project.js";
import { toKebabCase } from "../utils/text.js";

type StartPromptAnswers = Omit<ProjectAnswers, "linear"> & {
  linearEnabled: boolean;
  linearMode?: ProjectAnswers["linear"]["mode"];
  linearMoreDetails?: boolean;
  linearDeadline?: string;
  linearPriority?: LinearPriority;
  linearLead?: string;
  linearNotes?: string;
};

interface LinearConnection {
  apiKey?: string;
  teamId?: string;
}

const projectChoices: Array<{ name: string; value: ProjectType }> = [
  { name: "Next.js App", value: "nextjs" },
  { name: "React App (Vite)", value: "react-vite" },
  { name: "Express API", value: "express-api" },
  { name: "MERN Stack", value: "mern-stack" },
  { name: "CLI Tool", value: "cli-tool" },
  { name: "AI App", value: "ai-app" },
];

export async function promptForProjectStart(): Promise<ProjectAnswers> {
  const answers = await inquirer.prompt<StartPromptAnswers>([
    {
      type: "select",
      name: "type",
      message: "What are you building?",
      choices: projectChoices,
    },
    {
      type: "input",
      name: "name",
      message: "Project name:",
      filter: (value: string) => toKebabCase(value),
      validate: (value: string) => value.length > 0 || "Project name is required",
    },
    {
      type: "input",
      name: "description",
      message: "Project description:",
      default: "A fast-started development environment.",
    },
    {
      type: "confirm",
      name: "typescript",
      message: "Use TypeScript?",
      default: true,
    },
    {
      type: "confirm",
      name: "tailwind",
      message: "Add Tailwind CSS?",
      default: true,
      when: (answers) => ["nextjs", "react-vite"].includes(String(answers.type)),
    },
    {
      type: "select",
      name: "packageManager",
      message: "Package manager:",
      choices: ["npm", "pnpm", "yarn", "bun"],
      default: "npm",
    },
    {
      type: "select",
      name: "uiLibrary",
      message: "UI library:",
      choices: [
        { name: "None", value: "none" },
        { name: "shadcn/ui", value: "shadcn" },
        { name: "daisyUI", value: "daisyui" },
      ],
      default: "none",
      when: (answers) => answers.tailwind === true,
    },
    {
      type: "confirm",
      name: "git",
      message: "Initialize Git?",
      default: true,
    },
    {
      type: "select",
      name: "editor",
      message: "Preferred editor:",
      choices: [
        { name: "VS Code", value: "code" },
        { name: "Helix", value: "hx" },
        { name: "Neovim", value: "nvim" },
        { name: "WebStorm", value: "webstorm" },
      ],
      default: "code",
    },
    {
      type: "confirm",
      name: "openEditor",
      message: "Open editor after setup?",
      default: true,
    },
    {
      type: "confirm",
      name: "startDevServer",
      message: "Start dev server after setup?",
      default: true,
      when: (answers) => ["nextjs", "react-vite", "express-api", "mern-stack"].includes(String(answers.type)),
    },
    {
      type: "confirm",
      name: "docker",
      message: "Prepare Docker metadata?",
      default: false,
    },
    {
      type: "confirm",
      name: "githubRepo",
      message: "Create GitHub repo now?",
      default: false,
    },
    {
      type: "confirm",
      name: "linearEnabled",
      message: "Connect this to Linear Kanban?",
      default: false,
    },
    {
      type: "select",
      name: "linearMode",
      message: "Linear mode:",
      choices: [
        { name: "Project only", value: "project" },
        { name: "Project + starter issues", value: "project-with-issues" },
      ],
      default: "project-with-issues",
      when: (answers) => answers.linearEnabled === true,
    },
    {
      type: "confirm",
      name: "linearMoreDetails",
      message: "Add Linear planning details?",
      default: true,
      when: (answers) => answers.linearEnabled === true,
    },
    {
      type: "input",
      name: "linearDeadline",
      message: "Deadline / target date (YYYY-MM-DD, optional):",
      when: (answers) => answers.linearMoreDetails === true,
    },
    {
      type: "select",
      name: "linearPriority",
      message: "Priority:",
      choices: [
        { name: "None", value: "none" },
        { name: "Urgent", value: "urgent" },
        { name: "High", value: "high" },
        { name: "Medium", value: "medium" },
        { name: "Low", value: "low" },
      ],
      default: "medium",
      when: (answers) => answers.linearMoreDetails === true,
    },
    {
      type: "input",
      name: "linearLead",
      message: "Owner / lead (optional):",
      when: (answers) => answers.linearMoreDetails === true,
    },
    {
      type: "input",
      name: "linearNotes",
      message: "Planning notes (optional):",
      when: (answers) => answers.linearMoreDetails === true,
    },
    {
      type: "input",
      name: "tags",
      message: "Tags (comma separated):",
      filter: (value: string) =>
        value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
    },
  ]);

  return {
    ...answers,
    tailwind: answers.tailwind ?? false,
    startDevServer: answers.startDevServer ?? false,
    uiLibrary: answers.uiLibrary ?? "none",
    linear: {
      enabled: Boolean(answers.linearEnabled),
      mode: answers.linearMode ?? "project-with-issues",
      details: answers.linearMoreDetails
        ? {
            deadline: answers.linearDeadline?.trim() || undefined,
            priority: answers.linearPriority ?? "none",
            lead: answers.linearLead?.trim() || undefined,
            notes: answers.linearNotes?.trim() || undefined,
          }
        : undefined,
    },
    tags: answers.tags ?? [],
  } as ProjectAnswers;
}

export async function promptForLinearConnection(): Promise<LinearConnection> {
  const existingApiKey = process.env.LINEAR_API_KEY;
  const existingTeamId = process.env.LINEAR_TEAM_ID;
  let apiKey = existingApiKey;

  if (!apiKey) {
    const { enteredApiKey } = await inquirer.prompt<{ enteredApiKey: string }>([
      {
        type: "password",
        name: "enteredApiKey",
        message: "Linear API key (leave blank to write handoff file):",
        mask: "*",
      },
    ]);

    apiKey = enteredApiKey.trim() || undefined;
  }

  if (!apiKey) {
    return {};
  }

  if (existingTeamId) {
    return { apiKey, teamId: existingTeamId };
  }

  let teams = [];

  try {
    teams = await getLinearTeams(apiKey);
  } catch {
    const { teamId } = await inquirer.prompt<{ teamId: string }>([
      {
        type: "input",
        name: "teamId",
        message: "Linear team ID (leave blank to write handoff file):",
      },
    ]);

    return { apiKey, teamId: teamId.trim() || undefined };
  }

  if (teams.length === 0) {
    return { apiKey };
  }

  const { teamId } = await inquirer.prompt<{ teamId: string }>([
    {
      type: "select",
      name: "teamId",
      message: "Linear team:",
      choices: teams.map((team) => ({
        name: `${team.name} (${team.key})`,
        value: team.id,
      })),
    },
  ]);

  return { apiKey, teamId };
}
