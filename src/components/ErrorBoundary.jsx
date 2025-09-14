// src/components/ErrorBoundary.jsx
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  } // show fallback on error [12][13]
  componentDidCatch(error, info) {
    console.error("ErrorBoundary", error, info);
  } // log [14]
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h1>
            <button
              onClick={() => location.reload()}
              className="bg-primary text-white px-4 py-2 rounded-md"
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
