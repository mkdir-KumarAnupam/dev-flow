import fs from "fs-extra";
import path from "node:path";
import { type SandboxLanguage } from "../types/sandbox.js";

export async function writeProblemStarter(root: string, language: SandboxLanguage) {
  await fs.ensureDir(path.join(root, "attempts"));
  await fs.writeFile(path.join(root, "notes.md"), "# Notes\n\n- Approach:\n- Mistakes:\n- Complexity:\n");

  switch (language) {
    case "cpp":
      await fs.writeFile(path.join(root, "solution.cpp"), "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n\n  return 0;\n}\n");
      await fs.writeFile(path.join(root, "input.txt"), "");
      await fs.writeFile(path.join(root, "output.txt"), "");
      return;
    case "java":
      await fs.writeFile(path.join(root, "Main.java"), "public class Main {\n  public static void main(String[] args) {\n  }\n}\n");
      return;
    case "python":
      await fs.writeFile(path.join(root, "solution.py"), "def solve():\n    pass\n\nif __name__ == \"__main__\":\n    solve()\n");
      return;
    case "sql":
      await fs.writeFile(path.join(root, "schema.sql"), "-- SQLite schema\n");
      await fs.writeFile(path.join(root, "solution.sql"), "-- Write your query here\n");
      return;
    case "javascript":
      await fs.writeFile(path.join(root, "solution.js"), "function solve() {\n}\n\nsolve();\n");
      return;
    case "c":
      await fs.writeFile(path.join(root, "solution.c"), "#include <stdio.h>\n\nint main(void) {\n  return 0;\n}\n");
      return;
  }
}
