
import chalk from "chalk";
import { type PracticeProblem, type ProblemDifficulty } from "../../types/problem.js";

const ENDPOINT = "https://leetcode.com/graphql";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  "Referer": "https://leetcode.com/problemset/all/"
};

interface QuestionListFilter {
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  tags?: string[];
  searchQuery?: string;
}

export async function fetchRandomLeetCodeProblem(filters: { difficulty?: string, topics?: string[] } = {}): Promise<PracticeProblem | null> {
  try {
    const filterInput: QuestionListFilter = {};
    if (filters.difficulty) filterInput.difficulty = filters.difficulty.toUpperCase() as any;
    if (filters.topics && filters.topics.length > 0) filterInput.tags = filters.topics;

    const randomSlug = await getRandomTitleSlug(filterInput);
    if (!randomSlug) {
      return null;
    }

    return await fetchProblemDetails(randomSlug);
  } catch (err) {
    console.error(chalk.yellow("Failed to fetch from LeetCode API: "), err);
    return null;
  }
}

async function getRandomTitleSlug(filters: QuestionListFilter): Promise<string | null> {
  const query = `
    query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
      randomQuestion(categorySlug: $categorySlug, filters: $filters) {
        titleSlug
      }
    }
  `;

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      query,
      variables: {
        categorySlug: "algorithms",
        filters
      }
    })
  });

  const data: any = await response.json();
  return data?.data?.randomQuestion?.titleSlug || null;
}

async function fetchProblemDetails(titleSlug: string): Promise<PracticeProblem | null> {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        questionFrontendId
        title
        titleSlug
        isPaidOnly
        difficulty
        topicTags { name slug }
        stats
        companyTagStats
      }
    }
  `;

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({
      query,
      variables: { titleSlug }
    })
  });

  const data: any = await response.json();
  const q = data?.data?.question;
  
  if (!q || q.isPaidOnly) return null; // We skip premium questions since users might not have access

  let acceptanceRate = 50.0;
  try {
    const stats = JSON.parse(q.stats);
    if (stats.acRate) {
      acceptanceRate = parseFloat(stats.acRate.replace("%", ""));
    }
  } catch {
    // Ignore parse errors
  }

  let companies: string[] = [];
  try {
    if (q.companyTagStats) {
      const parsed = JSON.parse(q.companyTagStats);
      const slugs = new Set<string>();
      for (const key of Object.keys(parsed)) {
        for (const tag of parsed[key]) {
          if (tag.slug) slugs.add(tag.slug);
        }
      }
      companies = Array.from(slugs);
    }
  } catch {
    // Ignore parse errors
  }

  return {
    platform: "leetcode",
    problemId: q.questionFrontendId,
    title: q.title,
    slug: q.titleSlug,
    difficulty: q.difficulty.toLowerCase() as ProblemDifficulty,
    topics: q.topicTags.map((t: any) => t.slug),
    url: `https://leetcode.com/problems/${q.titleSlug}/`,
    acceptanceRate,
    companies
  };
}
