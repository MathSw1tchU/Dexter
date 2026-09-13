import { PokemonDetail, PokemonSpeciesInfo, PokemonKidStory, PokemonType } from '../types/pokemon';
import { getTypeMeta } from './typeColors';

// Cached dynamic stories to avoid re-fetching the same pokemon
const kidStoryCache = new Map<number, PokemonKidStory>();

// Generate playful size comparison based on height and weight
export function getKidSizeComparison(heightM: number, weightKg: number): string {
  let heightText = '';
  if (heightM <= 0.3) {
    heightText = 'pequenininho como uma caneca de chocolate quente';
  } else if (heightM <= 0.6) {
    heightText = 'do tamanho de um gatinho fofinho ou uma mochila escolar';
  } else if (heightM <= 1.0) {
    heightText = 'da altura de uma cadeira ou de um cachorrinho pequeno';
  } else if (heightM <= 1.4) {
    heightText = 'quase da sua altura, como um amigo de escola';
  } else if (heightM <= 1.9) {
    heightText = 'mais alto que o papai ou a mamãe';
  } else {
    heightText = 'gigantesco como uma árvore ou um ônibus escolar';
  }

  let weightText = '';
  if (weightKg <= 2) {
    weightText = 'levinho que cabe na palma da sua mão';
  } else if (weightKg <= 10) {
    weightText = 'pesa o mesmo que uma melancia docinha';
  } else if (weightKg <= 30) {
    weightText = 'pesa quase o mesmo que uma criança de 7 anos';
  } else if (weightKg <= 70) {
    weightText = 'pesa como um adulto bem forte';
  } else {
    weightText = 'pesadão como uma geladeira cheia de sorvete';
  }

  return `Ele é ${heightText} e ${weightText}!`;
}

// Generate instant kid-friendly speech story
export function generateLocalKidStory(
  pokemon: PokemonDetail,
  species: PokemonSpeciesInfo | null
): PokemonKidStory {
  const name = pokemon.displayName;
  const genus = species?.genus || 'Pokémon Amigo';
  const primaryType = pokemon.types[0] as PokemonType;
  const primaryMeta = getTypeMeta(primaryType);

  const sizeComparison = getKidSizeComparison(pokemon.height, pokemon.weight);

  // Type specific playful commentary
  const typePhrases: Record<PokemonType, string> = {
    normal: 'Ele é super companheiro e adora brincar de pega-pega no parque!',
    fire: 'Ele é quentinho e cheio de energia! Adora fazer fogueiras de faz-de-conta e soltar faíscas brilhantes!',
    water: 'Ele ama nadar na água, dar cambalhotas na piscina e fazer bolhas coloridas!',
    grass: 'Ele adora tomar sol no jardim, cheirar flores e proteger as plantinhas da natureza!',
    electric: 'Ele tem bochechas ou patinhas elétricas que dão choquinhos de cócegas quando ele fica feliz!',
    ice: 'Ele adora comer raspadinha de gelo e patinar no frio!',
    fighting: 'Ele é muito forte, adora fazer ginástica e nunca foge de um desafio heroico!',
    poison: 'Ele tem cores bem chamativas e adora brincar com poções mágicas na floresta!',
    ground: 'Ele adora cavar buracos na terra e brincar no castelinho de areia!',
    flying: 'Ele adora voar bem alto entre as nuvens e sentir o ventinho soprando nas asas!',
    psychic: 'Ele tem super poderes mágicos na mente e consegue fazer brinquedos flutuarem no ar!',
    bug: 'Ele é pequenino, curioso e adora escalar galhinhos em busca de doces frutinhas!',
    rock: 'Ele é durinho como uma pedrinha da sorte e muito resistente!',
    ghost: 'Ele é travesso e adora brincar de esconde-esconde no escuro para dar sustinhos de rir!',
    dragon: 'Ele é um mini dragão lendário com coração nobre, leal a quem lhe dá carinho!',
    steel: 'Seu corpinho brilha como uma armadura de cavaleiro!',
    dark: 'Ele parece misterioso, mas é um amigo muito protetor que vigia o seu sono!',
    fairy: 'Ele parece uma fada mágica saída de um conto infantil, trazendo alegria e purpurina!',
  };

  const typeDesc = typePhrases[primaryType] || 'Ele é um companheiro mágico e leal!';

  const kidSpokenStory = `Olá, jovem treinador! Este é o ${name}, o ${genus} do tipo ${primaryMeta.namePt}! ${typeDesc} ${sizeComparison}`;

  // Fun facts for iconic ones or procedurally
  let funFactKid = `Sabia que o ${name} é conhecido por ser um companheiro leal? Se você for bonzinho com ele, ele sempre vai te proteger nas brincadeiras!`;
  if (pokemon.name === 'pikachu') {
    funFactKid = 'Sabia que quando dois Pikachus se encontram, eles encostam as caudas para trocar choquinhos de cumprimento como se fosse um aperto de mão?';
  } else if (pokemon.name === 'charizard') {
    funFactKid = 'A chama na pontinha da cauda do Charizard brilha mais forte e quentinha quando ele está muito animado e feliz!';
  } else if (pokemon.name === 'bulbasaur') {
    funFactKid = 'O bulbo nas costas dele vai se abrindo e crescendo conforme ele toma solzinho no quintal com você!';
  } else if (pokemon.name === 'squirtle') {
    funFactKid = 'O casco arredondado dele permite que ele deslize na água tão rápido quanto uma prancha de surf!';
  } else if (pokemon.name === 'eevee') {
    funFactKid = 'O Eevee tem o pelo super macio como um ursinho de pelúcia e pode se transformar em 8 Pokémon diferentes!';
  } else if (pokemon.name === 'gengar') {
    funFactKid = 'O Gengar adora se disfarçar na sua sombra para te acompanhar sem ninguém perceber!';
  } else if (species?.flavorTextPt) {
    funFactKid = `Curiosidade da Pokédex: ${species.flavorTextPt.replace(/[\n\r]+/g, ' ')}`;
  }

  const kidTip = `Dica de amigo: Brinque bastante com a sua miniatura de ${name} e imagine batalhas épicas no seu quarto!`;

  return {
    kidSpokenStory,
    funFactKid,
    kidTip,
    sizeComparison,
  };
}

// Fetch dynamic story from server (Gemini powered) with graceful fallback
export async function getKidStory(
  pokemon: PokemonDetail,
  species: PokemonSpeciesInfo | null
): Promise<PokemonKidStory> {
  if (kidStoryCache.has(pokemon.id)) {
    return kidStoryCache.get(pokemon.id)!;
  }

  const localFallback = generateLocalKidStory(pokemon, species);

  try {
    const res = await fetch('/api/kid-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pokemonName: pokemon.displayName,
        genus: species?.genus || 'Pokémon',
        types: pokemon.types,
        flavorText: species?.flavorTextPt || species?.flavorTextEn || '',
      }),
    });

    if (!res.ok) {
      kidStoryCache.set(pokemon.id, localFallback);
      return localFallback;
    }

    const json = await res.json();
    if (json.success && json.data) {
      const enriched: PokemonKidStory = {
        kidSpokenStory: json.data.kidSpokenStory || localFallback.kidSpokenStory,
        funFactKid: json.data.funFactKid || localFallback.funFactKid,
        kidTip: json.data.kidTip || localFallback.kidTip,
        sizeComparison: json.data.sizeComparison || localFallback.sizeComparison,
      };
      kidStoryCache.set(pokemon.id, enriched);
      return enriched;
    }
  } catch {
    // Network or server error -> fallback
  }

  kidStoryCache.set(pokemon.id, localFallback);
  return localFallback;
}
