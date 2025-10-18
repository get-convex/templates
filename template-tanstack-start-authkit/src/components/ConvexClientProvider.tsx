import { ReactNode, useCallback, useState, useEffect } from 'react';
import { ConvexReactClient, ConvexProvider } from 'convex/react';
import { ConvexProviderWithAuth } from 'convex/react';
import { useAuth, useAccessToken, AuthKitProvider } from '@workos/authkit-tanstack-react-start/client';

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [convex] = useState(() => {
    return new ConvexReactClient(import.meta.env.VITE_CONVEX_URL!);
  });

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
  }

  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromAuthKit}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromAuthKit() {
  const { user, loading: isLoading } = useAuth();
  const { getAccessToken, refresh } = useAccessToken();

  const isAuthenticated = !!user;

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken?: boolean } = {}): Promise<string | null> => {
      if (!user) {
        return null;
      }

      try {
        if (forceRefreshToken) {
          return (await refresh()) ?? null;
        }

        return (await getAccessToken()) ?? null;
      } catch (error) {
        console.error('Failed to get access token:', error);
        return null;
      }
    },
    [user, refresh, getAccessToken],
  );

  return {
    isLoading,
    isAuthenticated,
    fetchAccessToken,
  };
}
