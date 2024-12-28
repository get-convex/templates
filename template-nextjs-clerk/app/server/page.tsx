import { auth } from "@clerk/nextjs/server";
import Home from "./inner";
import { preloadQuery, preloadedQueryResult } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function ServerPage() {
  const { getToken } = await auth();
  const token = await getToken({ template: "convex" });
  const preloaded = await preloadQuery(
    api.myFunctions.listNumbers,
    { count: 3 },
    { token: token! }
  );

  const data = preloadedQueryResult(preloaded);

  return (
    <main>
      <h2>Non-reactive Server-loaded data</h2>
      <code>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </code>
      <Home preloaded={preloaded} />
    </main>
  );
}
