import React from 'react';
import { PokemonDetail, PokemonSpeciesInfo } from '../types/pokemon';
import { formatPokemonName } from '../services/pokeApi';
import { BookOpen, Ruler, Weight, Compass, Heart, Shield, Egg } from 'lucide-react';

interface PokemonAboutTabProps {
  pokemon: PokemonDetail;
  species: PokemonSpeciesInfo | null;
}

export const PokemonAboutTab: React.FC<PokemonAboutTabProps> = ({ pokemon, species }) => {
  // Conversions
  const heightFeet = (pokemon.height * 3.28084).toFixed(1);
  const weightLbs = (pokemon.weight * 2.20462).toFixed(1);

  // Catch Rate percentage calculation approx
  const captureDifficulty = (rate: number) => {
    const chance = ((rate / 255) * 100).toFixed(0);
    if (rate >= 200) return { label: 'Muito Fácil', color: 'text-emerald-400', chance: `${chance}%` };
    if (rate >= 120) return { label: 'Comum', color: 'text-green-400', chance: `${chance}%` };
    if (rate >= 45) return { label: 'Desafiador', color: 'text-amber-400', chance: `${chance}%` };
    return { label: 'Muito Raro / Extremo', color: 'text-rose-400', chance: `${chance}%` };
  };

  const catchInfo = species ? captureDifficulty(species.captureRate) : null;

  return (
    <div className="space-y-4">
      {/* Pokédex Entry Lore Card */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-dex text-amber-400 font-bold uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Registro da Pokédex</span>
          {species?.generation && (
            <span className="text-[10px] text-slate-400 ml-auto bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {species.generation}
            </span>
          )}
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans italic">
          "{species?.flavorTextPt || species?.flavorTextEn || 'Dados de entrada sendo decodificados pela Pokédex.'}"
        </p>

        {species?.flavorTextPt && species?.flavorTextEn && (
          <p className="text-xs text-slate-400 border-t border-slate-800/80 pt-2 font-mono-dex">
            <span className="text-slate-500">EN:</span> "{species.flavorTextEn}"
          </p>
        )}
      </div>

      {/* Physical Dimensions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Height */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800 text-blue-400">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono-dex text-slate-400 uppercase">Altura</div>
            <div className="text-sm sm:text-base font-mono-dex font-bold text-white">
              {pokemon.height} m
            </div>
            <div className="text-[10px] text-slate-400 font-mono-dex">({heightFeet} ft)</div>
          </div>
        </div>

        {/* Weight */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800 text-amber-400">
            <Weight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono-dex text-slate-400 uppercase">Peso</div>
            <div className="text-sm sm:text-base font-mono-dex font-bold text-white">
              {pokemon.weight} kg
            </div>
            <div className="text-[10px] text-slate-400 font-mono-dex">({weightLbs} lbs)</div>
          </div>
        </div>

        {/* Habitat / Origin */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono-dex text-slate-400 uppercase">Habitat</div>
            <div className="text-sm sm:text-base font-mono-dex font-bold text-white truncate">
              {species?.habitat || 'Diversificado'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono-dex">Ambiente Natural</div>
          </div>
        </div>
      </div>

      {/* Capture & Breeding Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Breeding / Egg Groups */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-mono-dex text-slate-300 font-semibold uppercase">
            <Egg className="w-3.5 h-3.5 text-pink-400" />
            <span>Grupos de Ovos & Reprodução</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {species?.eggGroups && species.eggGroups.length > 0 ? (
              species.eggGroups.map((group) => (
                <span
                  key={group}
                  className="px-2.5 py-0.5 rounded bg-slate-800 text-slate-200 text-xs font-mono-dex border border-slate-700"
                >
                  {group}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 font-mono-dex">Desconhecido</span>
            )}
          </div>
        </div>

        {/* Catch Rate & Base Happiness */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono-dex">
            <span className="text-slate-400">Taxa de Captura:</span>
            <span className={`font-bold ${catchInfo?.color || 'text-white'}`}>
              {species?.captureRate} ({catchInfo?.label} ~{catchInfo?.chance})
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono-dex border-t border-slate-800/80 pt-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Heart className="w-3 h-3 text-rose-400" /> Amizade Base:
            </span>
            <span className="text-white font-bold">{species?.baseHappiness} / 255</span>
          </div>
        </div>
      </div>

      {/* Abilities Section */}
      <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-mono-dex text-cyan-400 font-bold uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Habilidades Passivas & Táticas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pokemon.abilities.map((ab) => (
            <div
              key={ab.name}
              className="p-2.5 rounded-lg bg-slate-800/70 border border-slate-700/80 flex items-center justify-between"
            >
              <div className="font-mono-dex text-sm font-semibold text-white">
                {formatPokemonName(ab.name)}
              </div>
              {ab.is_hidden && (
                <span className="text-[10px] uppercase font-mono-dex font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-700">
                  Oculta
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
