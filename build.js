#!/usr/bin/env node

import fs from "fs";
import os from "os";
import path from "path";
import { execSync } from "child_process";

const OUT_DIR = "dist";
const FILENAME = "elegant-black-theme";
const MANIFEST = "manifest.json";

const command = process.argv[2];
if (command === "clean") {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  process.exit(0);
}

if (!fs.existsSync(MANIFEST)) {
  console.error("Manifest file not found");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const version = manifest.version;
const outputFilePath = `${path.join(OUT_DIR, FILENAME)}-${version}.xpi`;

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

if (fs.existsSync(outputFilePath)) {
  fs.rmSync(outputFilePath);
}

const run = (cmd) => {
  execSync(cmd, { stdio: "inherit" });
};

try {
  switch (os.platform()) {
    case "win32":
      run(
        `powershell -NoProfile -ExecutionPolicy Bypass ` +
          `-Command "Import-Module Microsoft.PowerShell.Archive; ` +
          `Compress-Archive -Path '${MANIFEST}' -DestinationPath '${outputFilePath}'; ` +
          `exit"`,
      );
      break;
    case "darwin":
    case "linux":
      run(`zip -r ${outputFilePath} .`);
      break;
  }
} catch (error) {
  console.error(`Error creating XPI file: ${error.message}`);
}

console.log(`XPI file created: ${outputFilePath}`);
