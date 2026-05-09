/**
 * AI helpers for new features (CV screening, doc generation, etc.)
 * Works with or without Anthropic API key
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AIDocTemplate, CVAnalysis } from '../types';
import { sampleCVs } from '../data/hrData';

const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
export const isAILive = !!apiKey;

const client = isAILive
  ? new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  : null;

// ============================================
// CV SCREENING
// ============================================

export async function analyzeCv(cvText: string, position: string): Promise<CVAnalysis> {
  // Try to match against sample CVs first (for demo without API key)
  const matched = sampleCVs.find((s) =>
    cvText.toLowerCase().includes(s.expectedAnalysis.candidateName.toLowerCase().split(' ')[0])
  );

  if (matched) {
    // Simulate "thinking" delay
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));
    return { ...matched.expectedAnalysis, position: position || matched.expectedAnalysis.position };
  }

  // FAKE MODE: Smart heuristic analysis
  if (!isAILive || !client) {
    await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1500));
    return heuristicAnalysis(cvText, position);
  }

  // LIVE MODE: real Claude
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      system: `Si AI HR recruiter. Analyzuj CV a vrat strukturovany JSON output. Hovoris po slovensky.

Vrat IBA validny JSON v tomto formate (ziadny markdown, ziadny text mimo JSON):
{
  "candidateName": "string",
  "matchScore": 0-100,
  "skillMatch": 0-100,
  "experienceMatch": 0-100,
  "cultureMatch": 0-100,
  "extractedSkills": ["array of skills"],
  "yearsExperience": number,
  "redFlags": ["array of concerns in slovak"],
  "highlights": ["array of strong points in slovak"],
  "recommendation": "strong-fit" | "good-fit" | "maybe" | "not-fit",
  "summary": "2-3 vety strucne hodnotenie v slovencine"
}`,
      messages: [{
        role: 'user',
        content: `Analyzuj toto CV pre poziciu "${position}":\n\n${cvText}`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock || !('text' in textBlock)) throw new Error('no text');

    const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { ...parsed, position };
  } catch (e) {
    console.error('AI CV analysis failed, fallback:', e);
    return heuristicAnalysis(cvText, position);
  }
}

function heuristicAnalysis(cvText: string, position: string): CVAnalysis {
  const text = cvText.toLowerCase();

  // Count years of experience by detecting year ranges
  const yearMatches = text.match(/20\d{2}\s*[-–]\s*(20\d{2}|present|now|sucasnost)/gi) || [];
  let yearsExperience = 0;
  yearMatches.forEach((match) => {
    const years = match.match(/20\d{2}/g);
    if (years && years.length >= 1) {
      const start = parseInt(years[0]);
      const end = years[1] && /^20\d{2}$/.test(years[1]) ? parseInt(years[1]) : 2026;
      yearsExperience += Math.max(0, end - start);
    }
  });
  if (yearsExperience === 0) yearsExperience = 1;

  // Common skills detection
  const skillPool = [
    'React', 'TypeScript', 'JavaScript', 'Python', 'Java', 'Node.js', 'Vue', 'Angular',
    'SQL', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
    'Git', 'CI/CD', 'GraphQL', 'REST', 'HTML', 'CSS', 'Tailwind', 'Next.js',
    'Figma', 'Photoshop', 'Illustrator', 'UI', 'UX',
    'Sales', 'CRM', 'Salesforce', 'HubSpot', 'Marketing', 'SEO', 'Content',
  ];
  const extractedSkills = skillPool.filter((s) => text.includes(s.toLowerCase()));

  // Score calculation
  const isRelevantPosition = position.toLowerCase();
  let skillMatch = Math.min(100, extractedSkills.length * 10);
  if (isRelevantPosition.includes('senior')) skillMatch = Math.max(20, skillMatch - 10);
  let experienceMatch = Math.min(100, yearsExperience * 12);
  if (isRelevantPosition.includes('senior') && yearsExperience < 4) experienceMatch = Math.max(15, experienceMatch - 30);

  const cultureMatch = 60 + Math.floor(Math.random() * 30);
  const matchScore = Math.round((skillMatch * 0.5 + experienceMatch * 0.35 + cultureMatch * 0.15));

  let recommendation: CVAnalysis['recommendation'] = 'maybe';
  if (matchScore >= 80) recommendation = 'strong-fit';
  else if (matchScore >= 65) recommendation = 'good-fit';
  else if (matchScore < 45) recommendation = 'not-fit';

  // Extract candidate name (first line usually)
  const firstLine = cvText.trim().split('\n')[0].trim();
  const candidateName = firstLine.length < 50 ? firstLine : 'Kandidat';

  const redFlags: string[] = [];
  const highlights: string[] = [];

  if (isRelevantPosition.includes('senior') && yearsExperience < 4) {
    redFlags.push(`Iba ${yearsExperience} rokov skusenosti (poziaduje sa 5+)`);
  }
  if (extractedSkills.length < 3) redFlags.push('Malo identifikovatelnych technickych zrucnosti');

  if (yearsExperience >= 5) highlights.push(`${yearsExperience} rokov skusenosti`);
  if (extractedSkills.length >= 5) highlights.push(`Bohaty skill set (${extractedSkills.length} technologii)`);
  if (text.includes('lead') || text.includes('mentor')) highlights.push('Leadership/mentoring skusenosti');

  return {
    candidateName,
    position,
    matchScore,
    skillMatch,
    experienceMatch,
    cultureMatch,
    extractedSkills,
    yearsExperience,
    redFlags,
    highlights,
    recommendation,
    summary: `Kandidat ma ${yearsExperience} rokov skusenosti a ${extractedSkills.length} relevantnych zrucnosti. ${
      recommendation === 'strong-fit' ? 'Vyborny fit pre poziciu.' :
      recommendation === 'good-fit' ? 'Solidny kandidat, odporucam pohovor.' :
      recommendation === 'maybe' ? 'Mozny kandidat, ale s vyhradami.' :
      'Aktualne nezodpoveda poziadavkam pozicie.'
    }`,
  };
}

// ============================================
// DOC GENERATION
// ============================================

export interface DocGenInput {
  template: AIDocTemplate;
  variables: Record<string, string>;
}

const FAKE_DOCS: Record<AIDocTemplate, (v: Record<string, string>) => string> = {
  'employment-contract': (v) => `PRACOVNA ZMLUVA

uzavreta podla § 42 a nasl. Zakonnika prace medzi:

ZAMESTNAVATEL: ${v.company || 'Aurora s.r.o.'}
so sidlom: ${v.address || 'Prievozska 4, 821 09 Bratislava'}
ICO: 12345678

ZAMESTNANEC: ${v.name || '[Meno zamestnanca]'}
narodeny/a: ${v.birthdate || '[Datum narodenia]'}
adresa: ${v.employeeAddress || '[Adresa]'}

I. DRUH PRACE
Zamestnanec bude vykonavat pracu na pozicii: ${v.position || 'Software Engineer'}
Misto vykonu prace: ${v.workplace || 'Bratislava (s moznostou home office)'}

II. PRACOVNY POMER
Zacatie pracovneho pomeru: ${v.startDate || '[Datum nastupu]'}
Doba trvania: ${v.duration || 'na dobu neurcita'}
Skusobna doba: 3 mesiace

III. MZDA
Hruba mesacna mzda: ${v.salary || '2 500 EUR'}
Vyplata mzdy: do 15. dna nasledujuceho mesiaca

IV. PRACOVNY CAS
Pracovny cas: 40 hodin tyzdenne
Dovolenka: 25 dni rocne (5 nad zakonny rozsah ako benefit)

V. BENEFITY
- Multisport karta
- BetterHelp psychoterapia
- Stravne listky 8 EUR/den
- 3 sick days rocne
- Home office az 100% (po skusobnej dobe)

VI. ZAVERECNE USTANOVENIA
Zmluva je vyhotovena v dvoch rovnocennych vyhotoveniach.
Vstupuje do platnosti dnom podpisu oboch zmluvnych stran.

V Bratislave, dna ${v.signDate || new Date().toLocaleDateString('sk-SK')}

____________________                    ____________________
   Zamestnavatel                              Zamestnanec`,

  'job-posting': (v) => `# ${v.position || 'Senior React Developer'}
## ${v.company || 'Aurora'} | ${v.location || 'Bratislava / Remote'} | Plny uvazok

### O nas
Sme rastuca technologicka firma, kde stavame produkty pre 15M+ uzivatelov.
Posledny rok sme zatvorili Tatra Bank deal (2.4M EUR) a robime AI Hackatony.

### Co budes robit
${v.responsibilities || `- Stavat moderne web aplikacie v React + TypeScript
- Mentorovat juniorov a viest code reviews
- Spolupracovat s designermi cez Figma
- Lead architecture decisions na novych projektoch
- Podielat sa na technickom roadmape`}

### Co od teba ocakavame
${v.requirements || `- 5+ rokov skusenosti s React (TypeScript, hooks, modern patterns)
- Skusenost s Next.js, GraphQL alebo REST API
- Schopnost lead-ovat technicke diskusie
- Slovencina + Anglictina (B2+)`}

### Co ti ponukame
- Plat: ${v.salary || '3000 - 4500 EUR'} (podla skusenosti)
- 25 dni dovolenky + 3 sick days
- Multisport karta + BetterHelp + La Marzocco kavovar v office
- 100% home office mozne (Bratislava office k dispozici)
- Tehnologie ktore tab chces (MacBook M-series, monitor, klavesnica)
- Conference budget 1500 EUR/rok
- Pravidelne tymove udalosti (Devin Run, ski trip, hackatony)

### Ako sa prihlasit
Posli CV na ${v.email || 'kariera@aurora.sk'} alebo cez LinkedIn.
Co najradsej vidime v CV: GitHub, technicke clanky, bocne projekty.

Tesime sa na teba!`,

  'exit-interview': (v) => `EXIT INTERVIEW - OTAZKY

Zamestnanec: ${v.name || '[Meno]'}
Pozicia: ${v.position || '[Pozicia]'}
Datum: ${v.date || new Date().toLocaleDateString('sk-SK')}
Vedie rozhovor: ${v.interviewer || 'HR Manager'}

## 1. Dovody odchodu
- Co bol hlavny dovod tvojho rozhodnutia odist?
- Ked si zacal/a uvazovat o odchode (pred mesiacmi, po konkretnej udalosti)?
- Boli pristupne sposoby ako sa otazku riesit interne?
- Co by mohlo zmenit tvoje rozhodnutie?

## 2. Pracovne prostredie
- Ako by si zhodnotil/a vztah so svojim manazerom?
- Citil/a si dostatocnu podporu od svojho timu?
- Ako vnimas firemnu kulturu Aurora?
- Bolo nieco co ti dlhodobo prekazalo, ale nepovedal/a si to?

## 3. Pozicia a rast
- Mal/a si jasnu predstavu o svojom kariernom rozvoji?
- Boli ocakavania od tvojej role realisticke?
- Mal/a si dostatok prilezitosti na ucenie a rast?
- Co by si v tejto oblasti zlepsil/a?

## 4. Compensation a benefity
- Si spokojny/a s mzdou vzhladom na trh?
- Ktore benefity ti najviac chybali?
- Ktore benefity si vobec nevyuzival/a?

## 5. Procesy a nastroje
- Ktore procesy te v praci najviac obtazuju?
- Ake nastroje by ti pomohli pracovat efektivnejsie?
- Co by si zmenil/a na onboarding-u novych ludi?

## 6. Buducnost
- Kam ides? (Pozicia, firma)
- Co ta tam najviac priťahuje?
- Co budes z Aurora najviac chybat?
- Odporucil/a by si Aurora priateloi ako zamestnavatela? Preco ano/nie?

## 7. Zaverecne
- Si ochotny/a ostat v kontakte (alumni network)?
- Mas dalsie pripomienky alebo podnety?
- Mozeme zdielat tieto poznatky s tvojim manazerom (s/bez tvojho mena)?

---

POZNAMKY HR: ___________________________________________`,

  'review-draft': (v) => `# Performance Review - Q${v.quarter || '2'} ${v.year || '2026'}
**Zamestnanec:** ${v.name || '[Meno]'}
**Pozicia:** ${v.position || '[Pozicia]'}
**Manazer:** ${v.manager || '[Manazer]'}

## Celkove hodnotenie: ${v.score || '4.5'} / 5.0

### Silne stranky
${v.strengths || `- Vynikajucu technicka uroven v jeho/jej oblasti
- Pozitivny vplyv na timovu kulturu
- Dobre zvlada kritiku a feedback
- Iniciativny pristup k problemu`}

### Oblasti na rozvoj
${v.improvements || `- Public speaking a prezentovanie pred vacsim publikom
- Lepsie balansovanie pracovneho zatazenia
- Delegovanie ulohy juniorom`}

### Klucove uspechy tohto kvartalu
${v.achievements || `- Dokoncenie rebrand projektu pred deadline
- Mentoring 2 juniorov, oba dostali pozitivne hodnotenie
- Implementacia novej deployment pipeline (-40% deployment time)`}

### Goals na dalsie obdobie
1. ${v.goal1 || 'Lead novy projekt X'}
2. ${v.goal2 || 'Dokoncit certifikaciu Y'}
3. ${v.goal3 || 'Mentor 1 dalsieho juniora'}

### Compensation review
${v.compensation || 'Odporucam zvyseniе o 8% na zaklade vykonu a tržných hodnot.'}

### Zaver
${v.conclusion || 'Top performer v tyme. Strategicke zachovat vsetky benefity. Odporucam mu navysenu odzodvednost a leadership prilezitosti.'}

---
Podpis manazera: ____________   Podpis zamestnanca: ____________
Datum: ${new Date().toLocaleDateString('sk-SK')}`,

  'offer-letter': (v) => `${v.company || 'Aurora s.r.o.'}
${v.address || 'Prievozska 4, 821 09 Bratislava'}

${new Date().toLocaleDateString('sk-SK')}

${v.candidateName || '[Meno kandidata]'}
${v.candidateEmail || '[Email]'}

Vec: PONUKA PRACE - ${v.position || 'Senior React Developer'}

Vazeny/a ${v.candidateName?.split(' ')[0] || '[Meno]'},

s potesenim Vam ponukame poziciu **${v.position || 'Senior React Developer'}** v nasej spolocnosti.

PODMIENKY PONUKY:

- **Pozicia:** ${v.position || 'Senior React Developer'}
- **Oddelenie:** ${v.department || 'IT / Engineering'}
- **Nadriadeny:** ${v.manager || 'Peter Novak (Head of Engineering)'}
- **Datum nastupu:** ${v.startDate || '1.6.2026'}
- **Hruba mesacna mzda:** ${v.salary || '3 800 EUR'}
- **Rocny bonus:** az ${v.bonus || '15%'} (na zaklade vykonu)
- **Skusobna doba:** 3 mesiace

BENEFITY:
- 25 dni dovolenky + 3 sick days
- Multisport karta
- BetterHelp psychoterapia (preplacane)
- Conference budget 1500 EUR/rok
- Home office az 100%
- Stravne listky 8 EUR/den
- MacBook + setup podla vlastneho vyberu

NASLEDUJUCE KROKY:
1. Tato ponuka plati do **${v.expiryDate || '15.5.2026'}**
2. Ak suhlasis, prosim podpis zmluvu a posli ju spat
3. HR ti posle dalsie informacie o onboardinge

Ak mas akekolvek otazky, neváhaj sa ozvat na ${v.contactEmail || 'janka@aurora.sk'} alebo telefonicky.

Tesime sa, ze sa staneš sucastou tymu Aurora!

S pozdravom,

${v.signedBy || 'Janka Horvathova, HR Manager'}
${v.company || 'Aurora s.r.o.'}`,

  'warning-letter': (v) => `UPOZORNENIE NA NEDOSTATKY V PRACI

Zamestnanec: ${v.name || '[Meno]'}
Pozicia: ${v.position || '[Pozicia]'}
Datum: ${new Date().toLocaleDateString('sk-SK')}

Vazeny/a ${v.name?.split(' ')[0] || '[Meno]'},

tymto Vas formalne upozornujeme na nasledujuce nedostatky vo Vasej praci:

## Konkretne nedostatky
${v.issues || `1. Opakovane neskoré príchody na mítingy (3x v poslednom mesiaci)
2. Nedodrziavanie deadline-ov pri zadanom projekte X
3. Komunikacne problemy s timom (bez aktualizacie statusu)`}

## Ocakavane zlepsenie
${v.expectations || `- Dochvilnost na vsetky planovane mítingy
- Aktivny status update kazdy den (Slack)
- Dodrziavanie dohodnutych deadlines`}

## Casovy ramec
Ocakavame okamzite zlepsenie. Situacia bude prehodnotena po **30 dnoch** (do ${v.reviewDate || '8.6.2026'}).

## Dosledky
V pripade neopravenia situacie budeme nuteni pristupit k:
- Druhy formalny napomenutiu
- Zníženie performance review skore
- V krajnom pripade ukonceniu pracovneho pomeru

## Podpora
Ako firma chceme aby sa Vam darilo. Ponukame:
- Pravidelne 1:1 s manazerom
- Pripadnu pomoc s time managementom
- Mentoring od skusenejsieho kolegu

Zelajme si Vase rychle a uspesne zlepsenie.

S pozdravom,

${v.manager || 'Peter Novak'}                  ${v.hr || 'Janka Horvathova'}
Direktny nadriadeny                              HR Manager

Podpis zamestnanca (porozumenie): ________________________
Datum: ________________`,
};

export async function generateDoc(input: DocGenInput): Promise<string> {
  // FAKE MODE
  if (!isAILive || !client) {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    return FAKE_DOCS[input.template](input.variables);
  }

  // LIVE MODE
  try {
    const templateNames: Record<AIDocTemplate, string> = {
      'employment-contract': 'pracovnu zmluvu',
      'job-posting': 'pracovny inzerat',
      'exit-interview': 'exit interview otazky',
      'review-draft': 'performance review draft',
      'offer-letter': 'ponukovy list',
      'warning-letter': 'upozornenie na nedostatky',
    };

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2500,
      system: `Si HR expert v slovenskej firme. Pises profesionalne dokumenty v slovencine podla slovenskej legislativy. Pouzivas markdown formatovanie. Vystupy su pripravene na pouzitie.`,
      messages: [{
        role: 'user',
        content: `Vygeneruj ${templateNames[input.template]} s tymito udajmi:\n\n${JSON.stringify(input.variables, null, 2)}`,
      }],
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    if (textBlock && 'text' in textBlock) return textBlock.text;
    return FAKE_DOCS[input.template](input.variables);
  } catch (e) {
    console.error('AI doc gen failed:', e);
    return FAKE_DOCS[input.template](input.variables);
  }
}
