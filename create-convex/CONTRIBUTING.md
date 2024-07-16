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
npm create convex -- -t react-vite-shadcn
```

# Publish CLI

For patch, adapt this as needed:

```sh
cd create-convex
npm version patch
npm publish
```
