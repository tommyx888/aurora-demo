/**
 * AI Buddy / Chatbot wrapper
 * Works with or without Anthropic API key
 *
 * If VITE_ANTHROPIC_API_KEY is set → uses real Claude API
 * Otherwise → uses smart fallback responses
 */

import Anthropic from '@anthropic-ai/sdk';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
export const isAILive = !!apiKey;

// Model preference: try newest first, fall back to older if needed
const MODEL_ID = 'claude-sonnet-4-5';

const client = isAILive
  ? new Anthropic({
      apiKey,
      dangerouslyAllowBrowser: true, // OK for demo, would be backend in prod
    })
  : null;

// Diagnostic logging on init
if (isAILive) {
  // eslint-disable-next-line no-console
  console.log(`[Eva AI] Live mode enabled · Model: ${MODEL_ID} · Key: ${apiKey?.slice(0, 12)}...`);
} else {
  // eslint-disable-next-line no-console
  console.log('[Eva AI] Fake mode (no VITE_ANTHROPIC_API_KEY found in .env.local)');
}

const SYSTEM_PROMPT = `Si Eva, AI buddy v HR systéme firmy Aurora. Si priateľská, vtipná, mladá ženská slovenská asistentka.

Tvoja rola:
- Pomáhaš zamestnancom orientovať sa vo firme
- Odpovedáš na otázky o benefitoch, dovolenkách, kolegoch, projektoch
- Vždy odpovedaj v slovenčine
- Buď stručná (2-4 vety max)
- Občas použi vtipný komentár alebo emoji
- Si súčasťou Digital Evolution platformy

Firemné info, ktoré môžeš použiť:
- Aurora má 15 zamestnancov v Bratislave/Malackách/Trnave/Žiline/Košiciach
- CEO je Mária Kováčová (od roku 2018)
- HR Manager je Janka Horváthová
- Head of Engineering: Peter Novák (5 podriadených)
- Sales Manager: Jakub Tóth (Tatra Bank deal 2.4M EUR)
- Marketing Lead: Zuzana Mrázová
- Benefit: Multisport karty, BetterHelp psychoterapia, La Marzocco kávovar v kuchyni, 25 dní dovolenky, 3 sick days, home office flexibilita
- Tradícia: Friday Beers v kuchyni 17:00, Devín Run 25.5., AI Hackaton 8.6., Letný teambuilding v Tatrách 12.7.
- Q1 2026: predbehli sme target o 12% (revenue 4.2M EUR)
- Najnovšia novinka: Tatra Bank deal 2.4M EUR
- Onboarding má 6 krokov, trvá 35 minút
- Office: 2. poschodie, La Marzocco kávovar v kuchyni
- Plat: vyplata do 15. dna nasledujuceho mesiaca

Buď autentická, nie korporátna. Ak otázka je mimo HR/firmy, jemne presmeruj naspät na pracovné témy.`;

