# Welcome to your Convex + TanStack Start + WorkOS AuthKit app

This is a [Convex](https://convex.dev/) project using WorkOS AuthKit for authentication.

After the initial setup (<2 minutes) you'll have a working full-stack app using:

- Convex as your backend (database, server logic)
- [React](https://react.dev/) as your frontend (web page interactivity)
- [TanStack Start](https://tanstack.com/start) for modern full-stack React with file-based routing
- [Tailwind](https://tailwindcss.com/) for building great looking accessible UI
- [WorkOS AuthKit](https://authkit.com/) for authentication

## Get started

Clone this repository and install dependencies:

   ```bash
   npm install
   ```

### Automatic setup

Run `npx convex dev` and follow the prompts!

Most of the setup should be automated.

Consult the official [Convex WorkOS AuthKit docs](https://docs.convex.dev/auth/authkit/) for more details.

### Manual setup w/ existing WorkOS team

Set up your environment variables:

1. Get a template `.env.local` file ready:

   ```bash
   cp .env.local.example .env.local
   ```

2. Configure WorkOS AuthKit:
   - Get your Client ID and API Key from the WorkOS dashboard
   - In the WorkOS dashboard, add `http://localhost:3000/callback` as a redirect URI
   - Generate a secure password for cookie encryption (minimum 32 characters)
     - If you have `openssl` installed, you can use `openssl rand -base64 24`
   - Update your `.env.local` file with these values

3. Configure Convex:

   ```bash
   npx convex dev
   ```

   This will:
   - Set up your Convex deployment
   - Add your Convex URL to `.env.local`

   Then set your WorkOS Client ID and API key in your Convex deployment:

   ```bash
   npx convex env set WORKOS_CLIENT_ID <your_client_id>
   npx convex env set WORKOS_API_KEY <your_api_key>
   ```

   This allows Convex to validate JWT tokens from WorkOS

4. Run the development server:

   ```bash
   npm run dev
   ```

   This starts both the Vite dev server (TanStack Start frontend) and Convex backend in parallel

5. Open [http://localhost:3000](http://localhost:3000) to see your app

## WorkOS AuthKit Setup

This app uses WorkOS AuthKit for authentication. Key features:

- **Redirect-based authentication**: Users are redirected to WorkOS for sign-in/sign-up
- **Session management**: Automatic token refresh and session handling
- **Route loader protection**: Protected routes use loaders to check authentication
- **Client and server functions**: `useAuth()` for client components, `getAuth()` for server loaders

## Learn more

To learn more about developing your project with Convex, check out:

- The [Tour of Convex](https://docs.convex.dev/get-started) for a thorough introduction to Convex principles.
- The rest of [Convex docs](https://docs.convex.dev/) to learn about all Convex features.
- [Stack](https://stack.convex.dev/) for in-depth articles on advanced topics.

## Join the community

Join thousands of developers building full-stack apps with Convex:

- Join the [Convex Discord community](https://convex.dev/community) to get help in real-time.
- Follow [Convex on GitHub](https://github.com/get-convex/), star and contribute to the open-source implementation of Convex.
