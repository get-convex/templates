# Working on Convex templates

This repo contains:

- `create-convex`, the NPM project for cloning and setting up Convex templates
- A number of `template-*` directories.

### Setup

Install `just`: https://github.com/casey/just?tab=readme-ov-file#installation
(`brew install just`)

Install bun:

```
npm install -g bun
```

## Tooling

### Using tooling

Run `just` anywhere from this project to see the list of available commands.

Every recipe that touches the templates delegates to `scripts/templates.ts`,
which runs the task in all of them at the same time and shows one live line per
template. Each recipe takes optional filters — substrings of a template name —
so that a single template can be worked on:

```
just regenerate-codegen nextjs-clerk
```

The script itself takes a few more options, which the recipes pass through:

- `--list` prints the templates the filters select, then exits
- `--serial` runs one template at a time
- `--concurrency <n>` runs at most n templates at a time (8 by default)
- `--no-install` skips the install step of `regenerate-codegen` and
  `update-ai-files`

It is a Bun script, and it declares its own dependencies in its imports
(`import { Listr } from "listr2@11.0.1"`), thus there is nothing to install
before running it and the repo root needs no `package.json`.

### Convex deployments

`just regenerate-codegen` needs a deployment for each template, because
`convex codegen` pushes the functions to one in order to analyze them. It gives
each template an anonymous local deployment of its own, the same kind that CI
uses, by running `npx convex init` in it. No login and no cloud project are
involved, and the templates cannot race each other over a shared deployment.

The deployment is recorded in each template's gitignored `.env.local`, which the
recipe owns: a `.env.local` that selects anything other than an anonymous
deployment (for instance a cloud deployment written by an older version of this
tooling) is replaced.

## All templates to update

Last updated: 2025-03-24

Templates from the interactive picker:

- `template-bare` (In this repo)
- `template-tanstack-start`
- `template-tanstack-start-clerk`
  (Note, Tanstack Start + Convex Auth aren't known to work together yet)
  In submodules:
- `template-nextjs`
- `template-nextjs-clerk`
- `template-nextjs-convexauth`
- `template-react-vite`
- `template-react-vite-clerk`
- `template-react-vite-convexauth`

Other templates:

- `template-component`

Templates used by older versions of `npm create convex` (don't need updating, will be cleaned up soon):

- `template-nextjs-clerk-shadcn`
- `template-nextjs-lucia-shadcn`
- `template-nextjs-convexauth-shadcn`
- `template-nextjs-shadcn`
- `template-react-vite-clerk-shadcn`
- `template-react-vite-convexauth-shadcn`
- `template-react-vite-shadcn`

Other probably unused templates:

- `template-astro`

## Updating the `create convex` script

It's in `create-convex/src/index.ts`. It can be run locally by running `npm run build` and then running the resulting `dist/index.mjs`

Since this script is used quite prominently, it's highly recommended to
test it out manually immediately after publishing (in addition to testing
before publishing).

### Testing with different branches

When developing templates, you can test the `create-convex` script with templates from a specific branch using the `CONVEX_TEMPLATE_BRANCH` environment variable:

```bash
CONVEX_TEMPLATE_BRANCH=my-feature-branch npm run build && node dist/index.mjs
```

This will make the script pull templates from the specified branch instead of the default `main` branch. This is useful for:

- Testing template changes before merging to main
- Developing new templates in a feature branch
- Testing the interaction between script changes and template changes

Without this environment variable, the script defaults to using the `main` branch.
