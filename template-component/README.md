# Example Convex Component: Rate Limiter

This package demonstrates how to package a component to be published on npm.

We recommend developers bundle the components they publish to npm.

While it's possible to publish an npm package uncompiled (.ts instead of .js) if
tsconfig.json files differ between the consuming package and the installed one
there could be type or even runtime errors.

### Structure of a Convex Component

Components are expected to expose the entry point convex.config.js. The on-disc
location of this file must be a directory containing implementation files. These
files should be compiled to ESM, not CommonJS.

The package.json should contain `"type": "module"` and the tsconfig.json should
contain `"moduleResolution": "Bundler"` or Node16 in order to import other
component definitions.

In addition to convex.config.js, a component may expose other exports.

A client that wraps communication with the component for use in the Convex
environment is typically exposed as a named export `MyComponentClient` or
`MyComponent` imported from the root package.

```
import { MyComponentClient } from "my-convex-component";
```

Frontend code is typically published at a subpath:

```
import { FrontendReactComponent } from "my-convex-component/react";
```

Frontend code should be compiled as CommonJS code as well as ESM and make use of
subpackage stubs (see next section).

If you do include frontend components, prefer peer dependencies to avoid using
more than one version of e.g. React.

### Support for Node10 module resolution

The [Metro](https://reactnative.dev/docs/metro) bundler for React Native
requires setting
[`resolver.unstable_enablePackageExports`](https://metrobundler.dev/docs/package-exports/)
in order to import code that lives in `dist/esm/frontend.js` from a path like
`my-convex-component/frontend`.

Authors of Convex component that provide frontend components are encouraged to
support these legacy "Node10-style" module resolution algorithms by generating
stub directories with special pre- and post-pack scripts.

### package.json template

```json
{
  "name": "@convex-dev/ratelimiter",
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "build": "npm run build:esm && npm run build:cjs",
    "build:esm": "tsc --project ./esm.json && echo '{\\n  \"type\": \"module\"\\n}' > dist/esm/package.json",
    "build:cjs": "tsc --project ./commonjs.json && echo '{\\n  \"type\": \"commonjs\"\\n}' > dist/esm/package.json",
    "typecheck": "tsc --noEmit",
    "dev": "convex dev",
    "prepare": "npm run build",
    "prepack": "node node10stubs.mjs",
    "postpack": "node node10stubs.mjs --cleanup"
  },
  "files": ["dist", "src", "frontend"],
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "import": {
        "types": "./dist/esm/client.d.ts",
        "default": "./dist/esm/client.js"
      },
      "require": {
        "types": "./dist/commonjs/client.d.ts",
        "default": "./dist/commonjs/client.js"
      }
    },
    "./frontend": {
      "import": {
        "types": "./dist/esm/frontend.d.ts",
        "default": "./dist/esm/frontend.js"
      },
      "require": {
        "types": "./dist/commonjs/frontend.d.ts",
        "default": "./dist/commonjs/frontend.js"
      }
    },
    "./convex.config.js": {
      "import": {
        "types": "./dist/esm/ratelimiter/convex.config.d.ts",
        "default": "./dist/esm/ratelimiter/convex.config.js"
      },
      "require": {
        "types": "./dist/commonjs/ratelimiter/convex.config.d.ts",
        "default": "./dist/commonjs/ratelimiter/convex.config.js"
      }
    }
  },
  "dependencies": {
    "convex": "workspace:*"
  },
  "devDependencies": {
    "prettier": "3.2.5",
    "@types/node": "^18.17.0",
    "typescript": "~5.0.3"
  },
  "main": "./dist/commonjs/client.js",
  "types": "./dist/commonjs/client.d.ts",
  "module": "./dist/esm/client.js"
}
```

### Example App

If a package includes an example it should live in a subdirectory. `example` is
a good name for a directory.
