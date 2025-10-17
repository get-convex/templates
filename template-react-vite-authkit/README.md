# Welcome to your Convex + React (Vite) + WorkOS AuthKit app

This is a [Convex](https://convex.dev/) project created with [`npm create convex`](https://www.npmjs.com/package/create-convex).

After the initial setup (<2 minutes) you'll have a working full-stack app using:

- Convex as your backend (database, server logic)
- [React](https://react.dev/) as your frontend (web page interactivity)
- [Vite](https://vitest.dev/) for optimized web hosting
- [Tailwind](https://tailwindcss.com/) for building great looking accessible UI
- [WorkOS AuthKit](https://workos.com/docs/authkit) for authentication

## Get started

If you just cloned this codebase and didn't use `npm create convex`, run:

```
npm install
npm run dev
```

If you're reading this README on GitHub and want to use this template, run:

```
npm create convex@latest -- -t react-vite-workos-authkit
```

Then:

1. Sign up for [WorkOS](https://workos.com/) and create an application
2. Copy `.env.local.example` to `.env.local` and configure:
   - `VITE_WORKOS_CLIENT_ID`: Your WorkOS client ID
   - `VITE_WORKOS_REDIRECT_URI`: Your redirect URI (default: http://localhost:5173/callback)
   - `VITE_CONVEX_URL`: Your Convex deployment URL
3. Configure your WorkOS client ID as `WORKOS_CLIENT_ID` in your Convex dashboard environment variables

For user management and webhook integration with WorkOS, check out the [WorkOS documentation](https://workos.com/docs/user-management).

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
