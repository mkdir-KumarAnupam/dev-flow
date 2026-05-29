const fs = require('fs');
let code = fs.readFileSync('C:/dev-cli/src/commands/focus.ts', 'utf8');

code = code.replace(
  '// Spawn the Floating HUD',
  'if (!process.argv.includes("--no-hud")) {\n  // Spawn the Floating HUD'
);

code = code.replace(
  '    stdio: "ignore"\n  });\n\n  console.log(',
  '    stdio: "ignore"\n  });\n  }\n\n  console.log('
);

fs.writeFileSync('C:/dev-cli/src/commands/focus.ts', code);
console.log('Patched focus.ts');
