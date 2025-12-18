import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log this later if you want
    // console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass" style={{ padding: 26, marginTop: 26 }}>
          <h3 style={{ marginTop: 0 }}>⚠️ Analytics had a hiccup</h3>
          <p style={{ opacity: 0.75 }}>
            Something on this page failed to render (usually a chart). Your data is safe.
          </p>
          <button
            className="glass"
            style={{ marginTop: 10, cursor: "pointer" }}
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
