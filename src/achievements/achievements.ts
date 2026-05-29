import { type PracticeAnalytics } from "../analytics/practiceAnalytics.js";

export function getAchievements(analytics: PracticeAnalytics) {
  const achievements: string[] = [];

  if (analytics.currentStreak >= 7) achievements.push("7 Day Streak");
  if (analytics.longestStreak >= 30) achievements.push("Consistency Machine");
  if (analytics.solved >= 1) achievements.push("First Solve");
  if (analytics.solved >= 50) achievements.push("50 Problems Solved");
  if ((analytics.difficultyCounts.get("hard") ?? 0) >= 1) achievements.push("First Hard Problem");
  if ((analytics.topicCounts.get("dp") ?? 0) >= 5) achievements.push("DP Survivor");
  if ((analytics.topicCounts.get("graphs") ?? 0) >= 5) achievements.push("Graph Explorer");
  if (analytics.languages.has("sql")) achievements.push("SQL Specialist");

  return achievements;
}
