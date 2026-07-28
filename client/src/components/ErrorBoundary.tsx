import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-8">
          <div className="flex w-full max-w-xl flex-col items-center text-center">
            <AlertTriangle size={44} className="mb-6 shrink-0 text-gold" />
            <h1 className="font-display text-2xl font-black text-white">
              Coś poszło nie tak
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Wystąpił nieoczekiwany błąd. Odśwież stronę - jeśli problem się powtarza,
              napisz do nas: kontakt@dativedesign.com
            </p>
            <button
              onClick={() => window.location.reload()}
              className="gold-button-shimmer mt-7 inline-flex items-center gap-2 rounded-sm px-6 py-3 text-sm font-black uppercase tracking-wider text-background"
            >
              <RotateCcw size={16} />
              Odśwież stronę
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
