# Build CLI

```sh
cd create-convex
npm run build
```

# Test CLI

```sh
node <path to here>/create-convex/dist/index.mjs
```

with arguments:

```sh
node <path to here>/create-convex/dist/index.mjs -t react-vite-shadcn
```

**Note:** With `npm create` `--` is required:

```sh
npx create-convex -t react-vite-shadcn
```

# Publish CLI

For patch, adapt this as needed:

```sh
cd create-convex
VERSION=$(npm version patch)
git add package.json package-lock.json
git commit -m "$VERSION"
git tag "$VERSION"
git push --tags
npm publish
```
