fetch('https://leetcode.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: 'query { question(titleSlug: "two-sum") { exampleTestcaseList metaData } }' })
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2)));
