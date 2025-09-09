# To run these commands, read CONTRIBUTING.md

# Affects authoring this Justfile:
# https://github.com/casey/just?tab=readme-ov-file#positional-arguments
set positional-arguments

# List all available commands when running `just` without arguments
_default:
  @just --list

# Install npm dependencies in all template folders
install-all:
    #!/usr/bin/env sh
    set -e
    total=1
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

    install_deps "template-component/example"

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
