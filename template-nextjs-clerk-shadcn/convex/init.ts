import { internalMutation } from "./_generated/server";

export default internalMutation({
  args: {},
  handler: async () => {
    console.log(process.env["CLERK_JWT_ISSUER_DOMAIN"]);

    // ['OPENAI_API_KEY']
    // if (!process.env.OPENAI_API_KEY) {
    //   const deploymentName = process.env.CONVEX_CLOUD_URL?.slice(8).replace('.convex.cloud', '');
    //   throw new Error(
    //     '\n  Missing OPENAI_API_KEY in environment variables.\n\n' +
    //       '  Get one at https://openai.com/\n\n' +
    //       '  Paste it on the Convex dashboard:\n' +
    //       '  https://dashboard.convex.dev/d/' +
    //       deploymentName +
    //       '/settings?var=OPENAI_API_KEY',
    //   );
    // }
  },
});

// function checkEnvironmentVariableIsSet(variable: string) {

// }
