// Main JavaScript
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-select');
const resultsContainer = document.getElementById('results-container');
const resultsSection = document.getElementById('results-section');
const resultsCount = document.getElementById('results-count');
const recommendationsSection = document.getElementById('recommendations-section');
const recommendationsContainer = document.getElementById('recommendations-container');
const favoritesContainer = document.getElementById('favorites-container');
const favoritesCount = document.getElementById('favorites-count');
const loadingOverlay = document.getElementById('loading-overlay');
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

// Filter UI Elements
const filterWrapper = document.getElementById('filter-wrapper');
const filterMainBtn = document.getElementById('filter-main-btn');
const branchOptions = document.querySelectorAll('.branch-option');

// Toggle Filter Menu
if (filterMainBtn) {
    filterMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        filterWrapper.classList.toggle('open');
        filterMainBtn.classList.toggle('active');
    });
}

// Close filter when clicking outside
document.addEventListener('click', (e) => {
    if (filterWrapper && !filterWrapper.contains(e.target)) {
        filterWrapper.classList.remove('open');
        if (filterMainBtn) filterMainBtn.classList.remove('active');
    }
});

// Handle Filter Option Click
branchOptions.forEach(option => {
    option.addEventListener('click', () => {
        const sortValue = option.getAttribute('data-sort');

        // Update UI
        branchOptions.forEach(btn => btn.classList.remove('active'));
        option.classList.add('active');

        // Update hidden input
        if (sortSelect) {
            sortSelect.value = sortValue;
            // Trigger search manually since hidden input change event might not fire
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }

        // Close menu
        filterWrapper.classList.remove('open');
        if (filterMainBtn) filterMainBtn.classList.remove('active');
    });
});

// Navigation
navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page;

        // Update active nav button
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Show target page
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === `${targetPage}-page`) {
                page.classList.add('active');
            }
        });

        // Load specific page data
        if (targetPage === 'favorites') {
            loadFavorites();
        }
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendations();
});

// State for Infinite Scroll
let currentPage = 1;
let currentQuery = '';
let isLoadingMore = false;
let isDiscoverMode = true; // Default to discover mode
const DISCOVER_TOPICS = ['javascript', 'python', 'react', 'ai', 'machine-learning', 'web', 'rust', 'go', 'threejs'];

// Search functionality
async function performSearch(query, isNewSearch = true) {
    if (!query || query.trim() === '') {
        isDiscoverMode = true;
        loadRandomDiscoverRepos();
        return;
    }

    isDiscoverMode = false;
    currentQuery = query;

    if (isNewSearch) {
        showLoading();
        resultsContainer.innerHTML = '';
        if (resultsCount) resultsCount.textContent = '';
        currentPage = 1;
        resultsSection.classList.add('active');
    } else {
        // Pagination: Append loading indicator
        isLoadingMore = true;
        const loader = document.createElement('div');
        loader.id = 'scroll-loading';
        loader.textContent = 'Daha fazla yükleniyor...';
        loader.style.cssText = 'text-align:center;padding:1rem;grid-column:1/-1;color:var(--text-muted);';
        resultsContainer.appendChild(loader);
    }

    try {
        const sortValue = sortSelect ? sortSelect.value : 'stars';
        const url = `/api/search?q=${encodeURIComponent(currentQuery)}&sort=${sortValue}&page=${currentPage}`;
        const response = await fetch(url);
        const data = await response.json();

        // Remove loader if paginating
        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();

        if (isNewSearch) hideLoading();

        if (data.items && data.items.length > 0) {
            if (isNewSearch && resultsCount) {
                resultsCount.textContent = `${formatNumber(data.total_count || data.items.length)} sonuç bulundu`;
            }

            data.items.forEach(repo => {
                const card = createRepoCard(repo);
                resultsContainer.appendChild(card);
            });

            isLoadingMore = false;
        } else if (isNewSearch) {
            showNoResults();
        } else {
            // No more results
            isLoadingMore = true; // Stop trying
        }
    } catch (error) {
        console.error('Search error:', error);
        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();
        if (isNewSearch) {
            hideLoading();
            showError('Arama sırasında bir hata oluştu.');
        }
        isLoadingMore = false;
    }
}

