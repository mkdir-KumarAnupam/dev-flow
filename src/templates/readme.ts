import fs from "fs-extra";
import path from "node:path";
import { type ProjectAnswers } from "../types/project.js";

export async function createReadme(answers: ProjectAnswers, projectPath: string) {
  const readme = `# ${answers.name}

${answers.description}

## Stack

- ${answers.type}
- ${answers.typescript ? "TypeScript" : "JavaScript"}
- Package manager: ${answers.packageManager}
- Tailwind: ${answers.tailwind ? "yes" : "no"}
- UI library: ${answers.uiLibrary}
- Linear: ${answers.linear.enabled ? answers.linear.mode : "not connected"}

## dev

This project was created by \`dev\`, a terminal-native developer workflow environment.
`;

  await fs.writeFile(path.join(projectPath, "README.md"), readme);
}
