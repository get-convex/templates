# To run these commands, read CONTRIBUTING.md
# Affects authoring this Justfile:
# https://github.com/casey/just?tab=readme-ov-file#positional-arguments

set positional-arguments := true

# Every recipe below that touches the templates delegates to
# `scripts/templates.ts`, which runs the task in all of them at the same time.
# `--install=fallback` lets Bun install that script's own dependencies into its
# global cache, thus the repo root needs no `package.json`.
templates := "bun --install=fallback scripts/templates.ts"

# List all available commands when running `just` without arguments
_default:
    @just --list

# Install npm dependencies in all template folders (`just install-all nextjs` to filter)
install-all *args:
    {{ templates }} install "$@"

# Delete the lockfile of every template
rm-lockfiles *args:
    {{ templates }} rm-lockfiles "$@"

# The lockfiles are deleted by the CLI tool when the project is downloaded (in
# order to allow dependencies to be installed through any package manager), thus
# it’s a good idea to regenerate them from time to time to ensure that templates
# still work.
[doc("Delete and reinstall every lockfile")]
regenerate-lockfiles *args:
    just rm-lockfiles "$@"
    just install-all "$@"

# Regenerate `convex/_generated/` in all template folders
regenerate-codegen *args:
    {{ templates }} codegen "$@"

# Unlike `install-all`, the install it runs first uses `npm ci` /
# `bun install --frozen-lockfile`, which never rewrite the lockfiles, thus the
# resulting diff contains only AI files and no lockfile churn.
[doc("Update the Convex AI files in all template folders")]
update-ai-files *args:
    {{ templates }} ai-files "$@"

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
