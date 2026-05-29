import fs from "fs-extra";
import path from "node:path";
import { type ProjectAnswers } from "../../types/project.js";

export async function createExpressTemplate(answers: ProjectAnswers, projectPath: string) {
  await fs.ensureDir(path.join(projectPath, "src"));

  const extension = answers.typescript ? "ts" : "js";
  const packageJson = {
    name: answers.name,
    version: "0.1.0",
    private: true,
    type: answers.typescript ? "module" : "commonjs",
    scripts: answers.typescript
      ? {
          dev: "tsx watch src/index.ts",
          build: "tsc",
          start: "node dist/index.js",
        }
      : {
          dev: "node --watch src/index.js",
          start: "node src/index.js",
        },
    dependencies: {
      express: "^4.19.2",
    },
    devDependencies: answers.typescript
      ? {
          "@types/express": "^4.17.21",
          "@types/node": "^20.14.10",
          tsx: "^4.16.2",
          typescript: "^5.5.3",
        }
      : undefined,
  };

  await fs.writeJson(path.join(projectPath, "package.json"), packageJson, { spaces: 2 });

  if (answers.typescript) {
    await fs.writeJson(
      path.join(projectPath, "tsconfig.json"),
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          rootDir: "src",
          outDir: "dist",
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ["src"],
      },
      { spaces: 2 }
    );
  }

  await fs.writeFile(
    path.join(projectPath, "src", `index.${extension}`),
    createServerSource(answers.typescript)
  );
}

function createServerSource(typescript: boolean) {
  if (typescript) {
    return `import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(\`API ready on http://localhost:\${port}\`);
});
`;
  }

  return `const express = require("express");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(\`API ready on http://localhost:\${port}\`);
});
`;
}
