const { Octokit } = require("@octokit/rest");
require("dotenv").config();

// Build advanced search query - searches across ALL languages
// Build advanced search query - searches across ALL languages
function buildSearchQuery(input) {
  // Simple Natural Language Processing
  // Remove common Turkish/English stop words if query is long (likely a sentence)
  const stopWords = ['bir', 've', 'ile', 'için', 'bu', 'şu', 'o', 'bana', 'yapılmış', 'olan', 'göster', 'bul', 'getir', 'listele', 'istiyorum', 'the', 'and', 'for', 'with', 'made', 'in'];

  let terms = input.toLowerCase().split(/\s+/);

  // Only apply filtering if it looks like a sentence (more than 3 words)
  if (terms.length > 3) {
    terms = terms.filter(t => !stopWords.includes(t) && t.length > 1);
  }

  // If we filtered everything out, revert to original
  if (terms.length === 0) return input;

  const cleanQuery = terms.join(' ');

  // Enhanced search: name, description, topics, and readme content
  const searchQuery = `${cleanQuery} in:name,description,topics`;

  return searchQuery;
}

// Options: { sort: 'stars' | 'updated' | 'forks', order: 'desc' | 'asc', page: 1 }
async function findRepo(query, options = {}) {
  const { sort = 'stars', order = 'desc', page = 1 } = options;

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
  });

  try {
    // Search across all languages - no language filtering
    const searchQuery = buildSearchQuery(query);

    // Perform multiple searches for better results - NO language filtering
    // Search with different approaches to ensure we get results from ALL languages
    const searches = [
      // Main search - using user specified sort
      octokit.rest.search.repos({
        q: searchQuery,
        sort: sort,
        order: order,
        per_page: 20,
        page: page
      }),
      // Search in readme - respecting sort
      octokit.rest.search.repos({
        q: `${query.trim()} in:readme`,
        sort: sort,
        order: order,
        per_page: 15,
        page: page
      }),
      // Search with different sorting to get diverse results - ONLY if default sort
      ...(sort === 'stars' ? [octokit.rest.search.repos({
        q: searchQuery,
        sort: "updated",
        order: "desc",
        per_page: 10,
      })] : [])
    ];

    const [mainResults, readmeResults, updatedResults] = await Promise.all(searches);

    // Combine and deduplicate results from all searches
    const allRepos = new Map();

    // Add main results
    if (mainResults.data.items) {
      mainResults.data.items.forEach(repo => {
        allRepos.set(repo.id, repo);
      });
    }

    // Add readme results
    if (readmeResults.data.items) {
      readmeResults.data.items.forEach(repo => {
        if (!allRepos.has(repo.id)) {
          allRepos.set(repo.id, repo);
        }
      });
    }

    // Add updated results for diversity
    if (updatedResults.data.items) {
      updatedResults.data.items.forEach(repo => {
        if (!allRepos.has(repo.id)) {
          allRepos.set(repo.id, repo);
        }
      });
    }

    if (allRepos.size === 0) {
      return null;
    }

    // Convert to array and sort by stars, but ensure language diversity
    const reposArray = Array.from(allRepos.values());

    // Sort by stars but ensure we get diverse results
    // Sort by user preference
    reposArray.sort((a, b) => {
      if (sort === 'stars') {
        // Default complex logic for stars to ensure diversity
        if (Math.abs(b.stargazers_count - a.stargazers_count) > 100) {
          return b.stargazers_count - a.stargazers_count;
        }
        return Math.random() - 0.5;
      } else if (sort === 'updated') {
        return new Date(b.updated_at) - new Date(a.updated_at);
      } else if (sort === 'forks') {
        return b.forks_count - a.forks_count;
      }
      return 0;
    });

    // Return top results - this should include repos from all languages
    return reposArray.slice(0, 20).map(repo => ({
      name: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updated_at: repo.updated_at,
      topics: repo.topics || [],
      html_url: repo.html_url,
      full_name: repo.full_name,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count
    }));
  } catch (error) {
    console.error("Error searching GitHub:", error.message);
    throw error;
  }
}

module.exports = { findRepo };
