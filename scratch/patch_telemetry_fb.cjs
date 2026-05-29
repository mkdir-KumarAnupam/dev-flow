const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/daemon/telemetry.ts', 'utf8');

// 1. Add import
if (!code.includes('import admin from "firebase-admin";')) {
  code = code.replace('import { fileURLToPath } from "node:url";', 'import { fileURLToPath } from "node:url";\nimport admin from "firebase-admin";');
}

// 2. Add init
const initCode = `
const serviceAccountPath = path.join(process.env.USERPROFILE || "", ".dev-cli", "firebase-service-account.json");
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = fs.readJsonSync(serviceAccountPath);
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://devcli-e1bc5-default-rtdb.firebaseio.com"
    });
  } catch (e) {}
}
`;
if (!code.includes('admin.initializeApp')) {
  code = code.replace('async function main() {', initCode + '\nasync function main() {');
}

// 3. Add to live update
const fbSetCode = `
    if (fs.existsSync(serviceAccountPath)) {
      admin.database().ref("sessions/live").set({
        flowScore: liveScore,
        elapsedSeconds,
        targetSeconds,
        category,
        processName,
        windowTitle,
        codingSeconds,
        researchSeconds,
        distractionSeconds,
        idleSeconds,
        currentStreak,
        pid: process.pid
      }).catch(() => {});
    }
`;
if (!code.includes('admin.database().ref("sessions/live").set')) {
  code = code.replace('fs.writeJson(livePath, {', fbSetCode + '\n    fs.writeJson(livePath, {');
}

// 4. Add to finalize
const fbRemoveCode = `
  if (fs.existsSync(serviceAccountPath)) {
    try { await admin.database().ref("sessions/live").remove(); } catch {}
  }
`;
if (!code.includes('admin.database().ref("sessions/live").remove()')) {
  code = code.replace('try { await fs.remove(livePath); } catch {}', 'try { await fs.remove(livePath); } catch {}\n' + fbRemoveCode);
}

fs.writeFileSync('C:/dev-cli/src/daemon/telemetry.ts', code);
console.log('Patched telemetry.ts with Firebase Admin');
