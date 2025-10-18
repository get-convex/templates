import { Component, ReactNode } from 'react';

// NOTE: Once you get WorkOS working you can simplify this error boundary
// or remove it entirely.
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: ReactNode | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: unknown) {
    const errorText = '' + (error as any).toString();
    if (errorText.includes('@workos-inc/authkit-react') && errorText.includes('clientId')) {
      return {
        error: (
          <>
            <p>
              Add the following environment variables to your <code>.env.local</code> file:
            </p>
            <ul className="pl-4 list-disc">
              <li>
                <code>VITE_WORKOS_CLIENT_ID="your-client-id"</code>
              </li>
              <li>
                <code>VITE_WORKOS_API_HOSTNAME="api.workos.com"</code>
              </li>
              <li>
                <code>VITE_WORKOS_REDIRECT_URI="your-redirect-uri"</code>
              </li>
            </ul>
            <p>
              You can find these values in your WorkOS dashboard at{' '}
              <a className="underline hover:no-underline" href="https://dashboard.workos.com" target="_blank">
                https://dashboard.workos.com
              </a>
            </p>
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
          <h1 className="text-xl font-bold">Caught an error while rendering:</h1>
          {this.state.error}
        </div>
      );
    }

    return this.props.children;
  }
}