// Infinite Scroll - Discover Mode (Random Repos)
async function loadRandomDiscoverRepos() {
    if (isLoadingMore) return;
    isLoadingMore = true;

    const topic = DISCOVER_TOPICS[Math.floor(Math.random() * DISCOVER_TOPICS.length)];

    if (currentPage === 1) {
        resultsContainer.innerHTML = '';
        if (resultsCount) resultsCount.textContent = 'Keşfet: Popüler Repolar';
        resultsSection.classList.add('active');
    }

    const loader = document.createElement('div');
    loader.id = 'scroll-loading';
    loader.innerHTML = '<span style="color:var(--bright-green)">Keşfediliyor...</span>';
    loader.style.cssText = 'text-align:center;padding:1rem;grid-column:1/-1;';
    resultsContainer.appendChild(loader);

    try {
        const response = await fetch(`/api/search?q=${topic}&sort=stars&page=${currentPage}`);
        const data = await response.json();

        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();

        if (data.items && data.items.length > 0) {
            data.items.forEach(repo => {
                const card = createRepoCard(repo);
                resultsContainer.appendChild(card);
            });
        }

        isLoadingMore = false;
        currentPage++;
    } catch (e) {
        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();
        isLoadingMore = false;
    }
}

// Scroll Event for Infinite Loading (Throttled)
// Scroll Event for Infinite Loading (Optimized)
let isScrollScheduled = false;

window.addEventListener('scroll', () => {
    if (isScrollScheduled) return;

    isScrollScheduled = true;

    // Use requestAnimationFrame to run logic in sync with reflow
    window.requestAnimationFrame(() => {
        // Double check threshold inside RAF to avoid unnecessary calculations
        const scrollPosition = window.innerHeight + window.scrollY;
        const triggerHeight = document.body.offsetHeight - 800; // Increased buffer

        if (scrollPosition >= triggerHeight) {
            if (!isLoadingMore) {
                if (isDiscoverMode) {
                    loadRandomDiscoverRepos();
                } else if (currentQuery) {
                    currentPage++;
                    performSearch(currentQuery, false);
                }
            }
        }

        isScrollScheduled = false;
    });
}, { passive: true });

function displayResults(repos) {
    resultsContainer.innerHTML = '';
    resultsSection.classList.add('active');

    repos.forEach(repo => {
        const card = createRepoCard(repo);
        resultsContainer.appendChild(card);
    });

    // Animate cards with staggered effect
    const cards = resultsContainer.querySelectorAll('.repo-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';

        setTimeout(() => {
            card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, index * 80);
    });
}

function updateResultsCount(count) {
    if (resultsCount) {
        if (count > 0) {
            resultsCount.textContent = `${count} sonuç bulundu`;
            animateResultsCount();
        } else {
            resultsCount.textContent = '';
        }
    }
}

