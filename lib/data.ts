export type Position = "Goalkeeper" | "Defender" | "Midfielder" | "Forward";

export interface Player {
  id: string;
  name: string;
  position: Position;
  appearances: number;
  goals: number;
  assists: number;
  image?: string;
}

export interface MatchEvent {
  player: string;
  count: number;
}

export interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  result: "W" | "D" | "L" | "Upcoming";
  score?: string;
  summary?: string;
  motm?: string;
  lineup?: string[];
  subs?: string[];
  goals?: MatchEvent[];
  assists?: MatchEvent[];
}

export const squad: Player[] = [
  // Goalkeepers
  { id: "gk-1", name: "Hersh", position: "Goalkeeper", appearances: 0, goals: 0, assists: 0 },
  { id: "gk-2", name: "Hadi", position: "Goalkeeper", appearances: 7, goals: 1, assists: 0 },
  { id: "gk-3", name: "Hansel", position: "Goalkeeper", appearances: 7, goals: 0, assists: 1 },

  // Defenders
  { id: "def-1", name: "Izz Danish", position: "Defender", appearances: 0, goals: 0, assists: 0 },
  { id: "def-2", name: "Vasanth", position: "Defender", appearances: 0, goals: 0, assists: 0 },
  { id: "def-3", name: "Aniq", position: "Defender", appearances: 5, goals: 0, assists: 0 },
  { id: "def-4", name: "Riefqan", position: "Defender", appearances: 0, goals: 0, assists: 0 },
  { id: "def-5", name: "Ameer", position: "Defender", appearances: 6, goals: 0, assists: 0 },
  { id: "def-6", name: "Syafiq", position: "Defender", appearances: 7, goals: 0, assists: 0 },
  { id: "def-7", name: "Raakesh", position: "Defender", appearances: 2, goals: 0, assists: 0 },
  { id: "def-8", name: "Arish", position: "Defender", appearances: 4, goals: 0, assists: 0 },
  { id: "def-9", name: "Visesh", position: "Defender", appearances: 3, goals: 0, assists: 0 },

  // Midfielders
  { id: "mid-1", name: "Haron", position: "Midfielder", appearances: 0, goals: 0, assists: 0 },
  { id: "mid-2", name: "Santosh", position: "Midfielder", appearances: 3, goals: 1, assists: 3 },
  { id: "mid-3", name: "Ryogo", position: "Midfielder", appearances: 5, goals: 0, assists: 0 },
  { id: "mid-4", name: "Tamim", position: "Midfielder", appearances: 0, goals: 0, assists: 0 },
  { id: "mid-5", name: "Dharshan", position: "Midfielder", appearances: 1, goals: 2, assists: 0 },
  { id: "mid-6", name: "Faisal", position: "Midfielder", appearances: 0, goals: 0, assists: 0 },
  { id: "mid-7", name: "Fudhail", position: "Midfielder", appearances: 1, goals: 0, assists: 0 },
  { id: "mid-8", name: "Shriyansh", position: "Midfielder", appearances: 6, goals: 2, assists: 0 },
  { id: "mid-9", name: "Akash", position: "Midfielder", appearances: 4, goals: 0, assists: 0 },
  { id: "mid-10", name: "Rohan", position: "Midfielder", appearances: 1, goals: 0, assists: 0 },

  // Forwards
  { id: "fwd-1", name: "Shezan", position: "Forward", appearances: 11, goals: 4, assists: 1 },
  { id: "fwd-2", name: "Haziq", position: "Forward", appearances: 5, goals: 0, assists: 0 },
  { id: "fwd-4", name: "Jasteen", position: "Forward", appearances: 0, goals: 0, assists: 0 },
  { id: "fwd-5", name: "Ronit", position: "Forward", appearances: 4, goals: 5, assists: 0 },
  { id: "fwd-6", name: "Rishi", position: "Forward", appearances: 1, goals: 1, assists: 0 },
  { id: "fwd-7", name: "Zidane", position: "Forward", appearances: 9, goals: 8, assists: 6 },
  { id: "fwd-8", name: "Malcolm", position: "Forward", appearances: 1, goals: 1, assists: 0 },
  { id: "mid-11", name: "Saachin", position: "Midfielder", appearances: 2, goals: 0, assists: 1 },
  { id: "mid-12", name: "Adi", position: "Midfielder", appearances: 4, goals: 1, assists: 0 },
  { id: "mid-13", name: "Ariv", position: "Midfielder", appearances: 2, goals: 1, assists: 0 },
  { id: "fwd-9", name: "Zayaan", position: "Forward", appearances: 3, goals: 3, assists: 1 },
  { id: "fwd-10", name: "Nas", position: "Forward", appearances: 4, goals: 1, assists: 0 },
];

