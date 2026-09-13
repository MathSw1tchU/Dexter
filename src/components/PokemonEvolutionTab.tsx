import React from 'react';
import { EvolutionStep } from '../types/pokemon';
import { ArrowRight, Sparkles } from 'lucide-react';
import { pokedexAudio } from '../utils/soundEffects';

interface PokemonEvolutionTabProps {
  evolutionChain: EvolutionStep | null;
  currentPokemonId: number;
  onSelectPokemon: (idOrName: string | number) => void;
  isLoading: boolean;
}

export const PokemonEvolutionTab: React.FC<PokemonEvolutionTabProps> = ({
  evolutionChain,
  currentPokemonId,
  onSelectPokemon,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="font-mono-dex text-xs text-slate-400">Rastreando linha genealógica e dados evolutivos...</p>
      </div>
    );
  }

  if (!evolutionChain) {
    return (
      <div className="p-6 text-center bg-slate-900/60 rounded-xl border border-slate-800 font-mono-dex text-xs text-slate-400">
        Nenhuma linha evolutiva registrada para este Pokémon na PokéAPI.
      </div>
    );
  }

  // Flatten or walk the evolution branches
  // Handle 1-stage (no evolutions), 2-stage, 3-stage, and branching (Eevee, Gloom, Poliwhirl, etc.)
  const renderEvolutionCard = (step: EvolutionStep, triggerText?: string) => {
    const isCurrent = step.id === currentPokemonId;

    return (
      <div key={step.id} className="flex flex-col items-center">
        {triggerText && (
          <div className="flex items-center gap-1 my-2 sm:my-0 sm:mx-2 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono-dex text-[11px] text-amber-300 font-medium shadow">
            <ArrowRight className="w-3 h-3 text-amber-400 hidden sm:inline" />
            <span>{triggerText}</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            pokedexAudio.playClick();
            onSelectPokemon(step.id);
          }}
          className={`group flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
            isCurrent
              ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] ring-1 ring-amber-400'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-800/80'
          }`}
        >
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center p-1">
            <img
              src={step.artwork || step.sprite}
              alt={step.displayName}
              className="max-w-full max-h-full object-contain drop-shadow group-hover:scale-110 transition-transform"
              loading="lazy"
            />
          </div>

          <span className="font-mono-dex text-[10px] text-slate-400">
            #{String(step.id).padStart(4, '0')}
          </span>
          <span className="font-mono-dex text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition">
            {step.displayName}
          </span>

          {isCurrent && (
            <span className="mt-1 text-[9px] font-mono-dex font-bold uppercase tracking-wider text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
              Atual
            </span>
          )}
        </button>
      </div>
    );
  };

  // Check if no evolution exists
  const hasEvolutions = evolutionChain.evolvesTo && evolutionChain.evolvesTo.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-mono-dex text-xs text-slate-400 pb-1 border-b border-slate-800">
        <span className="flex items-center gap-1 text-amber-400 font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Cadeia Evolutiva Dinâmica
        </span>
        <span>Clique em um estágio para inspecionar</span>
      </div>

      {!hasEvolutions ? (
        <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <div className="w-24 h-24 mx-auto flex items-center justify-center">
            <img
              src={evolutionChain.artwork}
              alt={evolutionChain.displayName}
              className="max-w-full max-h-full object-contain drop-shadow"
            />
          </div>
          <div className="font-mono-dex text-sm font-bold text-white">
            {evolutionChain.displayName} #{String(evolutionChain.id).padStart(4, '0')}
          </div>
          <p className="font-mono-dex text-xs text-slate-400 max-w-sm mx-auto">
            Este Pokémon não possui evoluções conhecidas nem estágios prévios.
          </p>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 overflow-x-auto">
          {/* Main Stage 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 min-w-max mx-auto py-2">
            {renderEvolutionCard(evolutionChain)}

            {/* Branching Stage 2 */}
            <div className="flex flex-col gap-3">
              {evolutionChain.evolvesTo.map((stage2) => (
                <div key={stage2.id} className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                  {renderEvolutionCard(stage2, stage2.trigger?.details || 'Evolução')}

                  {/* Stage 3 if present */}
                  {stage2.evolvesTo && stage2.evolvesTo.length > 0 && (
                    <div className="flex flex-col gap-3">
                      {stage2.evolvesTo.map((stage3) => (
                        <React.Fragment key={stage3.id}>
                          {renderEvolutionCard(stage3, stage3.trigger?.details || 'Evolução')}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