function createRepoCard(repo) {
    const card = document.createElement('div');
    card.className = 'repo-card';

    const stars = formatNumber(repo.stars);
    const forks = formatNumber(repo.forks);
    const language = repo.language || 'Bilinmiyor';
    const description = repo.description || 'Açıklama yok';
    const topics = repo.topics || [];
    const topicsHtml = topics.slice(0, 3).map(topic =>
        `<span class="repo-topic">${escapeHtml(topic)}</span>`
    ).join('');

    const isLiked = isRepoLiked(repo.url);
    const heartIcon = isLiked ?
        '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" stroke="none"/>' :
        '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="none" stroke="currentColor" stroke-width="2"/>';

    card.innerHTML = `
        <div class="card-header">
            <h3 class="repo-name">${escapeHtml(repo.name)}</h3>
            <button class="like-btn ${isLiked ? 'liked' : ''}" aria-label="Beğen">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    ${heartIcon}
                </svg>
            </button>
        </div>
        <p class="repo-description">${escapeHtml(description)}</p>
        ${topics.length > 0 ? `<div class="repo-topics">${topicsHtml}</div>` : ''}
        <div class="repo-stats">
            <div class="repo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                <span>${stars}</span>
            </div>
            <div class="repo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="18" r="3"/>
                    <path d="M6 9a6 6 0 0 1 6-6h0a6 6 0 0 1 6 6"/>
                    <path d="M6 9v9a6 6 0 0 0 6 6h0a6 6 0 0 0 6-6V9"/>
                </svg>
                <span>${forks}</span>
            </div>
            <div class="repo-stat">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                </svg>
                <span>${escapeHtml(language)}</span>
            </div>
        </div>
        <a href="${repo.url}" target="_blank" rel="noopener noreferrer" class="repo-url">
            <span>GitHub'da Aç</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
        </a>
    `;

    // Add event listener to like button
    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(repo, likeBtn);
    });

    return card;
}

// Like System Functions
function getLikedRepos() {
    return JSON.parse(localStorage.getItem('likedRepos') || '[]');
}

function isRepoLiked(url) {
    const likes = getLikedRepos();
    return likes.some(r => r.url === url);
}

