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
  onQuickBackup: () => void;
  onOpenSyncTab: () => void;
  onOpenSettings: () => void;
  isSyncing?: boolean;
  lastSyncTime?: string;
  onTriggerSync?: () => void;
  onPullFromCloud?: () => void;
}

export default function TopHeader({
  user,
  theme,
  onToggleTheme,
  onLogout,
  onQuickBackup,
  onOpenSyncTab,
  onOpenSettings,
  isSyncing = false,
  lastSyncTime,
  onTriggerSync,
  onPullFromCloud,
}: TopHeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="w-full bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 text-white border-b border-purple-800/40 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 shrink-0 shadow-lg relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        
        {/* Esquerda: Logo + Título e Subtítulo */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-200 shadow-inner backdrop-blur-md shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base lg:text-lg font-black tracking-tight text-white leading-tight">
                  Gestor Financeiro
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-purple-500/25 border border-purple-400/30 text-purple-200 uppercase tracking-wider flex items-center gap-1">
                  <Smartphone className="w-2.5 h-2.5 text-emerald-300" />
                  <span>PC ⇄ Celular</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-purple-200/70 font-medium hidden sm:block">
                Controle de pagamentos, cobranças e sincronização em nuvem Vercel
              </p>
            </div>
          </div>

          {/* Versão mobile: Ações Rápidas de Topo */}
          <div className="flex items-center gap-1.5 md:hidden">
            {onPullFromCloud && (
              <button
                type="button"
                id="mobile-pull-cloud-header-btn"
                onClick={onPullFromCloud}
                disabled={isSyncing}
                className="p-2 rounded-lg bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 active:scale-95 transition-transform"
                title="Puxar dados mais recentes da Nuvem Vercel"
              >
                <ArrowDownToLine className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
              </button>
            )}
            {onTriggerSync && (
              <button
                type="button"
                id="mobile-push-cloud-header-btn"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="p-2 rounded-lg bg-purple-500/25 text-purple-200 border border-purple-400/30 active:scale-95 transition-transform"
                title="Enviar e salvar na Nuvem Vercel"
              >
                <ArrowUpFromLine className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg bg-white/10 text-purple-200 active:scale-95 transition-transform"
              title="Alternar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg bg-rose-500/20 text-rose-200 active:scale-95 transition-transform"
              title="Sair do sistema"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Direita: Ações Rápidas, Status de Nuvem, Tema e Perfil */}
        <div className="hidden md:flex items-center flex-wrap justify-end gap-2 w-full md:w-auto">
          
          {/* Botão 1: Puxar da Nuvem Vercel (Carrega o que foi feito no outro computador / celular) */}
          {onPullFromCloud && (
            <button
              type="button"
              id="header-pull-cloud-btn"
              onClick={onPullFromCloud}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-xs font-bold text-emerald-200 hover:text-emerald-100 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Puxar dados salvos na nuvem da Vercel (ideal para quando você abre o sistema em outro computador ou celular)"
            >
              <ArrowDownToLine className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-bounce' : ''}`} />
              <span>Puxar da Nuvem</span>
            </button>
          )}

          {/* Botão 2: Enviar para Nuvem Vercel (Salva e sincroniza agora) */}
          {onTriggerSync && (
            <button
              type="button"
              id="header-push-cloud-btn"
              onClick={onTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/90 hover:bg-purple-500 border border-purple-400/50 text-xs font-bold text-white transition-all cursor-pointer shadow-sm active:scale-95"
              title="Enviar dados atuais para a Nuvem da Vercel para estarem disponíveis em outros aparelhos"
            >
              <ArrowUpFromLine className={`w-3.5 h-3.5 text-purple-200 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Enviar p/ Nuvem</span>
            </button>
          )}

          {/* Botão Central de Nuvem Vercel (Abre a aba completa) */}
          <button
            type="button"
            id="cloud-status-header-btn"
            onClick={onOpenSyncTab}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-900/50 border border-purple-500/30 hover:border-purple-400 text-xs font-semibold text-purple-100 hover:bg-purple-800/70 transition-all cursor-pointer shadow-sm group"
            title="Abrir Central de Sincronização e Gerenciamento JSON"
          >
            <Cloud className="w-3.5 h-3.5 text-purple-300" />
            <span className="text-[11px] font-bold text-emerald-300">
              {isSyncing ? 'Sincronizando...' : 'Nuvem Vercel'}
            </span>
          </button>

          {/* Botão Baixar Backup (.JSON) */}
          <button
            type="button"
            id="quick-backup-btn"
            onClick={onQuickBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
            title="Fazer download imediato do backup JSON para este computador"
          >
            <Download className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden lg:inline">Baixar</span> .JSON
          </button>

          {/* Botão Alternar Tema */}
          <button
            type="button"
            id="theme-toggle-header-btn"
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-purple-200 hover:text-white transition-colors cursor-pointer"
            title={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Perfil do Usuário & Logout */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-header-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
            >
              <div className={`w-6 h-6 rounded-full ${user.avatarColor || 'bg-indigo-600'} text-white flex items-center justify-center text-[11px] font-black shadow-xs`}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[100px] truncate">{user.name}</span>
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
                    onOpenSyncTab();
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Cloud className="w-3.5 h-3.5 text-purple-400" />
                  Sincronização & Vercel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-left px-3 py-2 text-xs rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Configurações do Sistema
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
