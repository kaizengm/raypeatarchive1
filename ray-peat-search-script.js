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
  // ... (rest of the searchContent function remains unchanged)
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

    // ... (rest of the setupSearch function remains unchanged)
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
