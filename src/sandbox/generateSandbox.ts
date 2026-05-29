import fs from "fs-extra";
import path from "node:path";
import { writeSandboxMetadata } from "../metadata/sandboxMetadata.js";
import { type SandboxLanguage, type SandboxRecord } from "../types/sandbox.js";

export async function generateSandbox(record: SandboxRecord) {
  await fs.ensureDir(record.path);

  if (record.type === "university") {
    await createUniversityStructure(record);
  } else if (record.type === "competitive") {
    await createCompetitiveStructure(record);
  } else {
    await createScratchStructure(record);
  }

  await writeSandboxMetadata(record);
}

async function createUniversityStructure(record: SandboxRecord) {
  for (const directory of ["notes", "viva", "labs", "assignments"]) {
    await fs.ensureDir(path.join(record.path, directory));
  }

  await fs.writeFile(path.join(record.path, "notes", "README.md"), `# ${record.course} Notes\n`);
  await writeStarterFile(record, path.join(record.path, "main"));
}

async function createCompetitiveStructure(record: SandboxRecord) {
  await fs.writeFile(path.join(record.path, "notes.md"), `# ${record.name}\n\n- Platform: ${record.platform}\n- Topic: ${record.topic}\n- Difficulty: ${record.difficulty}\n`);
  await writeStarterFile(record, path.join(record.path, record.name));
}

async function createScratchStructure(record: SandboxRecord) {
  await fs.writeFile(path.join(record.path, "notes.md"), `# ${record.name}\n\nScratch context for ${record.activity}.\n`);
  await writeStarterFile(record, path.join(record.path, "main"));
}

async function writeStarterFile(record: SandboxRecord, basePath: string) {
  const extension = getExtension(record.language);
  const filePath = record.language === "java"
    ? path.join(path.dirname(basePath), "Main.java")
    : `${basePath}.${extension}`;

  await fs.writeFile(filePath, getStarterSource(record.language));
}

function getExtension(language: SandboxLanguage) {
  switch (language) {
    case "cpp":
      return "cpp";
    case "java":
      return "java";
    case "python":
      return "py";
    case "sql":
      return "sql";
    case "javascript":
      return "js";
    case "c":
      return "c";
  }
}

function getStarterSource(language: SandboxLanguage) {
  switch (language) {
    case "cpp":
      return "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  cout << \"ready\\n\";\n  return 0;\n}\n";
    case "java":
      return "public class Main {\n  public static void main(String[] args) {\n    System.out.println(\"ready\");\n  }\n}\n";
    case "python":
      return "print(\"ready\")\n";
    case "sql":
      return "-- SQLite sandbox\nSELECT 'ready' AS status;\n";
    case "javascript":
      return "console.log(\"ready\");\n";
    case "c":
      return "#include <stdio.h>\n\nint main(void) {\n  printf(\"ready\\n\");\n  return 0;\n}\n";
  }
}
