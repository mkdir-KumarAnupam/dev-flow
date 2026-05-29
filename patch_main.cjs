const fs = require('fs');
let mainCjs = fs.readFileSync('C:/dev-cli/dashboard/electron/main.cjs', 'utf8');

const injectionCode = `
  ipcMain.handle('start-project-tunnel', async (e, projectPath) => {
    try {
      return await new Promise((resolve, reject) => {
        const { spawn } = require('child_process');
        const localtunnel = require('localtunnel');
        console.log('Starting dev server in: ' + projectPath);
        
        let envs = Object.assign({}, process.env);
        // Inject keys if available
        try {
          const { safeStorage } = require('electron');
          const vaultPath = require('path').join(app.getPath('userData'), '.devos_vault');
          if (fs.existsSync(vaultPath) && safeStorage.isEncryptionAvailable()) {
            const keys = JSON.parse(safeStorage.decryptString(fs.readFileSync(vaultPath)));
            keys.forEach(k => {
              if (k.environment !== 'Production') {
                 if (k.assignedProjects.length === 0 || k.assignedProjects.includes(projectPath)) {
                    envs[k.name] = k.value;
                 }
              }
            });
          }
        } catch(e) {}
        
        const child = spawn('bun', ['run', 'dev'], { cwd: projectPath, env: envs, shell: true });
        
        let portFound = false;
        const onData = async (data) => {
          const out = data.toString();
          console.log(out);
          const match = out.match(/http:\\/\\/localhost:(\\d+)/);
          if (match && !portFound) {
            portFound = true;
            const port = parseInt(match[1]);
            console.log('Detected dev port:', port);
            try {
              const tunnel = await localtunnel({ port });
              tunnel.on('close', () => { child.kill(); });
              resolve({ url: tunnel.url });
            } catch (err) {
              reject(err);
            }
          }
        };
        child.stdout.on('data', onData);
        child.stderr.on('data', onData);
        
        child.on('error', (err) => {
          if (!portFound) reject(err);
        });
        
        setTimeout(() => {
          if (!portFound) {
            child.kill();
            reject(new Error('Timeout waiting for dev server port output'));
          }
        }, 15000);
      });
    } catch (e) {
      console.error(e);
      return { error: e.message };
    }
  });

  const getVaultPath = () => require('path').join(app.getPath('userData'), '.devos_vault');

  ipcMain.handle('get-security-keys', async () => {
    const { safeStorage } = require('electron');
    const vaultPath = getVaultPath();
    if (!fs.existsSync(vaultPath)) return [];
    try {
      const encrypted = fs.readFileSync(vaultPath);
      if (safeStorage.isEncryptionAvailable()) {
        const decrypted = safeStorage.decryptString(encrypted);
        return JSON.parse(decrypted);
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  ipcMain.handle('save-security-keys', async (e, keys) => {
    const { safeStorage } = require('electron');
    const vaultPath = getVaultPath();
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(JSON.stringify(keys));
        require('fs').writeFileSync(vaultPath, encrypted);
        return { success: true };
      }
      return { success: false, error: 'Encryption not available' };
    } catch (e) {
      console.error(e);
      return { success: false, error: e.message };
    }
  });
`;

if (!mainCjs.includes('start-project-tunnel')) {
  mainCjs = mainCjs.replace(
    /ipcMain\.handle\('create-course-workspace'/g,
    injectionCode + '\n  ipcMain.handle(\'create-course-workspace\''
  );
  fs.writeFileSync('C:/dev-cli/dashboard/electron/main.cjs', mainCjs);
  console.log('Injected IPC handlers into main.cjs');
} else {
  console.log('IPC handlers already injected.');
}
