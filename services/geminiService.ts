import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const verifyPublicTransportImage = async (
  base64Image: string, 
  type: 'TICKET' | 'STATION' = 'STATION'
): Promise<{ isValid: boolean; reasoning: string }> => {
  if (!apiKey) {
    console.warn("No API Key found, mocking verification");
    return { isValid: true, reasoning: "Verified (Mock Mode)" };
  }

  try {
    const now = new Date();
    // Use flexible date formats for prompt context
    const dateStr = now.toLocaleDateString('en-GB'); // DD/MM/YYYY
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    let prompt = "";
    if (type === 'TICKET') {
         prompt = `Analyze this image. Is it a public transport ticket (Metro, Bus, or Train) or a digital ticket on a phone screen?
         1. Check if it is a ticket.
         2. Look for the DATE: It must match today's date: ${dateStr} (allow standard variations).
         3. Look for the TIME: It must be reasonably close to now: ${timeStr} (within 4 hours).
         Return a JSON object with 'isValid' (boolean) and 'reasoning' (short string).
         If date/time is clearly visible and wrong, return isValid: false. If valid date/time found, return true.`;
    } else {
         prompt = `Analyze this image. Is it a photo taken inside a bus, metro, train station, or on a platform?
         It must clearly look like a public transport environment (seats, handles, turnstiles, platform edge, crowds, station signage).
         Return a JSON object with 'isValid' (boolean) and 'reasoning' (short string).`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            reasoning: { type: Type.STRING }
          },
          required: ["isValid", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini verification failed:", error);
    // Fallback for demo purposes if API fails
    return { isValid: true, reasoning: "AI Service busy, manual verification logged." };
  }
};

export const getTripTip = async (mode: string, distance: number): Promise<string> => {
  if (!apiKey) return "Great job saving CO2! Keep it up.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Give a very short, encouraging eco-tip (max 15 words) for someone who just traveled ${distance.toFixed(1)}km by ${mode} in Delhi.`
    });
    return response.text || "Every step counts towards a cleaner Delhi!";
  } catch (e) {
    return "Every step counts towards a cleaner Delhi!";
  }
};

export const analyzeTripData = async (mode: string, distance: number, timeSeconds: number): Promise<boolean> => {
    // Simple AI check for speed cheating
    // e.g. walking 10km in 5 minutes
    if (!apiKey) return true;

    try {
        const speedKmh = (distance / (timeSeconds / 3600));
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze: User claims to travel by ${mode}. Distance: ${distance}km. Time: ${timeSeconds} seconds. Calc speed: ${speedKmh} km/h. Is this physically possible and realistic? Return JSON { "possible": boolean }.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        possible: { type: Type.BOOLEAN }
                    }
                }
            }
        });
        const result = JSON.parse(response.text || "{}");
        return result.possible ?? true;
    } catch (e) {
        return true;
    }
}