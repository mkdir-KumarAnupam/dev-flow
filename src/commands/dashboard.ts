import express from "express";
import cors from "cors";
import open from "open";
import path from "node:path";
import fs from "fs-extra";
import chalk from "chalk";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import chokidar from "chokidar";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function dashboardCommand() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const home = process.env.HOME || process.env.USERPROFILE || "";
  const cliDir = path.join(home, ".dev-cli");

  const serveFile = async (res: any, filename: string) => {
    try {
      const data = await fs.readJson(path.join(cliDir, filename));
      res.json(data);
    } catch {
      res.json([]);
    }
  };

  app.get("/api/flow", (req, res) => serveFile(res, "flow.json"));
  app.get("/api/projects", (req, res) => serveFile(res, "projects.json"));
  app.get("/api/sandboxes", (req, res) => serveFile(res, "sandboxes.json"));
  app.get("/api/practice", (req, res) => serveFile(res, "practice.json"));
  
  // Stubs for features not yet implemented to prevent UI network spam
  app.get("/api/setup/status", (req, res) => {
    res.json({ setupRequired: false, settings: {} });
  });
  app.get("/api/focus/live", (req, res) => {
    res.json({ active: false });
  });
  app.get("/api/ip", (req, res) => {
    res.json({ ip: "127.0.0.1", tunnelUrl: "" });
  });

  app.post("/api/practice/update", async (req, res) => {
    try {
      const { slug, timeSpentMinutes } = req.body;
      const file = path.join(cliDir, "practice.json");
      const practice = await fs.readJson(file).catch(() => ([]));
      const idx = practice.findIndex((p: any) => p.slug === slug);
      if (idx !== -1) {
        practice[idx].timeSpentMinutes = timeSpentMinutes;
        practice[idx].endedAt = new Date().toISOString();
      } else {
        practice.push({ slug, timeSpentMinutes, startedAt: new Date().toISOString(), endedAt: new Date().toISOString() });
      }
      await fs.writeJson(file, practice, { spaces: 2 });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Mark a competitive problem as solved or stuck
  app.post("/api/competitive/status", async (req, res) => {
    try {
      const { slug, status, timeSpentMinutes } = req.body;
      const file = path.join(cliDir, "practice.json");
      const practice = await fs.readJson(file).catch(() => []);
      const idx = practice.findIndex((p: any) => p.slug === slug);
      const now = new Date().toISOString();
      if (idx !== -1) {
        practice[idx].status = status;
        practice[idx].endedAt = now;
        practice[idx].timeSpentMinutes = timeSpentMinutes;
        practice[idx].history = [...(practice[idx].history || []), { action: status, at: now }];
      } else {
        practice.push({ slug, status, timeSpentMinutes, startedAt: now, endedAt: now, history: [{ action: status, at: now }] });
      }
      await fs.writeJson(file, practice, { spaces: 2 });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Save inline code for a competitive solution into the practice record
  app.post("/api/competitive/save-solution", async (req, res) => {
    try {
      const { slug, code, language, problemRecord } = req.body;
      const file = path.join(cliDir, "practice.json");
      const practice = await fs.readJson(file).catch(() => []);
      const idx = practice.findIndex((p: any) => p.slug === slug);
      const now = new Date().toISOString();
      if (idx !== -1) {
        practice[idx].code = code;
        practice[idx].language = language || practice[idx].language;
        practice[idx].savedAt = now;
      } else {
        // Record doesn't exist yet — create it from the problemRecord payload
        practice.push({
          ...(problemRecord || {}),
          slug,
          code,
          language,
          status: 'solved',
          startedAt: now,
          endedAt: now,
          savedAt: now,
          history: [{ action: 'solved', at: now }],
        });
      }
      await fs.writeJson(file, practice, { spaces: 2 });
      res.json({ success: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
  app.get("/api/sessions", (req, res) => serveFile(res, "sessions.json"));

  app.get("/api/linear", async (req, res) => {
    try {
      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "No LINEAR_API_KEY set" });
      
      const query = `
        query {
          viewer {
            assignedIssues(filter: { state: { type: { neq: "canceled" } } }) {
              nodes {
                id
                title
                priority
                url
                state { id name color type }
                project { id name color }
                team {
                  id
                  states { nodes { id name type color } }
                }
              }
            }
          }
        }
      `;
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].message });
      res.json(data.data.viewer.assignedIssues.nodes);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/linear/create", async (req, res) => {
    try {
      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "No LINEAR_API_KEY set" });
      
      const { title, teamId } = req.body;
      const query = `
        mutation IssueCreate($title: String!, $teamId: String!) {
          issueCreate(input: { title: $title, teamId: $teamId }) {
            success
            issue { id title url }
          }
        }
      `;
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
        body: JSON.stringify({ query, variables: { title, teamId } })
      });
      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].message });
      res.json(data.data.issueCreate);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/linear/state", async (req, res) => {
    try {
      const apiKey = process.env.LINEAR_API_KEY;
      if (!apiKey) return res.status(401).json({ error: "No LINEAR_API_KEY set" });
      
      const { issueId, stateId } = req.body;
      const query = `
        mutation IssueUpdate($id: String!, $stateId: String!) {
          issueUpdate(id: $id, input: { stateId: $stateId }) {
            success
            issue { id state { id name type } }
          }
        }
      `;
      const response = await fetch('https://api.linear.app/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': apiKey },
        body: JSON.stringify({ query, variables: { id: issueId, stateId } })
      });
      const data = await response.json();
      if (data.errors) return res.status(400).json({ error: data.errors[0].message });
      res.json(data.data.issueUpdate);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/leetcode/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const query = `query { question(titleSlug: "${slug}") { title difficulty content metaData exampleTestcaseList codeSnippets { lang langSlug code } } }`;
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/execute", async (req, res) => {
    try {
      const { code, testcases, functionName, language = 'javascript', metaData } = req.body;
      const start = Date.now();
      let results;

      if (language === 'javascript' || language === 'js') {
        const wrapper = `
${code}
const testcases = ${JSON.stringify(testcases)};
const results = testcases.map(tc => {
  try {
    const inputs = tc.split('\\n').map(l => JSON.parse(l));
    return ${functionName}(...inputs);
  } catch (e) {
    return { error: e.message };
  }
});
console.log(JSON.stringify(results));
`;
        const tempFile = path.join(cliDir, 'tempRunner.js');
        await fs.writeFile(tempFile, wrapper);
        const child = await execa('node', [tempFile], { timeout: 3000 });
        results = JSON.parse(child.stdout);
      } 
      else if (language === 'cpp' || language === 'c++') {
        const { generateCppWrapper } = await import('./runners.js');
        const wrapper = generateCppWrapper(code, testcases, metaData);
        const tempFile = path.join(cliDir, 'tempRunner.cpp');
        await fs.writeFile(tempFile, wrapper);
        
        await execa('g++', [tempFile, '-o', path.join(cliDir, 'tempRunner.exe'), '-I', path.join(__dirname, '..', '..', 'lib')], { timeout: 5000 });
        const child = await execa(path.join(cliDir, 'tempRunner.exe'), [JSON.stringify(testcases)], { timeout: 3000 });
        results = JSON.parse(child.stdout);
      }
      else if (language === 'java') {
        const { generateJavaWrapper } = await import('./runners.js');
        const wrapper = generateJavaWrapper(code, testcases, metaData);
        const tempFile = path.join(cliDir, 'Main.java');
        await fs.writeFile(tempFile, wrapper);
        
        const gsonPath = path.join(__dirname, '..', '..', 'lib', 'gson.jar');
        const cp = `.;${gsonPath};${cliDir}`;
        await execa('javac', ['-cp', cp, tempFile], { timeout: 5000, cwd: cliDir });
        const child = await execa('java', ['-cp', cp, 'Main', JSON.stringify(testcases)], { timeout: 3000, cwd: cliDir });
        results = JSON.parse(child.stdout);
      }

      const duration = Date.now() - start;
      res.json({ results, duration });
    } catch (e: any) {
      res.status(500).json({ error: e.message, stdout: e.stdout, stderr: e.stderr });
    }
  });

  // Read code for a practice submission — checks inline code first, then filesystem
  app.get("/api/code", async (req, res) => {
    try {
      const { slug, path: filePath } = req.query as { slug?: string; path?: string };

      // 1. If a slug is given, try to serve inline code saved by competitive mode
      if (slug) {
        const practice = await fs.readJson(path.join(cliDir, "practice.json")).catch(() => []);
        const record = practice.find((p: any) => p.slug === slug);
        if (record?.code) {
          const ext: Record<string, string> = {
            javascript: 'js', typescript: 'ts', python: 'py', python3: 'py',
            java: 'java', cpp: 'cpp', 'c++': 'cpp', go: 'go', rust: 'rs',
            ruby: 'rb', swift: 'swift', kotlin: 'kt', scala: 'scala',
          };
          const lang = (record.language || 'txt').toLowerCase();
          return res.json({
            files: [{ name: `solution.${ext[lang] || lang}`, content: record.code }]
          });
        }
      }

      // 2. Fall back to filesystem path
      if (filePath) {
        const dirPath = filePath as string;
        const exists = await fs.pathExists(dirPath);
        if (!exists) return res.json({ files: [] });
        const stat = await fs.stat(dirPath);
        if (stat.isFile()) {
          const content = await fs.readFile(dirPath, 'utf-8');
          return res.json({ files: [{ name: path.basename(dirPath), content }] });
        }
        // It's a directory — read all code files in it
        const exts = ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rs', '.rb', '.swift', '.kt'];
        const entries = await fs.readdir(dirPath);
        const files = await Promise.all(
          entries
            .filter((f: string) => exts.includes(path.extname(f)))
            .map(async (f: string) => ({
              name: f,
              content: await fs.readFile(path.join(dirPath, f), 'utf-8').catch(() => '')
            }))
        );
        return res.json({ files: files.filter((f: any) => f.content) });
      }

      res.json({ files: [] });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Server-Sent Events (SSE) for hot-refresh
  app.get("/api/events", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const notify = () => {
      res.write(`data: ${JSON.stringify({ type: "refresh" })}\n\n`);
    };

    const watcher = chokidar.watch(cliDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true,
      depth: 1
    });

    watcher.on("change", (path) => {
      if (path.endsWith('.json')) notify();
    });

    req.on("close", () => {
      watcher.close();
      res.end();
    });
  });

const distPath = path.join(__dirname, "..", "..", "dashboard", "dist");
  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(4000, async () => {
    console.log(chalk.cyan("✦ Dev CLI Global Dashboard running at http://localhost:4000"));
    await open("http://localhost:4000");
  });
}
