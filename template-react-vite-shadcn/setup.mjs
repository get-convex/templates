/**
 * This script runs `npx @convex-dev/auth` to help with setting up
 * environment variables for Convex Auth.
 *
 * You can safely delete it and remove it from package.json scripts.
 */

import fs from "fs";
import { config as loadEnvFile } from "dotenv";
import { spawnSync } from "child_process";

if (!fs.existsSync(".env.local")) {
  // Something is off, skip the script.
  process.exit(0);
}

const config = {};
loadEnvFile({ path: ".env.local", processEnv: config });

const runOnceWorkflow = process.argv.includes("--once");

if (runOnceWorkflow && config.SETUP_SCRIPT_RAN !== undefined) {
  // The script has already ran once, skip.
  process.exit(0);
}

// The fallback should never be used.
const deploymentName =
  config.CONVEX_DEPLOYMENT.split(":").slice(-1)[0] ?? "<your deployment name>";

const variables = JSON.stringify({
  help:
    "This template includes prebuilt sign-in via GitHub OAuth and " +
    "magic links via Resend. " +
    "This command can help you configure the credentials for these services " +
    "via additional Convex environment variables.",
  providers: [
    {
      name: "GitHub OAuth",
      help:
        "Create a GitHub OAuth App, follow the instruction here: " +
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app\n\n" +
        `When you're asked for a callback URL use:\n\n` +
        `  https://${deploymentName}.convex.site/api/auth/callback/github`,
      variables: [
        {
          name: "AUTH_GITHUB_ID",
          description: "the Client ID of your GitHub OAuth App",
        },
        {
          name: "AUTH_GITHUB_SECRET",
          description: "the generated client secret",
        },
      ],
    },
    {
      name: "Resend",
      help: "Sign up for Resend at https://resend.com/signup. Then create an API Key.",
      variables: [
        {
          name: "AUTH_RESEND_KEY",
          description: "the API Key",
        },
      ],
    },
  ],
  success:
    "You're all set. If you need to, you can rerun this command with `node setup.mjs`.",
});

console.error(
  "You chose Convex Auth as the auth solution. " +
    "This command will walk you through setting up " +
    "the required Convex environment variables",
);

const result = spawnSync(
  "npx",
  ["@convex-dev/auth", "--variables", variables, "--skip-git-check"],
  { stdio: "inherit" },
);

if (runOnceWorkflow) {
  fs.writeFileSync(".env.local", `\nSETUP_SCRIPT_RAN=1\n`, { flag: "a" });
}

process.exit(result.status);
