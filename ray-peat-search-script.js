// Global variable to store all fetched content
let allContent = [];

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
    for (const file of files) {
      const content = await fetchFileContent(file.download_url, file.name);
      allContent.push({ name: file.name, content: content });
    }
    console.log('Processed all files:', allContent);
    updateLoadingMessage('Done');
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
  }
}

// Update loading message
function updateLoadingMessage(message) {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const loadingText = loadingIndicator.querySelector('p');
  if (loadingText) {
    loadingText.textContent = message;
  }
}

// Search function
function searchContent(query) {
  console.log('Searching for:', query);
  const results = [];
  const words = query.toLowerCase().split(/\s+/);

  allContent.forEach(file => {
    const content = file.content.toLowerCase();
    let matchFound = words.every(word => content.includes(word));

    if (matchFound) {
      const snippets = [];
      const lines = file.content.split('\n');
      
      lines.forEach((line, index) => {
        const lowerLine = line.toLowerCase();
        if (words.some(word => lowerLine.includes(word))) {
          let snippet = line.trim();
          
          // Add context by including surrounding lines
          if (index > 0) snippet = lines[index - 1].trim() + '\n' + snippet;
          if (index < lines.length - 1) snippet += '\n' + lines[index + 1].trim();
          
          // Highlight matching words
          words.forEach(word => {
            const regex = new RegExp(word, 'gi');
            snippet = snippet.replace(regex, match => `<mark>${match}</mark>`);
          });
          
          snippets.push(snippet);
        }
      });

      if (snippets.length > 0) {
        results.push({
          name: file.name,
          snippets: snippets
        });
      }
    }
  });

  console.log('Search results:', results);
  return results;
}

// Display search results
function displayResults(results) {
  const resultsContainer = document.getElementById('searchResults');
  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(result => {
    const resultElement = document.createElement('div');
    resultElement.className = 'mb-4';
    resultElement.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">${result.name}</h3>
      ${result.snippets.map(snippet => `<p class="mb-2">${snippet}</p>`).join('')}
    `;
    resultsContainer.appendChild(resultElement);
  });
}

// Main function to set up the search
async function setupSearch() {
  const loadingIndicator = document.getElementById('loadingIndicator');
  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector('button');

  if (!loadingIndicator || !searchInput || !searchButton) {
    console.error('Required DOM elements not found. Ensure all elements are present in the HTML.');
    return;
  }

  try {
    // Show loading indicator
    loadingIndicator.style.display = 'block';
    searchInput.disabled = true;
    searchButton.disabled = true;

    await processAllFiles();

    // Hide loading indicator and enable search
    loadingIndicator.style.display = 'none';
    searchInput.disabled = false;
    searchButton.disabled = false;

    // Set up search functionality
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        const results = searchContent(query);
        displayResults(results);
      }
    });

    // Enable search on Enter key press
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        searchButton.click();
      }
    });

  } catch (error) {
    console.error('Error setting up search:', error);
    loadingIndicator.style.display = 'none';
    document.getElementById('searchResults').innerHTML = '<p class="text-red-500">An error occurred while setting up the search. Please check the console for details.</p>';
  }
}

// Initialize the search when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing search');
  setupSearch();
});
