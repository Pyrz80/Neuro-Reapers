
import { GoogleGenAI, Type } from "@google/genai";
import { KernelPatch, WeaponType } from "../types";
import { getLanguage } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getKernelPatches(level: number): Promise<KernelPatch[]> {
  const lang = getLanguage() === 'tr' ? 'Turkish' : 'English';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 distinct "Kernel Patch" upgrades for a cyberpunk rogue-lite survivor game called Neuro-Reapers. 
      The player is at level ${level}. 
      Target Language: ${lang}.
      One should be a weapon upgrade (WeaponTypes: DATA_STREAM, FIREWALL_RING, LOGIC_BOMB, NEURAL_SPIKE) 
      and two should be stat buffs. 
      Make descriptions sound technical and immersive (cyberpunk style) in ${lang}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['WEAPON', 'STAT'] },
              weaponType: { type: Type.STRING, enum: Object.values(WeaponType) },
              statBoost: {
                type: Type.OBJECT,
                properties: {
                  speed: { type: Type.NUMBER },
                  health: { type: Type.NUMBER },
                  magnet: { type: Type.NUMBER },
                  crit: { type: Type.NUMBER }
                }
              }
            },
            required: ['id', 'name', 'description', 'type']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    // Fallback patches (keeping it simple for fallback)
    return [
      { id: 'f1', name: 'Buffer Overflow', description: 'Overclocks your movement systems.', type: 'STAT', statBoost: { speed: 0.1 } },
      { id: 'f2', name: 'Firewall Expansion', description: 'Upgrades the perimeter shields.', type: 'WEAPON', weaponType: WeaponType.FIREWALL_RING },
      { id: 'f3', name: 'Logic Recursion', description: 'Increases collection range.', type: 'STAT', statBoost: { magnet: 20 } }
    ];
  }
}

export async function getGameLore(action: string): Promise<string> {
  const lang = getLanguage() === 'tr' ? 'Turkish' : 'English';
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a short (max 15 words) lore notification for a cyberpunk game log. 
    Situation: ${action}. 
    Language: ${lang}. 
    Keep it cold, digital, and mysterious.`,
  });
  return response.text || "System Alert: Activity detected.";
}
