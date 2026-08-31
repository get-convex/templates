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
//   codegen         Install from the lockfiles, then regenerate
//                   `convex/_generated/`
//   ai-files        Install from the lockfiles, then run
//                   `convex ai-files update`
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
import {
  existsSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
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

// `parseArgs` is strict, thus a mistyped option is an error rather than an
// argument that is silently dropped. It throws, and a stack trace is not what a
// mistyped option deserves.
function parseCommandLine() {
  try {
    return parseArgs({
      args: process.argv.slice(2),
      options: {
        list: { type: "boolean" },
        serial: { type: "boolean" },
        "no-install": { type: "boolean" },
        concurrency: { type: "string" },
      },
      allowPositionals: true,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

const { values: options, positionals } = parseCommandLine();

const list = options.list === true;
const skipInstall = options["no-install"] === true;

// listr2 takes `concurrent` as it comes: `NaN` compares false against the
// number of running lanes, thus every lane would queue and none would start.
const concurrency =
  options.serial === true ? 1 : Number(options.concurrency ?? 8);
if (!Number.isInteger(concurrency) || concurrency < 1) {
  console.error(
    `--concurrency expects a positive integer, got ${options.concurrency}.`,
  );
  process.exit(1);
}

const [task, ...filters] = positionals;

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
  const label = `${command} ${args.join(" ")}`;
  report(label);
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

// Every `convex` command boots a local backend and stops it again when it
// exits, thus each one picks a port of its own. The choice is a check followed
// by a bind, and between the two the port can be taken — by a lane running
// alongside, or by the backend of the previous command still shutting down.
// Both were reproducible with two templates.
const PORT_RACE = new RegExp(
  [
    "did not start on port",
    "port \\d+ is not available",
    "different local backend is running",
  ].join("|"),
  "i",
);

// Every command this script runs `convex` for is idempotent, thus a lost race
// costs a retry and nothing else. Anything that is not a lost race fails on the
// first attempt, so a real error is not hidden behind a minute of retries.
async function convex(
  template: Template,
  args: string[],
  report: Report,
  stdin?: string,
): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run(template, "npx", ["convex", ...args], report, stdin);
    } catch (error) {
      const lostRace =
        error instanceof CommandFailed && PORT_RACE.test(error.message);
      if (!lostRace || attempt === 3) throw error;
      report(`port taken, retrying convex ${args[0]} (attempt ${attempt + 1})`);
      await new Promise((wake) => setTimeout(wake, 1000 * attempt));
    }
  }
}

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

// A deployment that does not exist yet has no port to suggest, thus every
// concurrent `convex init` walks up from the same one and all but the first
// lose. Creation is therefore serialized. It is the only step worth serializing:
// it happens once per workspace, and afterwards each template suggests the port
// its own deployment already used, which lanes do not contend over. The
// collisions that are left are the ones `convex` retries above.
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
// A stale selection — an older cloud deployment from a previous version of this
// script — is replaced rather than reused. Only the `CONVEX_DEPLOYMENT` line
// goes: `.env.local` is gitignored, thus it is also where a contributor keeps
// the real keys they run the template with.
async function ensureLocalDeployment(template: Template, report: Report) {
  const deployment = selectedDeployment(template);
  if (deployment?.startsWith("anonymous:")) return;
  if (deployment !== undefined) {
    report(`replacing deployment ${deployment} with a local one`);
    const path = join(template.dir, ".env.local");
    const kept = readFileSync(path, "utf8").replace(
      /^[ \t]*CONVEX_DEPLOYMENT=.*(?:\r?\n|$)/m,
      "",
    );
    writeFileSync(path, kept);
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
  // Both of these install from the lockfiles, thus the diff they leave behind
  // is the generated code alone. `regenerate-lockfiles` is what updates a
  // lockfile; a task that regenerates something else has no business doing it
  // as a side effect, least of all `ai-files`, whose diff the `Update AI files`
  // workflow turns into a pull request.
  codegen: async (template, report) => {
    if (!skipInstall) await install(template, report, true);
    await codegen(template, report);
  },
  "ai-files": async (template, report) => {
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
      // The lane title already names the template in a terminal. The verbose
      // renderer writes the lanes interleaved and drops the title, thus there
      // every line has to name the template itself.
      runTask(template, (line) => {
        listrTask.output = interactive ? line : `${template.name}$ ${line}`;
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
