
_default:
  @just --list

[no-cd]
absorb-prepare:
    @echo You were on: $(git rev-parse --short HEAD)
    git absorb -b $(git rev-list --max-parents=0 HEAD)
    @echo Now review the fixup commits via your favorite '`git log`' variant.
    @echo Then run '`just absorb-rebase`'
    @echo Any uncommited changes cannot be absorbed and you need to absorb them manually via '`git rebase -i --root`'

[no-cd]
absorb-rebase:
    GIT_SEQUENCE_EDITOR=true git rebase -i --root --autosquash

[no-cd]
absorb-revert:
    @echo Run '`git reset --soft <the commit hash of you were on>`'

commit message:
    git add template-*
    git commit -m {{message}}