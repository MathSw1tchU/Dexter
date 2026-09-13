import React, { useState, useEffect, useCallback } from 'react';
import { PokemonDetail, PokemonSpeciesInfo, EvolutionStep } from './types/pokemon';
import { getPokemonDetail, getPokemonSpecies, getEvolutionChain } from './services/pokeApi';
import { PokedexHeader } from './components/PokedexHeader';
import { PokemonScreen } from './components/PokemonScreen';
import { PokemonStatsTab } from './components/PokemonStatsTab';
import { PokemonAboutTab } from './components/PokemonAboutTab';
import { PokemonEvolutionTab } from './components/PokemonEvolutionTab';
import { PokemonMatchupsTab } from './components/PokemonMatchupsTab';
import { PokemonMovesTab } from './components/PokemonMovesTab';
import { PokemonKidTab } from './components/PokemonKidTab';
import { AiImageScannerModal } from './components/AiImageScannerModal';
import { PokemonListDrawer } from './components/PokemonListDrawer';
import { pokedexAudio } from './utils/soundEffects';
import {
  BarChart2,
  BookOpen,
  GitBranch,
  Shield,
  Swords,
  AlertCircle,
  Camera,
  Sparkles,
  Info,
  Radio,
} from 'lucide-react';

type TabKey = 'kids' | 'stats' | 'about' | 'evolution' | 'matchups' | 'moves';

