import { Component } from "react";

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    componentDidCatch(error, info) {
        console.error("ErrorBoundary", error, info);
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center bg-background">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-text-base mb-2">
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