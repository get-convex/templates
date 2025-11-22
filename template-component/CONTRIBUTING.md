# Developing guide

## Running locally

```sh
npm i
npm run dev
```

## Testing

```sh
npm ci
npm run clean
npm run typecheck
npm run lint
npm run test
```

## Deploying

### Building a one-off package

```sh
npm run clean
npm run build
npm pack
```

### Deploying a new version

```sh
npm ci
npm run clean
npm run build
npm run typecheck
npm run lint
npm run test

# this will change the version and commit it (if you run it in the root directory)
npm version patch
npm publish --dry-run
# sanity check files being included
npm publish
git push --tags
```

#### Alpha release

The same as above, but it requires extra flags so the release is only installed
with `@alpha`:

```sh
npm ci
npm run clean
npm run build
npm run typecheck
npm run lint
npm run test

npm version prerelease --preid alpha
npm publish --tag alpha
```

## Package scripts for releasing

Some package scripts that are useful for doing releases:

```
    "preversion": "npm run clean && npm ci && run-p test lint typecheck",
    "alpha": "npm version prerelease --preid alpha && npm publish --tag alpha && git push --tags",
    "release": "npm version patch && npm publish && git push --tags",
    "version": "vim -c 'normal o' -c 'normal o## '$npm_package_version CHANGELOG.md && prettier -w CHANGELOG.md && git add CHANGELOG.md"
```

The version script will open the changelog in vim and then save it before
committing the new version.
