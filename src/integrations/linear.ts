import fs from "fs-extra";
import path from "node:path";
import { type ProjectAnswers } from "../types/project.js";

const LINEAR_GRAPHQL_ENDPOINT = "https://api.linear.app/graphql";

interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

export interface LinearSyncResult {
  projectId?: string;
  projectUrl?: string;
  pendingFile?: string;
  status: "synced" | "pending";
  message?: string;
}

export async function syncProjectToLinear(
  answers: ProjectAnswers,
  projectPath: string,
  teamId?: string
): Promise<LinearSyncResult | undefined> {
  if (!answers.linear.enabled) {
    return undefined;
  }

  const apiKey = answers.linear.apiKey ?? process.env.LINEAR_API_KEY;
  const resolvedTeamId = teamId ?? answers.linear.teamId ?? process.env.LINEAR_TEAM_ID;

  if (!apiKey || !resolvedTeamId) {
    return createLinearHandoffFile(answers, projectPath);
  }

  try {
    const project = await linearRequest<{
      projectCreate: {
        success: boolean;
        project: {
          id: string;
          url: string;
        };
      };
    }>(
      apiKey,
      `mutation CreateProject($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            url
          }
        }
      }`,
      {
        input: {
          name: answers.name,
          description: buildLinearDescription(answers),
          teamIds: [resolvedTeamId],
          color: "#5E6AD2",
        },
      }
    );

    const projectId = project.projectCreate.project.id;

    if (answers.linear.mode === "project-with-issues") {
      await createPlanningIssues(apiKey, answers, resolvedTeamId, projectId);
    }

    return {
      projectId,
      projectUrl: project.projectCreate.project.url,
      status: "synced",
    };
  } catch (error) {
    return createLinearHandoffFile(answers, projectPath, getLinearErrorMessage(error));
  }
}

export async function getLinearTeams(apiKey = process.env.LINEAR_API_KEY): Promise<LinearTeam[]> {

  if (!apiKey) {
    return [];
  }

  const data = await linearRequest<{
    teams: {
      nodes: LinearTeam[];
    };
  }>(
    apiKey,
    `query Teams {
      teams {
        nodes {
          id
          name
          key
        }
      }
    }`,
    {}
  );

  return data.teams.nodes;
}

async function createPlanningIssues(
  apiKey: string,
  answers: ProjectAnswers,
  teamId: string,
  projectId: string
) {
  const issues = [
    {
      title: "Define workspace restore contract",
      description: "Capture editor, dev server, terminal panes, env loading, and restore behavior for this project.",
    },
    {
      title: "Ship first runnable vertical slice",
      description: "Get the generated project to a clean install, dev command, and README-backed startup path.",
    },
    {
      title: "Add automation hooks",
      description: "Decide which processes dev should launch automatically when this project is opened or restored.",
    },
  ];

  for (const issue of issues) {
    await linearRequest(
      apiKey,
      `mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
        }
      }`,
      {
        input: {
          teamId,
          projectId,
          title: issue.title,
          description: issue.description,
        },
      }
    );
  }
}

async function createLinearHandoffFile(
  answers: ProjectAnswers,
  projectPath: string,
  reason = "Missing LINEAR_API_KEY or Linear team ID."
): Promise<LinearSyncResult> {
  const pendingFile = path.join(projectPath, "linear-kanban.md");
  const body = `# Linear Kanban Handoff

Reason: ${reason}

Set \`LINEAR_API_KEY\` and \`LINEAR_TEAM_ID\`, or enter them during \`dev start\`, to create the project automatically.

## Project

- Name: ${answers.name}
- Type: ${answers.type}
- Description: ${answers.description}
- Mode: ${answers.linear.mode}
- Deadline: ${answers.linear.details?.deadline ?? "none"}
- Priority: ${answers.linear.details?.priority ?? "none"}
- Lead: ${answers.linear.details?.lead ?? "none"}

## Planning Notes

${answers.linear.details?.notes ?? "No extra notes."}

## Suggested Issues

- Define workspace restore contract
- Ship first runnable vertical slice
- Add automation hooks
`;

  await fs.writeFile(pendingFile, body);
  return { pendingFile, status: "pending", message: reason };
}

async function linearRequest<T>(
  apiKey: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await fetch(LINEAR_GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Linear API request failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as {
    data?: T;
    errors?: Array<{ message: string }>;
  };

  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join("; "));
  }

  if (!payload.data) {
    throw new Error("Linear API returned no data.");
  }

  return payload.data;
}

function buildLinearDescription(answers: ProjectAnswers) {
  return [
    answers.description,
    "",
    "Planning details:",
    `- Deadline: ${answers.linear.details?.deadline ?? "none"}`,
    `- Priority: ${answers.linear.details?.priority ?? "none"}`,
    `- Lead: ${answers.linear.details?.lead ?? "none"}`,
    `- Notes: ${answers.linear.details?.notes ?? "none"}`,
    "",
    "Created from dev.",
    "",
    `Type: ${answers.type}`,
    `Package manager: ${answers.packageManager}`,
    `Editor: ${answers.editor}`,
    `Tags: ${answers.tags.join(", ") || "none"}`,
  ].join("\n");
}

function getLinearErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown Linear API error.";
}
