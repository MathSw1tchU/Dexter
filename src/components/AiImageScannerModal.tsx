import React, { useState, useRef, useEffect } from 'react';
import { AiScanResult } from '../types/pokemon';
import { pokedexAudio } from '../utils/soundEffects';
import { pokedexVoice } from '../utils/pokedexVoice';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  Smile,
  Heart,
  ToyBrick,
} from 'lucide-react';

interface AiImageScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (pokemonNameOrId: string | number) => void;
}

const SAMPLE_MINIATURES = [
  {
    name: 'Miniatura Pikachu',
    query: '25',
    tag: 'Bonequinho Elétrico',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
  },
  {
    name: 'Miniatura Charizard',
    query: '6',
    tag: 'Mini Dragão de Fogo',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
  },
  {
    name: 'Miniatura Eevee',
    query: '133',
    tag: 'Bonequinho Peludinho',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
  },
  {
    name: 'Miniatura Squirtle',
    query: '7',
    tag: 'Mini Tartaruguinha',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
  },
  {
    name: 'Miniatura Gengar',
    query: '94',
    tag: 'Fantasma Travesso',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
  },
  {
    name: 'Miniatura Lucario',
    query: '448',
    tag: 'Guerreiro da Aura',
    imageUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/448.png',
  },
];

