# Convex Component Template

This is a Convex component, ready to be published on npm.

To create your own component:

1. Find and replace "Counter" to your component's Name.
1. Find and replace "counter" to your component's name.
1. Write code in src/component for your component.
1. Write code in src/client for your thick client.
1. Write example usage in example/convex/example.ts.
1. Delete the text in this readme until `---` and flesh out the README.

It is safe to find & replace "counter" project-wide.

To develop your component run a dev process in the example project.

```
npm i
cd example
npm i
npx convex dev
```

Modify the schema and index files in src/component/ to define your component.

Optionally write a client forusing this component in src/client/index.ts.

If you won't be adding frontend code (e.g. React components) to this
component you can delete the following:

- "prepack" and "postpack" scripts of package.json
- "./react" exports in package.json
- the "src/react/" directory
- the "node10stubs.mjs" file

### Component Directory structure

```
.
├── README.md           documentation of your component
├── package.json        component name, version number, other metadata
├── package-lock.json   Components are like libraries, package-lock.json
│                       is .gitignored and ignored by consumers.
├── src
│   ├── component/
│   │   ├── _generated/ Files here are generated.
│   │   ├── convex.config.ts  Name your component here and use other components
│   │   ├── index.ts    Define functions here and in new files in this directory
│   │   └── schema.ts   schema specific to this component
│   ├── client/index.ts "Thick" client code goes here.
│   └── react/          Code intended to be used on the frontend goes here.
│       │               Your are free to delete this if this component
│       │               does not provide code.
│       └── index.ts
├── example/            example Convex app that uses this component
│   │                   Run 'npx convex dev' from here during development.
│   ├── package.json.ts Thick client code goes here.
│   └── convex/
│       ├── _generated/
│       ├── convex.config.ts  Imports and uses this component
│       ├── myFunctions.ts    Functions that use the component
│       ├── schema.ts         Example app schema
│       └── tsconfig.json
│  
├── dist/               Publishing artifacts will be created here.
├── commonjs.json       Used during build by TypeScript.
├── esm.json            Used during build by TypeScript.
├── node10stubs.mjs     Script used during build for compatibility
│                       with the Metro bundler used with React Native.
├── eslint.config.mjs   Recommended lints for writing a component.
│                       Feel free to customize it.
└── tsconfig.json       Recommended tsconfig.json for writing a component.
                        Some settings can be customized, some are required.
```

### Structure of a Convex Component

A Convex components exposes the entry point convex.config.js. The on-disk
location of this file must be a directory containing implementation files. These
files should be compiled to ESM.
The package.json should contain `"type": "module"` and the tsconfig.json should
contain `"moduleResolution": "Bundler"` or `"Node16"` in order to import other
component definitions.

In addition to convex.config.js, a component typically exposes a client that
wraps communication with the component for use in the Convex
environment is typically exposed as a named export `MyComponentClient` or
`MyComponent` imported from the root package.

```
import { MyComponentClient } from "my-convex-component";
```

When frontend code is included it is typically published at a subpath:

```
import { helper } from "my-convex-component/react";
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
in order to import code that lives in `dist/esm/react.js` from a path like
`my-convex-component/react`.

Authors of Convex component that provide frontend components are encouraged to
support these legacy "Node10-style" module resolution algorithms by generating
stub directories with special pre- and post-pack scripts.

---

# Convex Counter Component

[![npm version](https://badge.fury.io/js/@convex-dev%2Fcounter.svg)](https://badge.fury.io/js/@convex-dev%2Fcounter)

- [ ] What is some compelling syntax as a hook?
- [ ] Why should you use this component?
- [ ] Links to Stack / other resources?

## Before you get started

### Convex App

You'll need a Convex App to use the component. Run `npm create convex` or
follow any of the [Convex quickstarts](https://docs.convex.dev/home) to set one up.

## Installation

Install the component package:

```ts
npm install @convex-dev/foo
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import counter from "@convex-dev/counter/convex.config";

const app = defineApp();
app.use(counter);

export default app;
```

## Usage

```ts
import { components } from "./_generated/api";
import { Counter } from "@convex-dev/counter";

