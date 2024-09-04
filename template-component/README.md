# Example Convex Component: Rate Limiter

This is a Convex component, ready to be published on npm.

To create your own component:

- change the "name" field in package.json
- modify src/component/convex.config.ts to use your component name

To develop your component run a dev process in the example project.

```
cd example
npm i
npx convex dev
```

Modify the schema and index files in src/component/ to define your component.

Optionally write a client forusing this component in src/client/index.ts.

If you won't be adding frontend code (e.g. React components) to this
component you can delete the following:

- "prepack" and "postpack" scripts of package.json
- "./frontend" exports in package.json
- the "src/frontend/" directory
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
│   ├── client.ts       "Fat" client code goes here.
│   └── frontend/       Code intended to be used on the frontend goes here.
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
import { helper } from "my-convex-component/frontend";
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