export const AiImageScannerModal: React.FC<AiImageScannerModalProps> = ({
  isOpen,
  onClose,
  onSelectPokemon,
}) => {
  const [activeMode, setActiveMode] = useState<'camera' | 'upload' | 'samples'>('camera');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<AiScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState(false);

  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Subscribe to voice synthesis
  useEffect(() => {
    const unsub = pokedexVoice.subscribe((speaking) => {
      setIsVoiceSpeaking(speaking);
    });
    return () => {
      unsub();
    };
  }, []);

  // Stop camera and voice when closing modal or switching
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      pokedexVoice.stop();
      setSelectedImage(null);
      setScanResult(null);
      setErrorMessage(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeMode === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeMode, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Erro ao acessar a câmera:', err);
      setCameraError(
        'Acesso à câmera bloqueado ou indisponível. Você pode fotografar e enviar o arquivo ou usar os exemplos rápidos abaixo.'
      );
    }
  };

  // Capture frame from live video
  const capturePhoto = () => {
    if (!videoRef.current) return;
    pokedexAudio.playScannerBeep();

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setSelectedImage(dataUrl);
    stopCamera();
    setActiveMode('upload');
    performAiScan(dataUrl);
  };

  // Convert uploaded file to base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    pokedexAudio.playClick();
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      performAiScan(base64);
    };
    reader.readAsDataURL(file);
  };

  // Sample image selection
  const handleSelectSample = async (sample: typeof SAMPLE_MINIATURES[0]) => {
    pokedexAudio.playClick();
    setIsScanning(true);
    setErrorMessage(null);
    setScanResult(null);

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width || 400;
        canvas.height = img.height || 400;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          setSelectedImage(base64);
          performAiScan(base64);
        }
      };
      img.onerror = () => {
        setIsScanning(false);
        setErrorMessage('Não foi possível carregar a miniatura de teste.');
      };
      img.src = sample.imageUrl;
    } catch {
      setIsScanning(false);
      setErrorMessage('Falha ao processar a amostra.');
    }
  };

  // Call server-side Gemini miniature recognition
  const performAiScan = async (base64Image: string) => {
    setIsScanning(true);
    setErrorMessage(null);
    setScanResult(null);
    pokedexAudio.playScannerBeep();

    try {
      const res = await fetch('/api/recognize-pokemon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Falha na resposta do scanner de miniaturas.');
      }

      const result: AiScanResult = json.data;
      setScanResult(result);

      if (result.identified) {
        pokedexAudio.playSuccessChime();

        // Speak kid speech automatically if enabled
        if (pokedexVoice.isAutoSpeakEnabled() && result.kidSpokenStory) {
          const textToSay = `${result.kidSpokenStory} ${result.funFactKid ? `Curiosidade: ${result.funFactKid}` : ''}`;
          pokedexVoice.speak(textToSay);
        }
      } else {
        pokedexAudio.playErrorBuzz();
        if (pokedexVoice.isAutoSpeakEnabled()) {
          pokedexVoice.speak('Ops! Não consegui reconhecer o bonequinho. Tente aproximar mais a câmera com boa luz!');
        }
      }
    } catch (err: any) {
      console.error('Falha no escaneamento de miniatura:', err);
      pokedexAudio.playErrorBuzz();
      setErrorMessage(
        err.message || 'Erro ao comunicar com a Pokédex. Verifique a conexão e tente novamente.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleSpeakScanResult = () => {
    if (isVoiceSpeaking) {
      pokedexVoice.stop();
    } else if (scanResult?.kidSpokenStory) {
      pokedexAudio.playClick();
      const textToSay = `${scanResult.kidSpokenStory} ${scanResult.funFactKid ? `Curiosidade: ${scanResult.funFactKid}` : ''} ${scanResult.kidTip ? `Dica do treinador: ${scanResult.kidTip}` : ''}`;
      pokedexVoice.speak(textToSay);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-4 border-red-700 rounded-3xl shadow-[0_0_50px_rgba(220,38,38,0.6)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Pokédex Bezel Bar */}
        <div className="bg-red-700 px-4 py-3.5 border-b-2 border-red-900 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-[0_0_12px_rgba(34,211,238,1)] animate-pulse flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div>
              <h3 className="font-mono-dex text-sm sm:text-base font-bold text-white tracking-wider flex items-center gap-1.5">
                <span>SCANNER DE MINIATURAS & BONEQUINHOS</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">KIDS</span>
              </h3>
              <p className="text-[10px] font-mono-dex text-red-200">
                Aponte para o seu bonequinho Pokémon e ouça a Pokédex falar!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-red-800 hover:bg-red-900 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              pokedexAudio.playClick();
              setActiveMode('camera');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-mono-dex font-bold rounded-t-lg transition border-t border-x cursor-pointer ${
              activeMode === 'camera'
                ? 'bg-slate-900 text-cyan-400 border-slate-800 border-b-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Câmera ao Vivo</span>
          </button>

          <button
            type="button"
            onClick={() => {
              pokedexAudio.playClick();
              setActiveMode('upload');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-mono-dex font-bold rounded-t-lg transition border-t border-x cursor-pointer ${
              activeMode === 'upload'
                ? 'bg-slate-900 text-amber-400 border-slate-800 border-b-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Foto da Miniatura</span>
          </button>

          <button
            type="button"
            onClick={() => {
              pokedexAudio.playClick();
              setActiveMode('samples');
            }}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-mono-dex font-bold rounded-t-lg transition border-t border-x cursor-pointer ${
              activeMode === 'samples'
                ? 'bg-slate-900 text-emerald-400 border-slate-800 border-b-slate-900'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Miniaturas Exemplo</span>
          </button>
        </div>

        {/* Modal Body with Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* CAMERA MODE */}
          {activeMode === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs font-mono-dex text-red-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 text-white rounded font-mono-dex text-xs"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video border-2 border-slate-700 flex items-center justify-center crt-screen shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Toy Framing Reticle Overlay */}
                  <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-amber-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3 bg-amber-400/5">
                    <div className="flex justify-between text-[11px] font-mono-dex text-amber-300 font-bold bg-black/60 px-2 py-0.5 rounded">
                      <span>[ENQUADRE SUA MINIATURA]</span>
                      <span>MIRA DO BONEQUINHO</span>
                    </div>

                    {/* Cute centering guide */}
                    <div className="self-center w-14 h-14 border-2 border-cyan-400 rounded-full flex items-center justify-center bg-cyan-950/30 animate-pulse">
                      <ToyBrick className="w-6 h-6 text-cyan-300 opacity-80" />
                    </div>

                    <div className="flex justify-between text-[10px] font-mono-dex text-amber-300 bg-black/60 px-2 py-0.5 rounded">
                      <span>Coloque o brinquedo no centro</span>
                      <span>Aperte o botão vermelho</span>
                    </div>
                  </div>

                  {/* Shutter Button */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      type="button"
                      id="shutter-capture-btn"
                      onClick={capturePhoto}
                      disabled={isScanning}
                      className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-mono-dex font-bold text-sm rounded-full shadow-[0_0_25px_rgba(239,68,68,0.9)] border-2 border-white active:scale-95 transition cursor-pointer"
                    >
                      <Camera className="w-5 h-5" />
                      <span>ESCANEAR MEU BONEQUINHO! 📸</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SAMPLES MODE */}
          {activeMode === 'samples' && (
            <div className="space-y-3">
              <p className="font-mono-dex text-xs text-slate-300">
                Não tem uma miniatura em mãos agora? Escolha um destes bonequinhos para testar o reconhecimento e a voz da Pokédex:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {SAMPLE_MINIATURES.map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => handleSelectSample(s)}
                    disabled={isScanning}
                    className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-400 hover:bg-slate-800/80 transition flex flex-col items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-20 h-20 flex items-center justify-center p-1 bg-slate-900 rounded-xl border border-slate-800">
                      <img
                        src={s.imageUrl}
                        alt={s.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-mono-dex text-xs font-bold text-slate-200 group-hover:text-amber-300">
                        {s.name}
                      </div>
                      <div className="text-[10px] font-mono-dex text-slate-400">
                        {s.tag}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD / DROPZONE MODE */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {!selectedImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-700 hover:border-amber-400 hover:bg-slate-800/40 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center gap-3 group"
                >
                  <div className="p-4 rounded-full bg-slate-800 group-hover:bg-amber-950/80 border border-slate-700 group-hover:border-amber-500 text-amber-400 transition">
                    <Upload className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <div className="font-mono-dex text-sm font-bold text-white">
                      Envie a foto do seu bonequinho ou miniatura
                    </div>
                    <div className="font-mono-dex text-xs text-slate-400 mt-1">
                      Pode ser uma foto tirada com o celular, apoiada na mesa ou segurada com a mãozinha!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 max-h-64 flex items-center justify-center p-2">
                  <img
                    src={selectedImage}
                    alt="Miniatura selecionada"
                    className="max-h-60 max-w-full object-contain rounded-xl shadow"
                  />

                  {/* Scanner animated beam */}
                  {isScanning && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_rgba(6,182,212,1)] animate-[bounce_1.5s_infinite]" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setScanResult(null);
                      pokedexVoice.stop();
                    }}
                    className="absolute top-2 right-2 p-2 rounded-lg bg-black/70 hover:bg-black text-white text-xs font-mono-dex border border-slate-600 transition cursor-pointer"
                  >
                    Trocar Foto
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SCANNING PROGRESS STATE */}
          {isScanning && (
            <div className="p-5 bg-slate-950 border-2 border-cyan-500/80 rounded-2xl space-y-2 text-center crt-screen">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="font-mono-dex text-sm font-bold text-cyan-300 tracking-wider animate-pulse">
                IDENTIFICANDO SUA MINIATURA POKÉMON...
              </div>
              <p className="font-mono-dex text-xs text-slate-400">
                Analisando formato, orelhinhas, olhos e detalhes do bonequinho...
              </p>
            </div>
          )}

          {/* ERROR ALERT */}
          {errorMessage && (
            <div className="p-4 bg-red-950/60 border border-red-800 rounded-xl text-xs font-mono-dex text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SCAN RESULT PANEL */}
          {scanResult && !isScanning && (
            <div className="space-y-3 pt-2">
              {scanResult.identified ? (
                <div className="p-5 bg-slate-950 rounded-2xl border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.3)] space-y-4">
                  
                  {/* Result Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="font-mono-dex text-xs font-bold text-emerald-400 uppercase tracking-wide">
                          Miniatura Reconhecida!
                        </span>
                      </div>
                      <h4 className="font-mono-dex text-2xl font-bold text-white mt-1">
                        {scanResult.displayName}
                      </h4>
                      {scanResult.miniatureDetails && (
                        <p className="text-xs font-mono-dex text-amber-300 mt-0.5">
                          {scanResult.miniatureDetails}
                        </p>
                      )}
                    </div>

                    <div className="text-right font-mono-dex">
                      <div className="text-[10px] text-slate-400 uppercase">Certeza da IA</div>
                      <div className="text-lg font-bold text-amber-400">
                        {scanResult.confidence}%
                      </div>
                    </div>
                  </div>

                  {/* Kid Voice Speaking Banner & Button */}
                  <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-500/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs font-mono-dex text-amber-300 font-bold">
                      <Volume2 className={`w-4 h-4 ${isVoiceSpeaking ? 'animate-bounce text-amber-400' : ''}`} />
                      <span>{isVoiceSpeaking ? 'Pokédex Falando em Voz Alta...' : 'Ouvir Historieta Falada para Criança'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSpeakScanResult}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono-dex font-bold text-xs shadow transition active:scale-95 cursor-pointer ${
                        isVoiceSpeaking
                          ? 'bg-rose-600 hover:bg-rose-500 text-white ring-2 ring-rose-400'
                          : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                      }`}
                    >
                      {isVoiceSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span>PARAR VOZ</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>FALAR EM VOZ ALTA 🔊</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Playful Kid Spoken Story Speech Balloon */}
                  {scanResult.kidSpokenStory && (
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 shadow-inner">
                      <div className="flex items-center gap-1.5 text-xs font-mono-dex text-amber-400 font-bold">
                        <Smile className="w-4 h-4 text-amber-400" />
                        <span>A Pokédex diz:</span>
                      </div>
                      <p className="text-sm sm:text-base text-white leading-relaxed font-sans font-medium">
                        "{scanResult.kidSpokenStory}"
                      </p>
                    </div>
                  )}

                  {/* Fun Fact & Kid Tip Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {scanResult.funFactKid && (
                      <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                        <div className="flex items-center gap-1 font-mono-dex text-xs font-bold text-purple-300">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                          <span>Curiosidade Divertida:</span>
                        </div>
                        <p className="text-xs text-slate-200 font-sans">
                          {scanResult.funFactKid}
                        </p>
                      </div>
                    )}

                    {scanResult.kidTip && (
                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 space-y-1">
                        <div className="flex items-center gap-1 font-mono-dex text-xs font-bold text-emerald-300">
                          <Heart className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Dica de Treinador Mirim:</span>
                        </div>
                        <p className="text-xs text-slate-200 font-sans">
                          {scanResult.kidTip}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Identified Visual Features */}
                  {scanResult.visualFeatures && scanResult.visualFeatures.length > 0 && (
                    <div className="space-y-1.5 border-t border-slate-800 pt-2">
                      <div className="font-mono-dex text-[11px] text-cyan-300 font-semibold uppercase flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" /> Detalhes observados na miniatura:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.visualFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono-dex"
                          >
                            ✓ {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button: Load into Pokédex */}
                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      id="load-pokemon-to-dex-btn"
                      onClick={() => {
                        pokedexAudio.playSuccessChime();
                        pokedexVoice.stop();
                        onSelectPokemon(scanResult.pokemonName || scanResult.displayName);
                        onClose();
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-mono-dex font-bold text-xs sm:text-sm rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-300 active:scale-95 transition cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>ABRIR NA POKÉDEX OFICIAL 🌟</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="p-5 bg-slate-950 rounded-2xl border border-amber-800 text-center space-y-2">
                  <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                  <h4 className="font-mono-dex text-sm font-bold text-amber-300">
                    Nenhum Bonequinho ou Miniatura Encontrado
                  </h4>
                  <p className="font-mono-dex text-xs text-slate-300 max-w-md mx-auto">
                    {scanResult.dexAnalysis ||
                      'Não consegui enxergar um bonequinho de Pokémon com nitidez. Tente segurar a miniatura mais perto da câmera ou coloque-a sobre uma mesa bem iluminada!'}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono-dex text-slate-500">
          <span>SCANNER DE MINIATURAS • INTELIGÊNCIA ARTIFICIAL GEMINI</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-300 transition cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