function toggleLike(repo, btn) {
    if (isRepoLiked(repo.url)) {
        removeLikedRepo(repo.url);
        btn.classList.remove('liked');
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;

        // If we represent favorites page, we should remove the card
        if (favoritesContainer.contains(btn.closest('.repo-card'))) {
            loadFavorites(); // Reload to remove
            loadRecommendations(); // Reload recommendations
        }
    } else {
        saveLikedRepo(repo);
        btn.classList.add('liked');
        btn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" stroke="none"/>
            </svg>
        `;

        // Animate Heart
        btn.style.animation = 'none';
        setTimeout(() => {
            btn.style.animation = 'heartBeat 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both';
        }, 10);

        loadRecommendations(); // Update recommendations based on new like
    }
}

function saveLikedRepo(repo) {
    const likes = getLikedRepos();
    if (!likes.some(r => r.url === repo.url)) {
        likes.push(repo);
        localStorage.setItem('likedRepos', JSON.stringify(likes));
    }
}

function removeLikedRepo(url) {
    const likes = getLikedRepos();
    const newLikes = likes.filter(r => r.url !== url);
    localStorage.setItem('likedRepos', JSON.stringify(newLikes));
}

function loadFavorites() {
    // Check if elements exist before using them
    const container = document.getElementById('favorites-container');
    const countDisplay = document.getElementById('favorites-count');

    if (!container) return; // Exit if container doesn't exist on this page

    const likes = getLikedRepos();
    container.innerHTML = '';

    if (likes.length === 0) {
        container.innerHTML = `
            <div class="repo-card empty-state" style="text-align: center; grid-column: 1 / -1; padding: 4rem; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem;">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" style="color: var(--text-muted); opacity: 0.5;">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <h3 style="color: var(--text-light); font-size: 1.5rem; margin:0;">Henüz Favori Yok</h3>
                <p style="color: var(--text-muted); font-size: 1rem;">Beğendiğiniz projeler burada saklanır.</p>
                <button onclick="document.querySelector('[data-page=\\'search\\']').click()" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: var(--gradient-primary); border: none; border-radius: 50px; color: var(--dark-green); font-weight: bold; cursor: pointer;">
                    Projeleri Keşfet
                </button>
            </div>
        `;
        if (countDisplay) countDisplay.textContent = '';
        return;
    }

    if (countDisplay) countDisplay.textContent = `${likes.length} favori repo`;

    likes.forEach(repo => {
        const card = createRepoCard(repo);
        container.appendChild(card);
    });
}



// Recommendation System
async function loadRecommendations() {
    const likes = getLikedRepos();
    if (likes.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
    }

    // Extract most common topics or languages
    const topics = {};
    likes.forEach(repo => {
        if (repo.topics) {
            repo.topics.forEach(t => {
                topics[t] = (topics[t] || 0) + 1;
            });
        }
    });

    // Sort topics by frequency
    const sortedTopics = Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(e => e[0]);

    if (sortedTopics.length === 0) {
        // Fallback to languages if no topics
        const langs = {};
        likes.forEach(repo => {
            if (repo.language) {
                langs[repo.language] = (langs[repo.language] || 0) + 1;
            }
        });
        const sortedLangs = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 1).map(e => e[0]);
        if (sortedLangs.length > 0) {
            sortedTopics.push(sortedLangs[0]);
        }
    }

    if (sortedTopics.length === 0) return;

    const query = sortedTopics.join(' ');

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query, sort: 'stars', order: 'desc' })
        });
        const data = await response.json();

        if (data.repos && data.repos.length > 0) {
            // Filter out already liked repos
            const newRecs = data.repos.filter(r => !isRepoLiked(r.url)).slice(0, 3);

            if (newRecs.length > 0) {
                recommendationsContainer.innerHTML = '';
                newRecs.forEach(repo => {
                    recommendationsContainer.appendChild(createRepoCard(repo));
                });
                recommendationsSection.style.display = 'block';
            } else {
                recommendationsSection.style.display = 'none';
            }
        }
    } catch (e) {
        console.error("Recommendation error", e);
    }
}

function showError(message) {
    resultsContainer.innerHTML = `
        <div class="repo-card" style="text-align: center; grid-column: 1 / -1;">
            <p style="color: var(--text-muted); font-size: 1.1rem;">${escapeHtml(message)}</p>
        </div>
    `;
}

function showNoResults() {
    resultsContainer.innerHTML = `
        <div class="repo-card" style="text-align: center; grid-column: 1 / -1;">
            <p style="color: var(--text-muted); font-size: 1.1rem;">Arama sonucu bulunamadı. Farklı bir terim deneyin.</p>
        </div>
    `;
}

function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        performSearch(query);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    }
});

// Smooth scroll to results
function scrollToResults() {
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Enhanced search with scroll
const originalPerformSearch = performSearch;
performSearch = async function (query) {
    await originalPerformSearch(query);
    setTimeout(scrollToResults, 300);
};

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K to focus search (hidden feature)
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }

    // Escape to clear search
    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }

    // Enter to search when input is focused
    if (e.key === 'Enter' && document.activeElement === searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    }
});

// Add search input animations
searchInput.addEventListener('focus', () => {
    searchInput.parentElement.style.transform = 'scale(1.02)';
    searchInput.parentElement.style.boxShadow = '0 0 50px rgba(74, 124, 89, 0.4), 0 20px 60px rgba(0, 0, 0, 0.3)';
});

searchInput.addEventListener('blur', () => {
    searchInput.parentElement.style.transform = 'scale(1)';
    searchInput.parentElement.style.boxShadow = '';
});

// Add typing indicator effect with pulse
let typingTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(typingTimeout);
    searchInput.style.opacity = '0.9';
    searchInput.parentElement.style.borderColor = 'rgba(74, 124, 89, 0.5)';

    typingTimeout = setTimeout(() => {
        searchInput.style.opacity = '1';
        searchInput.parentElement.style.borderColor = '';
    }, 200);
});

// Add search button glow effect on hover
searchBtn.addEventListener('mouseenter', () => {
    searchBtn.style.boxShadow = '0 10px 40px rgba(74, 124, 89, 0.5)';
});

searchBtn.addEventListener('mouseleave', () => {
    searchBtn.style.boxShadow = '';
});

// Add results count animation
function animateResultsCount() {
    if (resultsCount && resultsCount.textContent) {
        resultsCount.style.animation = 'none';
        setTimeout(() => {
            resultsCount.style.animation = 'fadeInScale 0.5s ease';
        }, 10);
    }
}

// Add CSS animation for results count
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: scale(0.9);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

