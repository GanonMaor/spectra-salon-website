import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep this as console.error so we can see it in DevTools even if UI is blank.
    console.error("[ErrorBoundary] Uncaught render error:", error);
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="text-sm uppercase tracking-[0.2em] text-white/60">
            Something went wrong
          </div>
          <h1 className="mt-2 text-xl font-semibold">App crashed while rendering</h1>
          <p className="mt-2 text-white/70 text-sm">
            Open DevTools Console for full details. You can also try reloading the page.
          </p>
          {this.state.error?.message && (
            <pre className="mt-4 whitespace-pre-wrap rounded-xl bg-black/40 border border-white/10 p-4 text-xs text-white/80">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-5 flex gap-2">
            <button
              type="button"
              className="rounded-xl px-4 py-2 bg-white text-black text-sm font-medium hover:bg-white/90 transition"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              type="button"
              className="rounded-xl px-4 py-2 border border-white/15 text-white/90 text-sm hover:bg-white/10 transition"
              onClick={() => this.setState({ hasError: false, error: undefined })}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }
}


