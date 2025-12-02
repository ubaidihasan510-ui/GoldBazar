import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
  // NOTE: In a real production app, never expose API keys on the client.
  // This should be proxied through a backend. 
  // For this demo, we assume the env var is available.
  const apiKey = process.env.API_KEY || ''; 
  if (!apiKey) {
    console.warn("Gemini API Key missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getMarketInsight = async (currentPrice: number): Promise<string> => {
  const client = getGeminiClient();
  if (!client) return "Market data currently unavailable due to missing API configuration.";

  try {
    const prompt = `
      The current gold price in Bangladesh is ${currentPrice} BDT per gram.
      Act as a senior financial analyst for the gold market.
      Provide a 2-sentence market insight for a retail investor. 
      Is it a good time to buy? Mention a fictional but plausible global economic trend (e.g., inflation, dollar rate, oil prices) affecting this.
      Keep it professional, concise, and encouraging but responsible.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Gold remains a stable asset amidst global market fluctuations.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Market analysis temporarily unavailable.";
  }
};
