const match = [ '<strong>Output:</strong> 5', '<strong>Output:</strong> 0' ];
const i = 0;
const expectedRaw = match && match[i] ? match[i].replace(new RegExp('<strong>Output:</strong>\\\\s*'), '').trim() : '';
console.log("expectedRaw:", expectedRaw);
