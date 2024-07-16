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
          return line.replace(regex, match => `<mark style="background-color: #DAF7A6">${match}</mark>`);
        });
      results.push({ name: file.name, content: file.content, snippets: snippets });
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
    loadingIndicator.style.display = 'none';
    searchInput.disabled = false;
    searchButton.disabled = false;

    function performSearch() {
      const query = searchInput.value.trim();
      console.log('Search initiated. Query:', query);
      if (query === '') {
        displayError('Please enter a search term.');
        return;
      }
      const results = searchContent(files, query);
      displayResults(results);
    }

    searchButton.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        performSearch();
      }
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
        const fileName = result.name.replace('.md', '.shtml');
        const url = `https://raypeat.com/articles/articles/${fileName}`;
        const firstSentence = result.content.split('.')[0] + '.';
        fileDiv.innerHTML = `<h3 class="font-bold mt-4"><a href="${url}" target="_blank" style="color: blue; text-decoration: underline;">${firstSentence}</a></h3>`;
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
