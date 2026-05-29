const fs = require('fs');
const text = fs.readFileSync('C:/Users/kranu/.gemini/antigravity/brain/93f39ce9-faa8-43ba-8ced-c41b539a40e6/.system_generated/logs/transcript.jsonl', 'utf8');
const lines = text.split('\n');
for (const line of lines) {
  if (line.includes('/api/linear')) {
    const json = JSON.parse(line);
    if (json.tool_calls?.[0]?.name === 'write_to_file' || json.tool_calls?.[0]?.name === 'replace_file_content' || json.tool_calls?.[0]?.name === 'multi_replace_file_content') {
       console.log("Found in tool call: ", json.tool_calls?.[0]?.name);
       console.log(json.tool_calls?.[0]?.args?.CodeContent?.substring(0, 500) || json.tool_calls?.[0]?.args?.ReplacementContent?.substring(0, 500) || json.tool_calls?.[0]?.args?.ReplacementChunks?.[0]?.ReplacementContent?.substring(0, 500));
    }
  }
}
