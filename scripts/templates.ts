#!/usr/bin/env -S bun --install=fallback
// Runs a task over every `template-*` directory, all of them at the same time.
//
// The templates are found on disk, thus a new template is picked up without a
// change to this script. Each template runs in its own lane, and the lanes run
// concurrently: an interactive terminal shows one live line per lane, and CI
// has no TTY, where Listr writes a plain line for each event instead.
//
// Bun runs this file. `listr2` is not vendored: `--install=fallback` (in the
// shebang, and in the `justfile`) lets Bun install the pinned version into its
// global cache on first run, thus the repo root needs no `package.json`.
//
// Usage: bun --install=fallback scripts/templates.ts <task> [options] [filter ...]
//
//   install         Install dependencies (`npm install` / `bun install`)
//   install-clean   Install from the lockfiles, never rewriting them
//                   (`npm ci` / `bun install --frozen-lockfile`)
//   codegen         Install, then regenerate `convex/_generated/`
//   ai-files        Install from the lockfiles, then run `convex ai-files update`
//   rm-lockfiles    Delete every lockfile
//
// Options:
//   --list              Print the templates the filters select, then exit
//   --serial            Run one template at a time
//   --concurrency <n>   Run at most n templates at a time (default 8)
//   --no-install        Skip the install step of `codegen` and `ai-files`
//
// A filter is a substring of a template name. Only the templates whose name
// contains one of the filters run.

import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Listr } from "listr2@11.0.1";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The one template that uses Bun rather than npm. `ci.yml` hardcodes the same
// list; keep the two in sync when a template switches package manager.
const BUN_TEMPLATES = new Set(["template-astro"]);

// Some templates (the AuthKit/WorkOS ones) read these during codegen. `ci.yml`
// sets the same values on the deployment it creates.
const CODEGEN_ENV_VARS = {
  CLERK_JWT_ISSUER_DOMAIN: "https://placeholder.authkit.dev/",
  WORKOS_CLIENT_ID: "client_placeholder",
  WORKOS_CLIENT_SECRET: "placeholder",
  WORKOS_ENVIRONMENT_ID: "environment_placeholder",
  WORKOS_ENVIRONMENT_API_KEY: "sk_test_placeholder",
};

type Template = { name: string; dir: string; usesBun: boolean };