export const matches: Match[] = [
  {
    id: "m-1",
    date: "4 April",
    opponent: "67 FC",
    location: "Dunman Secondary",
    result: "D",
    score: "8 - 8",
    summary: "A thrilling game where we made a comeback by scoring a last minute goal.",
    motm: "Ronit",
    lineup: ["Hansel", "Ryogo", "Arish", "Dharshan", "Zidane", "Ronit", "Shezan", "Zayaan", "Shriyansh", "Ameer", "Rishi"],
    goals: [
      { player: "Ronit", count: 3 },
      { player: "Zidane", count: 2 },
      { player: "Dharshan", count: 2 },
      { player: "Rishi", count: 1 },
    ],
  },
  {
    id: "m-2",
    date: "2nd May",
    opponent: "Tampines Glazers FC",
    location: "Dunman Secondary",
    result: "L",
    score: "2 - 3",
    lineup: ["Hansel", "Aniq", "Haziq", "Hadi", "Syafiq", "Santosh", "Ryogo", "Shriyansh", "Shezan", "Akash", "Arish"],
    goals: [
      { player: "Shezan", count: 1 },
      { player: "Shriyansh", count: 1 },
    ],
    assists: [{ player: "Santosh", count: 1 }],
  },
  {
    id: "m-3",
    date: "24th May, 1:00 PM",
    opponent: "Toezilla FC",
    location: "",
    result: "L",
    score: "1 - 2",
    lineup: ["Shezan", "Akash", "Ameer", "Haziq", "Ronit", "Zidane", "Ryogo", "Santosh", "Hansel", "Hadi", "Aniq"],
    subs: ["Rohan", "Shriyansh", "Syafiq"],
    goals: [{ player: "Santosh", count: 1 }],
  },
  {
    id: "m-4",
    date: "5th June",
    opponent: "Clover FC",
    location: "SIA Sports Club",
    result: "L",
    score: "4 - 5",
    goals: [
      { player: "Zidane", count: 1 },
      { player: "Malcolm", count: 1 },
      { player: "Ronit", count: 2 },
    ],
    assists: [
      { player: "Zidane", count: 2 },
      { player: "Saachin", count: 1 },
    ],
  },
  {
    id: "m-5",
    date: "13th June, 11:00 AM",
    opponent: "Teksha FC",
    location: "Punggol Sec",
    result: "L",
    score: "3 - 5",
    lineup: ["Hansel", "Hadi", "Haziq", "Syafiq", "Shriyansh", "Ryogo", "Adi", "Zidane", "Shezan", "Santosh", "Ameer"],
    subs: ["Raakesh"],
    goals: [
      { player: "Adi", count: 1 },
      { player: "Shriyansh", count: 1 },
      { player: "Own Goal", count: 1 },
    ],
    assists: [{ player: "Santosh", count: 2 }],
  },
  {
    id: "m-6",
    date: "27th June, 5:00 PM",
    opponent: "67ers",
    location: "North Vista Sec",
    result: "L",
    score: "6 - 9",
    lineup: ["Hansel", "Ameer", "Syafiq", "Raakesh", "Arish", "Aniq", "Ryogo", "Haziq", "Gibson", "Shafiq", "Shezan"],
    subs: ["Zayaan", "Shriyansh"],
    goals: [
      { player: "Zayaan", count: 2 },
      { player: "Shezan", count: 2 },
      { player: "Shafiq", count: 1 },
      { player: "Gibson", count: 1 },
    ],
    assists: [
      { player: "Zayaan", count: 1 },
      { player: "Hansel", count: 1 },
      { player: "Shezan", count: 1 },
    ],
  },
  {
    id: "m-7",
    date: "11th July, 1:00 PM",
    opponent: "Only Goons FC",
    location: "North Vista Sec",
    result: "W",
    score: "3 - 2",
    lineup: ["Hansel", "Syafiq", "Zayaan", "Mikail", "Nitesh", "Shezan", "Zidane", "Athan", "Adi", "Iman", "Saachin"],
    goals: [
      { player: "Zidane", count: 2 },
      { player: "Zayaan", count: 1 },
    ],
  },
  {
    id: "m-8",
    date: "16th August, 1:00 PM",
    opponent: "67ers FC",
    location: "North Vista Sec",
    result: "L",
    score: "2 - 4",
    lineup: ["Hadi", "Syafiq", "Aniq", "Rafa", "Imran", "Shezan", "Arish", "Zidane", "Nas", "Arif"],
    subs: ["Visesh"],
    goals: [
      { player: "Zidane", count: 1 },
      { player: "Nas", count: 1 },
    ],
    assists: [{ player: "Zidane", count: 1 }],
  },
  {
    id: "m-9",
    date: "6th September, 1:00 PM",
    opponent: "Tampines Glazers FC",
    location: "",
    result: "W",
    score: "3 - 2",
    lineup: ["Yuwan", "Hadi", "Shezan", "Ameer", "Izzudin", "Rafa", "Ariv", "Adi", "Zidane", "Nas", "Akash"],
    goals: [
      { player: "Ariv", count: 1 },
      { player: "Zidane", count: 1 },
      { player: "Hadi", count: 1 },
    ],
  },
  {
    id: "m-10",
    date: "13th September, 1:00 PM",
    opponent: "Club Este FC",
    location: "Bedok Green Sec",
    result: "L",
    score: "0 - 5",
    lineup: ["Aniq", "Hadi", "Imran", "Adi", "Visesh", "Akash", "Ronit", "Hansel", "Shezan", "Zidane", "Nas"],
  },
  {
    id: "m-11",
    date: "18th September, 5:00 PM",
    opponent: "Clovers FC",
    location: "SIA Sports Club",
    result: "W",
    score: "3 - 3",
    summary: "Tied 3-3 at full time, won 4-3 on penalties.",
    lineup: ["Haziq", "Sanjev", "Fudhail", "Visesh", "Shezan", "Nanda", "Ishwaar", "Zidane", "Jason", "Ariv", "Nas"],
    goals: [
      { player: "Shezan", count: 1 },
      { player: "Nanda", count: 1 },
      { player: "Zidane", count: 1 },
    ],
  },
];

