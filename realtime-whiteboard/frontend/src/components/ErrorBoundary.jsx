import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("[ErrorBoundary]", error, info); }
  handleRetry = () => this.setState((s) => ({ hasError: false, error: null, retryCount: s.retryCount + 1 }));

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: 32, textAlign: "center" }}>
          <div style={{ background: "white", borderRadius: 16, padding: 40, maxWidth: 420, boxShadow: "0 8px 32px rgba(79,70,229,0.1)" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>!</div>
            <h2 style={{ color: "#ef4444", marginBottom: 8 }}>Canvas Error</h2>
            <p style={{ color: "#64748b", marginBottom: 20 }}>The whiteboard encountered an unexpected error.</p>
            {import.meta.env.DEV && (
              <details style={{ textAlign: "left", background: "#fef2f2", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12 }}>
                <summary style={{ cursor: "pointer", color: "#dc2626" }}>Error details</summary>
                <pre style={{ marginTop: 8, overflow: "auto", color: "#991b1b" }}>{this.state.error?.toString()}</pre>
              </details>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button onClick={this.handleRetry} style={{ padding: "10px 20px", background: "#4f46e5", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Retry {this.state.retryCount > 0 && "(" + this.state.retryCount + ")"}
              </button>
              <button onClick={() => window.location.reload()} style={{ padding: "10px 20px", background: "#e2e8f0", color: "#374151", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <React.Fragment key={this.state.retryCount}>{this.props.children}</React.Fragment>;
  }
}

export default ErrorBoundary;
