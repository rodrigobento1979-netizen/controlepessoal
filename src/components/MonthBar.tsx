import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface MonthBarProps {
  selectedYearMonth: string;
  onChange: (yearMonth: string) => void;
}

const MONTHS_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const MONTHS_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export default function MonthBar({ selectedYearMonth, onChange }: MonthBarProps) {
  const [yearStr, monthStr] = selectedYearMonth.split('-');
  const currentYear = parseInt(yearStr, 10);
  const currentMonthIdx = parseInt(monthStr, 10) - 1; // 0-11

  const handlePrevYear = () => {
    const prevYear = currentYear - 1;
    onChange(`${prevYear}-${monthStr}`);
  };

  const handleNextYear = () => {
    const nextYear = currentYear + 1;
    onChange(`${nextYear}-${monthStr}`);
  };

  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      onChange(`${currentYear - 1}-12`);
    } else {
      const prevM = String(currentMonthIdx).padStart(2, '0');
      onChange(`${currentYear}-${prevM}`);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      onChange(`${currentYear + 1}-01`);
    } else {
      const nextM = String(currentMonthIdx + 2).padStart(2, '0');
      onChange(`${currentYear}-${nextM}`);
    }
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newMonthStr = String(monthIndex + 1).padStart(2, '0');
    onChange(`${currentYear}-${newMonthStr}`);
  };

  return (
    <div id="month-bar-container" className="theme-card rounded-xl p-2 sm:p-2.5 mb-2.5 relative z-10 transition-all duration-300 shadow-sm">
      {/* Linha superior compacta: Mês e Ano selecionados + Controles rápidos */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b transition-colors duration-300" style={{ borderBottomColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 bg-indigo-500/10 text-indigo-500 dark:text-indigo-300 border border-indigo-500/20 rounded-md shrink-0">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-xs font-bold theme-title truncate">
              {MONTHS_NAMES[currentMonthIdx]} <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{currentYear}</span>
            </span>
          </div>
        </div>

        {/* Controles de Navegação: Navegar Mês a Mês e Seleção de Ano */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Navegação Mês a Mês */}
          <div className="flex items-center border p-0.5 rounded-lg shadow-2xs transition-all" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
            <button
              id="prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95"
              title="Mês anterior"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              id="next-month-btn"
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white transition-all text-xs font-semibold cursor-pointer active:scale-95"
              title="Próximo mês"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Seletor de Ano */}
          <div className="flex items-center border p-0.5 rounded-lg shadow-2xs transition-all" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
            <button
              id="prev-year-btn"
              type="button"
              onClick={handlePrevYear}
              className="p-1 px-1.5 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white transition-all text-[11px] font-semibold cursor-pointer active:scale-95"
              title="Ano anterior"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="font-extrabold theme-text-primary text-[11px] px-1 select-none min-w-[36px] text-center">
              {currentYear}
            </span>
            <button
              id="next-year-btn"
              type="button"
              onClick={handleNextYear}
              className="p-1 px-1.5 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white transition-all text-[11px] font-semibold cursor-pointer active:scale-95"
              title="Próximo ano"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Meses Compacto: 6 colunas no mobile (2 linhas apenas) e 12 colunas no desktop */}
      <div className="grid grid-cols-6 lg:grid-cols-12 gap-1 pt-1.5">
        {MONTHS_SHORT.map((name, idx) => {
          const isSelected = idx === currentMonthIdx;
          return (
            <button
              id={`month-btn-${idx + 1}`}
              key={name}
              type="button"
              onClick={() => handleMonthSelect(idx)}
              className={`relative py-1 px-0.5 rounded-md font-semibold text-[11px] text-center transition-all duration-150 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'theme-title font-black text-indigo-600 dark:text-indigo-300'
                  : 'theme-text-secondary hover:bg-slate-400/10 dark:hover:bg-white/5 hover:text-indigo-500 dark:hover:text-white'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMonthBg"
                  className="absolute inset-0 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-md -z-10 border border-indigo-500/40 dark:border-indigo-400/40 shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="block">{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
