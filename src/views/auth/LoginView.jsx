import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { LayoutDashboard } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
export function LoginView() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTraditionalLogin = async (e) => {
    e.preventDefault();
    
    if (!email.endsWith('@correounivalle.edu.co')) {
      setError('Solo se puede iniciar sesión con una cuenta @correounivalle.edu.co');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError('Correo o contraseña incorrectos');
        return;
      }

      localStorage.setItem('token', data.access);
      if (data.user) {
        localStorage.setItem('user_name', data.user.first_name || '');
      }
      navigate('/hoy');
    } catch (err) {
      setError('Error de red al conectar con el servidor');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      localStorage.setItem('token', data.access);
      if (data.user) {
        localStorage.setItem('user_name', data.user.first_name || '');
        if (data.user.picture) {
          localStorage.setItem('user_picture', data.user.picture);
        }
      }
      navigate('/hoy');
    } catch (err) {
      setError('Error de red al conectar con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Bienvenido de nuevo</h1>
          <p className="text-slate-400">Ingresa a tu cuenta o regístrate</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col">
          
          {error && (
            <div className="mb-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleTraditionalLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo institucional</label>
              <input 
                type="email" 
                placeholder="tu@correounivalle.edu.co"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                required
              />
            </div>
            
            <Button type="submit" className="w-full py-6 mt-4 text-base font-medium rounded-xl bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all">
              Iniciar sesión
            </Button>
          </form>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">o también</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <div className="flex justify-center w-full mt-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('El inicio de sesión falló.')}
              theme="filled_black"
              size="large"
              shape="pill"
              text="continue_with"
            />
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            ¿No tienes una cuenta?{' '}
            <Link to="/registro" className="text-primary hover:text-white transition-colors font-medium">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
