import React, { useState } from 'react';
import { Camera, Volume2, VolumeX, Shuffle, Search, Sparkles, Layers } from 'lucide-react';
import { pokedexAudio } from '../utils/soundEffects';

interface PokedexHeaderProps {
  onOpenScanner: () => void;
  onSearch: (query: string) => void;
  onRandom: () => void;
  onToggleList: () => void;
  currentId: number;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
}

export const PokedexHeader: React.FC<PokedexHeaderProps> = ({
  onOpenScanner,
  onSearch,
  onRandom,
  onToggleList,
  currentId,
  isSoundEnabled,
  onToggleSound,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      pokedexAudio.playClick();
      onSearch(searchInput.trim());
    }
  };

  return (
    <header className="relative bg-red-600 border-b-4 border-red-800 shadow-xl px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Iconic Pokédex Hardware LEDs & Lens */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          {/* Main Blue Glowing Optical Sensor */}
          <div className="relative group cursor-pointer" onClick={() => pokedexAudio.playScannerBeep()} title="Sensor Óptico Principal">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 p-1 shadow-inner border-2 border-slate-300">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-cyan-600 via-sky-400 to-blue-300 shadow-[0_0_15px_rgba(56,189,248,0.8)] flex items-center justify-center relative overflow-hidden animate-pulse">
                {/* Reflection highlight */}
                <div className="absolute top-1 left-2 w-3 h-2 bg-white/70 rounded-full blur-[0.5px]"></div>
                <div className="w-4 h-4 rounded-full bg-cyan-200/40"></div>
              </div>
            </div>
          </div>

          {/* Indicator Trio LEDs */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-red-500 border border-red-900 shadow-[0_0_6px_rgba(239,68,68,0.8)]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-800 shadow-[0_0_6px_rgba(251,191,36,0.8)]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-800 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"></div>
          </div>

          <div className="ml-2 hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider font-mono-dex text-white drop-shadow-md">
              POKÉDEX <span className="text-amber-300 text-xs sm:text-sm font-semibold tracking-normal px-2 py-0.5 rounded bg-red-800/80 border border-red-700">MINIATURAS & VOZ IA</span>
            </h1>
            <p className="text-[11px] text-red-200 font-mono-dex tracking-tight">SCANNER DE BONEQUINHOS & DADOS LÚDICOS PARA CRIANÇAS</p>
          </div>
        </div>

        {/* Action Controls & Search Input */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          {/* Search Form */}
          <form onSubmit={handleSubmit} className="relative flex-1 sm:w-64 max-w-xs">
            <input
              type="text"
              id="pokedex-search-input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar (ex: 25, Lucario)..."
              className="w-full bg-slate-900 text-white placeholder-slate-400 text-sm font-mono-dex rounded-lg pl-9 pr-3 py-2 border border-red-900 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </form>

          {/* Random Pokemon Button */}
          <button
            type="button"
            id="random-pokemon-btn"
            onClick={() => {
              pokedexAudio.playClick();
              onRandom();
            }}
            title="Sortear Pokémon aleatório"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 active:scale-95 text-white text-xs font-mono-dex font-semibold rounded-lg border border-red-500 shadow transition-all cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Aleatório</span>
          </button>

          {/* Open List Drawer */}
          <button
            type="button"
            id="toggle-pokedex-list-btn"
            onClick={() => {
              pokedexAudio.playClick();
              onToggleList();
            }}
            title="Abrir Lista Geral"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-700 hover:bg-red-800 active:scale-95 text-white text-xs font-mono-dex font-semibold rounded-lg border border-red-500 shadow transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Lista</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            id="sound-toggle-btn"
            onClick={onToggleSound}
            title={isSoundEnabled ? "Desativar Som" : "Ativar Som"}
            className="p-2 bg-red-800/80 hover:bg-red-900 text-red-100 rounded-lg border border-red-700 transition cursor-pointer"
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* RECONHECIMENTO DE MINIATURAS POR IA */}
          <button
            type="button"
            id="open-ai-scanner-btn"
            onClick={() => {
              pokedexAudio.playScannerBeep();
              onOpenScanner();
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-mono-dex font-bold text-xs sm:text-sm rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.6)] border border-yellow-200 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4 text-slate-900 animate-bounce" />
            <span>Escanear Miniatura</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
          </button>
        </div>

      </div>
    </header>
  );
};
