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

# Publish the template to its own repo
[no-cd]
[no-exit-message]
template-publish force:
    @echo Publishing $(echo "{{invocation_directory()}}" | sed "s|^{{justfile_directory()}}/||")...
    @if [ "$1" = "true" ]; then \
        answer="y"; \
    else \
        read -p "Do you want to immediately publish this version of the template? [Y/n] " answer; \
    fi; \
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ] || [ "$answer" = "" ]; then \
        git push -f https://github.com/get-convex/$(echo "{{invocation_directory()}}" | sed "s|^{{justfile_directory()}}/||") HEAD:main; \
    else \
        echo "Not publishing."; exit 1; \
    fi
