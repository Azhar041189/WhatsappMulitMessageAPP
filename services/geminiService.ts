import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateMessageDraft = async (
  topic: string, 
  availableVariables: string[]
): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = "gemini-3-flash-preview";
    
    const prompt = `
      You are a professional WhatsApp marketing copywriter. 
      Write a short, engaging, and friendly WhatsApp message about the following topic: "${topic}".
      
      You MUST use some of the following placeholders where appropriate: ${availableVariables.map(v => `{${v}}`).join(', ')}.
      
      Keep the message under 100 words. Include appropriate emojis. 
      Do not include a subject line. Just the message body.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || "Could not generate message.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error generating message. Please check your API key.";
  }
};

export const cleanContactsData = async (
  rawData: string
): Promise<{ name: string; phone: string }[]> => {
  // Use Gemini to extract structured contact data from unstructured text paste
  try {
    const ai = getAiClient();
    const model = "gemini-3-flash-preview";

    const prompt = `
      Extract a list of contacts from the following text. 
      Return ONLY a valid JSON array of objects with "name" and "phone" properties.
      Normalize phone numbers to international format if possible (remove spaces, dashes).
      If no name is found, use "Friend".
      
      Text to process:
      "${rawData.substring(0, 5000)}"
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini extraction error:", error);
    return [];
  }
}