export default function App() {
  const [currentPokemon, setCurrentPokemon] = useState<PokemonDetail | null>(null);
  const [currentSpecies, setCurrentSpecies] = useState<PokemonSpeciesInfo | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStep | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isEvoLoading, setIsEvoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>('kids');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Load Pokemon by Name or ID
  const loadPokemon = useCallback(async (idOrName: string | number) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch Pokemon Main Details
      const detail = await getPokemonDetail(idOrName);
      setCurrentPokemon(detail);

      // 2. Fetch Species & Lore Details
      try {
        const species = await getPokemonSpecies(detail.id);
        setCurrentSpecies(species);

        // 3. Fetch Evolution Chain if available
        if (species.evolutionChainUrl) {
          setIsEvoLoading(true);
          getEvolutionChain(species.evolutionChainUrl)
            .then((chain) => setEvolutionChain(chain))
            .catch(() => setEvolutionChain(null))
            .finally(() => setIsEvoLoading(false));
        } else {
          setEvolutionChain(null);
        }
      } catch (speciesErr) {
        console.warn('Dados de espécie não disponíveis:', speciesErr);
        setCurrentSpecies(null);
        setEvolutionChain(null);
      }
    } catch (err: any) {
      console.error('Erro ao carregar Pokémon:', err);
      setErrorMessage(
        err.message || `Pokémon '${idOrName}' não foi encontrado. Tente buscar pelo número (ex: 25) ou nome exato.`
      );
      pokedexAudio.playErrorBuzz();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: Pikachu (#25) or Charizard (#6)
  useEffect(() => {
    loadPokemon(25);
  }, [loadPokemon]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if inside an input or modal is open
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        isScannerOpen ||
        isListOpen
      ) {
        return;
      }

      if (e.key === 'ArrowLeft' && currentPokemon && currentPokemon.id > 1) {
        pokedexAudio.playClick();
        loadPokemon(currentPokemon.id - 1);
      } else if (e.key === 'ArrowRight' && currentPokemon && currentPokemon.id < 1025) {
        pokedexAudio.playClick();
        loadPokemon(currentPokemon.id + 1);
      } else if (e.key.toLowerCase() === 'c' && currentPokemon) {
        pokedexAudio.playPokemonCry(currentPokemon.cryUrl, currentPokemon.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPokemon, isScannerOpen, isListOpen, loadPokemon]);

  const handlePrev = () => {
    if (currentPokemon && currentPokemon.id > 1) {
      loadPokemon(currentPokemon.id - 1);
    }
  };

  const handleNext = () => {
    if (currentPokemon && currentPokemon.id < 1025) {
      loadPokemon(currentPokemon.id + 1);
    }
  };

  const handleRandom = () => {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    loadPokemon(randomId);
  };

  const handleToggleSound = () => {
    const nextState = !isSoundEnabled;
    setIsSoundEnabled(nextState);
    pokedexAudio.setSoundEnabled(nextState);
    if (nextState) {
      pokedexAudio.playClick();
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'kids', label: 'Voz & Crianças 🎈', icon: <Radio className="w-4 h-4 text-amber-400" /> },
    { key: 'stats', label: 'Estatísticas', icon: <BarChart2 className="w-4 h-4" /> },
    { key: 'about', label: 'Sobre & Lore', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'evolution', label: 'Evoluções', icon: <GitBranch className="w-4 h-4" /> },
    { key: 'matchups', label: 'Fraquezas', icon: <Shield className="w-4 h-4" /> },
    { key: 'moves', label: 'Golpes', icon: <Swords className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      
      {/* Top Pokédex Bezel Hardware Header */}
      <PokedexHeader
        currentId={currentPokemon?.id || 1}
        onOpenScanner={() => setIsScannerOpen(true)}
        onSearch={(query) => loadPokemon(query)}
        onRandom={handleRandom}
        onToggleList={() => setIsListOpen(true)}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main Console Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        
        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mb-4 p-4 rounded-xl bg-red-950/80 border-2 border-red-700 flex items-center justify-between gap-3 text-red-200 font-mono-dex text-xs animate-shake">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-white font-bold cursor-pointer"
            >
              OK
            </button>
          </div>
        )}

        {/* Outer Pokédex Case (Red Metallic Shell with Chamfers) */}
        <div className="relative bg-gradient-to-b from-red-600 via-red-650 to-red-700 p-3 sm:p-6 rounded-3xl border-4 sm:border-8 border-red-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* Decorative Case Screws */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner"></div>
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner"></div>
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner"></div>
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-300 border border-slate-500 shadow-inner"></div>

          {/* Dual-Panel Layout: Left CRT Screen + Right Data Terminal */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT MODULE: Visual Unit Screen & Controls */}
            <div className="lg:col-span-5">
              {currentPokemon ? (
                <PokemonScreen
                  pokemon={currentPokemon}
                  species={currentSpecies}
                  onPrev={handlePrev}
                  onNext={handleNext}
                  isLoading={isLoading}
                />
              ) : (
                <div className="p-12 text-center font-mono-dex text-sm text-red-200">
                  Carregando Pokédex...
                </div>
              )}
            </div>

            {/* CENTRAL HINGE SEPARATOR (Desktop only visual) */}
            <div className="hidden lg:block lg:col-span-1 self-stretch relative">
              <div className="h-full w-full flex flex-col items-center justify-center gap-6">
                <div className="w-3 h-16 rounded-full bg-gradient-to-r from-red-900 via-red-800 to-red-950 border border-red-700 shadow-inner"></div>
                <div className="w-3 h-24 rounded-full bg-gradient-to-r from-red-900 via-red-800 to-red-950 border border-red-700 shadow-inner"></div>
                <div className="w-3 h-16 rounded-full bg-gradient-to-r from-red-900 via-red-800 to-red-950 border border-red-700 shadow-inner"></div>
              </div>
            </div>

            {/* RIGHT MODULE: High-Tech Data Terminal */}
            <div className="lg:col-span-6 bg-slate-950 p-4 sm:p-5 rounded-2xl border-4 border-slate-800 shadow-2xl flex flex-col min-h-[560px]">
              
              {/* Terminal Top Lights & Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse"></div>
                  <span className="font-mono-dex text-xs font-bold text-slate-300 uppercase tracking-wider">
                    TERMINAL DE ANÁLISE DE DADOS
                  </span>
                </div>

                <div className="font-mono-dex text-[11px] text-amber-400 font-semibold bg-amber-950/70 px-2 py-0.5 rounded border border-amber-900">
                  ONLINE
                </div>
              </div>

              {/* Tab Navigation Switches */}
              <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-3 border-b border-slate-800/80 no-scrollbar">
                {tabs.map((t) => {
                  const isActive = activeTab === t.key;
                  return (
                    <button
                      key={t.key}
                      type="button"
                      id={`tab-${t.key}-btn`}
                      onClick={() => {
                        pokedexAudio.playClick();
                        setActiveTab(t.key);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono-dex text-xs font-bold transition whitespace-nowrap cursor-pointer border ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 border-yellow-300 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Body */}
              <div className="flex-1 py-4">
                {isLoading ? (
                  <div className="py-20 text-center space-y-3 font-mono-dex text-xs text-slate-400">
                    <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p>Carregando telemetria e dados oficiais...</p>
                  </div>
                ) : currentPokemon ? (
                  <>
                    {activeTab === 'kids' && (
                      <PokemonKidTab
                        pokemon={currentPokemon}
                        species={currentSpecies}
                        onOpenScanner={() => setIsScannerOpen(true)}
                      />
                    )}
                    {activeTab === 'stats' && <PokemonStatsTab pokemon={currentPokemon} />}
                    {activeTab === 'about' && (
                      <PokemonAboutTab pokemon={currentPokemon} species={currentSpecies} />
                    )}
                    {activeTab === 'evolution' && (
                      <PokemonEvolutionTab
                        evolutionChain={evolutionChain}
                        currentPokemonId={currentPokemon.id}
                        onSelectPokemon={(id) => loadPokemon(id)}
                        isLoading={isEvoLoading}
                      />
                    )}
                    {activeTab === 'matchups' && (
                      <PokemonMatchupsTab types={currentPokemon.types} />
                    )}
                    {activeTab === 'moves' && <PokemonMovesTab moves={currentPokemon.moves} />}
                  </>
                ) : null}
              </div>

              {/* Terminal Bottom Controls (Quick Actions & Hints) */}
              <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] font-mono-dex text-slate-400 gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">Use as setas [← / →] para navegar, [C] para o grito, botão [OUVIR 🔊] para a historinha falada.</span>
                  <span className="sm:hidden">Toque em [OUVIR 🔊] para escutar a historinha!</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Escanear Bonequinho 📸</span>
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* AI Camera / Image Scanner Modal */}
      <AiImageScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onSelectPokemon={(nameOrId) => loadPokemon(nameOrId)}
      />

      {/* General Pokemon Registry Browser Drawer */}
      <PokemonListDrawer
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onSelectPokemon={(id) => loadPokemon(id)}
        currentPokemonId={currentPokemon?.id || 1}
      />

      {/* Footer */}
      <footer className="p-3 text-center font-mono-dex text-[11px] text-slate-500 border-t border-slate-900 bg-slate-950">
        Pokédex com Reconhecimento Visual IA Gemini e Integração com a PokéAPI oficial.
      </footer>
    </div>
  );
}
