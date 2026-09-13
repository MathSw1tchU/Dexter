import React, { useState } from 'react';
import { PokemonMoveInfo } from '../types/pokemon';
import { formatPokemonName } from '../services/pokeApi';
import { Swords, Search, Flame } from 'lucide-react';

interface PokemonMovesTabProps {
  moves: PokemonMoveInfo[];
}

export const PokemonMovesTab: React.FC<PokemonMovesTabProps> = ({ moves }) => {
  const [filterQuery, setFilterQuery] = useState('');

  const filteredMoves = moves.filter((m) =>
    m.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-mono-dex text-amber-400 font-bold uppercase">
          <Swords className="w-4 h-4" />
          <span>Movimentos & Golpes ({moves.length} registrados)</span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar golpe..."
            className="w-full sm:w-48 bg-slate-900 text-xs font-mono-dex text-white placeholder-slate-500 rounded-lg pl-7 pr-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2 pointer-events-none" />
        </div>
      </div>

      {/* Moves Table / Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
        {filteredMoves.length > 0 ? (
          filteredMoves.map((m, idx) => (
            <div
              key={`${m.name}-${idx}`}
              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono-dex text-xs font-semibold text-slate-200">
                  {formatPokemonName(m.name)}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {m.level_learned_at > 0 ? (
                  <span className="text-[10px] font-mono-dex font-bold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                    Lv. {m.level_learned_at}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono-dex px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {formatPokemonName(m.learn_method)}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 p-6 text-center text-xs font-mono-dex text-slate-500">
            Nenhum movimento encontrado correspondente ao filtro.
          </div>
        )}
      </div>
    </div>
  );
};
