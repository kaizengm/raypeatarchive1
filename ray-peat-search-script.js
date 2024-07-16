// Fetch data from GitHub
async function fetchGitHubData() {
  const apiUrl = 'https://api.github.com/repos/kaizengm/raypeatarchive1/contents/documents/raypeat.com';
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.filter(item => item.name.endsWith('.md'));
}

// Fetch content of a single file
async function fetchFileContent(url) {
  const response = await fetch(url);
  return await response.text();
}

// Process all markdown files
async function processAllFiles() {
  const files = await fetchGitHubData();
  let allContent = [];
  for (const file of files) {
    const content = await fetchFileContent(file.download_url);
    allContent.push({ name: file.name, content: content });
  }
  return allContent;
}

// Search function
function searchContent(files, query) {
  const results = [];
  const regex = new RegExp(query, 'gi');
  
  files.forEach(file => {
    const matches = file.content.match(regex);
    if (matches) {
      const snippets = file.content.split('\n')
        .filter(line => line.toLowerCase().includes(query.toLowerCase()))
        .map(line => {
          return line.replace(regex, match => `<mark>${match}</mark>`);
        });
      results.push({ name: file.name, snippets: snippets });
    }
  });
  
  return results;
}

// Main function to set up the search
async function setupSearch() {
  const files = await processAllFiles();
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const resultsContainer = document.getElementById('searchResults');

  searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    const results = searchContent(files, query);
    displayResults(results);
  });

  function displayResults(results) {
    resultsContainer.innerHTML = '';
    if (results.length === 0) {
      resultsContainer.innerHTML = '<p>No results found.</p>';
      return;
    }
    results.forEach(result => {
      const fileDiv = document.createElement('div');
      fileDiv.innerHTML = `<h3 class="font-bold mt-4">${result.name}</h3>`;
      result.snippets.forEach(snippet => {
        const snippetDiv = document.createElement('div');
        snippetDiv.innerHTML = snippet;
        snippetDiv.className = 'mb-2';
        fileDiv.appendChild(snippetDiv);
      });
      resultsContainer.appendChild(fileDiv);
    });
  }
}

// Initialize the search when the page loads
window.addEventListener('load', setupSearch);
