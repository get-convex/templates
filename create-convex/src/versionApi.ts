import { PACKAGE_VERSION } from "./packageVersion";

const CONVEX_CLIENT = `create-convex-${PACKAGE_VERSION}`;

export async function getLatestCursorRules(): Promise<string> {
  let response: Response | null = null;

  try {
    response = await fetch(`https://version.convex.dev/v1/cursor_rules`, {
      headers: {
        "Convex-Client": CONVEX_CLIENT,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error fetching Cursor rules: ${error.message}`);
    }
    throw new Error(`Unknown error fetching Cursor rules: ${error}`);
  }

  const data = await response.text();
  if (response.status !== 200) {
    throw new Error(
      `Failed to fetch latest Cursor rules: ${response.status} ${response.statusText} / ${data}`,
    );
  }

  return data;
}
