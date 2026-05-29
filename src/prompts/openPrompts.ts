import inquirer from "inquirer";
import { getProjectLabel } from "../registry/projects.js";
import { type ProjectRecord } from "../types/project.js";

export async function promptForProjectOpen(projects: ProjectRecord[]): Promise<ProjectRecord> {
  const { search } = await inquirer.prompt<{ search: string }>([
    {
      type: "input",
      name: "search",
      message: "Search projects:",
      default: "",
    },
  ]);

  const matches = filterProjects(projects, search);

  if (matches.length === 0) {
    throw new Error(`No projects matched "${search}".`);
  }

  const { project } = await inquirer.prompt<{ project: ProjectRecord }>([
    {
      type: "select",
      name: "project",
      message: "Open project:",
      pageSize: 12,
      choices: matches.map((item) => ({
        name: getProjectLabel(item),
        value: item,
      })),
    },
  ]);

  return project;
}

function filterProjects(projects: ProjectRecord[], search: string): ProjectRecord[] {
  const query = search.trim().toLowerCase();

  if (!query) {
    return projects;
  }

  return projects.filter((project) => {
    const haystack = [
      project.name,
      project.type,
      project.description,
      project.path,
      ...(project.tags ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return fuzzyIncludes(haystack, query);
  });
}

function fuzzyIncludes(value: string, query: string): boolean {
  let cursor = 0;

  for (const character of query) {
    cursor = value.indexOf(character, cursor);

    if (cursor === -1) {
      return false;
    }

    cursor += 1;
  }

  return true;
}
