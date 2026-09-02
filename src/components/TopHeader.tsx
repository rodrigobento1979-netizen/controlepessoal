import React, { useState } from 'react';
import { 
  Cloud, 
  Download, 
  Upload,
  RefreshCw, 
  Sun, 
  Moon, 
  LogOut, 
  User, 
  ShieldCheck, 
  FileSpreadsheet,
  Settings,
  HelpCircle,
  CheckCircle2,
  Database,
  Smartphone,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';
import { UserAuth } from '../types';

interface TopHeaderProps {
  user: UserAuth;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenSyncTab?: () => void;
}

export default function TopHeader({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onOpenSettings,
  onOpenSyncTab,
}: TopHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white border-b border-purple-800/40 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 shrink-0 shadow-lg relative z-30">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Esquerda: Logo + Título e Subtítulo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 shadow-inner backdrop-blur-md shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white leading-tight">
                Gestor Financeiro
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-500/25 border border-emerald-400/30 text-emerald-200 uppercase tracking-wider items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Banco Cloud Ativo</span>
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-purple-200/70 font-medium hidden md:block">
              Controle de mensalidades, cobranças e despesas
            </p>
          </div>
        </div>

        {/* Direita: Botão Configurações, Alternador de Tema e Perfil */}
        <div className="flex items-center gap-2">
          
          {/* Botão Configurações (Abre o modal de configurações com Restauração JSON / Banco) */}
          <button
            type="button"
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
            title="Abrir Configurações e Restauração de Banco de Dados"
          >
            <Settings className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Configurações</span>
          </button>

          {/* Botão Alternar Tema */}
          <button
            type="button"
            id="theme-toggle-header-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-purple-200 hover:text-white transition-colors cursor-pointer active:scale-95"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-200" />}
          </button>

          {/* Perfil do Usuário & Dropdown */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-header-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer active:scale-95"
            >
              <div className={`w-6 h-6 rounded-full ${user.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center text-[11px] font-black shadow-xs`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] sm:max-w-[110px] truncate hidden xs:inline">{user.name}</span>
            </button>

            {/* Menu Dropdown de Usuário */}
            {showUserMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-slate-200 animate-fade-in"
                onMouseLeave={() => setShowUserMenu(false)}
              >
                <div className="px-3 py-2 border-b border-slate-800 mb-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-extrabold rounded-md uppercase">
                    {user.role === 'admin' ? 'Administrador' : 'Operador'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-400" />
                  Configurações & Banco de Dados
                </button>

                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 flex items-center gap-2 cursor-pointer transition-colors font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Encerrar Sessão (Sair)
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
