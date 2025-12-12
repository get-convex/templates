#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname, basename } from "path";
import readline from "readline";

// Utility functions for case conversion
function toPascalCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^(.)/, (char) => char.toUpperCase());
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  if (pascal === pascal.toUpperCase()) {
    return pascal.toLowerCase();
  }
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[-_\s]+/g, "-")
    .toLowerCase();
}

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-_\s]+/g, "_")
    .toLowerCase();
}

function toSpaceCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase();
}

function toTitleCase(str) {
  if (str === str.toUpperCase()) {
    return str;
  }
  return toSpaceCase(str)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Function to get all files recursively, excluding specified directories
function getAllFiles(dir, excludeDirs = [".git", "node_modules", ".cursor"]) {
  const files = [];

  function traverse(currentPath) {
    const items = readdirSync(currentPath);
    for (const item of items) {
      const fullPath = join(currentPath, item);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        if (!excludeDirs.includes(item)) {
          traverse(fullPath);
        }
      } else {
        // Only process text files (skip binary files)
        const ext = extname(item).toLowerCase();
        const textExtensions = [
          ".ts",
          ".tsx",
          ".js",
          ".jsx",
          ".cjs",
          ".mjs",
          ".json",
          ".md",
          ".txt",
          ".yaml",
          ".yml",
          ".html",
          ".css",
          ".scss",
          ".less",
          ".xml",
          ".config",
        ];

        if (textExtensions.includes(ext) || !ext) {
          files.push(fullPath);
        }
      }
    }
  }

  traverse(dir);
  return files;
}

// Function to replace all occurrences in a file
function replaceInFile(filePath, replacements) {
  try {
    let content = readFileSync(filePath, "utf8");
    let hasChanges = false;

    for (const [oldText, newText] of replacements) {
      if (content.includes(oldText)) {
        content = content.replaceAll(oldText, newText);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      writeFileSync(filePath, content, "utf8");
    }
  } catch (error) {
    // Skip files that can't be read as text
    if (error.code !== "EISDIR") {
      console.warn(`Warning: Could not process ${filePath}: ${error.message}`);
    }
  }
}

// Main setup function
async function setup() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Current directory name
  const currentDirName = basename(process.cwd());

  // Prompt for component name
  let componentName = "";
  while (!componentName.trim()) {
    componentName = await new Promise((resolve) => {
      rl.question(
        `Enter your component name (e.g., "document search" or "RAG") [${currentDirName}]: `,
        (answer) => {
          resolve(answer.trim() || currentDirName);
        },
      );
    });
    if (!componentName.trim()) {
      console.log("❌ Component name is required! Please try again.\n");
    }
  }

  // Prompt for npm package name
  let npmPackageName = "";
  while (!npmPackageName.trim()) {
    npmPackageName = await new Promise((resolve) => {
      rl.question(
        `NPM package name (e.g. @your-org/${toKebabCase(componentName)}): `,
        (answer) => {
          resolve(answer.trim());
        },
      );
    });
    if (!npmPackageName.trim()) {
      console.log("❌ NPM package name is required! Please try again.\n");
    }
  }

  // Prompt for repository name
  let repoName = "";
  while (!repoName.trim()) {
    repoName = await new Promise((resolve) => {
      rl.question(
        `GitHub repository name (e.g. username/${toKebabCase(componentName)}): `,
        (answer) => {
          resolve(answer.trim());
        },
      );
    });
    if (!repoName.trim()) {
      console.log("❌ Repository name is required! Please try again.\n");
    }
  }

  rl.close();

  // Generate all case variations
  const cases = {
    pascal: toPascalCase(componentName),
    camel: toCamelCase(componentName),
    kebab: toKebabCase(componentName),
    snake: toSnakeCase(componentName),
    space: toSpaceCase(componentName),
    title: toTitleCase(componentName),
  };

  // Define all replacements
  const replacements = [
    // NPM package name
    ["@example/sample-component", npmPackageName],

    // Repository name
    ["example-org/sample-component", repoName],

    // Component name variations
    ["SampleComponent", cases.pascal],
    ["sampleComponent", cases.camel],
    ["sample-component", cases.kebab],
    ["sample_component", cases.snake],
    ["sample component", cases.space],
    ["Sample Component", cases.title],
  ];
  if (npmPackageName.includes("/")) {
    replacements.push([
      "@example%2Fsample-component",
      npmPackageName.replace("/", "%2F"),
    ]);
  } else {
    replacements.push(["@example%2Fsample-component", npmPackageName]);
  }

  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  if (packageJson.name !== npmPackageName) {
    packageJson.name = npmPackageName;
    writeFileSync("package.json", JSON.stringify(packageJson, null, 2), "utf8");
  }

  const files = getAllFiles(".");
  let processedCount = 0;

  for (const file of files) {
    replaceInFile(file, replacements);
    processedCount++;
  }

  console.log(
    "\nℹ️  Read the README.md to learn about the component template.",
  );
}

// Run the setup
setup().catch(console.error);
