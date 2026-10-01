import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '../../components/ui/button';
import { LayoutDashboard } from 'lucide-react';

export function RegisterView() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@correounivalle.edu.co')) {
      setError('Solo se permiten correos institucionales @correounivalle.edu.co');
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        setError(data.error || 'Error al registrar la cuenta');
        return;
      }

      localStorage.setItem('token', data.access);
      if (data.user) {
        localStorage.setItem('user_name', data.user.first_name || '');
      }
      navigate('/hoy');
    } catch (err) {
      setError('Error de conexión con el servidor');
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
        setError(data.error || 'Error al iniciar sesión con Google');
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
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-outfit font-bold text-white mb-2">Crea tu cuenta</h1>
          <p className="text-slate-400">Exclusivo para la comunidad @correounivalle.edu.co</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl flex flex-col">
          
          {error && (
            <div className="mb-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo</label>
              <input 
                type="text" 
                placeholder="Juan Pérez"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo institucional</label>
              <input 
                type="email" 
                placeholder="tu@correounivalle.edu.co"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all"
                required
              />
            </div>
            
            <Button type="submit" className="w-full py-6 mt-4 text-base font-medium rounded-xl bg-white text-black hover:bg-slate-200 shadow-lg transition-all">
              Registrarme ahora
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
              onError={() => setError('El registro con Google falló.')}
              theme="filled_black"
              size="large"
              shape="pill"
              text="signup_with"
            />
          </div>
          
          <div className="mt-8 text-center text-sm text-slate-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-white hover:text-slate-200 transition-colors font-medium">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
