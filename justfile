# To run these commands, read CONTRIBUTING.md

# Affects authoring this Justfile:
# https://github.com/casey/just?tab=readme-ov-file#positional-arguments
set positional-arguments

# List all available commands when running `just` without arguments
_default:
  @just --list

rm-lockfiles:
    #!/usr/bin/env sh
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package-lock.json" ]; then
            rm -f "$dir/package-lock.json"
            rm -f "$dir/bun.lockb"
        fi
    done

# Since the lockfiles are deleted by the CLI tool when the project is downloaded
# (in order to allow dependencies to be installed through any package manager),
# it’s a good idea to regenerate them from time to time to ensure that
# templates still work.
regenerate-lockfiles:
    just rm-lockfiles
    just install-all

# Install npm dependencies in all template folders
install-all:
    #!/usr/bin/env sh
    set -e
    total=0
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            total=$((total+1))
        fi
    done

    counter=0
    install_deps() {
        dir="$1"

        counter=$((counter+1))
        printf "\n\033[35m[%s/%s] Installing dependencies in \033[36m%s\033[35m\033[0m\n" "$counter" "$total" "$dir"
        if [ "$dir" = "template-astro" ]; then
            (cd "$dir" && bun install)
        else
            (cd "$dir" && npm install)
        fi
    }

    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            install_deps "$(basename $dir)"
        fi
    done

regenerate-codegen: install-all
    #!/usr/bin/env sh
    set -e
    total=0
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            total=$((total+1))
        fi
    done

    counter=0
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            counter=$((counter+1))
            printf "\n\033[35m[%s/%s] Regenerating codegen in \033[36m%s\033[35m\033[0m\n" "$counter" "$total" "$dir"
            (cd "$dir" && CONVEX_AGENT_MODE=anonymous npx convex codegen --init)
        fi
    done

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
