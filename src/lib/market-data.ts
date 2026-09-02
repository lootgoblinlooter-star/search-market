/**
 * Roblox market-gap dataset + scoring engine.
 *
 * Gap Score = Demand x Audience Opportunity x Novelty / Competition
 * (normalised through a saturating curve so it lands on a 0-100 scale)
 */

export type Fantasy = {
  id: string;
  name: string;
  short: string;
  /** Search + play demand signal, 0-100 */
  demand: number;
  /** Reachable audience size, 0-100 */
  audience: number;
  /** Trailing growth signal, 0-100 */
  growth: number;
  /** YouTube view/upload demand signal, 0-100 */
  youtube: number;
  note: string;
};

export type Gameplay = {
  id: string;
  name: string;
  short: string;
  /** How proven the loop is across the whole platform, 0-100 */
  proven: number;
};

export type Game = {
  name: string;
  fantasy: string;
  gameplay: string;
  ccu: number;
  visits: number;
  likeRatio: number;
  ageYears: number;
  updatedRecently: boolean;
  strength: string;
  weakness: string;
};

export const FANTASIES: Fantasy[] = [
  { id: "scp", name: "SCP", short: "SCP", demand: 92, audience: 87, growth: 78, youtube: 94, note: "Huge lore-driven audience fed by YouTube; play patterns skew horror/roleplay." },
  { id: "animals", name: "Animals", short: "Animals", demand: 88, audience: 93, growth: 66, youtube: 81, note: "Broadest evergreen fantasy on the platform, heavily served by sim + adopt loops." },
  { id: "firefighter", name: "Firefighter", short: "Fire", demand: 74, audience: 68, growth: 71, youtube: 79, note: "Service-worker fantasy with strong satisfaction loops and low native supply." },
  { id: "airport", name: "Airport", short: "Airport", demand: 71, audience: 63, growth: 74, youtube: 76, note: "Aviation roleplay has a devoted niche and almost no genre variety." },
  { id: "zombies", name: "Zombies", short: "Zombies", demand: 86, audience: 84, growth: 52, youtube: 83, note: "Massive but mature market; most loops already occupied by long-running titles." },
  { id: "police", name: "Police / Crime", short: "Police", demand: 83, audience: 88, growth: 58, youtube: 80, note: "Roleplay-dominated. Non-roleplay loops are barely explored." },
  { id: "space", name: "Space", short: "Space", demand: 69, audience: 61, growth: 68, youtube: 66, note: "High-imagination fantasy, hard to build well, so supply stays thin." },
  { id: "pirates", name: "Pirates", short: "Pirates", demand: 64, audience: 59, growth: 61, youtube: 70, note: "Anime-adjacent demand spikes; classic pirate fantasy is underbuilt." },
  { id: "farming", name: "Farming", short: "Farming", demand: 81, audience: 77, growth: 84, youtube: 78, note: "Recently re-proven by grow-and-trade loops; adjacent loops still open." },
  { id: "superheroes", name: "Superheroes", short: "Heroes", demand: 79, audience: 82, growth: 55, youtube: 84, note: "Reliable demand tied to film/anime cycles, dominated by PvP and sims." },
  { id: "military", name: "Military", short: "Military", demand: 72, audience: 70, growth: 49, youtube: 64, note: "Strong but insular community; clan/milsim culture crowds out casual entries." },
  { id: "brainrot", name: "Brainrot / Steal", short: "Brainrot", demand: 96, audience: 91, growth: 41, youtube: 97, note: "Peak attention, peak saturation. Re-skinning the collectible changes nothing." },
];

export const GAMEPLAYS: Gameplay[] = [
  { id: "simulator", name: "Simulator", short: "Sim", proven: 92 },
  { id: "survival", name: "Survival", short: "Surv", proven: 86 },
  { id: "tycoon", name: "Tycoon", short: "Tyco", proven: 89 },
  { id: "collection", name: "Collection", short: "Coll", proven: 90 },
  { id: "pvp", name: "PvP", short: "PvP", proven: 84 },
  { id: "management", name: "Management", short: "Mgmt", proven: 74 },
  { id: "horror", name: "Horror", short: "Horr", proven: 81 },
  { id: "obby", name: "Obby", short: "Obby", proven: 70 },
];

