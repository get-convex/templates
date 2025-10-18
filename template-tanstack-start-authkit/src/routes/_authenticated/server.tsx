import { createFileRoute } from '@tanstack/react-router';
import { api } from '../../../convex/_generated/api';
import { getAuth } from '@workos/authkit-tanstack-react-start';
import { useMutation, useQuery } from 'convex/react';
import { fetchQuery } from 'convex/nextjs';

export const Route = createFileRoute('/_authenticated/server')({
  component: ServerPage,
  loader: async () => {
    const auth = await getAuth();
    const accessToken = auth.user ? auth.accessToken : undefined;
    const convexUrl = import.meta.env.VITE_CONVEX_URL;
    if (!convexUrl) {
      throw new Error('VITE_CONVEX_URL environment variable is not set');
    }

    // Fetch data server-side
    const serverData = await fetchQuery(
      api.myFunctions.listNumbers,
      { count: 3 },
      { token: accessToken, url: convexUrl },
    );

    return { serverData };
  },
});

function ServerPage() {
  const { serverData } = Route.useLoaderData();
  // Also subscribe to real-time updates client-side
  const clientData = useQuery(api.myFunctions.listNumbers, { count: 3 });
  const addNumber = useMutation(api.myFunctions.addNumber);

  return (
    <main className="p-8 flex flex-col gap-4 mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold text-center">Convex + TanStack Start</h1>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Server-loaded data (fetched in loader)</h2>
        <code>
          <pre>{JSON.stringify(serverData, null, 2)}</pre>
        </code>
      </div>
      <div className="flex flex-col gap-4 bg-slate-200 dark:bg-slate-800 p-4 rounded-md">
        <h2 className="text-xl font-bold">Reactive client-loaded data (real-time updates)</h2>
        <code>
          <pre>{JSON.stringify(clientData, null, 2)}</pre>
        </code>
      </div>
      <button
        className="bg-foreground text-background px-4 py-2 rounded-md mx-auto"
        onClick={() => {
          void addNumber({ value: Math.floor(Math.random() * 10) });
        }}
      >
        Add a random number
      </button>
    </main>
  );
}
