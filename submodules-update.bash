#!/bin/bash

# Initialize and update submodules
git submodule update --init --remote

# Define a function to check changes and reset
check_changes_and_reset() {
    local submodule_path="$1"
    local old_commit=$(git rev-parse HEAD)
    local old_branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "detached HEAD")
    local target_branch=$(basename "$submodule_path")
    local current_branch=$(git symbolic-ref --short HEAD)

    # Check if the current branch is the target branch and remote commit matches current commit
    if [[ "$target_branch" = "$current_branch" ]]; then
        local remote_commit=$(git rev-parse @{u})
        if [[ "$old_commit" = "$remote_commit" ]]; then
            exit 0
        fi
    fi

    echo git checkout "$target_branch"
    # Reset hard to the upstream tracking branch
    echo git reset --hard @{u}

    # Fetch the new commit and branch for comparison
    local new_commit=$(git rev-parse HEAD)
    local new_branch=$(git symbolic-ref --short HEAD 2>/dev/null || echo "detached HEAD")

    echo
    echo "\033[33m$(basename "$submodule_path")\033[0m updated"
    echo
    echo "  before: commit \033[31m$old_commit\033[0m branch \033[92m$old_branch\033[0m"
    echo "   after: commit \033[31m$new_commit\033[0m branch \033[92m$new_branch\033[0m"

    exit 0
}

# Export the function for git submodule foreach
export -f check_changes_and_reset

# Process each submodule
git submodule foreach 'check_changes_and_reset "$PWD"' | grep -v '^Entering ' || exit 0
