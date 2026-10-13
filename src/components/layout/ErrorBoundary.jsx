import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '../ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/hoy';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-5 text-red-400">
              <AlertCircle className="w-7 h-7" />
            </div>
            
            <h2 className="text-2xl font-outfit font-bold text-white mb-2">
              Algo no salió como esperábamos
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Ocurrió un error inesperado al procesar esta vista. Tus datos y gestiones están a salvo en el servidor.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={this.handleReset}
                className="flex-1 rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(var(--primary),0.3)]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
              <Button 
                variant="outline" 
                onClick={this.handleGoHome}
                className="flex-1 rounded-xl border-white/10 text-slate-300 hover:text-white bg-white/5"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir a Hoy
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
