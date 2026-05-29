import { getPracticeRecords } from "../registry/practice.js";
import { type ProblemRecord } from "../types/problem.js";

export interface PracticeAnalytics {
  records: ProblemRecord[];
  solved: number;
  attempted: number;
  stuck: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  activeDays: Set<string>;
  topicCounts: Map<string, number>;
  topicStuck: Map<string, number>;
  difficultyCounts: Map<string, number>;
  platformCounts: Map<string, number>;
  languages: Set<string>;
}

export async function getPracticeAnalytics(): Promise<PracticeAnalytics> {
  const records = await getPracticeRecords();
  const activeDays = new Set(records.map((record) => dayKey(record.endedAt ?? record.startedAt)));
  const topicCounts = new Map<string, number>();
  const topicStuck = new Map<string, number>();
  const difficultyCounts = new Map<string, number>();
  const platformCounts = new Map<string, number>();
  const languages = new Set<string>();

  for (const record of records) {
    increment(difficultyCounts, record.difficulty);
    increment(platformCounts, record.platform);
    languages.add(record.language);

    for (const topic of record.topics) {
      increment(topicCounts, topic);

      if (record.status === "stuck") {
        increment(topicStuck, topic);
      }
    }
  }

  return {
    records,
    solved: records.filter((record) => record.status === "solved").length,
    attempted: records.length,
    stuck: records.filter((record) => record.status === "stuck").length,
    totalMinutes: records.reduce((sum, record) => sum + (record.timeSpentMinutes ?? 0), 0),
    currentStreak: calculateCurrentStreak(activeDays),
    longestStreak: calculateLongestStreak(activeDays),
    activeDays,
    topicCounts,
    topicStuck,
    difficultyCounts,
    platformCounts,
    languages,
  };
}

export function getRank(analytics: PracticeAnalytics) {
  const score =
    analytics.solved * 10 +
    analytics.stuck * 2 +
    analytics.currentStreak * 5 +
    (analytics.difficultyCounts.get("hard") ?? 0) * 8 +
    (analytics.difficultyCounts.get("medium") ?? 0) * 4;

  if (score >= 1200) return "Algorithm Master";
  if (score >= 700) return "Problem Slayer";
  if (score >= 400) return "Competitive Grinder";
  if (score >= 180) return "Advanced Solver";
  if (score >= 60) return "Intermediate Solver";
  return "Beginner";
}

export function topEntry(map: Map<string, number>) {
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0];
}

export function dayKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function increment(map: Map<string, number>, key: string) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function calculateCurrentStreak(days: Set<string>) {
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function calculateLongestStreak(days: Set<string>) {
  const sorted = [...days].sort();
  let longest = 0;
  let current = 0;
  let previous: Date | undefined;

  for (const day of sorted) {
    const date = new Date(day);

    if (previous && date.getTime() - previous.getTime() === 86400000) {
      current += 1;
    } else {
      current = 1;
    }

    longest = Math.max(longest, current);
    previous = date;
  }

  return longest;
}