/**
 * Competition index per fantasy x gameplay cell, 0-100.
 * Derived from live-title count, combined CCU and how entrenched the leaders are.
 * Column order matches GAMEPLAYS.
 */
const COMPETITION: Record<string, number[]> = {
  //            sim surv tyc coll pvp mgmt horr obby
  scp: [66, 88, 34, 18, 58, 24, 93, 40],
  animals: [94, 47, 61, 79, 38, 27, 31, 55],
  firefighter: [45, 33, 52, 21, 26, 30, 22, 34],
  airport: [38, 22, 63, 19, 24, 41, 20, 29],
  zombies: [72, 91, 55, 36, 88, 29, 84, 44],
  police: [58, 49, 66, 25, 81, 32, 27, 41],
  space: [51, 39, 57, 28, 46, 33, 30, 36],
  pirates: [47, 44, 42, 31, 63, 26, 23, 38],
  farming: [83, 35, 74, 68, 29, 44, 21, 33],
  superheroes: [86, 41, 48, 62, 92, 25, 28, 47],
  military: [54, 67, 59, 33, 90, 37, 26, 39],
  brainrot: [97, 61, 78, 96, 74, 43, 52, 66],
};

export const GAMES: Game[] = [
  { name: "Site-19 Roleplay", fantasy: "scp", gameplay: "horror", ccu: 18400, visits: 412_000_000, likeRatio: 0.91, ageYears: 5, updatedRecently: true, strength: "Deep lore fidelity and a committed roleplay community.", weakness: "Brutal onboarding; new players quit inside two minutes." },
  { name: "Containment Breach Survival", fantasy: "scp", gameplay: "survival", ccu: 11200, visits: 268_000_000, likeRatio: 0.88, ageYears: 4, updatedRecently: true, strength: "Tense round pacing and readable objectives.", weakness: "No long-term progression, so retention collapses after week one." },
  { name: "Anomaly Facility Tycoon", fantasy: "scp", gameplay: "tycoon", ccu: 2100, visits: 21_000_000, likeRatio: 0.84, ageYears: 2, updatedRecently: false, strength: "First mover on facility building.", weakness: "Abandoned updates and shallow late game." },
  { name: "SCP Card Collectors", fantasy: "scp", gameplay: "collection", ccu: 480, visits: 3_100_000, likeRatio: 0.79, ageYears: 1, updatedRecently: false, strength: "Clear rarity ladder.", weakness: "Thin art budget, no facility fantasy, no social layer." },
  { name: "Adopt A Pet World", fantasy: "animals", gameplay: "simulator", ccu: 96000, visits: 3_900_000_000, likeRatio: 0.93, ageYears: 7, updatedRecently: true, strength: "Trading economy is the real product.", weakness: "Nearly impossible to displace head-on." },
  { name: "Wild Wolf Life", fantasy: "animals", gameplay: "survival", ccu: 6400, visits: 148_000_000, likeRatio: 0.86, ageYears: 5, updatedRecently: true, strength: "Strong roleplay-in-survival hybrid.", weakness: "Dated combat and rough mobile controls." },
  { name: "Zoo Keeper Manager", fantasy: "animals", gameplay: "management", ccu: 890, visits: 9_800_000, likeRatio: 0.82, ageYears: 2, updatedRecently: false, strength: "Satisfying enclosure building.", weakness: "No trading, no social hooks, weak retention loop." },
  { name: "Firefighter Rescue Sim", fantasy: "firefighter", gameplay: "simulator", ccu: 1700, visits: 34_000_000, likeRatio: 0.85, ageYears: 3, updatedRecently: true, strength: "Fun hose physics.", weakness: "Repetitive missions and no progression fantasy." },
  { name: "Station 7 Roleplay", fantasy: "firefighter", gameplay: "survival", ccu: 940, visits: 12_400_000, likeRatio: 0.8, ageYears: 4, updatedRecently: false, strength: "Committed roleplay regulars.", weakness: "Empty servers off-peak; nothing to do solo." },
  { name: "Airport Tycoon Deluxe", fantasy: "airport", gameplay: "tycoon", ccu: 3300, visits: 96_000_000, likeRatio: 0.87, ageYears: 5, updatedRecently: true, strength: "Clean build progression.", weakness: "Zero threat or tension; sessions end early." },
  { name: "Flight Line RP", fantasy: "airport", gameplay: "simulator", ccu: 1250, visits: 22_000_000, likeRatio: 0.81, ageYears: 3, updatedRecently: true, strength: "Authentic ground-crew roles.", weakness: "Requires a full server to be fun." },
  { name: "Zombie Uprising", fantasy: "zombies", gameplay: "survival", ccu: 24000, visits: 690_000_000, likeRatio: 0.9, ageYears: 6, updatedRecently: true, strength: "Best-in-class gunplay feel.", weakness: "Grind wall at mid level." },
  { name: "Undead Arena", fantasy: "zombies", gameplay: "pvp", ccu: 15600, visits: 310_000_000, likeRatio: 0.85, ageYears: 4, updatedRecently: true, strength: "Fast matchmaking.", weakness: "Severe skill-gap churn for new players." },
  { name: "City Patrol RP", fantasy: "police", gameplay: "pvp", ccu: 21000, visits: 540_000_000, likeRatio: 0.88, ageYears: 6, updatedRecently: true, strength: "Emergent cops-and-robbers drama.", weakness: "Toxic servers; no solo mode." },
  { name: "Evidence Room", fantasy: "police", gameplay: "collection", ccu: 320, visits: 1_900_000, likeRatio: 0.76, ageYears: 1, updatedRecently: false, strength: "Novel forensic framing.", weakness: "Unfinished, tiny content pool." },
  { name: "Deep Space Outpost", fantasy: "space", gameplay: "management", ccu: 610, visits: 7_400_000, likeRatio: 0.83, ageYears: 2, updatedRecently: true, strength: "Genuinely deep systems.", weakness: "Too complex for the median player; no tutorial." },
  { name: "Pirate Seas Legacy", fantasy: "pirates", gameplay: "pvp", ccu: 8900, visits: 210_000_000, likeRatio: 0.89, ageYears: 5, updatedRecently: true, strength: "Ship combat is unmatched.", weakness: "Anime-skinned; the classic pirate audience is unserved." },
  { name: "Grow & Trade Garden", fantasy: "farming", gameplay: "collection", ccu: 145000, visits: 5_100_000_000, likeRatio: 0.92, ageYears: 2, updatedRecently: true, strength: "Perfect idle + trade loop.", weakness: "Endgame players have nothing left to chase." },
  { name: "Barn Tycoon", fantasy: "farming", gameplay: "tycoon", ccu: 4200, visits: 88_000_000, likeRatio: 0.84, ageYears: 4, updatedRecently: true, strength: "Reliable tycoon pacing.", weakness: "Visually dated, no social layer." },
  { name: "Hero Clash", fantasy: "superheroes", gameplay: "pvp", ccu: 33000, visits: 780_000_000, likeRatio: 0.87, ageYears: 5, updatedRecently: true, strength: "Powers feel great.", weakness: "Pay-to-win perception in reviews." },
  { name: "Frontline Milsim", fantasy: "military", gameplay: "pvp", ccu: 12800, visits: 240_000_000, likeRatio: 0.86, ageYears: 6, updatedRecently: true, strength: "Serious clan infrastructure.", weakness: "Impenetrable to casual players." },
  { name: "Steal a Brainrot", fantasy: "brainrot", gameplay: "collection", ccu: 410000, visits: 12_000_000_000, likeRatio: 0.9, ageYears: 1, updatedRecently: true, strength: "Perfect social-theft loop and meme velocity.", weakness: "Category is fully claimed; clones die on arrival." },
  { name: "Brainrot Tycoon", fantasy: "brainrot", gameplay: "tycoon", ccu: 46000, visits: 890_000_000, likeRatio: 0.81, ageYears: 1, updatedRecently: true, strength: "Rides the meme wave.", weakness: "One of dozens of near-identical titles." },
];

