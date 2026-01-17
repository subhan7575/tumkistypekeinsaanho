import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  runtime: 'nodejs',
};

export default async function handler(req: any, res: any) {
  // Sirf POST request allow karein
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Vercel Environment Variable safety check
  const apiKey = (process.env.API_KEY || '').trim().replace(/^["']|["']$/g, '');

  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API_KEY is missing. Sir, Vercel ki settings mein check karein aur Redeploy karein.' 
    });
  }

  try {
    const { image, lang } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Clean Base64 (remove prefix)
    const base64Data = image.split(',')[1] || image;

    const prompt = lang === 'hi' 
      ? "Analyze this face for personality. Be bold, edgy, and honest. Use Roman Urdu. Return ONLY JSON: {title, description, reportDescription, darkLine, traits[], weaknesses[]}"
      : "Analyze this face for personality. Return ONLY JSON: {title, description, reportDescription, darkLine, traits[], weaknesses[]}";

    const result = await model.generateContent([
      { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
      { text: prompt }
    ]);

    const responseText = await result.response.text();
    
    // JSON Extracting logic (to avoid "Unexpected Token A")
    const cleanedJson = responseText.substring(
      responseText.indexOf('{'),
      responseText.lastIndexOf('}') + 1
    );

    return res.status(200).json(JSON.parse(cleanedJson));

  } catch (error: any) {
    console.error("MIKE_SYSTEM_LOG:", error);
    // Hamesha JSON return karein taake frontend "Unexpected Token" error na de
    return res.status(500).json({ 
      error: "Sir, AI Engine ne error diya: " + (error.message || "Unknown error")
    });
  }
}
