fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'query { question(titleSlug: "best-time-to-buy-and-sell-stock") { content } }' })
}).then(r => r.json()).then(data => {
  const content = data.data.question.content;
  const match5 = content.match(new RegExp('<strong>Output:</strong>\\s*([^<\\n]+)', 'g'));
  console.log("MATCH 5:", match5);
});
