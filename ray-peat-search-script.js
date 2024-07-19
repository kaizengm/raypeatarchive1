// Fetch data from GitHub
async function fetchGitHubData() {
  // ... (unchanged)
}

// Fetch content of a single file
async function fetchFileContent(url, fileName) {
  // ... (unchanged)
}

// Process all markdown files
async function processAllFiles() {
  // ... (unchanged)
}

// Update loading message
function updateLoadingMessage(message) {
  // ... (unchanged)
}

// Search function
function searchContent(files, query) {
  const results = [];
  const regex = new RegExp(query, 'gi');

  for (const file of files) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (regex.test(lines[i])) {
        let title = '';
        let j = i;
        
        // Skip lines starting with '![' or 'http'
        while (j >= 0 && (lines[j].trim().startsWith('![') || lines[j].trim().startsWith('http'))) {
          j--;
        }
        
        // Find the title
        while (j >= 0) {
          const line = lines[j].trim();
          if (line === '') {
            j--;
            continue;
          }
          
          // Remove asterisks and stop at '**' or '.'
          title = line.replace(/\*/g, '');
          const doubleAsteriskIndex = title.indexOf('**');
          const periodIndex = title.indexOf('.');
          
          if (doubleAsteriskIndex !== -1) {
            title = title.substring(0, doubleAsteriskIndex);
          } else if (periodIndex !== -1) {
            title = title.substring(0, periodIndex);
          }
          
          title = title.trim();
          break;
        }

        const context = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n');
        results.push({ title, context, fileName: file.name });
      }
    }
  }

  return results;
}

// Main function to set up the search
async function setupSearch() {
  // ... (unchanged)
}

// Initialize the search when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded, initializing search');
  setupSearch();
});