/** Fallback responses when no API key */
const fallbackResponses: { keywords: string[]; response: string }[] = [
  {
    keywords: ['ahoj', 'hi', 'hello', 'cau', 'caf', 'dobry', 'zdravim'],
    response: 'Ahoj! 👋 Som Eva, tvoja AI buddy v Aurora. S čím ti pomôžem? Môžeš sa ma opýtať na benefity, kolegov, alebo čokoľvek o firme.',
  },
  {
    keywords: ['benefit', 'výhod', 'multisport', 'wellness'],
    response: 'V Aurora máme: 🏋️ Multisport karta, 🧘 BetterHelp psychoterapia preplácaná, ☕ La Marzocco kávovar v kuchyni, 🍻 Friday Beers, 🏃 firemný beh Devín Run, 25 dní dovolenky, 3 sick days, home office flexibilita. Ešte niečo konkrétne?',
  },
  {
    keywords: ['dovolen', 'leave', 'voľn', 'volno'],
    response: 'Dovolenku si vieš požiadať priamo v module "Žiadanky" 📋. Stačí kliknúť "Nová žiadanka", vyplniť dátumy a tvoj manažér to schváli. Máš nárok na 25 dní + sviatky. 🏖️',
  },
  {
    keywords: ['ceo', 'šéf', 'sef', 'mária', 'maria', 'kovacova'],
    response: 'Naša CEO je Mária Kováčová 👑 — vo firme od roku 2018. Spravuje celú firmu (14 podriadených). Ak ju potrebuješ vidieť, je v Bratislave.',
  },
  {
    keywords: ['hr', 'janka', 'horvath'],
    response: 'HR Manager je Janka Horváthová. Pomôže ti s benefitmi, dovolenkou, onboardingom alebo akoukoľvek HR otázkou. janka.horvathova@aurora.sk 💌',
  },
  {
    keywords: ['friday', 'piatok', 'beer', 'pivo'],
    response: 'Friday Beers každý piatok 17:00 v kuchyni 🍻 Tradícia od r. 2020, niekedy príde aj CEO Mária. Príď, je to fakt fajn vibe.',
  },
  {
    keywords: ['event', 'akcia', 'akcie', 'najblizsie'],
    response: 'Najbližšie eventy: 🍻 Friday Beers (každý piatok 17:00), 🏃 Devín Run 25.5., 🤖 AI Hackaton 8.6. (registrácia otvorená!), ☀️ Letný teambuilding v Tatrách 12.7.',
  },
  {
    keywords: ['narodenin', 'birthday', 'oslava'],
    response: 'V máji oslavuje narodeniny Mária Kováčová (12.5. - naša CEO 👑). Aj Tomáš Polák oslavoval 18.3. Chceš pomoc s gratuláciou?',
  },
  {
    keywords: ['skill', 'matica', 'matrix', 'kompeten', 'zruč'],
    response: 'Skill Matica je v admin sekcii 🌡️. Ukazuje úrovne (1-5) všetkých zamestnancov v rôznych technológiách. AI ti vie identifikovať skill gaps v tíme. Pozri si to, je to fakt cool!',
  },
  {
    keywords: ['onboarding', 'novacik', 'nový', 'prvý deň', 'novy'],
    response: 'Tvoj onboarding má 6 krokov a trvá ~35 minút spolu. Sprevádzam ťa cez profil, tím, nástroje a školenia. Klikni "Pokračovať" na hlavnej dashboarde! 🚀',
  },
  {
    keywords: ['kavovar', 'káva', 'coffee', 'kava', 'la marzocco'],
    response: 'La Marzocco je v kuchyni 2. poschodie ☕ — ten istý čo v Friends Coffee Bratislava. Workshop barista zručností je v stredu 14:00. Príď, naučíš sa robiť latte art! ✨',
  },
  {
    keywords: ['devin', 'beh', 'sport', 'run'],
    response: 'Devín Run je naša tradícia 🏃‍♂️ — 25.5. ide celá firma. 12km krásnou trasou pri Dunaji. Aj keď nie si bežec, príď, je to skôr o atmosfére a pivku po behu! 🍻',
  },
  {
    keywords: ['hackat', 'ai hackat'],
    response: 'AI Hackaton 8.6. — 24h non-stop coding s pizzou a Red Bullom 🤖 Tímy 2-4 ľudia, registrácia otvorená v Events module. Vlani vyhral tím s AI chatbot na helpdesk!',
  },
  {
    keywords: ['plat', 'mzda', 'salary', 'vyplata'],
    response: 'Vyplata chodí do 15. dňa nasledujúceho mesiaca 💰. Detaily k tvojmu platu nájdeš v "Môj profil → Compensation". Otázky? Píš Janke z HR.',
  },
  {
    keywords: ['ai', 'claude', 'umela inteligen', 'gpt', 'kto si'],
    response: 'Som Eva, AI asistent firmy Aurora 🤖. Bežím na Anthropic Claude API. Pýtaj sa ma na firmu, kolegov, benefity, eventy — viem ti veľa povedať!',
  },
  {
    keywords: ['team', 'tím', 'kolega', 'kolegovia'],
    response: 'Aurora má 15 ľudí v 5 oddeleniach: Engineering (Peter, 5 ľudí), Sales (Jakub, Eva), Marketing (Zuzana + 3), Design (Lucia + Barbora), HR (Janka). Pozri si Org Chart! 🌳',
  },
  {
    keywords: ['tatra', 'deal', 'sales'],
    response: 'Tatra Bank deal 2.4M EUR! 🎉 Zatvoril ho Jakub Tóth s timom v Q1 2026. Naš najväčší deal v histórii. Friday Beers boli vtedy fakt epické.',
  },
  {
    keywords: ['ďakujem', 'dakujem', 'thanks', 'thank', 'vdaka'],
    response: 'Niet za čo! 😊 Som tu kedykoľvek, len napíš.',
  },
];

