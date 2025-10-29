import { useCallback, useMemo } from 'react';
import { ConvexProviderWithAuth, ConvexReactClient } from 'convex/react';
import { AuthKitProvider, useAccessToken, useAuth } from '@workos/authkit-tanstack-react-start/client';
import type { ReactNode } from 'react';

const client = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={client} useAuth={useAuthFromWorkOS}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

function useAuthFromWorkOS() {
  const { loading, user } = useAuth();
  const { accessToken, getAccessToken } = useAccessToken();

  const fetchAccessToken = useCallback(
    async ({ forceRefreshToken }: { forceRefreshToken: boolean }) => {
      if (!accessToken || forceRefreshToken) {
        return (await getAccessToken()) ?? null;
      }

      return accessToken;
    },
    [accessToken, getAccessToken],
  );

  return useMemo(
    () => ({
      isLoading: loading,
      isAuthenticated: !!user,
      fetchAccessToken,
    }),
    [loading, user, fetchAccessToken],
  );
}
