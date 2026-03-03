import { GoogleGenAI, Type } from "@google/genai";

export async function generateWebsiteContent(data: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

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
    },
  });

  return JSON.parse(response.text);
}

export async function generateFullHTML(request: any) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

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

  return response.text || '';
}
