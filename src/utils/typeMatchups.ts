import { PokemonType } from '../types/pokemon';

// Standard Pokemon Gen 6+ Type Chart
// Attacking type -> Defending type multipliers
const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  electric: { water: 2, grass: 0.5, electric: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, grass: 0.5, electric: 2, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { grass: 2, electric: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'steel', 'dark', 'fairy',
];

export interface MatchupSummary {
  superWeak: PokemonType[]; // 4x
  weak: PokemonType[]; // 2x
  normal: PokemonType[]; // 1x
  resistant: PokemonType[]; // 0.5x
  superResistant: PokemonType[]; // 0.25x
  immune: PokemonType[]; // 0x
}

export function calculateDefensiveMatchups(defendingTypes: PokemonType[]): MatchupSummary {
  const result: MatchupSummary = {
    superWeak: [],
    weak: [],
    normal: [],
    resistant: [],
    superResistant: [],
    immune: [],
  };

  if (!defendingTypes || defendingTypes.length === 0) {
    return result;
  }

  for (const attackingType of ALL_TYPES) {
    let multiplier = 1;

    for (const defType of defendingTypes) {
      const typeAttacks = TYPE_CHART[attackingType];
      if (typeAttacks && typeAttacks[defType] !== undefined) {
        multiplier *= typeAttacks[defType]!;
      }
    }

    if (multiplier === 0) {
      result.immune.push(attackingType);
    } else if (multiplier >= 4) {
      result.superWeak.push(attackingType);
    } else if (multiplier >= 2) {
      result.weak.push(attackingType);
    } else if (multiplier === 1) {
      result.normal.push(attackingType);
    } else if (multiplier <= 0.25) {
      result.superResistant.push(attackingType);
    } else if (multiplier < 1) {
      result.resistant.push(attackingType);
    }
  }

  return result;
}
