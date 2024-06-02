"use client";

import { AfterSSR } from "@/components/helpers/AfterSSR";
import { SessionProvider } from "@convex-dev/convex-lucia-auth/react";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <AfterSSR>
      <ConvexProvider client={convex}>
        <SessionProvider>{children}</SessionProvider>
      </ConvexProvider>
    </AfterSSR>
  );
}
