'use client';

import { ReactNode, useCallback, useRef, useState } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithAuth } from 'convex/react';
import { AuthKitProvider, useAuth, useAccessToken } from '@workos-inc/authkit-nextjs/components';

export function ConvexClientProvider({
  accessToken,
  children,
}: {
  accessToken: string | undefined;
  children: ReactNode;
}) {
  const [convex] = useState(() => {
    return new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  });
  return (
    <AuthKitProvider>
      <ConvexProviderWithAuth client={convex} useAuth={useOptionalAuthKitAuthFromServer(accessToken)}>
        {children}
      </ConvexProviderWithAuth>
    </AuthKitProvider>
  );
}

/**
 * A wrapper that provides a `useAuth` style hook that will use an accessToken from the server
 * until the client performs auth and stabilizes with its own token.
 *
 * If there's no `providedAccessToken`, the client will simply perform auth as it normally would.
 *
 * @param serverAccessToken optional token from the server
 * @returns a `useAuth` compatible hook
 */
function useOptionalAuthKitAuthFromServer(serverAccessToken: string | undefined) {
  const providedAccessTokenRef = useRef(serverAccessToken);
  const useWrappedAuth = () => {
    const { isLoading, isAuthenticated, fetchAccessToken } = useAuthFromAuthKit();
    // AuthKit starts in loading state.
    const isInitialLoadInProgress = useRef(isLoading);

    return {
      isLoading: isLoading,
      isAuthenticated: !!providedAccessTokenRef.current || isAuthenticated,
      fetchAccessToken: useCallback(
        ({ forceRefreshToken }: { forceRefreshToken?: boolean }) => {
          if (providedAccessTokenRef.current) {
            const serverAccessToken = providedAccessTokenRef.current;
            if (!isLoading && isInitialLoadInProgress.current) {
              // The initial load finished, stop using the providedAccessTokenRef and allow the
              // client to continue with regular auth token fetches.
              isInitialLoadInProgress.current = false;
              providedAccessTokenRef.current = undefined;
            }
            return Promise.resolve(serverAccessToken);
          }
          return fetchAccessToken({ forceRefreshToken });
        },
        [fetchAccessToken, isLoading],
      ),
    };
  };
  return useWrappedAuth;
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
