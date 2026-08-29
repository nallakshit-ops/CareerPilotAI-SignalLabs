const q = '(Databases OR "Machine Learning" OR AI) hackathon';
fetch('https://api.github.com/search/repositories?q=' + encodeURIComponent(q) + '&sort=stars&order=desc', {
  headers: { 'User-Agent': 'node.js' }
})
.then(r => r.json())
.then(data => console.log('Total:', data.total_count, 'Items:', data.items?.length))
.catch(console.error);
