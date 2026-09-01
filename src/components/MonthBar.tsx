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

  const handleMonthSelect = (monthIndex: number) => {
    const newMonthStr = String(monthIndex + 1).padStart(2, '0');
    onChange(`${currentYear}-${newMonthStr}`);
  };

  return (
    <div id="month-bar-container" className="theme-card rounded-xl p-3.5 mb-3.5 relative z-10 transition-all duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2.5 border-b transition-colors duration-300" style={{ borderBottomColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 dark:text-indigo-300 border border-indigo-500/20 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight theme-title">Mês de Referência</h2>
            <p className="text-[11px] theme-text-secondary">Navegue para ver pendências e recebimentos do período</p>
          </div>
        </div>

        {/* Seletor de Ano */}
        <div className="flex items-center justify-center gap-2 border p-0.5 rounded-lg self-start md:self-auto shadow-xs transition-all duration-300" style={{ backgroundColor: 'var(--pill-bg)', borderColor: 'var(--pill-border)' }}>
          <button
            id="prev-year-btn"
            onClick={handlePrevYear}
            className="p-1 px-2 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white active:scale-95 transition-all text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
            title="Ano anterior"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="font-extrabold theme-text-primary text-xs px-1 select-none min-w-[45px] text-center">
            {currentYear}
          </span>
          <button
            id="next-year-btn"
            onClick={handleNextYear}
            className="p-1 px-2 hover:bg-slate-400/10 dark:hover:bg-white/10 rounded-md theme-text-secondary hover:text-indigo-500 dark:hover:text-white active:scale-95 transition-all text-xs font-semibold flex items-center gap-0.5 cursor-pointer"
            title="Próximo ano"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid de Meses (Desktop e Mobile responsivo) */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 mt-2.5 relative z-10">
        {MONTHS_SHORT.map((name, idx) => {
          const isSelected = idx === currentMonthIdx;
          return (
            <button
              id={`month-btn-${idx + 1}`}
              key={name}
              onClick={() => handleMonthSelect(idx)}
              className={`relative py-1.5 px-1 rounded-lg font-medium text-xs text-center transition-all duration-200 cursor-pointer overflow-hidden ${
                isSelected
                  ? 'theme-title font-black'
                  : 'theme-text-secondary hover:bg-slate-400/10 dark:hover:bg-white/5 hover:text-indigo-500 dark:hover:text-white border border-transparent'
              }`}
            >
              {isSelected && (
                <motion.div
                  layoutId="activeMonthBg"
                  className="absolute inset-0 bg-indigo-500/15 dark:bg-indigo-500/25 rounded-lg -z-10 border border-indigo-500/40 dark:border-indigo-400/40 shadow-xs"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <span className="block font-bold text-xs">{name}</span>
            </button>
          );
        })}
      </div>

      {/* Indicador de Visualização Ativa */}
      <div className="mt-2 flex items-center justify-end">
        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-500/8 dark:bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/15 dark:border-indigo-500/20 shadow-xs">
          Visualizando: <span className="font-extrabold theme-title">{MONTHS_NAMES[currentMonthIdx]} de {currentYear}</span>
        </span>
      </div>
    </div>
  );
}
