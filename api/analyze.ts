import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Auto-detect API_KEY from environment (Vercel, Local .env, GitHub, etc.)
  let apiKey = process.env.API_KEY || '';
  
  // Clean the key: remove spaces or accidental quotes
  apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

  if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
    return res.status(500).json({ 
      error: 'API_KEY missing or invalid. Please set your API_KEY in the environment variables or .env file and restart/redeploy.' 
    });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }
    }

    const { image, lang } = body;
    if (!image) {
      return res.status(400).json({ error: 'No image data provided for analysis.' });
    }
    
    const ai = new GoogleGenAI({ apiKey });

    const instructions = lang === 'hi'
      ? `You are the 'Sachi Baat' Personality Engine. Analyze facial features for true character traits. 
         Be extremely honest, bold, and edgy. 
         ALL TEXT OUTPUT MUST BE IN ROMAN URDU (Urdu in English script).
         JSON structure:
         - title: Catchy Roman Urdu title.
         - description: 1-line sharp summary.
         - reportDescription: 3 sentences of analysis.
         - darkLine: A poetic Sher in Roman Urdu.
         - traits: 5 strengths.
         - weaknesses: 4 flaws.`
      : `Analyze facial features for personality traits. Be unfiltered.
         JSON structure:
         - title: Bold title.
         - description: 1-line summary.
         - reportDescription: 3 sentences of analysis.
         - darkLine: Philosophical quote.
         - traits: 5 strengths.
         - weaknesses: 4 flaws.`;

    // Using gemini-3-flash-preview for high performance
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: image, mimeType: 'image/jpeg' } },
          { text: "Analyze this person's character based on biometric facial markers. Give honest results." }
        ]
      },
      config: {
        systemInstruction: instructions,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            reportDescription: { type: Type.STRING },
            darkLine: { type: Type.STRING },
            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["title", "description", "reportDescription", "darkLine", "traits", "weaknesses"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("The AI model returned no content.");

    return res.status(200).json(JSON.parse(text));

  } catch (error: any) {
    console.error('API Error:', error);
    
    let message = error.message || 'Server Error occurred during analysis.';
    
    if (message.includes('API key not valid') || message.includes('400')) {
      message = "The provided API Key is not valid. Please check your API_KEY configuration.";
    }

    return res.status(500).json({ error: message });
  }
}
