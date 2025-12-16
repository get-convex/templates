# Publishing

In order for other people to install and use this component, you can publish the
package to npm.

You will first need to have an npmjs account with permissions to push to your
package name.

If this is your first time, here are the recommended steps:

1. Ensure the package.json "name" matches what you want it to be called. It
   should either be like `my-package` or `@my-org/my-package`. If it's the
   latter, ensure you have an npmjs account with permissions to push to
   `my-org`.
2. `npm login` to login to npmjs.
3. `npm run clean` to clean your `/dist` directory.
4. `npm ci` to install the dependencies with the versions specified in
   `package-lock.json`.
5. `npm run build` to build the package fresh.
6. (Optional) `npm run typecheck` to typecheck the package.
7. (Optional) `npm run lint` to lint the package.
8. (Optional) `npm run test` to test the package.
9. (Optional) `npm pack` will create a .tgz file of the package. You can then
   try installing it in another project with
   `npm install ./path/to/your-package.tgz` to sanity check that it works as
   expected. You can remove the .tgz file after.
10. `npm publish --access public` to publish the package to npm.
11. `git tag v0.1.0` to tag the new version.
12. `git push --follow-tags` to push the tags to the repository. This way, other
    contributors can always see what code was published with each version.
    Running `npm version ...` will create these tags and commits automatically.

After the initial publish, you can use the release scripts documented below,
which will do steps 3-12 automatically (except the sanity check in step 9).

## Package scripts for releasing

In package.json, there are some scripts that are useful for doing releases.

- `preversion` will run the tests and typecheck the code before marking a new
  version.
- `version` will open the changelog in vim and then save it before committing
  the new version.
- `prepublishOnly` will make a clean build of the package before publishing.

These are not required and can be modified or removed if desired. They will all
be run automatically when using one of the deployment commands.

## Deploying a new alpha version

```sh
npm run alpha
```

This will create a prerelease version with an `@alpha` tag. It will then publish
the package to npm and push the code and new tag. Users can install the package
with `npm install @your-package@alpha`.

## Deploying a new release version

```sh
npm run release
```

This will create a patch version and publish as `latest`. It will then publish
the package to npm and push the code and new tag. To publish a new minor or
major version, you can run the commands manually:

```sh
npm version minor # or major
npm publish
git push --follow-tags
```

## Building a one-off package

```sh
npm run clean
npm run build
npm pack
```

You can then provide the .tgz file to others to install via
`npm install ./path/to/your-package.tgz`.
