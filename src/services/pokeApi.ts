import {
  EvolutionStep,
  PokemonDetail,
  PokemonMoveInfo,
  PokemonSpeciesInfo,
  PokemonStat,
  PokemonSummary,
  PokemonType,
} from '../types/pokemon';

const POKEAPI_BASE = 'https://pokeapi.co/api/v2';

// Memory cache to prevent redundant network requests and provide instant responsiveness
const pokemonCache = new Map<string | number, PokemonDetail>();
const speciesCache = new Map<string | number, PokemonSpeciesInfo>();
const evolutionCache = new Map<string, EvolutionStep>();

// Format pokemon name nicely (e.g., "tapu-koko" -> "Tapu Koko", "mr-mime" -> "Mr. Mime")
export function formatPokemonName(name: string): string {
  if (!name) return '';
  const specialNames: Record<string, string> = {
    'mr-mime': 'Mr. Mime',
    'mime-jr': 'Mime Jr.',
    'mr-rime': 'Mr. Rime',
    'type-null': 'Type: Null',
    'tapu-koko': 'Tapu Koko',
    'tapu-lele': 'Tapu Lele',
    'tapu-bulu': 'Tapu Bulu',
    'tapu-fini': 'Tapu Fini',
    'great-tusk': 'Great Tusk',
    'scream-tail': 'Scream Tail',
    'brute-bonnet': 'Brute Bonnet',
    'flutter-mane': 'Flutter Mane',
    'slither-wing': 'Slither Wing',
    'sandy-shocks': 'Sandy Shocks',
    'iron-treads': 'Iron Treads',
    'iron-bundle': 'Iron Bundle',
    'iron-hands': 'Iron Hands',
    'iron-jugulis': 'Iron Jugulis',
    'iron-moth': 'Iron Moth',
    'iron-thorns': 'Iron Thorns',
    'roaring-moon': 'Roaring Moon',
    'iron-valiant': 'Iron Valiant',
    'walking-wake': 'Walking Wake',
    'iron-leaves': 'Iron Leaves',
    'gouging-fire': 'Gouging Fire',
    'raging-bolt': 'Raging Bolt',
    'iron-boulder': 'Iron Boulder',
    'iron-crown': 'Iron Crown',
    'wo-chien': 'Wo-Chien',
    'chien-pao': 'Chien-Pao',
    'ting-lu': 'Ting-Lu',
    'chi-yu': 'Chi-Yu',
    'ho-oh': 'Ho-Oh',
    'porygon-z': 'Porygon-Z',
    'jangmo-o': 'Jangmo-o',
    'hakamo-o': 'Hakamo-o',
    'kommo-o': 'Kommo-o',
  };

  const lower = name.toLowerCase();
  if (specialNames[lower]) {
    return specialNames[lower];
  }

  return name
    .split('-')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

// Clean up pokedex flavor text with carriage returns
function cleanFlavorText(text: string): string {
  return text
    .replace(/[\n\f\r\t]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Fetch single Pokemon by id or name
export async function getPokemonDetail(idOrName: string | number): Promise<PokemonDetail> {
  const key = String(idOrName).toLowerCase();
  if (pokemonCache.has(key)) {
    return pokemonCache.get(key)!;
  }

  const res = await fetch(`${POKEAPI_BASE}/pokemon/${encodeURIComponent(key)}`);
  if (!res.ok) {
    throw new Error(`Pokémon '${idOrName}' não foi encontrado no banco de dados da PokéAPI.`);
  }

  const data = await res.json();

  const types = data.types.map((t: any) => t.type.name as PokemonType);

  const stats: PokemonStat[] = data.stats.map((s: any) => ({
    name: s.stat.name,
    base_stat: s.base_stat,
    effort: s.effort,
  }));

  const totalStats = stats.reduce((acc, curr) => acc + curr.base_stat, 0);

  const abilities = data.abilities.map((a: any) => ({
    name: a.ability.name,
    is_hidden: a.is_hidden,
    slot: a.slot,
  }));

  const officialArtwork =
    data.sprites?.other?.['official-artwork']?.front_default ||
    data.sprites?.other?.home?.front_default ||
    data.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`;

  const officialArtworkShiny =
    data.sprites?.other?.['official-artwork']?.front_shiny ||
    data.sprites?.other?.home?.front_shiny ||
    data.sprites?.front_shiny ||
    officialArtwork;

  const showdownAnimated = data.sprites?.other?.showdown?.front_default || undefined;
  const showdownAnimatedShiny = data.sprites?.other?.showdown?.front_shiny || undefined;

  const cryUrl =
    data.cries?.latest ||
    `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${data.id}.ogg`;

  const moves: PokemonMoveInfo[] = (data.moves || [])
    .slice(0, 24)
    .map((m: any) => {
      const versionDetail = m.version_group_details?.[m.version_group_details.length - 1];
      return {
        name: m.move.name,
        learn_method: versionDetail?.move_learn_method?.name || 'level-up',
        level_learned_at: versionDetail?.level_learned_at || 0,
      };
    });

  const pokemon: PokemonDetail = {
    id: data.id,
    name: data.name,
    displayName: formatPokemonName(data.name),
    height: data.height / 10, // meters
    weight: data.weight / 10, // kg
    baseExperience: data.base_experience || 0,
    types,
    stats,
    totalStats,
    abilities,
    sprites: {
      artwork: officialArtwork,
      artworkShiny: officialArtworkShiny,
      showdownAnimated,
      showdownAnimatedShiny,
      pixelFront: data.sprites?.front_default || officialArtwork,
      pixelShiny: data.sprites?.front_shiny || officialArtworkShiny,
    },
    cryUrl,
    moves,
    speciesUrl: data.species?.url,
  };

  pokemonCache.set(data.id, pokemon);
  pokemonCache.set(data.name.toLowerCase(), pokemon);
  return pokemon;
}

// Fetch Species Info (Lore, genus, habitat, evolution chain)
export async function getPokemonSpecies(idOrName: string | number): Promise<PokemonSpeciesInfo> {
  const key = String(idOrName).toLowerCase();
  if (speciesCache.has(key)) {
    return speciesCache.get(key)!;
  }

  const res = await fetch(`${POKEAPI_BASE}/pokemon-species/${encodeURIComponent(key)}`);
  if (!res.ok) {
    throw new Error(`Informações da espécie '${idOrName}' não puderam ser carregadas.`);
  }

  const data = await res.json();

  // Find genus in pt/pt-BR or en
  const ptGenus = data.genera?.find((g: any) => g.language?.name === 'pt' || g.language?.name === 'pt-BR');
  const enGenus = data.genera?.find((g: any) => g.language?.name === 'en');
  const genus = ptGenus?.genus || enGenus?.genus || 'Pokémon';

  // Find flavor text in pt/pt-BR or en
  const ptFlavors = data.flavor_text_entries?.filter(
    (f: any) => f.language?.name === 'pt' || f.language?.name === 'pt-BR'
  );
  const enFlavors = data.flavor_text_entries?.filter((f: any) => f.language?.name === 'en');

  const flavorTextPt = ptFlavors?.length > 0 ? cleanFlavorText(ptFlavors[ptFlavors.length - 1].flavor_text) : undefined;
  const flavorTextEn = enFlavors?.length > 0 ? cleanFlavorText(enFlavors[enFlavors.length - 1].flavor_text) : undefined;

  const generationName = data.generation?.name ? formatPokemonName(data.generation.name) : 'Gen I';
  const eggGroups = (data.egg_groups || []).map((eg: any) => formatPokemonName(eg.name));

  const speciesInfo: PokemonSpeciesInfo = {
    id: data.id,
    name: data.name,
    genus,
    flavorTextPt,
    flavorTextEn,
    habitat: data.habitat?.name ? formatPokemonName(data.habitat.name) : undefined,
    captureRate: data.capture_rate || 45,
    baseHappiness: data.base_happiness || 50,
    growthRate: data.growth_rate?.name ? formatPokemonName(data.growth_rate.name) : 'Médio',
    isLegendary: Boolean(data.is_legendary),
    isMythical: Boolean(data.is_mythical),
    generation: generationName,
    evolutionChainUrl: data.evolution_chain?.url,
    eggGroups,
  };

  speciesCache.set(data.id, speciesInfo);
  speciesCache.set(data.name.toLowerCase(), speciesInfo);
  return speciesInfo;
}

// Extract Pokemon ID from PokeAPI URL (e.g. https://pokeapi.co/api/v2/pokemon-species/25/ -> 25)
function extractIdFromUrl(url: string): number {
  const parts = url.split('/').filter(Boolean);
  const idStr = parts[parts.length - 1];
  return parseInt(idStr, 10) || 1;
}

// Fetch & Parse Evolution Chain
export async function getEvolutionChain(chainUrl: string): Promise<EvolutionStep | null> {
  if (!chainUrl) return null;
  if (evolutionCache.has(chainUrl)) {
    return evolutionCache.get(chainUrl)!;
  }

  try {
    const res = await fetch(chainUrl);
    if (!res.ok) return null;
    const data = await res.json();

    async function parseNode(node: any): Promise<EvolutionStep> {
      const speciesId = extractIdFromUrl(node.species.url);
      const name = node.species.name;
      const displayName = formatPokemonName(name);

      const artwork = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
      const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;

      // Parse trigger
      let triggerInfo: EvolutionStep['trigger'];
      if (node.evolution_details && node.evolution_details.length > 0) {
        const detail = node.evolution_details[0];
        const method = detail.trigger?.name || 'level-up';
        const minLevel = detail.min_level;
        const item = detail.item?.name ? formatPokemonName(detail.item.name) : undefined;
        const happiness = detail.min_happiness;
        const timeOfDay = detail.time_of_day;

        let details = '';
        if (minLevel) details = `Nível ${minLevel}`;
        else if (item) details = `Item: ${item}`;
        else if (happiness) details = `Amizade Alta`;
        else if (method === 'trade') details = `Troca`;
        else details = formatPokemonName(method);

        triggerInfo = {
          method,
          minLevel,
          item,
          happiness,
          timeOfDay,
          details,
        };
      }

      // Recursively parse next stages
      const evolvesTo: EvolutionStep[] = [];
      if (node.evolves_to && node.evolves_to.length > 0) {
        for (const nextNode of node.evolves_to) {
          evolvesTo.push(await parseNode(nextNode));
        }
      }

      return {
        id: speciesId,
        name,
        displayName,
        sprite,
        artwork,
        types: [], // Can be loaded on demand or lazily
        trigger: triggerInfo,
        evolvesTo,
      };
    }

    const result = await parseNode(data.chain);
    evolutionCache.set(chainUrl, result);
    return result;
  } catch (err) {
    console.warn('Erro ao carregar cadeia evolutiva:', err);
    return null;
  }
}

// Fetch initial list of Pokemon (e.g. 151 default, with support for offset & limit)
export async function getPokemonList(limit = 151, offset = 0): Promise<PokemonSummary[]> {
  const res = await fetch(`${POKEAPI_BASE}/pokemon?limit=${limit}&offset=${offset}`);
  if (!res.ok) {
    throw new Error('Falha ao listar Pokémon da PokéAPI.');
  }
  const data = await res.json();

  return data.results.map((item: any, index: number) => {
    const id = offset + index + 1;
    return {
      id,
      name: item.name,
      displayName: formatPokemonName(item.name),
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      types: [],
    };
  });
}