// ---------- Derived helpers ----------

export const POSITION_ORDER: Position[] = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

export const POSITION_SHORT: Record<Position, string> = {
  Goalkeeper: "GK",
  Defender: "DEF",
  Midfielder: "MID",
  Forward: "FWD",
};

export function groupByPosition(players: Player[]): { position: Position; players: Player[] }[] {
  return POSITION_ORDER.map((position) => ({
    position,
    players: players
      .filter((p) => p.position === position)
      .sort((a, b) => b.appearances - a.appearances || b.goals - a.goals || a.name.localeCompare(b.name)),
  })).filter((group) => group.players.length > 0);
}

export interface ParsedScore {
  for: number;
  against: number;
}

export function parseScore(match: Match): ParsedScore | null {
  if (!match.score) return null;
  const parts = match.score.split("-").map((s) => Number(s.trim()));
  if (parts.length !== 2 || parts.some((n) => Number.isNaN(n))) return null;
  return { for: parts[0], against: parts[1] };
}

export interface TeamRecord {
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

export function getTeamRecord(allMatches: Match[]): TeamRecord {
  const played = allMatches.filter((m) => m.result !== "Upcoming");
  const record: TeamRecord = {
    played: played.length,
    won: played.filter((m) => m.result === "W").length,
    drawn: played.filter((m) => m.result === "D").length,
    lost: played.filter((m) => m.result === "L").length,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
  for (const m of played) {
    const score = parseScore(m);
    if (score) {
      record.goalsFor += score.for;
      record.goalsAgainst += score.against;
    }
  }
  record.goalDifference = record.goalsFor - record.goalsAgainst;
  return record;
}

export interface TrendPoint {
  matchday: number;
  opponent: string;
  result: Match["result"];
  score: string;
  goalDifference: number;
  cumulative: number;
}

/** Match-by-match cumulative goal difference, in chronological (matchday) order. */
export function getGoalDifferenceTrend(allMatches: Match[]): TrendPoint[] {
  let cumulative = 0;
  const points: TrendPoint[] = [];
  allMatches.forEach((m, i) => {
    if (m.result === "Upcoming") return;
    const score = parseScore(m);
    const gd = score ? score.for - score.against : 0;
    cumulative += gd;
    points.push({
      matchday: i + 1,
      opponent: m.opponent,
      result: m.result,
      score: m.score ?? "",
      goalDifference: gd,
      cumulative,
    });
  });
  return points;
}

/** Most recent completed results first, oldest last. */
export function getForm(allMatches: Match[], count = 5): Match["result"][] {
  return allMatches
    .filter((m) => m.result !== "Upcoming")
    .slice(-count)
    .reverse()
    .map((m) => m.result);
}

export type LeaderboardKey = "goals" | "assists" | "appearances" | "involvements";

export function getLeaders(players: Player[], key: LeaderboardKey): Player[] {
  const valueOf = (p: Player) =>
    key === "involvements" ? p.goals + p.assists : p[key];
  return [...players].sort(
    (a, b) => valueOf(b) - valueOf(a) || b.appearances - a.appearances || a.name.localeCompare(b.name)
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
