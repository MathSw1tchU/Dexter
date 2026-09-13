import { PokemonType } from '../types/pokemon';

export interface TypeMeta {
  namePt: string;
  nameEn: string;
  colorHex: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  pillGradient: string;
}

export const TYPE_CONFIG: Record<PokemonType, TypeMeta> = {
  normal: {
    namePt: 'Normal',
    nameEn: 'Normal',
    colorHex: '#9fa19f',
    bgClass: 'bg-stone-500',
    textClass: 'text-stone-100',
    borderClass: 'border-stone-400',
    pillGradient: 'from-stone-500 to-stone-600',
  },
  fire: {
    namePt: 'Fogo',
    nameEn: 'Fire',
    colorHex: '#e64b24',
    bgClass: 'bg-orange-600',
    textClass: 'text-white',
    borderClass: 'border-orange-500',
    pillGradient: 'from-orange-500 to-red-600',
  },
  water: {
    namePt: 'Água',
    nameEn: 'Water',
    colorHex: '#2980ef',
    bgClass: 'bg-blue-600',
    textClass: 'text-white',
    borderClass: 'border-blue-400',
    pillGradient: 'from-blue-500 to-cyan-600',
  },
  grass: {
    namePt: 'Planta',
    nameEn: 'Grass',
    colorHex: '#3fa129',
    bgClass: 'bg-emerald-600',
    textClass: 'text-white',
    borderClass: 'border-emerald-400',
    pillGradient: 'from-emerald-500 to-green-600',
  },
  electric: {
    namePt: 'Elétrico',
    nameEn: 'Electric',
    colorHex: '#fac000',
    bgClass: 'bg-amber-400',
    textClass: 'text-slate-950',
    borderClass: 'border-amber-300',
    pillGradient: 'from-yellow-400 to-amber-500',
  },
  ice: {
    namePt: 'Gelo',
    nameEn: 'Ice',
    colorHex: '#3dcef3',
    bgClass: 'bg-cyan-500',
    textClass: 'text-slate-950',
    borderClass: 'border-cyan-300',
    pillGradient: 'from-cyan-400 to-teal-500',
  },
  fighting: {
    namePt: 'Lutador',
    nameEn: 'Fighting',
    colorHex: '#ff8000',
    bgClass: 'bg-amber-700',
    textClass: 'text-white',
    borderClass: 'border-amber-600',
    pillGradient: 'from-amber-600 to-red-700',
  },
  poison: {
    namePt: 'Veneno',
    nameEn: 'Poison',
    colorHex: '#9141cb',
    bgClass: 'bg-purple-600',
    textClass: 'text-white',
    borderClass: 'border-purple-400',
    pillGradient: 'from-purple-600 to-fuchsia-700',
  },
  ground: {
    namePt: 'Terrestre',
    nameEn: 'Ground',
    colorHex: '#915121',
    bgClass: 'bg-yellow-700',
    textClass: 'text-white',
    borderClass: 'border-yellow-600',
    pillGradient: 'from-yellow-700 to-amber-800',
  },
  flying: {
    namePt: 'Voador',
    nameEn: 'Flying',
    colorHex: '#81b9ef',
    bgClass: 'bg-sky-500',
    textClass: 'text-white',
    borderClass: 'border-sky-400',
    pillGradient: 'from-sky-400 to-indigo-500',
  },
  psychic: {
    namePt: 'Psíquico',
    nameEn: 'Psychic',
    colorHex: '#ef4179',
    bgClass: 'bg-pink-600',
    textClass: 'text-white',
    borderClass: 'border-pink-400',
    pillGradient: 'from-pink-500 to-rose-600',
  },
  bug: {
    namePt: 'Inseto',
    nameEn: 'Bug',
    colorHex: '#91a119',
    bgClass: 'bg-lime-600',
    textClass: 'text-white',
    borderClass: 'border-lime-400',
    pillGradient: 'from-lime-500 to-emerald-600',
  },
  rock: {
    namePt: 'Pedra',
    nameEn: 'Rock',
    colorHex: '#afa981',
    bgClass: 'bg-stone-600',
    textClass: 'text-white',
    borderClass: 'border-stone-500',
    pillGradient: 'from-stone-600 to-stone-700',
  },
  ghost: {
    namePt: 'Fantasma',
    nameEn: 'Ghost',
    colorHex: '#704170',
    bgClass: 'bg-indigo-700',
    textClass: 'text-white',
    borderClass: 'border-indigo-500',
    pillGradient: 'from-indigo-600 to-purple-800',
  },
  dragon: {
    namePt: 'Dragão',
    nameEn: 'Dragon',
    colorHex: '#5060e1',
    bgClass: 'bg-indigo-600',
    textClass: 'text-white',
    borderClass: 'border-indigo-400',
    pillGradient: 'from-indigo-600 to-violet-700',
  },
  steel: {
    namePt: 'Aço',
    nameEn: 'Steel',
    colorHex: '#60a1b8',
    bgClass: 'bg-slate-500',
    textClass: 'text-white',
    borderClass: 'border-slate-400',
    pillGradient: 'from-slate-500 to-zinc-600',
  },
  dark: {
    namePt: 'Sombrio',
    nameEn: 'Dark',
    colorHex: '#50413f',
    bgClass: 'bg-zinc-800',
    textClass: 'text-zinc-100',
    borderClass: 'border-zinc-600',
    pillGradient: 'from-zinc-800 to-neutral-900',
  },
  fairy: {
    namePt: 'Fada',
    nameEn: 'Fairy',
    colorHex: '#ef70ef',
    bgClass: 'bg-rose-400',
    textClass: 'text-slate-950',
    borderClass: 'border-rose-300',
    pillGradient: 'from-pink-400 to-rose-400',
  },
};

export function getTypeMeta(type: string): TypeMeta {
  const normalized = (type || 'normal').toLowerCase() as PokemonType;
  return TYPE_CONFIG[normalized] || TYPE_CONFIG.normal;
}

export function formatStatName(stat: string): { labelPt: string; short: string; color: string } {
  switch (stat.toLowerCase()) {
    case 'hp':
      return { labelPt: 'Pontos de Vida', short: 'HP', color: 'bg-emerald-500' };
    case 'attack':
      return { labelPt: 'Ataque', short: 'ATK', color: 'bg-rose-500' };
    case 'defense':
      return { labelPt: 'Defesa', short: 'DEF', color: 'bg-blue-500' };
    case 'special-attack':
      return { labelPt: 'Ataque Especial', short: 'SP.ATK', color: 'bg-purple-500' };
    case 'special-defense':
      return { labelPt: 'Defesa Especial', short: 'SP.DEF', color: 'bg-teal-500' };
    case 'speed':
      return { labelPt: 'Velocidade', short: 'SPD', color: 'bg-amber-500' };
    default:
      return { labelPt: stat.toUpperCase(), short: stat.substring(0, 3).toUpperCase(), color: 'bg-slate-500' };
  }
}