export type Opportunity = {
  id: string;
  fantasy: Fantasy;
  gameplay: Gameplay;
  title: string;
  demand: number;
  competition: number;
  audienceOpportunity: number;
  novelty: number;
  gapScore: number;
  verdict: "gap" | "moderate" | "saturated";
  rationale: string;
  competitors: Game[];
  concepts: { title: string; tag: string }[];
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

function demandOf(f: Fantasy) {
  return clamp(f.demand * 0.5 + f.youtube * 0.32 + f.growth * 0.18);
}

function noveltyOf(competition: number, proven: number) {
  // A proven loop dropped into an uncrowded market is the highest-novelty move.
  return clamp((100 - competition) * 0.72 + proven * 0.28);
}

function audienceOpportunityOf(f: Fantasy, competition: number) {
  return clamp(f.audience * 0.6 + (100 - competition) * 0.4);
}

/** Demand x Audience x Novelty / Competition, squashed onto 0-100. */
export function gapScore(demand: number, audience: number, novelty: number, competition: number) {
  const raw = ((demand / 100) * (audience / 100) * (novelty / 100)) / Math.max(0.16, competition / 100);
  return clamp(100 * (1 - Math.exp(-raw * 1.15)));
}

const CONCEPT_VERBS: Record<string, (f: string) => { title: string; tag: string }[]> = {
  simulator: (f) => [
    { title: `${f} progression simulator with rarity tiers`, tag: "Sim" },
    { title: `Upgrade-driven ${f.toLowerCase()} career ladder`, tag: "Sim" },
    { title: `Idle ${f.toLowerCase()} sim with offline earnings`, tag: "Idle" },
  ],
  survival: (f) => [
    { title: `Round-based ${f.toLowerCase()} survival with meta progression`, tag: "Surv" },
    { title: `Co-op ${f.toLowerCase()} extraction runs`, tag: "Co-op" },
    { title: `Escalating ${f.toLowerCase()} night cycles`, tag: "Surv" },
  ],
  tycoon: (f) => [
    { title: `Build and expand a ${f.toLowerCase()} operation`, tag: "Tycoon" },
    { title: `${f} tycoon with staff hiring and events`, tag: "Tycoon" },
    { title: `Multiplayer ${f.toLowerCase()} district builder`, tag: "Social" },
  ],
  collection: (f) => [
    { title: `Discover and collect ${f.toLowerCase()} variants`, tag: "Coll" },
    { title: `${f} index with trading and rarity hunts`, tag: "Trade" },
    { title: `Seasonal ${f.toLowerCase()} collection events`, tag: "Live-ops" },
  ],
  pvp: (f) => [
    { title: `Objective-based ${f.toLowerCase()} team battles`, tag: "PvP" },
    { title: `${f} arena with loadout progression`, tag: "PvP" },
    { title: `Asymmetric ${f.toLowerCase()} hunt mode`, tag: "Asym" },
  ],
  management: (f) => [
    { title: `Run and staff a ${f.toLowerCase()} operation`, tag: "Mgmt" },
    { title: `${f} crisis management with failure states`, tag: "Mgmt" },
    { title: `${f} logistics with upgrade research`, tag: "Strategy" },
  ],
  horror: (f) => [
    { title: `${f} horror with a persistent hub`, tag: "Horror" },
    { title: `Investigate ${f.toLowerCase()} incidents co-op`, tag: "Co-op" },
    { title: `Procedural ${f.toLowerCase()} haunt runs`, tag: "Horror" },
  ],
  obby: (f) => [
    { title: `${f}-themed obby with checkpoints and shop`, tag: "Obby" },
    { title: `Race-format ${f.toLowerCase()} tower`, tag: "Race" },
    { title: `${f} obby creator with player stages`, tag: "UGC" },
  ],
};

export function buildOpportunity(fantasyId: string, gameplayId: string): Opportunity | null {
  const fantasy = FANTASIES.find((f) => f.id === fantasyId);
  const gameplay = GAMEPLAYS.find((g) => g.id === gameplayId);
  if (!fantasy || !gameplay) return null;

  const col = GAMEPLAYS.findIndex((g) => g.id === gameplayId);
  const competition = COMPETITION[fantasy.id]?.[col] ?? 50;
  const demand = demandOf(fantasy);
  const novelty = noveltyOf(competition, gameplay.proven);
  const audienceOpportunity = audienceOpportunityOf(fantasy, competition);
  const score = gapScore(demand, audienceOpportunity, novelty, competition);

  const verdict: Opportunity["verdict"] = competition >= 70 ? "saturated" : score >= 70 ? "gap" : "moderate";

  const competitors = GAMES.filter((g) => g.fantasy === fantasy.id).sort((a, b) => b.ccu - a.ccu);

  const rationale =
    verdict === "saturated"
      ? `${fantasy.name} x ${gameplay.name} is already crowded. ${fantasy.note} Changing the skin on an occupied loop rarely creates a new market — take the loop to an audience that has not seen it.`
      : `${fantasy.note} ${gameplay.name} is a proven loop (${gameplay.proven}/100 platform-wide) but only reaches ${competition}/100 competition inside this fantasy, which is where the gap lives.`;

  return {
    id: `${fantasy.id}-${gameplay.id}`,
    fantasy,
    gameplay,
    title: `${fantasy.name} x ${gameplay.name}`,
    demand,
    competition,
    audienceOpportunity,
    novelty,
    gapScore: score,
    verdict,
    rationale,
    competitors,
    concepts: (CONCEPT_VERBS[gameplay.id] ?? CONCEPT_VERBS["simulator"]!)(fantasy.name),
  };
}

export function allOpportunities(): Opportunity[] {
  const out: Opportunity[] = [];
  for (const f of FANTASIES) {
    for (const g of GAMEPLAYS) {
      const o = buildOpportunity(f.id, g.id);
      if (o) out.push(o);
    }
  }
  return out.sort((a, b) => b.gapScore - a.gapScore);
}

export function competitionFor(fantasyId: string, gameplayId: string) {
  const col = GAMEPLAYS.findIndex((g) => g.id === gameplayId);
  return COMPETITION[fantasyId]?.[col] ?? 50;
}

export type ResearchSignal = {
  source: "YouTube" | "Reddit" | "Roblox reviews";
  quote: string;
  fantasy: string;
  gameplay: string;
  weight: number;
};

export const RESEARCH_SIGNALS: ResearchSignal[] = [
  { source: "YouTube", quote: "SCP facility building videos pull 3-8x the views of the games they cover", fantasy: "scp", gameplay: "management", weight: 91 },
  { source: "Reddit", quote: "\"Why does every SCP game have to be horror? I just want to run the site.\"", fantasy: "scp", gameplay: "collection", weight: 88 },
  { source: "Roblox reviews", quote: "\"Cool idea but I had no clue what to do for the first 10 minutes\"", fantasy: "scp", gameplay: "survival", weight: 74 },
  { source: "YouTube", quote: "Cleaning and restoration compilations keep out-performing the games themselves", fantasy: "firefighter", gameplay: "simulator", weight: 84 },
  { source: "Reddit", quote: "\"I wish there was an airport game where things actually go wrong.\"", fantasy: "airport", gameplay: "survival", weight: 81 },
  { source: "YouTube", quote: "Ground-crew POV videos are a steady niche with almost no game supply", fantasy: "airport", gameplay: "management", weight: 77 },
  { source: "Reddit", quote: "\"I'm tired of every new game being the same steal-a-thing clone.\"", fantasy: "brainrot", gameplay: "collection", weight: 93 },
  { source: "Roblox reviews", quote: "\"Great on PC, unplayable on mobile\" appears in most top police RP reviews", fantasy: "police", gameplay: "pvp", weight: 69 },
  { source: "YouTube", quote: "Pirate ship-building content spikes without a matching Roblox title", fantasy: "pirates", gameplay: "tycoon", weight: 72 },
  { source: "Reddit", quote: "\"Why doesn't anyone make a serious space colony game on Roblox?\"", fantasy: "space", gameplay: "management", weight: 76 },
];
