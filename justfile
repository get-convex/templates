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

    # Set up environment variables in a new dev deployment
    printf "\n\033[35mSetting up environment variables in a dev deployment\033[0m\n"
    cd template-bare
    npx convex dev --once --configure existing --team convex-playground --project templates-regenerate-codegen --dev-deployment cloud
    npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://placeholder.authkit.dev/"
    npx convex env set WORKOS_CLIENT_ID client_placeholder
    npx convex env set WORKOS_CLIENT_SECRET placeholder
    npx convex env set WORKOS_ENVIRONMENT_ID environment_placeholder
    npx convex env set WORKOS_ENVIRONMENT_API_KEY sk_test_placeholder
    cd ..

    counter=0
    regenerate() {
        dir="$1"

        counter=$((counter+1))
        printf "\n\033[35m[%s/%s] Updating codegen in \033[36m%s\033[35m\033[0m\n" "$counter" "$total" "$dir"
        if [ "$dir" = "template-component" ]; then
            printf "\033[33mWarning: Skipping codegen for %s\033[0m\n" "$dir"
        else
            # convex-playground/templates-regenerate-codegen is an empty project that has
            # mock values for all environment variables used in templates
            (cd "$dir" && npx convex dev --once --configure existing --team convex-playground --project templates-regenerate-codegen --dev-deployment cloud)
            (cd "$dir" && npx convex codegen --init)
        fi
    }

    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            regenerate "$(basename $dir)"
        fi
    done

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
