# Convex Component Template

This is a Convex component, ready to be published on npm.

To create your own component:

1. Run `node rename.mjs` to rename everything to your component's name.
1. Write code in src/component for your component.
1. Write code in src/client for the Class that interfaces with the component.
1. Write example usage in example/convex/example.ts.
1. Delete the text in this readme until `---` and flesh out the README.
1. Publish to npm with `npm run alpha` or `npm run release`.

To develop your component run a dev process in the example project:

```sh
npm i
npm run dev
```

`npm i` will do the install and an initial build. `npm run dev` will start a
file watcher to re-build the component, as well as the example project frontend
and backend, which does codegen and installs the component.

Modify the schema and index files in src/component/ to define your component.

Write a client for using this component in src/client/index.ts.

If you won't be adding frontend code (e.g. React components) to this component
you can delete the following:

- "./react" exports in package.json
- the "src/react/" directory

If you will be adding frontend code, add a peer dependency on React in
package.json.

### Component Directory structure

```
.
├── README.md           documentation of your component
├── package.json        component name, version number, other metadata
├── package-lock.json   Components are like libraries, package-lock.json
│                       is .gitignored and ignored by consumers.
├── src
│   ├── component/
│   │   ├── _generated/ Files here are generated for the component.
│   │   ├── convex.config.ts  Name your component here and use other components
│   │   ├── lib.ts    Define functions here and in new files in this directory
│   │   └── schema.ts   schema specific to this component
│   ├── client/index.ts "Thick" client code goes here.
│   └── react/          Code intended to be used on the frontend goes here.
│       │               Your are free to delete this if this component
│       │               does not provide code.
│       └── index.ts
├── example/            example Convex app that uses this component
│   └── convex/
│       ├── _generated/       Files here are generated for the example app.
│       ├── convex.config.ts  Imports and uses this component
│       ├── myFunctions.ts    Functions that use the component
│       └── schema.ts         Example app schema
└── dist/               Publishing artifacts will be created here.
```

---

# Convex Sample Component Component

[![npm version](https://badge.fury.io/js/@example%2Fsample-component.svg)](https://badge.fury.io/js/@example%2Fsample-component)

<!-- START: Include on https://convex.dev/components -->

- [ ] What is some compelling syntax as a hook?
- [ ] Why should you use this component?
- [ ] Links to docs / other resources?

Found a bug? Feature request?
[File it here](https://github.com/example-org/sample-component/issues).

## Pre-requisite: Convex

You'll need an existing Convex project to use the component. Convex is a hosted
backend platform, including a database, serverless functions, and a ton more you
can learn about [here](https://docs.convex.dev/get-started).

Run `npm create convex` or follow any of the
[quickstarts](https://docs.convex.dev/home) to set one up.

## Installation

Install the component package:

```sh
npm install @example/sample-component
```

Create a `convex.config.ts` file in your app's `convex/` folder and install the
component by calling `use`:

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import sampleComponent from "@example/sample-component/convex.config.js";

const app = defineApp();
app.use(sampleComponent);

export default app;
```

## Usage

```ts
import { components } from "./_generated/api";
import { SampleComponent } from "@example/sample-component";

const sampleComponent = new SampleComponent(components.sampleComponent, {
  ...options,
});
```

See more example usage in [example.ts](./example/convex/example.ts).

<!-- END: Include on https://convex.dev/components -->

Run the example:

```sh
npm i
npm run dev
```
