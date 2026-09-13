import React, { useState, useEffect } from 'react';
import { PokemonSummary, PokemonType } from '../types/pokemon';
import { getPokemonList } from '../services/pokeApi';
import { getTypeMeta } from '../utils/typeColors';
import { pokedexAudio } from '../utils/soundEffects';
import { X, Search, Filter, Layers } from 'lucide-react';

interface PokemonListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (id: number) => void;
  currentPokemonId: number;
}

const GENERATIONS = [
  { label: 'Todos', offset: 0, limit: 151 },
  { label: 'Gen 1 (Kanto #1-151)', offset: 0, limit: 151 },
  { label: 'Gen 2 (Johto #152-251)', offset: 151, limit: 100 },
  { label: 'Gen 3 (Hoenn #252-386)', offset: 251, limit: 135 },
  { label: 'Gen 4 (Sinnoh #387-493)', offset: 386, limit: 107 },
  { label: 'Gen 5 (Unova #494-649)', offset: 493, limit: 156 },
  { label: 'Gen 6 (Kalos #650-721)', offset: 649, limit: 72 },
  { label: 'Gen 7 (Alola #722-809)', offset: 721, limit: 88 },
  { label: 'Gen 8 (Galar #810-905)', offset: 809, limit: 96 },
  { label: 'Gen 9 (Paldea #906-1025)', offset: 905, limit: 120 },
];

export const PokemonListDrawer: React.FC<PokemonListDrawerProps> = ({
  isOpen,
  onClose,
  onSelectPokemon,
  currentPokemonId,
}) => {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGenIndex, setSelectedGenIndex] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen && pokemonList.length === 0) {
      loadGen(selectedGenIndex);
    }
  }, [isOpen]);

  const loadGen = async (genIdx: number) => {
    setIsLoading(true);
    setSelectedGenIndex(genIdx);
    const gen = GENERATIONS[genIdx];
    try {
      const list = await getPokemonList(gen.limit, gen.offset);
      setPokemonList(list);
    } catch (err) {
      console.error('Erro ao carregar lista de pokémon:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = pokemonList.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return p.name.toLowerCase().includes(q) || String(p.id).includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border-l-4 border-red-700 h-full shadow-2xl flex flex-col">
        
        {/* Drawer Header */}
        <div className="p-4 bg-red-700 border-b-2 border-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Layers className="w-5 h-5" />
            <h3 className="font-mono-dex text-base font-bold tracking-wider">
              REGISTRO GERAL DA POKÉDEX
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-red-800 hover:bg-red-900 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou número..."
              className="w-full bg-slate-900 text-xs font-mono-dex text-white placeholder-slate-500 rounded-lg pl-8 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Generation Select */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedGenIndex}
              onChange={(e) => {
                pokedexAudio.playClick();
                loadGen(Number(e.target.value));
              }}
              className="w-full bg-slate-900 text-xs font-mono-dex text-slate-200 rounded-lg px-2 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-400"
            >
              {GENERATIONS.slice(1).map((g, idx) => (
                <option key={g.label} value={idx + 1}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pokemon Grid List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {isLoading ? (
            <div className="py-12 text-center space-y-2 font-mono-dex text-xs text-slate-400">
              <div className="w-7 h-7 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <span>Carregando dados da geração...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((p) => {
              const isCurrent = p.id === currentPokemonId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    pokedexAudio.playClick();
                    onSelectPokemon(p.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex items-center justify-center p-1 bg-slate-900 rounded-lg border border-slate-800">
                      <img
                        src={p.artwork || p.sprite}
                        alt={p.displayName}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <div className="text-left font-mono-dex">
                      <div className="text-xs font-bold text-white">
                        {p.displayName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        #{String(p.id).padStart(4, '0')}
                      </div>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-mono-dex font-bold uppercase text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      Atual
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-12 text-center font-mono-dex text-xs text-slate-500">
              Nenhum Pokémon encontrado.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 font-mono-dex text-[11px] text-slate-500 text-center">
          {filtered.length} Pokémon exibidos
        </div>

      </div>
    </div>
  );
};
