import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getDurationFromQuery = async (query: string): Promise<number | null> => {
  if (!ai) {
    console.error("Gemini API Key is missing.");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `User wants to set a timer for: "${query}". Determine the appropriate duration in seconds.`,
      config: {
        systemInstruction: "You are a helpful timer assistant. You interpret natural language requests for time duration (e.g., 'boil pasta', '20 minutes', 'pomodoro') and return the duration in seconds. If the request is vague, estimate a standard time. If the request is invalid, return 0.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seconds: {
              type: Type.INTEGER,
              description: "The duration in seconds.",
            },
          },
          required: ["seconds"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;

    const data = JSON.parse(text);
    return data.seconds > 0 ? data.seconds : null;

  } catch (error) {
    console.error("Error fetching duration from Gemini:", error);
    return null;
  }
};
