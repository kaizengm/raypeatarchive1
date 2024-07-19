// Fetch data from GitHub
async function fetchGitHubData() {
  try {
    updateLoadingMessage('Fetching GitHub data...');
    const apiUrl = 'https://api.github.com/repos/kaizengm/raypeatarchive1/contents/documents/raypeat.com';
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Fetched GitHub data:', data);
    return data.filter(item => item.name.endsWith('.md'));
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    throw error;
  }
}

// Fetch content of a single file
async function fetchFileContent(url, fileName) {
  try {
    updateLoadingMessage(`Processing file: ${fileName}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error fetching file content:', error);
    throw error;
  }
}

// Process all markdown files
async function processAllFiles() {
  try {
    const files = await fetchGitHubData();
    updateLoadingMessage('Processing files...');
    console.log('Processing files:', files);
    let allContent = [];
    for (const file of files) {
      const content = await fetchFileContent(file.download_url, file.name);
      allContent.push({ name: file.name, content: content });
    }
    console.log('Processed all files:', allContent);
    updateLoadingMessage('Done');
    return allContent;
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
  }
}

// Update loading message
function updateLoadingMessage(message) {
  const loadingText = document.querySelector('#loadingIndicator p');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Search function
function searchContent(files, query) {
  console.log('Searching for:', query);
  const results = [];
  const regex = new RegExp(query, 'gi');
  
  files.forEach(file => {
    const matches = file.content.match(regex);
    if (matches) {
      const lines = file.content.split('\n');
      const title = lines[0].trim() || file.name; // Use first line as title, fallback to filename
      
      const snippets = lines
        .filter(line => line.toLowerCase().includes(query.toLowerCase()))
        .map(line => {
          const words = line.split(/\s+/);
          const matchIndex = words.findIndex(word => word.toLowerCase().includes(query.toLowerCase()));
          const start = Math.max(0, matchIndex - 7);
          const end = Math.min(words.length, matchIndex + 8);
          let snippet = words.slice(start, end).join(' ');
          
          // Ensure the snippet doesn't cut off mid-sentence
          if (start > 0 && !snippet.match(/^[.!?]\s/)) {
            snippet = '...' + snippet;
          }
          if (end < words.length && !snippet.match(/[.!?]$/)) {
            snippet = snippet + '...';
          }
          
          return snippet.replace(regex, match => `<mark>${match}</mark>`);
        })
        .slice(0, 5); // Limit to 5 snippets per file
      
      if (snippets.length === 5 && lines.length > 5) {
        snippets.push('<span class="underline">Read more...</span>');
      }
      
      results.push({ name: title, snippets: snippets });
    }
  });
  
  console.log('Search results:', results);
  return results;
}

// Main function to set up the search
async function setupSearch() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');
  const resultsContainer = document.getElementById('searchResults');

  if (!loadingIndicator || !searchInput || !searchButton || !resultsContainer) {
    console.error('Required DOM elements not found. Ensure all elements are present in the HTML.');
    return;
  }

  try {
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    searchInput.disabled = true;
    searchButton.disabled = true;

    const files = await processAllFiles();

    // Hide loading indicator and enable search
    setTimeout(() => {
      loadingIndicator.style.display = 'none';
      searchInput.disabled = false;
      searchButton.disabled = false;
    }, 1000); // Delay to show "Done" message

    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        const searchResults = searchContent(files, query);
        displayResults(searchResults);
      }
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          const searchResults = searchContent(files, query);
          displayResults(searchResults);
        }
      }
    });

    function displayResults(results) {
      resultsContainer.innerHTML = '';
      if (results.length === 0) {
        resultsContainer.innerHTML = '<p>No results found.</p>';
      } else {
        results.forEach(result => {
          const resultElement = document.createElement('div');
          resultElement.className = 'result-item mb-4';
          resultElement.innerHTML = `
            <h2 class="text-xl font-semibold mb-2">${result.name}</h2>
            <ul class="list-disc pl-5">
              ${result.snippets.map(snippet => `<li class="mb-1">${snippet}</li>`).join('')}
            </ul>
          `;
          resultsContainer.appendChild(resultElement);
        });
      }
    }
  } catch (error) {
    console.error('Error setting up search:', error);
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (resultsContainer) {
      resultsContainer.innerHTML = '<p class="text-red-500">An error occurred while setting up the search. Please check the console for details.</p>';
    }
  }
}

// Initialize the search when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing search');
  setupSearch();
});
