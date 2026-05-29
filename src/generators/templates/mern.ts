import fs from "fs-extra";
import path from "node:path";
import { type ProjectAnswers } from "../../types/project.js";
import { createExpressTemplate } from "./express.js";

export async function createMernTemplate(answers: ProjectAnswers, projectPath: string) {
  await fs.ensureDir(projectPath);
  await createExpressTemplate({ ...answers, name: `${answers.name}-api` }, path.join(projectPath, "server"));
  await createClientPlaceholder(answers, path.join(projectPath, "client"));

  await fs.writeJson(
    path.join(projectPath, "package.json"),
    {
      name: answers.name,
      private: true,
      scripts: {
        dev: "npm run dev --workspace server",
      },
      workspaces: ["server", "client"],
    },
    { spaces: 2 }
  );
}

async function createClientPlaceholder(answers: ProjectAnswers, clientPath: string) {
  await fs.ensureDir(clientPath);
  await fs.writeJson(
    path.join(clientPath, "package.json"),
    {
      name: `${answers.name}-client`,
      private: true,
      scripts: {
        dev: "vite",
      },
      dependencies: {
        "@vitejs/plugin-react": "^4.3.1",
        vite: "^5.3.3",
        react: "^18.3.1",
        "react-dom": "^18.3.1",
      },
    },
    { spaces: 2 }
  );

  await fs.writeFile(
    path.join(clientPath, "README.md"),
    "# Client\n\nRun `npm create vite@latest . -- --template react-ts` here when you are ready to hydrate the frontend.\n"
  );
}
