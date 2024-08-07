# Working on Convex templates

This repo contains:

- `create-convex`, the NPM project for cloning and setting up Convex templates
- A number of `template-*` Git submodules

To understand submodules read at least the first few sections of
https://git-scm.com/book/en/v2/Git-Tools-Submodules

## Cloning this repo

You must clone this repo with this command:

```sh
git clone --recurse-submodules https://github.com/get-convex/templates/
```

If you don't use `--recurse-submodules` you won't clone the individual
templates.

## Tooling

### Setup

Install `just`: https://github.com/casey/just?tab=readme-ov-file#installation
(`brew install just`)

Install `git-absorb`:
https://github.com/tummychow/git-absorb?tab=readme-ov-file#installing
(`brew install git-absorb`)

### Using tooling

Run `just` anywhere from this project to see the list of available commands.

Then you can run them from this or child directory, for example to absorb
changes to a template into its history do:

```sh
cd template-foo
just absorb-prepare
```

## Workflows

### Make changes to a template

Each template is a checkout of a repo at a particular branch.

For example `template-nextjs-shadcn` is a check out of the
https://github.com/get-convex/generate-template-nextjs.git repo at the `convex`
branch.

The `generate-` repo has a clean history. This is important so that we can go
and rebuild it from a fresh `npx create-next-app`. This is the only way to make
maintainting a large number of templates over time tracktable.

#### Absorb workflow

If you just want to make a simple code change to the code we wrote (in `convex/`
or some client code), you can do the following:

1. `cd template-foo`
2. Make the change
3. Stage the changes with `git add`
4. Run `just absorb-prepare`
5. Check the new commits target the right base commits (should be easy to tell
   from the commit titles). If there are changes left staged you either did
   something wrong, or you're adding new files. In this case you can stash these
   changes and use the [Manual workflow](#manualworkflow) later.
6. Run `just absorb-rebase`. Hopefully you won't get rebase conflicts. If you
   do, resolve them, stage the resolved files, and run `git rebase --continue`.
   Repeat until the full rebase finishes.
7. Run `just commit "My message"` to commit the changes you just made to the
   main `templates` repo. The main repo will have a commit showing the previous
   commit the branch was at and the new one. This way we can keep track of
   changes to these templates.

#### Manual workflow

If you need to make other changes, including rerunning the commands used to make
a particular commit, do:

1. `cd template-foo`
2. Run `npx rebase -i --root`
3. Mark the commits you want to edit as `edit`. This is easier if you install
   GitLens extension in VS Code and configure Git to use VS Code as the editor
   via `git config --global core.editor "code --wait"`
4. Save and close the file/interface.
5. Make your changes, stage them, and run `git rebase --continue`.
6. Repeat until the full rebase finishes.
7. Run `just commit "My message"` to commit the changes you just made to the
   main `templates` repo.
