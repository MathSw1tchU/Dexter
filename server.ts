import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow large payloads for camera captures and high-resolution photo uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in environment variables.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Image Recognition Endpoint
app.post("/api/recognize-pokemon", async (req, res) => {
  try {
    const { image, mimeType = "image/jpeg" } = req.body;

    if (!image || typeof image !== "string") {
      res.status(400).json({
        error: "Nenhuma imagem fornecida para reconhecimento.",
      });
      return;
    }

    // Strip data URL prefix if present
    let base64Data = image;
    let resolvedMimeType = mimeType;

    const dataUrlMatch = image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (dataUrlMatch) {
      resolvedMimeType = dataUrlMatch[1];
      base64Data = dataUrlMatch[2];
    }

    const ai = getGeminiClient();

    const systemPrompt = `Você é a Voz da Pokédex Amiga, o Scanner Biométrico Oficial especializado em reconhecer MINIATURAS E BONEQUINHOS DE POKÉMON!
O usuário é uma CRIANÇA que está apontando a câmera ou enviando a foto de um brinquedo, bonequinho ou miniatura de Pokémon (por exemplo: bonequinhos colecionáveis Tomy, Moncolle, Bandai, Funko Pop, miniaturas de plástico articuladas ou estáticas, brinquedos de batalha, miniaturas seguradas na mãozinha da criança, apoiadas sobre mesa, tapete, cama ou chão).

Sua missão:
1. Identificar com máxima atenção qual é a espécie de Pokémon correspondente àquela miniatura, prestando atenção em detalhes de escultura, cores, orelhinhas, olhos pintados, asas, rabinho e pose do bonequinho.
2. Gerar uma FALA LÚDICA, DIVERTIDA, MÁGICA E AFETIVA especialmente pensada para ser dita em voz alta para uma criança, como a Pokédex falante do anime (estilo Dexter / Rotom Dex amigo)!
3. "pokemonName" DEVE ser o identificador padrão em letras minúsculas exato da PokéAPI oficial (ex: "pikachu", "charizard", "bulbasaur", "squirtle", "eevee", "gengar", "lucario", "greninja", "mewtwo", "snorlax", "jigglypuff", etc.).
4. "identified" deve ser true se houver uma miniatura, brinquedo ou representação de Pokémon visível. Se não for um Pokémon (ex: foto de uma maçã, sapato, carro ou parede vazia), marque false com uma resposta amigável e fofa para a criança.
5. "kidSpokenStory": Um texto lúdico, animado e acolhedor (1 a 3 frases) pronto para ser lido em voz alta pela Pokédex para a criança! Exemplo: "Uau, treinador! Você tem a miniatura do Pikachu! Ele é um ratinho elétrico super fofo que guarda choquinhos de amizade nas bochechinhas vermelhas! Quando ele fica feliz, dá pulinhos elétricos!"
6. "funFactKid": Uma curiosidade divertida, mágica ou engraçada contada de um jeito fácil para criança entender.
7. "kidTip": Uma dica carinhosa de como brincar ou cuidar desse Pokémon no time de faz-de-conta.
8. "miniatureDetails": Um comentário fofo sobre o bonequinho detectado (ex: "Miniatura simpática com pose de batalha", "Bonequinho amarelo com orelhinhas pontudas").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: resolvedMimeType,
              data: base64Data,
            },
          },
          {
            text: "Identifique esta miniatura de Pokémon e crie a narração lúdica falada para uma criança.",
          },
        ],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identified: {
              type: Type.BOOLEAN,
              description: "Indica se uma miniatura ou Pokémon foi identificado na imagem.",
            },
            pokemonName: {
              type: Type.STRING,
              description: "Nome oficial do Pokémon em minúsculas para consulta na PokeAPI (ex: 'pikachu', 'charizard').",
            },
            displayName: {
              type: Type.STRING,
              description: "Nome formatado para exibição com letra maiúscula.",
            },
            nationalDexNumber: {
              type: Type.INTEGER,
              description: "Número na Pokédex Nacional caso identificado, ou 0 se desconhecido.",
            },
            confidence: {
              type: Type.NUMBER,
              description: "Porcentagem de certeza do escaneamento de 0 a 100.",
            },
            isShiny: {
              type: Type.BOOLEAN,
              description: "Se a miniatura apresenta coloração brilhante (Shiny).",
            },
            formOrVariant: {
              type: Type.STRING,
              description: "Forma ou variante detectada (ex: 'Normal', 'Alola', 'Galar', 'Mega').",
            },
            miniatureDetails: {
              type: Type.STRING,
              description: "Detalhes do bonequinho ou miniatura analisada.",
            },
            kidSpokenStory: {
              type: Type.STRING,
              description: "Narração carinhosa e animada para a Pokédex falar em voz alta com a criança.",
            },
            funFactKid: {
              type: Type.STRING,
              description: "Curiosidade divertida e surpreendente para crianças.",
            },
            kidTip: {
              type: Type.STRING,
              description: "Dica amigável de treinador mirim.",
            },
            visualFeatures: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Traços visuais observados na miniatura (em português).",
            },
            dexAnalysis: {
              type: Type.STRING,
              description: "Relatório de escaneamento amigável e tecnológico.",
            },
            alternativeCandidates: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Outros possíveis candidatos semelhantes se houver dúvida.",
            },
          },
          required: [
            "identified",
            "pokemonName",
            "displayName",
            "confidence",
            "kidSpokenStory",
            "funFactKid",
            "kidTip",
            "visualFeatures",
            "dexAnalysis",
          ],
        },
      },
    });

    const rawText = response.text || "{}";
    const result = JSON.parse(rawText);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("Erro ao reconhecer miniatura de Pokémon via IA:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Falha ao processar o reconhecimento da miniatura.",
    });
  }
});

// Endpoint to generate a playful kid speech story for any selected Pokémon on-demand
app.post("/api/kid-story", async (req, res) => {
  try {
    const { pokemonName, genus, types = [], flavorText = "" } = req.body;

    if (!pokemonName) {
      res.status(400).json({ error: "Nome do Pokémon é obrigatório." });
      return;
    }

    const ai = getGeminiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: `Gere a fala falada da Pokédex para uma criança sobre o Pokémon ${pokemonName} (${genus || "Pokémon"}, tipos: ${types.join(", ")}).
Contexto do jogo: "${flavorText}".
Fale diretamente com uma criança de 5 a 10 anos em Português do Brasil com muito carinho, empolgação e imaginação!
Retorne JSON com:
- kidSpokenStory: A fala alegre e envolvente da Pokédex pronta para ser lida em voz alta (2 a 3 frases).
- funFactKid: Uma curiosidade muito legal e divertida.
- kidTip: Uma dica de como ser amigo desse Pokémon.
- sizeComparison: Uma comparação de tamanho simples que criança entende (ex: "do tamanho de um gatinho", "mais alto que uma geladeira").`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kidSpokenStory: { type: Type.STRING },
            funFactKid: { type: Type.STRING },
            kidTip: { type: Type.STRING },
            sizeComparison: { type: Type.STRING },
          },
          required: ["kidSpokenStory", "funFactKid", "kidTip", "sizeComparison"],
        },
      },
    });

    const data = JSON.parse(response.text || "{}");
    res.json({ success: true, data });
  } catch (err: any) {
    console.error("Erro ao gerar história lúdica:", err);
    res.status(500).json({ success: false, error: err?.message });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pokédex Server] Executando em http://localhost:${PORT}`);
  });
}

startServer();
