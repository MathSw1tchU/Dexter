import React, { useState, useEffect } from 'react';
import { PokemonDetail, PokemonSpeciesInfo, PokemonKidStory } from '../types/pokemon';
import { getKidStory } from '../utils/kidLore';
import { pokedexVoice } from '../utils/pokedexVoice';
import { pokedexAudio } from '../utils/soundEffects';
import { getTypeMeta } from '../utils/typeColors';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Smile,
  Ruler,
  Camera,
  Flame,
  Radio,
  Gamepad2,
} from 'lucide-react';

interface PokemonKidTabProps {
  pokemon: PokemonDetail;
  species: PokemonSpeciesInfo | null;
  onOpenScanner: () => void;
}

export const PokemonKidTab: React.FC<PokemonKidTabProps> = ({
  pokemon,
  species,
  onOpenScanner,
}) => {
  const [kidStory, setKidStory] = useState<PokemonKidStory | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(pokedexVoice.isAutoSpeakEnabled());

  // Subscribe to speech synthesis state changes
  useEffect(() => {
    const unsubscribe = pokedexVoice.subscribe((speaking) => {
      setIsSpeaking(speaking);
    });
    return () => {
      unsubscribe();
      pokedexVoice.stop();
    };
  }, []);

  // Fetch or generate kid story when pokemon changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingStory(true);

    getKidStory(pokemon, species)
      .then((story) => {
        if (!isCancelled) {
          setKidStory(story);
          setIsLoadingStory(false);

          // Auto-speak if enabled and user has already interacted
          if (pokedexVoice.isAutoSpeakEnabled()) {
            pokedexVoice.speak(story.kidSpokenStory);
          }
        }
      })
      .catch(() => {
        if (!isCancelled) setIsLoadingStory(false);
      });

    return () => {
      isCancelled = true;
      pokedexVoice.stop();
    };
  }, [pokemon.id]);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      pokedexVoice.stop();
    } else if (kidStory) {
      pokedexAudio.playClick();
      pokedexVoice.speak(
        `${kidStory.kidSpokenStory} Curiosidade: ${kidStory.funFactKid} E lembre-se: ${kidStory.kidTip}`
      );
    }
  };

  const handleToggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    pokedexVoice.setAutoSpeak(next);
    pokedexAudio.playClick();
  };

  const primaryMeta = getTypeMeta(pokemon.types[0]);

  return (
    <div className="space-y-4">
      
      {/* Kid Speech Audio Interactive Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border-2 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              {isSpeaking && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isSpeaking ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
            </span>
            <span className="font-mono-dex text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-pulse text-amber-400' : 'text-slate-400'}`} />
              Voz Falada da Pokédex
            </span>
          </div>

          {/* Auto Speak Toggle */}
          <button
            type="button"
            onClick={handleToggleAutoSpeak}
            className={`text-[11px] font-mono-dex px-2.5 py-1 rounded-full border transition cursor-pointer flex items-center gap-1 ${
              autoSpeak
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <span>Auto-fala:</span>
            <span className="font-bold">{autoSpeak ? 'LIGADA' : 'DESLIGADA'}</span>
          </button>
        </div>

        {/* Big Kid-friendly Speech Button with Sound Wave Animations */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <button
            type="button"
            id="kid-voice-speak-btn"
            onClick={handleToggleSpeech}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-mono-dex font-bold text-sm transition-all shadow-lg active:scale-95 cursor-pointer ${
              isSpeaking
                ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-rose-900/50 ring-2 ring-rose-400'
                : 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-amber-500/30'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-5 h-5 animate-pulse" />
                <span>PARAR DE FALAR ⏹️</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" />
                <span>OUVIR A POKÉDEX FALAR 🔊</span>
              </>
            )}
          </button>

          {/* Miniature Scan Quick Action */}
          <button
            type="button"
            onClick={onOpenScanner}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400 text-xs font-mono-dex font-semibold transition cursor-pointer"
          >
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Escanear Miniatura 📷</span>
          </button>
        </div>

        {/* Dynamic Voice Waves animation when speaking */}
        {isSpeaking && (
          <div className="flex items-center justify-center gap-1 py-1">
            {[12, 24, 16, 28, 14, 20, 26, 12, 18, 24].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]"
                style={{
                  height: `${h}px`,
                  animationDelay: `${(i % 5) * 0.1}s`,
                }}
              />
            ))}
            <span className="text-[11px] font-mono-dex text-amber-300 ml-2 animate-pulse">
              A Pokédex está falando com você...
            </span>
          </div>
        )}
      </div>

      {/* Spoken Speech Bubble (What the Pokédex says) */}
      <div className="relative p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono-dex text-amber-400 font-bold">
          <Smile className="w-4 h-4 text-amber-400" />
          <span>A Pokédex diz para você:</span>
        </div>

        {isLoadingStory ? (
          <div className="py-4 text-center space-y-2 text-xs font-mono-dex text-slate-400">
            <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Preparando a historinha mágica...</p>
          </div>
        ) : (
          <p className="text-sm sm:text-base text-white leading-relaxed font-sans font-medium">
            "{kidStory?.kidSpokenStory || 'Olá! Vamos brincar e aprender sobre este Pokémon!'}"
          </p>
        )}
      </div>

      {/* Kid Friendly Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        
        {/* Real World Size Comparison */}
        <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono-dex font-bold text-blue-300 uppercase">
            <Ruler className="w-4 h-4 text-blue-400" />
            <span>Tamanho no Mundo Real</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans">
            {kidStory?.sizeComparison || 'Tamanho ideal para ser seu companheiro de brincadeira!'}
          </p>
          <div className="text-[10px] font-mono-dex text-blue-300 pt-1 border-t border-blue-900/50">
            Altura: {pokemon.height} m • Peso: {pokemon.weight} kg
          </div>
        </div>

        {/* Fun Magical Curiosity */}
        <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-mono-dex font-bold text-purple-300 uppercase">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Curiosidade Divertida</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans">
            {kidStory?.funFactKid || 'Ele adora fazer novos amigos e participar de grandes aventuras no faz-de-conta!'}
          </p>
        </div>

        {/* How to Play / Care Tip */}
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1.5 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-xs font-mono-dex font-bold text-emerald-300 uppercase">
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Dica do Treinador Mirim</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-200 font-sans">
            {kidStory?.kidTip || 'Coloque sua miniatura na estante ou na mesa e imagine que você está explorando uma floresta Pokémon!'}
          </p>
        </div>

      </div>

      {/* Playful Friendship Badge */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono-dex text-slate-300">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>Grau de Companheirismo:</span>
          <span className="font-bold text-white">Amigo para Toda Aventura!</span>
        </div>
        <div className="text-amber-400 font-bold">
          {primaryMeta.namePt}
        </div>
      </div>

    </div>
  );
};
