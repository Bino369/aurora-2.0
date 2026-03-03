import { GoogleGenAI, ThinkingLevel } from "@google/genai";
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
    const request = req.body;
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a concise, professional, standalone single-file HTML website for:
        Business: ${request.businessName} (${request.businessType})
        Services: ${request.services}
        Target: ${request.targetAudience}
        Contact: ${request.email}, ${request.phone}
        
        Requirements:
        - Modern Tailwind CSS (CDN).
        - Hero, About, Services, Contact.
        - Responsive.
        - Output ONLY raw HTML.`,
      config: {
        systemInstruction: "You are a world-class web developer. Generate high-quality, production-ready standalone HTML files. Be extremely concise to minimize generation time.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      },
    });

    const html = response.text || '';
    return res.status(200).json({ html });
  } catch (error: any) {
    console.error("AI Error:", error);
    return res.status(500).json({ 
      error: "Failed to generate HTML", 
      details: error.message || String(error) 
    });
  }
}
