import React, { useState, useEffect } from 'react';
import { PokemonDetail, PokemonSpeciesInfo } from '../types/pokemon';
import { getTypeMeta } from '../utils/typeColors';
import { pokedexAudio } from '../utils/soundEffects';
import { pokedexVoice } from '../utils/pokedexVoice';
import { getKidStory } from '../utils/kidLore';
import { Volume2, VolumeX, Sparkles, ChevronLeft, ChevronRight, Activity, ShieldAlert, Radio } from 'lucide-react';

interface PokemonScreenProps {
  pokemon: PokemonDetail;
  species: PokemonSpeciesInfo | null;
  onPrev: () => void;
  onNext: () => void;
  isLoading: boolean;
}

export const PokemonScreen: React.FC<PokemonScreenProps> = ({
  pokemon,
  species,
  onPrev,
  onNext,
  isLoading,
}) => {
  const [isShiny, setIsShiny] = useState(false);
  const [showAnimated, setShowAnimated] = useState(false);
  const [isPlayingCry, setIsPlayingCry] = useState(false);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  useEffect(() => {
    const unsub = pokedexVoice.subscribe((speaking) => {
      setIsVoiceSpeaking(speaking);
    });
    return () => {
      unsub();
    };
  }, []);

  // Stop voice when changing pokemon
  useEffect(() => {
    pokedexVoice.stop();
  }, [pokemon.id]);

  const handlePlayCry = () => {
    setIsPlayingCry(true);
    pokedexAudio.playPokemonCry(pokemon.cryUrl, pokemon.id);
    setTimeout(() => setIsPlayingCry(false), 1200);
  };

  const handleToggleVoice = async () => {
    if (isVoiceSpeaking) {
      pokedexVoice.stop();
    } else {
      pokedexAudio.playClick();
      const story = await getKidStory(pokemon, species);
      const speech = `${story.kidSpokenStory} Curiosidade: ${story.funFactKid} Dica: ${story.kidTip}`;
      pokedexVoice.speak(speech);
    }
  };

  // Determine current image
  let currentImage = pokemon.sprites.artwork;
  if (isShiny) {
    currentImage = pokemon.sprites.artworkShiny;
  }
  if (showAnimated) {
    if (isShiny && pokemon.sprites.showdownAnimatedShiny) {
      currentImage = pokemon.sprites.showdownAnimatedShiny;
    } else if (pokemon.sprites.showdownAnimated) {
      currentImage = pokemon.sprites.showdownAnimated;
    }
  }

  const formattedId = `#${String(pokemon.id).padStart(4, '0')}`;

  return (
    <div className="bg-red-700/90 p-3 sm:p-5 rounded-2xl border-4 border-red-900 shadow-2xl flex flex-col justify-between">
      
      {/* Top Screen Bezel LEDs */}
      <div className="flex items-center justify-between pb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-400 border border-red-900 shadow-[0_0_6px_rgba(248,113,113,0.9)]"></div>
          <div className="w-3 h-3 rounded-full bg-red-400 border border-red-900 shadow-[0_0_6px_rgba(248,113,113,0.9)]"></div>
        </div>

        <div className="font-mono-dex text-xs font-bold text-red-200 tracking-wider">
          POKÉMON IDENTIFIER UNIT
        </div>

        <div className="flex items-center gap-1">
          {/* Speaker grill vents */}
          <div className="w-1 h-3 bg-red-900 rounded-full"></div>
          <div className="w-1 h-3 bg-red-900 rounded-full"></div>
          <div className="w-1 h-3 bg-red-900 rounded-full"></div>
        </div>
      </div>

      {/* Main CRT Display Screen */}
      <div className="relative rounded-xl border-4 border-slate-700 bg-slate-950 p-4 crt-screen overflow-hidden shadow-inner flex flex-col items-center">
        
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        {/* Screen Header Info */}
        <div className="w-full flex items-center justify-between z-10 font-mono-dex text-xs border-b border-slate-800 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              {formattedId}
            </span>
            <span className="text-slate-400 uppercase tracking-wide truncate max-w-[120px] sm:max-w-[180px]">
              {species?.genus || 'Pokémon'}
            </span>
          </div>

          {species?.isLegendary && (
            <span className="text-[10px] font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Lendário
            </span>
          )}
          {species?.isMythical && (
            <span className="text-[10px] font-bold text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded border border-purple-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Mítico
            </span>
          )}
        </div>

        {/* Center Pokémon Image Stage */}
        <div className="relative w-full aspect-square max-h-72 sm:max-h-80 flex items-center justify-center p-2 z-10 group">
          {/* Subtle glow circle behind pokemon based on primary type */}
          <div
            className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full blur-2xl opacity-25 transition-all"
            style={{
              backgroundColor: getTypeMeta(pokemon.types[0]).colorHex,
            }}
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="font-mono-dex text-xs text-cyan-300 animate-pulse">Sintonizando dados...</span>
            </div>
          ) : (
            <img
              src={currentImage}
              alt={pokemon.displayName}
              className={`max-w-full max-h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:scale-105 ${
                showAnimated ? 'h-32 sm:h-40' : 'h-52 sm:h-64'
              }`}
              loading="lazy"
            />
          )}

          {/* Quick Cry audio trigger on top-right of image */}
          <button
            type="button"
            id="play-cry-btn"
            onClick={handlePlayCry}
            title="Tocar Grito do Pokémon"
            className={`absolute top-2 right-2 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-600 transition cursor-pointer shadow-lg ${
              isPlayingCry ? 'ring-2 ring-cyan-400 scale-110 bg-cyan-900' : ''
            }`}
          >
            <Volume2 className={`w-4 h-4 ${isPlayingCry ? 'animate-bounce text-cyan-200' : ''}`} />
          </button>
        </div>

        {/* Display Name & Type Badges */}
        <div className="w-full text-center z-10 mt-1">
          <h2 className="text-xl sm:text-2xl font-bold font-mono-dex text-white tracking-wide">
            {pokemon.displayName}
          </h2>

          <div className="flex items-center justify-center gap-2 mt-2">
            {pokemon.types.map((type) => {
              const meta = getTypeMeta(type);
              return (
                <span
                  key={type}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono-dex shadow border ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
                >
                  {meta.namePt}
                </span>
              );
            })}
          </div>
        </div>

        {/* Bottom Screen Controls (Sprite switches & Kid Voice) */}
        <div className="w-full flex items-center justify-between pt-3 mt-3 border-t border-slate-800 z-10 text-xs font-mono-dex gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="toggle-shiny-btn"
              onClick={() => {
                pokedexAudio.playClick();
                setIsShiny(!isShiny);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded border transition cursor-pointer ${
                isShiny
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Shiny</span>
            </button>

            {pokemon.sprites.showdownAnimated && (
              <button
                type="button"
                id="toggle-animated-sprite-btn"
                onClick={() => {
                  pokedexAudio.playClick();
                  setShowAnimated(!showAnimated);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded border transition cursor-pointer ${
                  showAnimated
                    ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{showAnimated ? 'Pixel' : '3D'}</span>
              </button>
            )}
          </div>

          {/* Kid Voice Play Button */}
          <button
            type="button"
            id="screen-voice-btn"
            onClick={handleToggleVoice}
            title={isVoiceSpeaking ? "Parar fala da Pokédex" : "Ouvir Pokédex falando historinha"}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-bold transition shadow cursor-pointer ${
              isVoiceSpeaking
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.8)] animate-pulse'
                : 'bg-amber-400/90 hover:bg-amber-300 text-slate-950 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
            }`}
          >
            {isVoiceSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>FALANDO... ⏹️</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-slate-950" />
                <span>OUVIR 🔊</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Screen Bottom Hardware Panel with Prev / Next D-Pad Navigation */}
      <div className="flex items-center justify-between pt-4 mt-2 px-1">
        {/* Navigation Previous */}
        <button
          type="button"
          id="prev-pokemon-btn"
          disabled={pokemon.id <= 1}
          onClick={() => {
            pokedexAudio.playClick();
            onPrev();
          }}
          className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-mono-dex font-semibold rounded-lg border border-slate-700 shadow active:scale-95 transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-amber-400" />
          <span>Anterior</span>
        </button>

        {/* Hardware Status Dot */}
        <div className="flex items-center gap-2 font-mono-dex text-[11px] text-red-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>SINCRONIZADO</span>
        </div>

        {/* Navigation Next */}
        <button
          type="button"
          id="next-pokemon-btn"
          onClick={() => {
            pokedexAudio.playClick();
            onNext();
          }}
          className="flex items-center gap-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono-dex font-semibold rounded-lg border border-slate-700 shadow active:scale-95 transition cursor-pointer"
        >
          <span>Próximo</span>
          <ChevronRight className="w-4 h-4 text-amber-400" />
        </button>
      </div>

    </div>
  );
};
