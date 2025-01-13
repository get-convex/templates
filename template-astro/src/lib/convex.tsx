import { CONVEX_URL } from "astro:env/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useState, type FunctionComponent, type JSX } from "react";

// Astro context providers don't work when used in .astro files.
// See this and other related issues: https://github.com/withastro/astro/issues/2016#issuecomment-981833594
//
// This exists to conveniently wrap any component that uses Convex.
export function withConvexProvider<Props extends JSX.IntrinsicAttributes>(
  Component: FunctionComponent<Props>,
) {
  return function WithConvexProvider(props: Props) {
    const [client] = useState(() => new ConvexReactClient(CONVEX_URL));
    return (
      <ConvexProvider client={client}>
        <Component {...props} />
      </ConvexProvider>
    );
  };
}
