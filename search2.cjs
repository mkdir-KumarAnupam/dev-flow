const fs = require('fs');
const text = fs.readFileSync('C:/Users/kranu/.gemini/antigravity/brain/93f39ce9-faa8-43ba-8ced-c41b539a40e6/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = text.split('\n');
for (const line of lines) {
  if (line.includes('/api/linear')) {
    const json = JSON.parse(line);
    const content = json.tool_calls?.[0]?.args?.ReplacementContent || json.tool_calls?.[0]?.args?.CodeContent || json.tool_calls?.[0]?.args?.ReplacementChunks?.[0]?.ReplacementContent;
    if (content && content.includes('api.linear.app')) {
      console.log("----");
      console.log(content.substring(0, 1000));
    }
  }
}
