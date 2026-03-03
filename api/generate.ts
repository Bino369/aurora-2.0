import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      error: "GEMINI_API_KEY is missing in Vercel.",
      details: "Please add GEMINI_API_KEY to your Vercel Environment Variables."
    });
  }

  try {
    const data = req.body;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate professional website content for a business with the following details:
        Business Name: ${data.businessName}
        Business Type: ${data.businessType}
        Services: ${data.services}
        Target Audience: ${data.targetAudience}
        Contact Email: ${data.email}
        Phone Number: ${data.phone}
        Additional Notes: ${data.notes || 'None'}`,
      config: {
        systemInstruction: "You are an expert copywriter and web designer. Generate structured website content in JSON format.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hero: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                tagline: { type: Type.STRING },
              },
              required: ["headline", "tagline"],
            },
            about: { type: Type.STRING },
            services: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["title", "description"],
              },
            },
            contact: { type: Type.STRING },
            ctaText: { type: Type.STRING },
          },
          required: ["hero", "about", "services", "contact", "ctaText"],
        },
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      },
    });

    const content = JSON.parse(response.text);
    return res.status(200).json(content);
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate content", 
      details: error.message || String(error) 
    });
  }
}
