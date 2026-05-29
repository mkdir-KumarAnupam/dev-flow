import { getConfig } from "../commands/config.js";

export async function analyzeSession(sessionData: any) {
  const apiKey = (await getConfig("groqKey")) || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return {
      error: "No Groq API key found. Run 'dev config set groqKey <YOUR_KEY>'."
    };
  }

  const prompt = `You are an elite, highly professional productivity analyst and engineering manager.
I have just finished a deep work session. Analyze my performance based on my exact chronological timeline and hard metrics.

SESSION DATA:
Total Duration: ${sessionData.durationMinutes} minutes
Flow Score: ${sessionData.flowScore} / 100
Lines of Code Written: ${sessionData.locDelta}
Coding Time: ${sessionData.codingSeconds} seconds
Distraction Time: ${sessionData.distractionSeconds} seconds
Timeline Events:
${JSON.stringify(sessionData.timeline, null, 2)}

INSTRUCTIONS:
You must act as a highly intelligent context filter. The naive telemetry daemon uses hardcoded rules (e.g. all "youtube" is "distraction"). You must read the exact "windowTitle" of each event and correct the daemon's mistakes. For example, if I was watching a "Next.js Tutorial" on YouTube, that is "research", not a "distraction". 

1. "recalibratedEvents": Provide an array of objects for ANY event in the timeline that was incorrectly categorized. Provide the "index" of the event in the timeline array, its "newCategory" ("coding", "research", "distraction", or "idle"), and a brief "reason". If no corrections are needed, return an empty array.
2. "wastedTimeAnalysis": Specifically name the actual video titles or page titles that were true distractions and explicitly tell me how much time I wasted on them. Be extremely specific.
3. "coreObservations": Provide an array of 2 to 3 very concise, single-line bullet points (max 10 words each) highlighting the most critical observations.
4. "derivedMetrics": Calculate 3 hidden metrics (e.g., "Avg Sustained Focus", "Context Switch Rate", "Deep Work Ratio"). Provide 'label', 'value', and 'status' ("good", "bad", "neutral").

Return ONLY a valid JSON object matching this schema:
{
  "recalibratedEvents": [
    {
      "index": 0,
      "newCategory": "string",
      "reason": "string"
    }
  ],
  "wastedTimeAnalysis": "string",
  "coreObservations": ["string"],
  "derivedMetrics": [
    {
      "label": "string",
      "value": "string",
      "status": "string"
    }
  ]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API responded with status ${res.status}: ${text}`);
    }

    const data = await res.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (err: any) {
    return {
      error: "AI Analysis Failed: " + err.message
    };
  }
}
