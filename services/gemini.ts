
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getRageMessage(deaths: number, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just died for the ${deaths}th time in my troll game 'Die Again'. Write a short, funny, and slightly toxic/enraging insult or mock (max 15 words). In ${langName} please. Make it sound like a classic gamer rage comment.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text || (lang === 'it' ? "Ancora? Sei proprio scarso!" : "Again? You're so bad!");
  } catch (error) {
    console.error("Gemini error:", error);
    return lang === 'it' ? "Non ci posso credere, sei morto di nuovo!" : "I can't believe it, you died again!";
  }
}

export async function getLevelAdvice(levelName: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a 'troll' advice for a level named '${levelName}' in my game 'Die Again'. The advice should sound helpful but actually be a bit mocking. Max 20 words, in ${langName}.`,
    });
    return response.text || (lang === 'it' ? "Il segreto è non morire. Facile, no?" : "The secret is not dying. Easy, right?");
  } catch (error) {
    return lang === 'it' ? "Prova a saltare... o forse no?" : "Try jumping... or maybe not?";
  }
}

export async function processFeedback(username: string, feedback: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `User '${username}' provided this feedback for the game 'Die Again': "${feedback}". Reply as a sarcastic game developer who thinks the player is just crying because the game is too hard. Keep it under 25 words, in ${langName}, very funny and troll-ish.`,
    });
    return response.text || (lang === 'it' ? "Grazie del feedback, ma sembra solo un problema di skill." : "Thanks for the feedback, but it sounds like a skill issue.");
  } catch (error) {
    return lang === 'it' ? "Feedback ricevuto. Lo ignoreremo con piacere!" : "Feedback received. We will happily ignore it!";
  }
}