const templates: Template[] = readdirSync(root, { withFileTypes: true })
  .filter(
    (entry) =>
      entry.isDirectory() &&
      entry.name.startsWith("template-") &&
      existsSync(join(root, entry.name, "package.json")),
  )
  .map((entry) => ({
    name: entry.name,
    dir: join(root, entry.name),
    usesBun: BUN_TEMPLATES.has(entry.name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

// --- Command line -----------------------------------------------------------

const argv = process.argv.slice(2);

function optionValue(name: string): string | undefined {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
}

const list = argv.includes("--list");
const serial = argv.includes("--serial");
const skipInstall = argv.includes("--no-install");
const concurrency = serial ? 1 : Number(optionValue("--concurrency") ?? 8);

const positional = argv.filter((arg, index) => {
  if (arg.startsWith("--")) return false;
  return argv[index - 1] !== "--concurrency";
});
const [task, ...filters] = positional;

const selected =
  filters.length === 0
    ? templates
    : templates.filter((template) =>
        filters.some((filter) => template.name.includes(filter)),
      );

if (list) {
  for (const template of selected) console.log(template.name);
  process.exit(0);
}

if (selected.length === 0) {
  console.error(`No template matches ${filters.join(", ")}.`);
  process.exit(1);
}

// --- Running commands -------------------------------------------------------

type Report = (line: string) => void;

// A terminal redraws one line per lane, thus the live progress of a command is
// worth showing. CI has no TTY, where Listr writes each report as its own line:
// there, only the command itself is worth a line.
const interactive = process.stdout.isTTY === true;

class CommandFailed extends Error {
  constructor(template: Template, label: string, output: string) {
    super(`${template.name}: ${label} failed\n\n${output.trim()}`);
    this.name = "CommandFailed";
  }
}

// Runs a command in a template and reports its last output line as it goes. The
// whole output is kept, because a failure has to show it: only the last line is
// visible while the command runs.
function run(
  template: Template,
  command: string,
  args: string[],
  report: Report,
  stdin?: string,
): Promise<void> {
  // The lane title already names the template in a terminal. The verbose
  // renderer writes the lanes interleaved, thus there the line has to name it.
  const label = `${command} ${args.join(" ")}`;
  report(interactive ? label : `${template.name}$ ${label}`);
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, {
      cwd: template.dir,
      stdio: [stdin === undefined ? "ignore" : "pipe", "pipe", "pipe"],
    });
    let output = "";
    const collect = (chunk: Buffer) => {
      const text = chunk.toString();
      output += text;
      if (!interactive) return;
      const lastLine = text.trimEnd().split("\n").at(-1)?.trim();
      if (lastLine) report(`${label} — ${lastLine}`);
    };
    child.stdout.on("data", collect);
    child.stderr.on("data", collect);
    child.on("error", rejectRun);
    child.on("close", (code) => {
      if (code === 0) resolveRun();
      else rejectRun(new CommandFailed(template, label, output));
    });
    if (stdin !== undefined) child.stdin.end(stdin);
  });
}

const convex = (
  template: Template,
  args: string[],
  report: Report,
  stdin?: string,
) => run(template, "npx", ["convex", ...args], report, stdin);

// --- Tasks ------------------------------------------------------------------

function install(template: Template, report: Report, clean: boolean) {
  if (template.usesBun) {
    return run(
      template,
      "bun",
      ["install", ...(clean ? ["--frozen-lockfile"] : [])],
      report,
    );
  }
  return run(template, "npm", [clean ? "ci" : "install"], report);
}

// Two `convex init` runs that create a local deployment at the same time both
// pick the first free port, and the second one then fails with "A different
// local backend is running on selected port". The lanes thus create their
// deployments one at a time; only the creation is serialized, because the
// commands that follow use the port that the deployment already holds.
let deploymentSetup: Promise<unknown> = Promise.resolve();
function serializeSetup<T>(work: () => Promise<T>): Promise<T> {
  const next = deploymentSetup.then(work, work);
  deploymentSetup = next.catch(() => {});
  return next;
}

function selectedDeployment(template: Template): string | undefined {
  const path = join(template.dir, ".env.local");
  if (!existsSync(path)) return undefined;
  return /^\s*CONVEX_DEPLOYMENT=(\S+)/m.exec(readFileSync(path, "utf8"))?.[1];
}

// `convex codegen` pushes the functions to a deployment to analyze them, thus
// each template needs one of its own: templates that shared a deployment would
// race, and one of the pushes would fail. An anonymous local deployment needs
// no login and no cloud project, which is both what lets any contributor run
// this and what `ci.yml` verifies the generated code against.
//
// `.env.local` is gitignored and this task is what writes it, thus a stale one
// — an older cloud deployment from a previous version of this script — is
// replaced rather than reused.
async function ensureLocalDeployment(template: Template, report: Report) {
  const deployment = selectedDeployment(template);
  if (deployment?.startsWith("anonymous:")) return;
  if (deployment !== undefined) {
    report(`replacing deployment ${deployment} with a local one`);
    rmSync(join(template.dir, ".env.local"));
  }
  // Not a TTY, thus `convex init` creates `anonymous-<template>` instead of
  // asking which deployment to use.
  await serializeSetup(() => convex(template, ["init"], report));
}

async function codegen(template: Template, report: Report) {
  await ensureLocalDeployment(template, report);
  const envFile = Object.entries(CODEGEN_ENV_VARS)
    .map(([name, value]) => `${name}=${value}\n`)
    .join("");
  await convex(template, ["env", "set", "--force"], report, envFile);
  if (template.name === "template-component") {
    // The component's own code is generated by a separate command.
    await run(template, "npm", ["run", "build:codegen"], report);
  }
  await convex(template, ["codegen", "--init"], report);
}

function rmLockfiles(template: Template, report: Report) {
  for (const lockfile of ["package-lock.json", "bun.lock"]) {
    const path = join(template.dir, lockfile);
    if (existsSync(path)) {
      report(`rm ${lockfile}`);
      rmSync(path);
    }
  }
  return Promise.resolve();
}

const tasks: Record<
  string,
  (template: Template, report: Report) => Promise<void>
> = {
  install: (template, report) => install(template, report, false),
  "install-clean": (template, report) => install(template, report, true),
  codegen: async (template, report) => {
    if (!skipInstall) await install(template, report, false);
    await codegen(template, report);
  },
  "ai-files": async (template, report) => {
    // A clean install keeps the lockfiles out of the resulting diff, which the
    // `Update AI files` workflow turns into a pull request.
    if (!skipInstall) await install(template, report, true);
    await convex(template, ["ai-files", "update"], report);
  },
  "rm-lockfiles": rmLockfiles,
};

const runTask = tasks[task ?? ""];
if (runTask === undefined) {
  console.error(
    `Unknown task ${task ?? "(none)"}. Expected one of: ${Object.keys(tasks).join(", ")}.`,
  );
  process.exit(1);
}

// --- Run --------------------------------------------------------------------

const listr = new Listr(
  selected.map((template) => ({
    title: template.name,
    task: (_context: unknown, listrTask: { output: string }) =>
      runTask(template, (line) => {
        listrTask.output = line;
      }),
  })),
  {
    concurrent: concurrency,
    exitOnError: false,
    collectErrors: true,
    // A terminal shows one live line per lane. CI has no TTY, thus Listr falls
    // back to the verbose renderer, which writes each event as a plain line.
    renderer: "default",
    fallbackRenderer: "verbose",
  },
);

await listr.run();

// Listr has already written each failure, thus the exit code is all that is
// left to report.
if ((listr.errors ?? []).length > 0) process.exit(1);

console.log(`\n✔ ${task} complete in ${selected.length} templates.`);
