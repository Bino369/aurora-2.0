import { GoogleGenAI } from "@google/genai";
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    const request = req.body;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a complete, standalone single-file HTML website for:
        Business Name: ${request.businessName}
        Business Type: ${request.businessType}
        Services: ${request.services}
        Target Audience: ${request.targetAudience}
        Contact: ${request.email}, ${request.phone}
        Notes: ${request.notes}
        
        Requirements:
        - Use modern Tailwind CSS (via CDN).
        - Include a hero section, about, services cards, and contact footer.
        - Make it responsive and professional.
        - Output ONLY the raw HTML code starting with <!DOCTYPE html>.`,
      config: {
        systemInstruction: "You are a world-class web developer. Generate high-quality, production-ready standalone HTML files.",
      },
    });

    const html = response.text || '';
    return res.status(200).json({ html });
  } catch (error) {
    console.error("AI Error:", error);
    return res.status(500).json({ error: "Failed to generate HTML" });
  }
}
