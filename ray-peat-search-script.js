// Fetch data from GitHub
async function fetchGitHubData() {
  const apiUrl = 'https://api.github.com/repos/kaizengm/raypeatarchive1/git/trees/main?recursive=1';
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.tree.filter(item => item.path.endsWith('.shtml'));
}

// Fetch content of a single file
async function fetchFileContent(url) {
  const response = await fetch(url);
  return await response.text();
}

// Process all text files
async function processAllFiles() {
  const files = await fetchGitHubData();
  let allContent = '';
  for (const file of files) {
    const content = await fetchFileContent(file.url);
    allContent += content + '\n';
  }
  return allContent;
}

// Search function
function searchContent(content, query) {
  const lines = content.split('\n');
  return lines.filter(line => line.toLowerCase().includes(query.toLowerCase()));
}

// Main function to set up the search
async function setupSearch() {
  const content = await processAllFiles();
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const resultsContainer = document.getElementById('searchResults');

  searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    const results = searchContent(content, query);
    displayResults(results);
  });

  function displayResults(results) {
    resultsContainer.innerHTML = '';
    results.forEach(result => {
      const div = document.createElement('div');
      div.textContent = result;
      resultsContainer.appendChild(div);
    });
  }
}

// Initialize the search when the page loads
window.addEventListener('load', setupSearch);
