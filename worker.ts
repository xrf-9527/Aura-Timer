/// <reference types="@cloudflare/workers-types" />
import { GoogleGenAI, Type } from "@google/genai";

interface Env {
    GEMINI_API_KEY: string;
    ASSETS: Fetcher;
}

export default {
    async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
        const url = new URL(request.url);

        // API Route for Gemini
        if (url.pathname === "/api/gemini") {
            if (request.method !== "POST") {
                return new Response("Method Not Allowed", { status: 405 });
            }

            const apiKey = env.GEMINI_API_KEY;
            if (!apiKey) {
                return new Response("Server Configuration Error: GEMINI_API_KEY missing", { status: 500 });
            }

            try {
                const { query } = await request.json() as { query: string };
                if (!query) {
                    return new Response("Missing query", { status: 400 });
                }

                const ai = new GoogleGenAI({ apiKey });
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
                return new Response(text, {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (error) {
                console.error("Worker Error:", error);
                return new Response(JSON.stringify({ error: "Failed to process request" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        // Serve Static Assets (React App)
        // This requires the [assets] configuration in wrangler.toml
        return env.ASSETS.fetch(request);
    },
};
