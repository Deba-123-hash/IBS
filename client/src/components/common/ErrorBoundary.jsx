import React from 'react';
import { AlertTriangle, RotateCcw, Home, LifeBuoy } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('CAMPUS OS ErrorBoundary caught an unexpected runtime error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetError: this.handleReset
        });
      }

      return (
        <div className="min-h-[360px] flex items-center justify-center p-6 bg-slate-50/80 rounded-3xl border border-slate-200/80 m-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-soft text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                {this.props.title || 'Module Display Interrupted'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {this.props.message ||
                  'An unexpected runtime condition occurred in this campus module. Core session data remains secure.'}
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-[11px] font-mono text-slate-700 max-h-24 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry Module</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                <Home className="h-3.5 w-3.5" />
                <span>Campus Home</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 flex items-center justify-center gap-1">
              <LifeBuoy className="h-3.5 w-3.5 text-slate-400" />
              <span>Diagnostic telemetry recorded for CAMPUS OS Helpdesk</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
