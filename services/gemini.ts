
import { GoogleGenAI } from "@google/genai";
import { Language } from "../types";

// Local fallbacks to use when the API is exhausted (429) or fails
const LOCAL_FALLBACKS = {
  it: {
    rage: [
      "Ancora? Sei proprio scarso!",
      "Non ci posso credere, sei morto di nuovo!",
      "Mio nonno giocherebbe meglio con una mano sola.",
      "Hai provato a... non morire?",
      "Il tasto salto funziona, sai?",
      "Forse il giardinaggio è un hobby più adatto a te.",
      "Sento il rumore dei tuoi nervi che saltano.",
      "Skill issue. Palesemente.",
      "Ma lo fai apposta o è un talento naturale?",
      "Ritenta, sarai più sfortunato."
    ],
    advice: [
      "Il segreto è non morire. Facile, no?",
      "Prova a saltare... o forse no?",
      "Guarda bene dove metti i piedi, scemo.",
      "Il viola non è il tuo colore fortunato oggi.",
      "Corri veloce, o resta fermo. In entrambi i casi morirai.",
      "Hai mai pensato di disinstallare? Aiuta molto.",
      "Scommetto che morirai tra 3... 2... 1...",
      "Le trappole sono lì per un motivo. Per farti sclerare."
    ],
    feedback: [
      "Grazie del feedback, ma sembra solo un problema di skill.",
      "Feedback ricevuto. Lo ignoreremo con piacere!",
      "Interessante. Lo metterò nella cartella 'Cose che non farò mai'.",
      "Piangi meno, gioca meglio."
    ]
  },
  en: {
    rage: [
      "Again? You're so bad!",
      "I can't believe it, you died again!",
      "My grandma plays better with one hand.",
      "Have you tried... not dying?",
      "The jump button actually works, you know?",
      "Maybe gardening is a better hobby for you.",
      "I can hear your nerves snapping from here.",
      "Skill issue. Obviously.",
      "Are you doing this on purpose or is it natural talent?",
      "Try again, you'll be even unluckier."
    ],
    advice: [
      "The secret is not dying. Easy, right?",
      "Try jumping... or maybe not?",
      "Watch your step, dummy.",
      "Purple isn't your lucky color today.",
      "Run fast, or stay still. Either way, you're toast.",
      "Ever thought about uninstalling? It really helps.",
      "I bet you'll die in 3... 2... 1...",
      "The traps are there for a reason. To make you rage."
    ],
    feedback: [
      "Thanks for the feedback, but it sounds like a skill issue.",
      "Feedback received. We will happily ignore it!",
      "Interesting. I'll put this in the 'Never gonna do it' folder.",
      "Cry less, play better."
    ]
  }
};

const getRandomFallback = (type: 'rage' | 'advice' | 'feedback', lang: Language) => {
  const list = LOCAL_FALLBACKS[lang][type];
  return list[Math.floor(Math.random() * list.length)];
};

/**
 * Helper to call Gemini with retries and exponential backoff.
 * This helps handle transient errors and 429 Rate Limit issues.
 */
async function generateWithRetry(prompt: string, retries = 2, delay = 1000): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  for (let i = 0; i <= retries; i++) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          temperature: 0.9,
        }
      });
      
      if (response.text) return response.text;
    } catch (error: any) {
      const isQuotaError = error?.message?.includes("429") || error?.message?.includes("quota") || error?.status === 429;
      
      // If it's a quota error and we have retries left, wait and try again
      if (isQuotaError && i < retries) {
        console.warn(`Gemini Quota Exceeded (429). Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      
      // For other errors or if we're out of retries, log and return null
      console.error("Gemini Error:", error.message || error);
      break; 
    }
  }
  return null;
}

export async function getRageMessage(deaths: number, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `The player just died for the ${deaths}th time in my troll game 'Die Again'. Write a short, funny, and slightly toxic/enraging insult or mock (max 15 words). In ${langName} please. Make it sound like a classic gamer rage comment.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('rage', lang);
}

export async function getLevelAdvice(levelName: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `Provide a 'troll' advice for a level named '${levelName}' in my game 'Die Again'. The advice should sound helpful but actually be a bit mocking. Max 20 words, in ${langName}.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('advice', lang);
}

export async function processFeedback(username: string, feedback: string, lang: Language): Promise<string> {
  const langName = lang === 'it' ? 'Italian' : 'English';
  const prompt = `User '${username}' provided this feedback for the game 'Die Again': "${feedback}". Reply as a sarcastic game developer who thinks the player is just crying because the game is too hard. Keep it under 25 words, in ${langName}, very funny and troll-ish.`;
  
  const result = await generateWithRetry(prompt);
  return result || getRandomFallback('feedback', lang);
}
