import React, { useState } from 'react';
import { 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Cloud, 
  Database,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserAuth } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserAuth) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [selectedProfile, setSelectedProfile] = useState<'rodrigo' | 'aryadner' | 'custom'>('rodrigo');
  const [email, setEmail] = useState('rodrigobento1979@gmail.com');
  const [name, setName] = useState('Rodrigo Bento');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectProfile = (profile: 'rodrigo' | 'aryadner' | 'custom') => {
    setSelectedProfile(profile);
    setErrorMsg('');
    if (profile === 'rodrigo') {
      setEmail('rodrigobento1979@gmail.com');
      setName('Rodrigo Bento');
      setPassword('123456');
    } else if (profile === 'aryadner') {
      setEmail('aryadner@gestaofinanceira.com');
      setName('Aryadner');
      setPassword('123456');
    } else {
      setEmail('');
      setName('');
      setPassword('');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Informe o seu e-mail ou usuário.');
      return;
    }

    if (!password.trim()) {
      setErrorMsg('Informe a sua senha de acesso.');
      return;
    }

    // Validação de senha
    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const userObj: UserAuth = {
        id: `user-${Date.now()}`,
        name: name.trim() || (email.split('@')[0] || 'Usuário'),
        email: email.trim(),
        role: selectedProfile === 'aryadner' ? 'operador' : 'admin',
        avatarColor: selectedProfile === 'aryadner' ? 'bg-pink-500' : 'bg-indigo-600',
      };

      if (rememberMe) {
        localStorage.setItem('contr_clientes_auth_user', JSON.stringify(userObj));
        localStorage.setItem('contr_clientes_is_authenticated', 'true');
      } else {
        sessionStorage.setItem('contr_clientes_auth_user', JSON.stringify(userObj));
        sessionStorage.setItem('contr_clientes_is_authenticated', 'true');
      }

      onLoginSuccess(userObj);
    }, 450);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background Decorativo com estética Roxo Executivo & Indigo */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Card Principal Compacto */}
      <div className="w-full max-w-sm relative z-10 animate-fade-in my-auto">
        
        {/* Top Header Card com Roxo Profundo da Identidade Visual */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 border border-purple-500/30 rounded-t-2xl p-4 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-15 pointer-events-none">
            <Cloud className="w-20 h-20 text-white" />
          </div>

          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 border border-white/20 text-white shadow-inner mb-2 backdrop-blur-md">
            <ShieldCheck className="w-6 h-6 text-purple-200" />
          </div>

          <h1 className="text-lg font-black tracking-tight text-white">
            Gestão Financeira & Clientes
          </h1>
          <p className="text-[11px] text-purple-200/80 mt-0.5 font-medium">
            Controle de Mensalidades & Despesas
          </p>
        </div>

        {/* Corpo do Formulário Compacto */}
        <div className="bg-slate-900/95 border-x border-b border-slate-800 rounded-b-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl">
          
          {/* Seletor Rápido de Perfil */}
          <div className="mb-3.5">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 select-none">
              Acesso Rápido de Usuário:
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                id="profile-rodrigo-btn"
                onClick={() => handleSelectProfile('rodrigo')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  selectedProfile === 'rodrigo'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-1 ring-purple-500/50 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                  R
                </div>
                <span className="truncate w-full text-center text-[11px]">Rodrigo</span>
              </button>

              <button
                type="button"
                id="profile-aryadner-btn"
                onClick={() => handleSelectProfile('aryadner')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  selectedProfile === 'aryadner'
                    ? 'bg-pink-600/20 border-pink-500 text-pink-200 ring-1 ring-pink-500/50 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-[9px] font-black shadow-xs">
                  A
                </div>
                <span className="truncate w-full text-center text-[11px]">Aryadner</span>
              </button>

              <button
                type="button"
                id="profile-custom-btn"
                onClick={() => handleSelectProfile('custom')}
                className={`p-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                  selectedProfile === 'custom'
                    ? 'bg-purple-600/20 border-purple-500 text-purple-200 ring-1 ring-purple-500/50 shadow-md'
                    : 'bg-slate-800/60 border-slate-700/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[9px] font-black shadow-xs">
                  <User className="w-3 h-3" />
                </div>
                <span className="truncate w-full text-center text-[11px]">Outro</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            
            {/* Campo Nome / Identificação */}
            {selectedProfile === 'custom' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1 select-none">
                  <User className="w-3 h-3 text-purple-400" /> Seu Nome Completo
                </label>
                <input
                  id="login-name-input"
                  type="text"
                  placeholder="Ex: Administrador"
                  className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            {/* Campo E-mail / Usuário */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1 select-none">
                <User className="w-3 h-3 text-purple-400" /> E-mail ou Usuário
              </label>
              <input
                id="login-email-input"
                type="text"
                placeholder="usuario@empresa.com"
                className="w-full px-3 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Campo Senha */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1 select-none">
                  <KeyRound className="w-3 h-3 text-purple-400" /> Senha de Acesso
                </label>
                <span className="text-[10px] text-purple-300 font-medium">Padrão: 123456</span>
              </div>
              <div className="relative">
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="w-full pl-3 pr-9 py-2 bg-slate-950/70 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 font-semibold focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Checkbox Lembrar */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 text-[11px] text-slate-300 font-medium cursor-pointer select-none">
                <input
                  id="remember-me-checkbox"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span>Lembrar login</span>
              </label>

              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Cloud className="w-3 h-3 text-emerald-400" />
                Nuvem
              </span>
            </div>

            {/* Mensagem de Erro */}
            {errorMsg && (
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Botão Entrar */}
            <button
              type="submit"
              id="submit-login-btn"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-600/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed group mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Acessar Painel</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
