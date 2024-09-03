// This file is for thick component clients and helpers that run
// on the Convex backend.
declare global {
  const Convex: Record<string, unknown>;
}

if (typeof Convex === "undefined") {
  throw new Error(
    "this is Convex backend code, but it's running somewhere else!"
  );
}

export function add(a: number, b: number): number {
  if (typeof Convex === "undefined") {
    throw new Error(
      "this is Convex backend code, but it's running somewhere else!"
    );
  }
  return a + b;
}
