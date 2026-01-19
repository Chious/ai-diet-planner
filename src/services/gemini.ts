export type GeminiFoodAnalysis = {
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
  };
};

export type GeminiImagePayload = {
  base64Image: string;
  mimeType?: string;
};

const MOCK_RESULT: GeminiFoodAnalysis = {
  name: "Braised Pork Rice",
  calories: 650,
  macros: {
    protein: 28,
    carbs: 72,
    fats: 18,
  },
};

function shouldMockGemini(): boolean {
  if (process.env.EXPO_PUBLIC_MOCK_GEMINI === "true") {
    return true;
  }

  const globalMocks = (globalThis as { __DETOX_MOCKS__?: { gemini?: boolean } })
    .__DETOX_MOCKS__;
  return Boolean(globalMocks?.gemini);
}

function extractJson(text: string): GeminiFoodAnalysis {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || start >= end) {
    throw new Error("Gemini response did not include JSON.");
  }

  const jsonText = text.slice(start, end + 1);
  const parsed = JSON.parse(jsonText) as GeminiFoodAnalysis;

  if (!parsed?.name || !parsed?.calories || !parsed?.macros) {
    throw new Error("Gemini response JSON missing required fields.");
  }

  return parsed;
}

export async function analyzeFoodImage({
  base64Image,
  mimeType = "image/jpeg",
}: GeminiImagePayload): Promise<GeminiFoodAnalysis> {
  if (shouldMockGemini()) {
    return MOCK_RESULT;
  }

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key is missing. Falling back to mock response.");
    return MOCK_RESULT;
  }

  const prompt = [
    "You are a nutrition assistant.",
    "Analyze the food photo and return JSON only:",
    "{",
    '  "name": "Dish Name",',
    '  "calories": 123,',
    '  "macros": { "protein": 10, "carbs": 20, "fats": 5 }',
    "}",
    "Respond with JSON only, no Markdown.",
  ].join("\n");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 256,
        },
      }),
    }
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini API error: ${message}`);
  }

  const payload = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini response missing content.");
  }

  return extractJson(text);
}
