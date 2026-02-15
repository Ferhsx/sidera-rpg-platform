import React, { ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-void flex items-center justify-center p-4 text-stone-300">
                    <div className="max-w-md w-full bg-ash/50 border border-red-900/50 p-6 rounded-lg backdrop-blur-sm text-center">
                        <div className="flex justify-center mb-4">
                            <AlertTriangle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-xl font-serif text-red-400 mb-2">Erro Crítico no Sidera</h1>
                        <p className="text-stone-500 mb-6 text-sm">
                            A realidade instável causou um colapso na interface.
                            <br />
                            {this.state.error?.message}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 w-full py-2 bg-red-900/20 hover:bg-red-900/40 border border-red-900/50 rounded transition-colors text-red-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Recarregar Aplicação
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
