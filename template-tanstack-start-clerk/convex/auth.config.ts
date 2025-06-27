export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex" JWT template
      // or with `process.env.CLERK_JWT_ISSUER_DOMAIN`
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // See https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances
      // Should look similar to 'https://main-swine-30.clerk.accounts.dev'.
      domain: process.env.VITE_CLERK_FRONTEND_API_URL,
      applicationID: 'convex',
    },
  ],
}
