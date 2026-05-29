import inquirer from "inquirer";
import { getProjectLabel } from "../registry/projects.js";
import { type ProjectRecord } from "../types/project.js";

export async function selectProject(
  projects: ProjectRecord[],
  message = "Select project:"
): Promise<ProjectRecord | undefined> {
  if (projects.length === 0) {
    return undefined;
  }

  const { project } = await inquirer.prompt<{ project: ProjectRecord | "none" }>([
    {
      type: "select",
      name: "project",
      message,
      pageSize: 12,
      choices: [
        { name: "Cancel", value: "none" },
        ...projects.map((item) => ({
          name: getProjectLabel(item),
          value: item,
        })),
      ],
    },
  ]);

  return project === "none" ? undefined : project;
}