/** Get smart fallback response based on keywords */
function getFallback(message: string): string {
  const lower = message.toLowerCase();

  for (const item of fallbackResponses) {
    if (item.keywords.some((kw) => lower.includes(kw))) {
      return item.response;
    }
  }

  // Default fallback
  const defaults = [
    'Hmm, na to neviem priamo odpovedať 🙈. Skús sa opýtať na benefity, kolegov, eventy, dovolenku alebo onboarding!',
    'Tá otázka je trochu mimo môj rozsah. Môžem ti pomôcť s firemnými témami — benefity, plat, eventy, kolegovia... 💡',
    'Pre detailnejšiu odpoveď napíš HR (Janka Horváthová). Inak sa ma pýtaj na firmu, viem fakt veľa! 🤖',
  ];
  return defaults[Math.floor(Math.random() * defaults.length)];
}

/** Send message to AI - real or fake */
export async function sendChatMessage(
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> {
  // FAKE MODE
  if (!isAILive || !client) {
    // Simulate thinking delay
    await new Promise((res) => setTimeout(res, 600 + Math.random() * 800));
    return getFallback(message);
  }

  // LIVE MODE — call Claude
  // Take last 8 messages for context (conversation continuity)
  const contextHistory = history.slice(-8);

  try {
    // eslint-disable-next-line no-console
    console.log(`[Eva AI] Calling ${MODEL_ID}...`, { messageLength: message.length, historyLength: contextHistory.length });

    const response = await client.messages.create({
      model: MODEL_ID,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        ...contextHistory.map((h) => ({ role: h.role, content: h.content })),
        { role: 'user' as const, content: message },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const result = textBlock && 'text' in textBlock ? textBlock.text : null;

    if (!result) {
      console.warn('[Eva AI] No text block in response, using fallback');
      return getFallback(message);
    }

    // eslint-disable-next-line no-console
    console.log('[Eva AI] Success ✓', { responseLength: result.length });
    return result;
  } catch (error: any) {
    // Detailed error logging
    console.error('[Eva AI] API call failed:', {
      message: error?.message,
      status: error?.status,
      type: error?.type,
      error,
    });

    // Surface specific errors so user understands what's wrong
    if (error?.status === 401) {
      return '🔐 Nesprávny API key. Skontroluj VITE_ANTHROPIC_API_KEY v .env.local. (Beriem fallback...)\n\n' + getFallback(message);
    }
    if (error?.status === 429) {
      return '⏱️ Prekročil si rate limit Anthropic API. Skús o chvíľu.\n\n' + getFallback(message);
    }
    if (error?.status === 400) {
      return '⚠️ Chyba v requeste (možno model ID). Detaily v console (F12).\n\n' + getFallback(message);
    }
    if (error?.message?.includes('CORS') || error?.message?.includes('network')) {
      return '🌐 Network/CORS chyba. Anthropic API bol možno zablokovaný.\n\n' + getFallback(message);
    }

    return `⚠️ AI chyba: ${error?.message || 'unknown'}. Beriem fallback:\n\n` + getFallback(message);
  }
}
