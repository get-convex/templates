# create-convex

## Scaffolding Your First Convex Project

```bash
$ npm create convex@latest
```

Then follow the prompts!

You can also directly specify the project name and the template you want to use
via additional command line options. For example, to scaffold a Convex project
with no client, run:

```bash
npm create convex@latest my-app -- -t bare
```

`-t` is a shorthand for `--template`

Currently supported template presets include:

- `bare`
- `nextjs-clerk-shadcn`
- `nextjs-lucia-shadcn`
- `nextjs-shadcn`
- `react-vite-clerk-shadcn`
- `react-vite-shadcn`

You can use `.` for the project name to scaffold in the current directory:

```sh
npm create convex@latest .
```

You can use any repository on GitHub as a template by providing the owner and repo names:

```sh
npm create convex@latest my-app -- -t thomasballinger/convex-clerk-users-table
```

optionally with a branch name:

```sh
npm create convex@latest my-app -- -t 'thomasballinger/convex-clerk-users-table#branch'
```
