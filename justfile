# To run these commands, read CONTRIBUTING.md

# Affects authoring this Justfile:
# https://github.com/casey/just?tab=readme-ov-file#positional-arguments
set positional-arguments

# List all available commands when running `just` without arguments
_default:
  @just --list

# `npm install` without adding `package-lock.json`
[no-cd]
install *ARGS:
    npm install --package-lock false "$@"

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
