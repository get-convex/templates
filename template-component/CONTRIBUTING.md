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

### Changelog

To edit the changelog while changing the version, you can add this to your
`package.json` scripts:

```json
"version": "vim CHANGELOG.md && prettier -w CHANGELOG.md && git add CHANGELOG.md"
```

It will open the changelog in vim and then save it before committing the new
version.
