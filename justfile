# To run these commands, read CONTRIBUTING.md
# Affects authoring this Justfile:
# https://github.com/casey/just?tab=readme-ov-file#positional-arguments

set positional-arguments := true

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
    names=""
    set --
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            if [ "$dir" = "template-astro" ]; then
                set -- "$@" "cd $dir && bun install"
            else
                set -- "$@" "cd $dir && npm install"
            fi
            names="${names:+$names,}$dir"
        fi
    done
    just _run-parallel "$names" "$@"

# Clean install of npm dependencies in all template folders.
# Unlike `install-all`, this uses `npm ci` / `bun install --frozen-lockfile`,
# which never rewrite lockfiles. Used by `update-ai-files` so the resulting

# diff contains only AI files and no lockfile churn.
_install-all-clean:
    #!/usr/bin/env sh
    set -e
    names=""
    set --
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            if [ "$dir" = "template-astro" ]; then
                set -- "$@" "cd $dir && bun install --frozen-lockfile"
            else
                set -- "$@" "cd $dir && npm ci"
            fi
            names="${names:+$names,}$dir"
        fi
    done
    just _run-parallel "$names" "$@"

regenerate-codegen: install-all
    #!/usr/bin/env sh
    set -e

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

    names=""
    set --
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            # convex-playground/templates-regenerate-codegen is an empty project that has
            # mock values for all environment variables used in templates
            cmd="cd $dir && { test -f .env.local || npx convex dev --once --configure existing --team convex-playground --project templates-regenerate-codegen --dev-deployment cloud --skip-push; }"
            if [ "$dir" = "template-component" ]; then
                # The component codegen uses a separate command
                cmd="$cmd && npm run build:codegen"
            fi
            cmd="$cmd && npx convex codegen --init"
            set -- "$@" "$cmd"
            names="${names:+$names,}$dir"
        fi
    done
    just _run-parallel "$names" "$@"

update-ai-files: _install-all-clean
    #!/usr/bin/env sh
    set -e
    names=""
    set --
    for dir in template-*; do
        if [ -d "$dir" ] && [ -f "$dir/package.json" ]; then
            set -- "$@" "cd $dir && npx convex ai-files update"
            names="${names:+$names,}$dir"
        fi
    done
    just _run-parallel "$names" "$@"

# Run the given commands in parallel, one per template.
# In an interactive terminal this uses `mprocs` to run them all at once with a
# live TUI. Since `mprocs` is a TUI that requires a TTY and never auto-exits,
# non-interactive environments (e.g. CI) fall back to running the commands
# sequentially so the recipe still terminates on its own.
_run-parallel names *commands:
    #!/usr/bin/env sh
    set -e
    # With `positional-arguments`, `$@` also contains `names` as `$1`; drop it
    # so `$@` holds only the per-template commands.
    shift
    if [ -t 1 ]; then
        npx mprocs@latest --names "{{names}}" "$@"
    else
        total=$#
        counter=0
        for cmd in "$@"; do
            counter=$((counter+1))
            printf "\n\033[35m[%s/%s] \033[36m%s\033[0m\n" "$counter" "$total" "$cmd"
            sh -c "$cmd"
        done
    fi

# Commit a template change in the `templates` repo
commit message:
    git add template-*
    git commit -m "$1"
