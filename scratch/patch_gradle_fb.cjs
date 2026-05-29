const fs = require('fs');

// Patch root build.gradle.kts
let root = fs.readFileSync('C:/dev-cli/FocusCompanion/build.gradle.kts', 'utf8');
if (!root.includes('buildscript')) {
  root = `buildscript {
    dependencies {
        classpath("com.google.gms:google-services:4.4.1")
    }
}
` + root;
  fs.writeFileSync('C:/dev-cli/FocusCompanion/build.gradle.kts', root);
}

// Patch app build.gradle.kts
let app = fs.readFileSync('C:/dev-cli/FocusCompanion/app/build.gradle.kts', 'utf8');
if (!app.includes('id("com.google.gms.google-services")')) {
  app = app.replace('plugins {', 'plugins {\n  id("com.google.gms.google-services")');
}
if (!app.includes('firebase-bom')) {
  app = app.replace('dependencies {', 'dependencies {\n  implementation(platform("com.google.firebase:firebase-bom:32.7.0"))\n  implementation("com.google.firebase:firebase-database-ktx")');
}
fs.writeFileSync('C:/dev-cli/FocusCompanion/app/build.gradle.kts', app);
console.log('Patched gradle files');
