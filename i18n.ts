
import { Language } from './types';

export const translations = {
  it: {
    newUser: "NUOVO UTENTE",
    registrationDesc: "Inserisci il tuo nome per iniziare a soffrire. I tuoi progressi verranno salvati su questo dispositivo.",
    usernamePlaceholder: "USERNAME...",
    registerBtn: "REGISTRATI E MUORI",
    usernameTooShort: "Username troppo corto! Almeno 3 caratteri.",
    welcomeBack: "Bentornato",
    playLevel: "GIOCA LIVELLO",
    spin: "SPIN",
    gifts: "REGALI",
    shop: "NEGOZIO",
    feedback: "FEEDBACK",
    deaths: "MORTE",
    gems: "GEMME",
    menu: "MENU",
    tipTitle: "TIP DEL PRO:",
    winTitle: "GRANDE!",
    winDesc: "Livello {n} Superato.",
    nextLevel: "LIVELLO {n} →",
    luckySpin: "LUCKY SPIN",
    balance: "Saldo",
    spinning: "GIRANDO...",
    close: "CHIUDI",
    dailyRewards: "REGALI GIORNALIERI",
    day: "GIORNO",
    skinShop: "NEGOZIO SKIN",
    skinClassic: "CLASSICO",
    skinGold: "ORO",
    skinRuby: "RUBINO",
    skinEmerald: "SMERALDO",
    skinGhost: "FANTASMA",
    equipped: "EQUIPAGGIATA",
    equip: "EQUIPAGGIA",
    buy: "ACQUISTA",
    insufficientGems: "SOLDI INSUFFICIENTI",
    feedbackDesc: "Se è troppo difficile il gioco oppure devo aggiungere qualcosa scrivilo.",
    feedbackPlaceholder: "Scrivi qui le tue idee o lamentele...",
    feedbackSent: "feedback mandato adesso ci penseranno gli sviluppatori",
    feedbackAcknowledge: "HO CAPITO, SCUSA",
    zone: "ZONA",
    scleri: "SCLERI",
    jump: "SALTO",
    insufficientGemsAlert: "GEMME INSUFFICIENTI!",
    cancel: "Annulla"
  },
  en: {
    newUser: "NEW USER",
    registrationDesc: "Enter your name to start suffering. Your progress will be saved on this device.",
    usernamePlaceholder: "USERNAME...",
    registerBtn: "REGISTER AND DIE",
    usernameTooShort: "Username too short! At least 3 characters.",
    welcomeBack: "Welcome back",
    playLevel: "PLAY LEVEL",
    spin: "SPIN",
    gifts: "GIFTS",
    shop: "SHOP",
    feedback: "FEEDBACK",
    deaths: "DEATHS",
    gems: "GEMS",
    menu: "MENU",
    tipTitle: "PRO TIP:",
    winTitle: "GREAT!",
    winDesc: "Level {n} Completed.",
    nextLevel: "LEVEL {n} →",
    luckySpin: "LUCKY SPIN",
    balance: "Balance",
    spinning: "SPINNING...",
    close: "CLOSE",
    dailyRewards: "DAILY GIFTS",
    day: "DAY",
    skinShop: "SKIN SHOP",
    skinClassic: "CLASSIC",
    skinGold: "GOLD",
    skinRuby: "RUBY",
    skinEmerald: "EMERALD",
    skinGhost: "GHOST",
    equipped: "EQUIPPED",
    equip: "EQUIP",
    buy: "BUY",
    insufficientGems: "NOT ENOUGH GEMS",
    feedbackDesc: "If the game is too hard or you want me to add something, write it down.",
    feedbackPlaceholder: "Write your ideas or complaints here...",
    feedbackSent: "feedback sent, the developers will think about it now",
    feedbackAcknowledge: "I UNDERSTAND, SORRY",
    zone: "ZONE",
    scleri: "RAGE",
    jump: "JUMP",
    insufficientGemsAlert: "NOT ENOUGH GEMS!",
    cancel: "Cancel"
  }
};

export type TranslationKey = keyof typeof translations.it;

export const t = (key: TranslationKey, lang: Language, params?: { [key: string]: any }) => {
  let str = translations[lang][key] || key;
  if (params) {
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
  }
  return str;
};
