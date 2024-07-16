// Fetch data from GitHub
async function fetchGitHubData() {
  try {
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
async function fetchFileContent(url) {
  try {
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
    console.log('Processing files:', files);
    let allContent = [];
    for (const file of files) {
      const content = await fetchFileContent(file.download_url);
      allContent.push({ name: file.name, content: content });
    }
    console.log('Processed all files:', allContent);
    return allContent;
  } catch (error) {
    console.error('Error processing files:', error);
    throw error;
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
      const snippets = file.content.split('\n')
        .filter(line => line.toLowerCase().includes(query.toLowerCase()))
        .map(line => {
          return line.replace(regex, match => `<mark>${match}</mark>`);
        });
      results.push({ name: file.name, snippets: snippets });
    }
  });
  
  console.log('Search results:', results);
  return results;
}

// Main function to set up the search
async function setupSearch() {
  try {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const searchInput = document.querySelector('input[type="text"]');
    const searchButton = document.querySelector('button');
    const resultsContainer = document.getElementById('searchResults');

    if (!loadingIndicator || !searchInput || !searchButton || !resultsContainer) {
      throw new Error('Required DOM elements not found');
    }

    // Show loading indicator
    loadingIndicator.style.display = 'block';
    searchInput.disabled = true;
    searchButton.disabled = true;

    const files = await processAllFiles();

    // Hide loading indicator and enable search
    loadingIndicator.style.display = 'none';
    searchInput.disabled = false;
    searchButton.disabled = false;

    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      console.log('Search button clicked. Query:', query);
      if (query === '') {
        displayError('Please enter a search term.');
        return;
      }
      const results = searchContent(files, query);
      displayResults(results);
    });

    function displayResults(results) {
      console.log('Displaying results:', results);
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

    function displayError(message) {
      console.error(message);
      resultsContainer.innerHTML = `<p class="text-red-500">${message}</p>`;
    }

    console.log('Search setup complete');
  } catch (error) {
    console.error('Error setting up search:', error);
    const resultsContainer = document.getElementById('searchResults');
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (resultsContainer && loadingIndicator) {
      loadingIndicator.style.display = 'none';
      resultsContainer.innerHTML = '<p class="text-red-500">An error occurred while setting up the search. Please check the console for details.</p>';
    }
  }
}

// Initialize the search when the page loads
window.addEventListener('load', () => {
  console.log('Page loaded, initializing search');
  setupSearch();
});
