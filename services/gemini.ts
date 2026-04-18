
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Local fallbacks to use when the API is exhausted (429) or fails
const LOCAL_FALLBACKS = {
  it: {
    rage: (deaths: number) => [
      `Sei morto ${deaths} volte. Non mollare!`,
      `Ancora? ${deaths} morti, ma la prossima sarà quella buona!`,
      "Puoi farcela, respira e riprova.",
      "Hai provato a saltare con un tempismo diverso?",
      "Il tasto salto è il tuo migliore amico.",
      "Forse dovresti studiare meglio il percorso.",
      "Sento che sei vicino alla soluzione.",
      "Riprova, ogni tentativo ti rende migliore.",
      "Ma lo fai apposta o stai solo esplorando ogni modo di morire? 😉",
      "Ritenta, il successo è dietro l'angolo."
    ],
    advice: [
      "Il segreto è osservare bene il ritmo delle trappole.",
      "Prova a saltare... forse il tempismo è tutto.",
      "Guarda bene dove metti i piedi.",
      "Il viola è un colore ostico, ma superabile.",
      "Corri veloce o aspetta il momento giusto.",
      "Hai mai pensato di cambiare strategia? Aiuta molto.",
      "Scommetto che ce la farai al prossimo tentativo!",
      "Le trappole sono lì per metterti alla prova. Superale!"
    ],
    feedback: [
      "Grazie del feedback! Lo terremo in considerazione per i prossimi update.",
      "Feedback ricevuto. Grazie per aiutarci a migliorare!",
      "Interessante. Lo analizzeremo con il team.",
      "Grazie del supporto, continua a giocare!"
    ]
  },
  en: {
    rage: (deaths: number) => [
      `You died ${deaths} times. Don't give up!`,
      `Again? ${deaths} deaths, but the next one will be it!`,
      "You can do this, take a breath and try again.",
      "Have you tried jumping with different timing?",
      "The jump button is your best friend.",
      "Maybe you should study the path better.",
      "I feel you're close to the solution.",
      "Try again, every attempt makes you better.",
      "Are you doing this on purpose or just exploring every way to die? 😉",
      "Try again, success is just around the corner."
    ],
    advice: [
      "The secret is observing the rhythm of the traps.",
      "Try jumping... maybe timing is everything.",
      "Watch your step.",
      "Purple is a tricky color, but surmountable.",
      "Run fast or wait for the right moment.",
      "Ever thought about changing strategy? It really helps.",
      "I bet you'll make it on the next try!",
      "The traps are there to test you. Overcome them!"
    ],
    feedback: [
      "Thanks for the feedback! We'll consider it for future updates.",
      "Feedback received. Thanks for helping us improve!",
      "Interesting. We'll analyze it with the team.",
      "Thanks for the support, keep playing!"
    ]
  }
};

const getRandomFallback = (type: 'rage' | 'advice' | 'feedback', lang: Language, deaths?: number) => {
  const list = type === 'rage' ? LOCAL_FALLBACKS[lang].rage(deaths || 0) : LOCAL_FALLBACKS[lang][type];
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * Helper to call Gemini with retries and exponential backoff.
 * This helps handle transient errors and 429 Rate Limit issues.
 */
async function generateWithRetry(prompt: string, retries = 2, delay = 800): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY not found. Using local fallbacks.");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.9,
        }
      });
      
      const text = response.text;
      if (text) return text;
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      const lowMsg = errorMsg.toLowerCase();
      
      const isQuotaError = lowMsg.includes("429") || lowMsg.includes("quota") || lowMsg.includes("resource_exhausted");
      const isTransientError = lowMsg.includes("500") || lowMsg.includes("rpc failed") || lowMsg.includes("xhr error") || lowMsg.includes("proxy");
      
      if (isQuotaError || isTransientError) {
        if (i < retries) {
          const type = isQuotaError ? "Quota Exceeded (429)" : "Transient Server Error";
          console.warn(`Gemini ${type}. Retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2; 
          continue;
        } else {
          console.warn(`Gemini error persistent after ${retries} retries. Switching to local fallback.`);
          return null;
        }
      }
      
      console.error("Gemini Error:", errorMsg);
      break; 
    }
  }
  return null;
}

export async function getRageMessage(deaths: number, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `The player just died for the ${deaths}th time in my game 'Die Again'. Write a short, encouraging, and slightly funny message to motivate them to keep trying (max 15 words). In ${langName} please. Combine a bit of humor with support. Mention they died ${deaths} times.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('rage', lang, deaths);
}

export async function getLevelAdvice(levelName: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `Provide a helpful and slightly funny advice for a level named '${levelName}' in my game 'Die Again'. The advice should be genuinely useful but with a lighthearted tone. Max 20 words, in ${langName}.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('advice', lang);
}

export async function processFeedback(username: string, feedback: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `User '${username}' provided this feedback for the game 'Die Again': "${feedback}". Reply as a kind and slightly witty game developer who appreciates the input and encourages the player to continue. Keep it under 25 words, in ${langName}.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('feedback', lang);
}
