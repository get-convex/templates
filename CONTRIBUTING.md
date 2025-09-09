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
