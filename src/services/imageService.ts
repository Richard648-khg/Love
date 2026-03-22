import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateSingleImage(prompt: string, aspectRatio: "16:9" | "1:1" | "4:3" = "16:9") {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    const part = response.candidates[0].content.parts.find(p => p.inlineData);
    if (part?.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (error) {
    console.error("Error generating image:", error);
  }
  return null;
}

export async function generateHeroBackground() {
  return generateSingleImage(
    "A romantic couple standing on a balcony overlooking a city at night, cinematic lighting, high quality, romantic atmosphere, elegant attire, soft focus background."
  );
}

export async function generateClimaxMainImage() {
  return generateSingleImage(
    "A cinematic close-up of a romantic couple in a warm, golden hour light, looking into each other's eyes, professional photography, high detail, soft glow.",
    "4:3"
  );
}

export async function generateQuotesWithImages(quotes: string[]) {
  const results = [];
  for (const quote of quotes) {
    const prompt = `A romantic, artistic image illustrating the feeling of this quote: "${quote}". Soft colors, dreamlike atmosphere, high quality.`;
    const img = await generateSingleImage(prompt, "1:1");
    results.push({ quote, image: img });
  }
  return results;
}

export async function generateRomanticImages() {
  const prompts = [
    "A couple walking through a field of lavender at sunset, soft golden hour light, dreamlike, professional photography, warm colors.",
    "A couple sitting by a fireplace in a cozy mountain cabin, soft glow, intimate atmosphere, high detail.",
    "A couple dancing under the moonlight on a quiet beach, ethereal lighting, romantic."
  ];

  const images = [];
  for (const prompt of prompts) {
    const img = await generateSingleImage(prompt);
    if (img) images.push(img);
  }
  return images;
}
