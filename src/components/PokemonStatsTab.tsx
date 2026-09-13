import React from 'react';
import { PokemonDetail } from '../types/pokemon';
import { formatStatName } from '../utils/typeColors';
import { Zap, Shield, Heart, Gauge, Flame, Sparkles } from 'lucide-react';

interface PokemonStatsTabProps {
  pokemon: PokemonDetail;
}

export const PokemonStatsTab: React.FC<PokemonStatsTabProps> = ({ pokemon }) => {
  // Compute appraisal based on Total Base Stats
  const getBstTier = (total: number) => {
    if (total >= 600) return { label: 'Classe Lendária / Titã (Top Tier)', color: 'text-amber-400 bg-amber-950/70 border-amber-800' };
    if (total >= 500) return { label: 'Nível Avançado / Competitivo', color: 'text-emerald-400 bg-emerald-950/70 border-emerald-800' };
    if (total >= 400) return { label: 'Potencial Intermediário Equilibrado', color: 'text-cyan-400 bg-cyan-950/70 border-cyan-800' };
    return { label: 'Estágio Inicial / Em Evolução', color: 'text-slate-300 bg-slate-800/80 border-slate-700' };
  };

  const bstTier = getBstTier(pokemon.totalStats);

  // Icon mapping for stats
  const getStatIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'hp':
        return <Heart className="w-3.5 h-3.5 text-emerald-400" />;
      case 'attack':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'defense':
        return <Shield className="w-3.5 h-3.5 text-blue-400" />;
      case 'special-attack':
        return <Zap className="w-3.5 h-3.5 text-purple-400" />;
      case 'special-defense':
        return <Sparkles className="w-3.5 h-3.5 text-teal-400" />;
      case 'speed':
        return <Gauge className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return null;
    }
  };

  // Color gradient based on base stat value
  const getBarColor = (val: number) => {
    if (val >= 130) return 'from-cyan-400 to-teal-300 shadow-[0_0_8px_rgba(45,212,191,0.7)]';
    if (val >= 90) return 'from-emerald-500 to-green-400';
    if (val >= 65) return 'from-amber-500 to-yellow-400';
    if (val >= 45) return 'from-orange-500 to-amber-500';
    return 'from-rose-600 to-red-500';
  };

  return (
    <div className="space-y-4">
      {/* Total BST Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 gap-2">
        <div>
          <div className="font-mono-dex text-xs text-slate-400 uppercase">Total de Estatísticas Base (BST)</div>
          <div className="font-mono-dex text-2xl font-bold text-white flex items-baseline gap-2">
            {pokemon.totalStats}
            <span className="text-xs text-slate-500 font-normal">/ 780 max</span>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border text-xs font-mono-dex font-semibold self-start sm:self-auto ${bstTier.color}`}>
          {bstTier.label}
        </div>
      </div>

      {/* Individual Stat Rows */}
      <div className="space-y-3 bg-slate-900/70 p-4 rounded-xl border border-slate-800">
        <div className="grid grid-cols-12 text-[11px] font-mono-dex text-slate-400 pb-1 border-b border-slate-800">
          <span className="col-span-4">ATRIBUTO</span>
          <span className="col-span-2 text-right">BASE</span>
          <span className="col-span-4 pl-3">PROGRESSÃO</span>
          <span className="col-span-2 text-right">NÍVEL 100</span>
        </div>

        {pokemon.stats.map((st) => {
          const formatted = formatStatName(st.name);
          const percent = Math.min(100, Math.round((st.base_stat / 255) * 100));

          // Min/max approx at Lv 100
          // HP formula differs from other stats
          let minVal = 0;
          let maxVal = 0;
          if (st.name.toLowerCase() === 'hp') {
            minVal = Math.floor(st.base_stat * 2 + 110);
            maxVal = Math.floor(st.base_stat * 2 + 204);
          } else {
            minVal = Math.floor((st.base_stat * 2 + 5) * 0.9);
            maxVal = Math.floor((st.base_stat * 2 + 99) * 1.1);
          }

          return (
            <div key={st.name} className="grid grid-cols-12 items-center text-xs font-mono-dex py-0.5">
              {/* Stat Name & Icon */}
              <div className="col-span-4 flex items-center gap-1.5 text-slate-200">
                {getStatIcon(st.name)}
                <span className="font-semibold">{formatted.short}</span>
                <span className="text-[10px] text-slate-400 hidden sm:inline">({formatted.labelPt})</span>
              </div>

              {/* Base Stat Value */}
              <div className="col-span-2 text-right font-bold text-white pr-2">
                {st.base_stat}
              </div>

              {/* Graphical Progress Bar */}
              <div className="col-span-4 px-2">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${getBarColor(st.base_stat)} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Range Estimate */}
              <div className="col-span-2 text-right text-[10px] text-slate-400 font-mono">
                {minVal}-{maxVal}
              </div>
            </div>
          );
        })}
      </div>

      {/* EV Yield Effort Points */}
      <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs font-mono-dex">
        <span className="text-amber-300 font-semibold">Rendimento de Esforço (EVs ao derrotar): </span>
        <span className="text-slate-300">
          {pokemon.stats
            .filter((s) => s.effort > 0)
            .map((s) => `+${s.effort} ${formatStatName(s.name).short}`)
            .join(', ') || 'Nenhum ponto de esforço registrado'}
        </span>
      </div>
    </div>
  );
};
