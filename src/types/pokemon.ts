export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'steel'
  | 'dark'
  | 'fairy';

export interface PokemonStat {
  name: string;
  base_stat: number;
  effort: number;
}

export interface PokemonAbilityInfo {
  name: string;
  is_hidden: boolean;
  slot: number;
  effect?: string;
  short_effect?: string;
}

export interface PokemonMoveInfo {
  name: string;
  learn_method: string;
  level_learned_at: number;
  type?: PokemonType;
  power?: number | null;
  accuracy?: number | null;
  damage_class?: string;
}

export interface PokemonSummary {
  id: number;
  name: string;
  displayName: string;
  sprite: string;
  artwork: string;
  types: PokemonType[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  displayName: string;
  height: number; // in meters
  weight: number; // in kg
  baseExperience: number;
  types: PokemonType[];
  stats: PokemonStat[];
  totalStats: number;
  abilities: PokemonAbilityInfo[];
  sprites: {
    artwork: string;
    artworkShiny: string;
    showdownAnimated?: string;
    showdownAnimatedShiny?: string;
    pixelFront: string;
    pixelShiny: string;
  };
  cryUrl?: string;
  moves: PokemonMoveInfo[];
  speciesUrl: string;
}

export interface PokemonSpeciesInfo {
  id: number;
  name: string;
  genus: string; // e.g. "Pokémon Rato"
  flavorTextPt?: string;
  flavorTextEn?: string;
  habitat?: string;
  captureRate: number; // 0-255
  baseHappiness: number;
  growthRate: string;
  isLegendary: boolean;
  isMythical: boolean;
  generation: string;
  evolutionChainUrl?: string;
  eggGroups: string[];
}

export interface EvolutionStep {
  id: number;
  name: string;
  displayName: string;
  sprite: string;
  artwork: string;
  types: PokemonType[];
  trigger?: {
    method: string;
    minLevel?: number;
    item?: string;
    happiness?: number;
    timeOfDay?: string;
    details?: string;
  };
  evolvesTo: EvolutionStep[];
}

export interface AiScanResult {
  identified: boolean;
  pokemonName: string;
  displayName: string;
  nationalDexNumber?: number;
  confidence: number;
  isShiny?: boolean;
  formOrVariant?: string;
  miniatureDetails?: string;
  kidSpokenStory?: string;
  funFactKid?: string;
  kidTip?: string;
  visualFeatures: string[];
  dexAnalysis: string;
  alternativeCandidates?: string[];
}

export interface PokemonKidStory {
  kidSpokenStory: string;
  funFactKid: string;
  kidTip: string;
  sizeComparison: string;
}
