import { Component, type ErrorInfo, type ReactNode } from "react";
import { reportLovableError } from "@/lib/lovable-error-reporting";

type Props = {
  children: ReactNode;
  /** Nome da área (usado no diagnóstico). */
  area?: string;
  /** Mensagem amigável exibida ao usuário. */
  message?: string;
  /** Renderização alternativa completa (opcional). */
  fallback?: (reset: () => void, error: Error) => ReactNode;
};

type State = { error: Error | null };

/**
 * Impede que a exceção de um componente derrube o aplicativo inteiro.
 * Mostra uma mensagem amigável com botões "Tentar novamente" e "Ir para o início".
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.area ?? "app"}]`, error, info?.componentStack);
    reportLovableError(error, {
      boundary: "react_error_boundary",
      area: this.props.area ?? "app",
    });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset, error);

    return (
      <div className="flex min-h-[240px] w-full items-center justify-center px-4 py-10">
        <div className="max-w-md text-center">
          <h2 className="font-display text-xl font-black text-foreground">
            {this.props.message ?? "Não foi possível carregar esta parte do site."}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tente novamente em alguns instantes. O restante do site continua funcionando.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              Tentar novamente
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
            >
              Ir para o início
            </a>
          </div>
        </div>
      </div>
    );
  }
}

/** Boundary de página inteira (usado na raiz do aplicativo). */
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      area="app"
      fallback={(reset, error) => (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="max-w-md text-center">
            <h1 className="font-display text-2xl font-black text-foreground">
              Algo não carregou como esperado
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Já registramos o problema. Você pode tentar novamente ou voltar para o início.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  reset();
                  if (typeof window !== "undefined") window.location.reload();
                }}
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground transition hover:brightness-110"
              >
                Tentar novamente
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Ir para o início
              </a>
            </div>
            {import.meta.env.DEV && (
              <pre className="mt-6 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-[11px] text-muted-foreground">
                {error.message}
              </pre>
            )}
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
