import React from 'react';
import { PokemonType } from '../types/pokemon';
import { calculateDefensiveMatchups } from '../utils/typeMatchups';
import { getTypeMeta } from '../utils/typeColors';
import { ShieldAlert, ShieldCheck, Shield, Ban } from 'lucide-react';

interface PokemonMatchupsTabProps {
  types: PokemonType[];
}

export const PokemonMatchupsTab: React.FC<PokemonMatchupsTabProps> = ({ types }) => {
  const matchups = calculateDefensiveMatchups(types);

  const renderTypeBadges = (list: PokemonType[], multiplierLabel: string, badgeBg: string) => {
    if (list.length === 0) {
      return <span className="text-xs text-slate-500 font-mono-dex italic">Nenhum tipo nesta categoria</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {list.map((t) => {
          const meta = getTypeMeta(t);
          return (
            <div
              key={t}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono-dex font-bold border shadow ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
            >
              <span>{meta.namePt}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${badgeBg}`}>
                {multiplierLabel}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono-dex text-slate-300 flex items-center gap-2">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span>
          Cálculo defensivo de eficácia de dano baseado na combinação de tipos:
          <span className="font-bold text-white ml-1">
            {types.map((t) => getTypeMeta(t).namePt).join(' / ')}
          </span>
        </span>
      </div>

      {/* 4x Super Weaknesses */}
      {matchups.superWeak.length > 0 && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/80 space-y-2">
          <div className="flex items-center gap-1.5 font-mono-dex text-xs font-bold text-red-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Vulnerabilidade Crítica (Dano Quádruplo - 4x)</span>
          </div>
          {renderTypeBadges(matchups.superWeak, '4x', 'bg-black/60 text-red-300')}
        </div>
      )}

      {/* 2x Weaknesses */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 font-mono-dex text-xs font-bold text-orange-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-orange-400" />
          <span>Fraquezas (Dano Dobrado - 2x)</span>
        </div>
        {renderTypeBadges(matchups.weak, '2x', 'bg-black/50 text-orange-300')}
      </div>

      {/* 0.5x Resistances */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
        <div className="flex items-center gap-1.5 font-mono-dex text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Resistências (Metade do Dano - ½x)</span>
        </div>
        {renderTypeBadges(matchups.resistant, '½x', 'bg-black/50 text-emerald-300')}
      </div>

      {/* 0.25x Super Resistances */}
      {matchups.superResistant.length > 0 && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/80 space-y-2">
          <div className="flex items-center gap-1.5 font-mono-dex text-xs font-bold text-emerald-300 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Super Resistências (Quarto de Dano - ¼x)</span>
          </div>
          {renderTypeBadges(matchups.superResistant, '¼x', 'bg-black/60 text-emerald-200')}
        </div>
      )}

      {/* 0x Immunities */}
      {matchups.immune.length > 0 && (
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/80 space-y-2">
          <div className="flex items-center gap-1.5 font-mono-dex text-xs font-bold text-indigo-300 uppercase tracking-wider">
            <Ban className="w-4 h-4 text-indigo-400" />
            <span>Imunidades Totais (Sem Dano - 0x)</span>
          </div>
          {renderTypeBadges(matchups.immune, '0x', 'bg-black/60 text-indigo-200')}
        </div>
      )}
    </div>
  );
};
