import { Component, ReactNode } from "react";

// NOTE: Once you get Clerk working you can simplify this error boundary
// or remove it entirely.
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: ReactNode | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    const errorText = "" + (error as any).toString();
    if (
      errorText.includes("@clerk/clerk-react") &&
      errorText.includes("publishableKey")
    ) {
      const [clerkDashboardUrl] = errorText.match(/https:\S+/) ?? [];
      const trimmedClerkDashboardUrl = clerkDashboardUrl?.endsWith(".")
        ? clerkDashboardUrl.slice(0, -1)
        : clerkDashboardUrl;
      return {
        error: (
          <>
            <p>
              Add{" "}
              <code>
                VITE_CLERK_PUBLISHABLE_KEY="{"<"}your publishable key{">"}"
              </code>{" "}
              to the <code>.env.local</code> file
            </p>
            {clerkDashboardUrl ? (
              <p>
                You can find it at{" "}
                <a
                  className="underline hover:no-underline"
                  href={trimmedClerkDashboardUrl}
                  target="_blank"
                >
                  {trimmedClerkDashboardUrl}
                </a>
              </p>
            ) : null}
            <p className="pl-8 text-sm font-mono">Raw error: {errorText}</p>
          </>
        ),
      };
    }

    return { error: <p>{errorText}</p> };
  }

  componentDidCatch() {}

  render() {
    if (this.state.error !== null) {
      return (
        <div className="bg-red-500/20 border border-red-500/50 p-8 flex flex-col gap-4 container mx-auto">
          <h1 className="text-xl font-bold">
            Caught an error while rendering:
          </h1>
          {this.state.error}
        </div>
      );
    }

    return this.props.children;
  }
}