const counter = new Counter(components.counter, {
  ...options,
});
```

See more example usage in [example.ts](./example/convex/example.ts).

# 🧑‍🏫 What is Convex?

[Convex](https://convex.dev) is a hosted backend platform with a
built-in database that lets you write your
[database schema](https://docs.convex.dev/database/schemas) and
[server functions](https://docs.convex.dev/functions) in
[TypeScript](https://docs.convex.dev/typescript). Server-side database
[queries](https://docs.convex.dev/functions/query-functions) automatically
[cache](https://docs.convex.dev/functions/query-functions#caching--reactivity) and
[subscribe](https://docs.convex.dev/client/react#reactivity) to data, powering a
[realtime `useQuery` hook](https://docs.convex.dev/client/react#fetching-data) in our
[React client](https://docs.convex.dev/client/react). There are also clients for
[Python](https://docs.convex.dev/client/python),
[Rust](https://docs.convex.dev/client/rust),
[ReactNative](https://docs.convex.dev/client/react-native), and
[Node](https://docs.convex.dev/client/javascript), as well as a straightforward
[HTTP API](https://docs.convex.dev/http-api/).

The database supports
[NoSQL-style documents](https://docs.convex.dev/database/document-storage) with
[opt-in schema validation](https://docs.convex.dev/database/schemas),
[relationships](https://docs.convex.dev/database/document-ids) and
[custom indexes](https://docs.convex.dev/database/indexes/)
(including on fields in nested objects).

The
[`query`](https://docs.convex.dev/functions/query-functions) and
[`mutation`](https://docs.convex.dev/functions/mutation-functions) server functions have transactional,
low latency access to the database and leverage our
[`v8` runtime](https://docs.convex.dev/functions/runtimes) with
[determinism guardrails](https://docs.convex.dev/functions/runtimes#using-randomness-and-time-in-queries-and-mutations)
to provide the strongest ACID guarantees on the market:
immediate consistency,
serializable isolation, and
automatic conflict resolution via
[optimistic multi-version concurrency control](https://docs.convex.dev/database/advanced/occ) (OCC / MVCC).

The [`action` server functions](https://docs.convex.dev/functions/actions) have
access to external APIs and enable other side-effects and non-determinism in
either our
[optimized `v8` runtime](https://docs.convex.dev/functions/runtimes) or a more
[flexible `node` runtime](https://docs.convex.dev/functions/runtimes#nodejs-runtime).

Functions can run in the background via
[scheduling](https://docs.convex.dev/scheduling/scheduled-functions) and
[cron jobs](https://docs.convex.dev/scheduling/cron-jobs).

Development is cloud-first, with
[hot reloads for server function](https://docs.convex.dev/cli#run-the-convex-dev-server) editing via the
[CLI](https://docs.convex.dev/cli),
[preview deployments](https://docs.convex.dev/production/hosting/preview-deployments),
[logging and exception reporting integrations](https://docs.convex.dev/production/integrations/),
There is a
[dashboard UI](https://docs.convex.dev/dashboard) to
[browse and edit data](https://docs.convex.dev/dashboard/deployments/data),
[edit environment variables](https://docs.convex.dev/production/environment-variables),
[view logs](https://docs.convex.dev/dashboard/deployments/logs),
[run server functions](https://docs.convex.dev/dashboard/deployments/functions), and more.

There are built-in features for
[reactive pagination](https://docs.convex.dev/database/pagination),
[file storage](https://docs.convex.dev/file-storage),
[reactive text search](https://docs.convex.dev/text-search),
[vector search](https://docs.convex.dev/vector-search),
[https endpoints](https://docs.convex.dev/functions/http-actions) (for webhooks),
[snapshot import/export](https://docs.convex.dev/database/import-export/),
[streaming import/export](https://docs.convex.dev/production/integrations/streaming-import-export), and
[runtime validation](https://docs.convex.dev/database/schemas#validators) for
[function arguments](https://docs.convex.dev/functions/args-validation) and
[database data](https://docs.convex.dev/database/schemas#schema-validation).

Everything scales automatically, and it’s [free to start](https://www.convex.dev/plans).
