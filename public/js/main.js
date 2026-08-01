// Main JavaScript — Repulse
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
const header = document.getElementById('site-header');

// Filter UI Elements
const filterWrapper = document.getElementById('filter-wrapper');
const filterMainBtn = document.getElementById('filter-main-btn');
const branchOptions = document.querySelectorAll('.branch-option');

// ---------- Motion (framer-motion dom build) ----------
const M = window.Motion;
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const EASE_OUT = [0.22, 1, 0.36, 1];
const EASE_SPRING = [0.34, 1.56, 0.64, 1];

function anim(target, keyframes, options = {}) {
    if (REDUCED_MOTION) return null;
    return M.animate(target, keyframes, options);
}

function animateCardsIn(container) {
    const cards = container.querySelectorAll('.repo-card:not([data-animated])');
    if (cards.length === 0) return;

    cards.forEach(card => card.setAttribute('data-animated', 'true'));

    if (REDUCED_MOTION) {
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'none';
        });
        return;
    }

    M.animate(cards, {
        opacity: [0, 1],
        transform: ['translateY(18px)', 'translateY(0px)']
    }, {
        duration: 0.45,
        delay: (index) => index * 0.055,
        ease: EASE_OUT
    });
}

// ---------- Page transitions ----------
function switchPage(targetPage) {
    navButtons.forEach(b => b.classList.remove('active'));
    const activeBtn = document.querySelector(`.nav-btn[data-page="${targetPage}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    const current = document.querySelector('.page.active');
    const next = document.getElementById(`${targetPage}-page`);
    if (!next || next === current) return;

    if (current) {
        anim(current, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(-8px)'] }, {
            duration: 0.16,
            ease: 'easeOut'
        });
    }

    setTimeout(() => {
        if (current) current.classList.remove('active');
        next.classList.add('active');
        anim(next, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, {
            duration: 0.32,
            delay: (REDUCED_MOTION ? 0 : 0.02),
            ease: EASE_OUT
        });

        if (targetPage === 'favorites') loadFavorites();
    }, REDUCED_MOTION ? 0 : 170);
}

// Navigation
navButtons.forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
});

// Header scroll state
let headerTick = false;
window.addEventListener('scroll', () => {
    if (headerTick) return;
    headerTick = true;
    requestAnimationFrame(() => {
        header.classList.toggle('scrolled', window.scrollY > 24);
        headerTick = false;
    });
}, { passive: true });

// ---------- Hero entrance ----------
function playHeroEntrance() {
    const lines = document.querySelectorAll('.title-line');
    const badge = document.querySelector('.hero-badge');
    const subtitle = document.querySelector('.subtitle');
    const searchBox = document.querySelector('.search-box');
    const filters = document.querySelector('.search-filters-container');
    const hint = document.querySelector('.search-hint');
    const terminal = document.querySelector('.terminal-window');

    if (REDUCED_MOTION) return;

    if (badge) {
        M.animate(badge, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, {
            duration: 0.4, ease: EASE_OUT
        });
    }
    lines.forEach((line, i) => {
        M.animate(line, { opacity: [0, 1], transform: ['translateY(26px)', 'translateY(0px)'] }, {
            duration: 0.6, delay: 0.08 + i * 0.09, ease: EASE_OUT
        });
    });
    if (subtitle) {
        M.animate(subtitle, { opacity: [0, 1], transform: ['translateY(14px)', 'translateY(0px)'] }, {
            duration: 0.5, delay: 0.45, ease: EASE_OUT
        });
    }
    if (searchBox) {
        M.animate(searchBox, { opacity: [0, 1], transform: ['translateY(18px)', 'translateY(0px)'] }, {
            duration: 0.55, delay: 0.55, ease: EASE_OUT
        });
    }
    if (filters) {
        M.animate(filters, { opacity: [0, 1], transform: ['translateY(10px)', 'translateY(0px)'] }, {
            duration: 0.4, delay: 0.72, ease: EASE_OUT
        });
    }
    if (hint) {
        M.animate(hint, { opacity: [0, 1] }, { duration: 0.5, delay: 0.85, ease: 'easeOut' });
    }
    if (terminal) {
        M.animate(terminal, {
            opacity: [0, 1],
            transform: ['translateY(24px) scale(0.985)', 'translateY(0px) scale(1)']
        }, {
            duration: 0.65, delay: 0.35, ease: EASE_OUT
        });
    }

    playTerminalSequence();
}

// Terminal typing sequence
function playTerminalSequence() {
    const cmdEl = document.getElementById('term-cmd');
    const cursor = document.querySelector('.term-cursor');
    const lineEls = [1, 2, 3, 4, 5, 6, 7].map(n => document.getElementById(`term-line-${n}`));

    const fullText = cmdEl.textContent;

    const typeChar = (charIndex) => {
        cmdEl.textContent = fullText.slice(0, charIndex + 1);
    };

    const startLines = () => {
        if (cursor) cursor.style.display = 'none';
        lineEls.forEach((line, i) => {
            if (!line) return;
            M.animate(line, { opacity: [0, 1], transform: ['translateX(-6px)', 'translateX(0px)'] }, {
                duration: 0.3, delay: 0.15 + i * 0.22, ease: 'easeOut'
            });
        });
    };

    if (REDUCED_MOTION) {
        lineEls.forEach(l => { if (l) l.style.opacity = '1'; });
        return;
    }

    const done = [];
    for (let i = 0; i <= fullText.length; i++) {
        done.push(new Promise(resolve => setTimeout(() => { typeChar(i); resolve(); }, 30 + i * 22)));
    }

    Promise.all(done).then(() => setTimeout(startLines, 200));
}

// ---------- Toggle Filter Menu ----------
if (filterMainBtn) {
    filterMainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const opening = !filterWrapper.classList.contains('open');
        filterWrapper.classList.toggle('open');
        filterMainBtn.classList.toggle('active');
        filterMainBtn.setAttribute('aria-expanded', opening ? 'true' : 'false');
    });
}

// Close filter when clicking outside
document.addEventListener('click', (e) => {
    if (filterWrapper && !filterWrapper.contains(e.target)) {
        filterWrapper.classList.remove('open');
        if (filterMainBtn) filterMainBtn.classList.remove('active');
        if (filterMainBtn) filterMainBtn.setAttribute('aria-expanded', 'false');
    }
});

// Handle Filter Option Click
branchOptions.forEach(option => {
    option.addEventListener('click', () => {
        const sortValue = option.getAttribute('data-sort');

        branchOptions.forEach(btn => btn.classList.remove('active'));
        option.classList.add('active');

        if (sortSelect) {
            sortSelect.value = sortValue;
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            }
        }

        filterWrapper.classList.remove('open');
        if (filterMainBtn) filterMainBtn.classList.remove('active');
        if (filterMainBtn) filterMainBtn.setAttribute('aria-expanded', 'false');
    });
});

// Initial load
document.addEventListener('DOMContentLoaded', () => {
    loadRecommendations();
    playHeroEntrance();
});

// ---------- GitHub API (client-side) ----------
const GITHUB_API = 'https://api.github.com/search/repositories';

// Lightweight natural language processing — strips stop words from long queries
const STOP_WORDS = ['bir', 've', 'ile', 'için', 'bu', 'şu', 'o', 'bana', 'yapılmış', 'olan', 'göster', 'bul', 'getir', 'listele', 'istiyorum', 'the', 'and', 'for', 'with', 'made', 'in'];

function buildSmartQuery(input) {
    const terms = input.toLowerCase().split(/\s+/);

    let cleaned = terms;
    if (terms.length > 3) {
        cleaned = terms.filter(t => !STOP_WORDS.includes(t) && t.length > 1);
    }

    if (cleaned.length === 0) return input;
    return cleaned.join(' ');
}

function mapRepo(repo) {
    return {
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
    };
}

// Search across name/description/topics + README, then merge and deduplicate
async function searchGitHub(query, sort, page) {
    const smartQ = buildSmartQuery(query);
    const base = `q=${encodeURIComponent(`${smartQ} in:name,description,topics`)}&sort=${sort}&order=desc`;
    const mainUrl = `${GITHUB_API}?${base}&per_page=20&page=${page}`;
    const readmeUrl = `${GITHUB_API}?q=${encodeURIComponent(`${query.trim()} in:readme`)}&sort=${sort}&order=desc&per_page=15&page=${page}`;

    const [mainRes, readmeRes] = await Promise.all([fetch(mainUrl), fetch(readmeUrl)]);

    if (!mainRes.ok && !readmeRes.ok) {
        throw new Error(`GitHub API error: ${mainRes.status}`);
    }

    const [mainData, readmeData] = await Promise.all([mainRes.json(), readmeRes.json()]);

    const map = new Map();
    (mainData.items || []).forEach(repo => map.set(repo.id, repo));
    (readmeData.items || []).forEach(repo => {
        if (!map.has(repo.id)) map.set(repo.id, repo);
    });

    const items = [...map.values()].slice(0, 20).map(mapRepo);
    return { items, total_count: mainData.total_count || items.length };
}

// State for Infinite Scroll
let currentPage = 1;
let currentQuery = '';
let isLoadingMore = false;
let isDiscoverMode = true;
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
        isLoadingMore = true;
        const loader = document.createElement('div');
        loader.id = 'scroll-loading';
        loader.textContent = 'Loading more...';
        loader.style.cssText = 'text-align:center;padding:1.2rem;grid-column:1/-1;color:var(--text-3);font-family:var(--font-mono);font-size:0.85rem;';
        resultsContainer.appendChild(loader);
    }

    try {
        const sortValue = sortSelect ? sortSelect.value : 'stars';
        const data = await searchGitHub(currentQuery, sortValue, currentPage);

        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();

        if (isNewSearch) hideLoading();

        if (data.items && data.items.length > 0) {
            if (isNewSearch && resultsCount) {
                resultsCount.textContent = `${formatNumber(data.total_count || data.items.length)} results found`;
                anim(resultsCount, { opacity: [0, 1], transform: ['scale(0.96)', 'scale(1)'] }, {
                    duration: 0.3, ease: EASE_SPRING
                });
            }

            data.items.forEach(repo => {
                resultsContainer.appendChild(createRepoCard(repo));
            });

            animateCardsIn(resultsContainer);
            isLoadingMore = false;
        } else if (isNewSearch) {
            showNoResults();
        } else {
            isLoadingMore = true;
        }
    } catch (error) {
        console.error('Search error:', error);
        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();
        if (isNewSearch) {
            hideLoading();
            showError('An error occurred while searching. Rate limits on the public GitHub API may apply.');
        }
        isLoadingMore = false;
    }
}

// Infinite Scroll - Discover Mode
async function loadRandomDiscoverRepos() {
    if (isLoadingMore) return;
    isLoadingMore = true;

    const topic = DISCOVER_TOPICS[Math.floor(Math.random() * DISCOVER_TOPICS.length)];

    if (currentPage === 1) {
        resultsContainer.innerHTML = '';
        if (resultsCount) resultsCount.textContent = 'Discover: Popular Repos';
        resultsSection.classList.add('active');
    }

    const loader = document.createElement('div');
    loader.id = 'scroll-loading';
    loader.innerHTML = '<span>Exploring...</span>';
    loader.style.cssText = 'text-align:center;padding:1.2rem;grid-column:1/-1;color:var(--text-3);font-family:var(--font-mono);font-size:0.85rem;';
    resultsContainer.appendChild(loader);

    try {
        const data = await searchGitHub(topic, 'stars', currentPage);

        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();

        if (data.items && data.items.length > 0) {
            data.items.forEach(repo => {
                resultsContainer.appendChild(createRepoCard(repo));
            });
            animateCardsIn(resultsContainer);
        }

        isLoadingMore = false;
        currentPage++;
    } catch (e) {
        const existingLoader = document.getElementById('scroll-loading');
        if (existingLoader) existingLoader.remove();
        isLoadingMore = false;
    }
}

// Scroll Event for Infinite Loading
let isScrollScheduled = false;

window.addEventListener('scroll', () => {
    if (isScrollScheduled) return;
    isScrollScheduled = true;

    window.requestAnimationFrame(() => {
        const scrollPosition = window.innerHeight + window.scrollY;
        const triggerHeight = document.body.offsetHeight - 800;

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
        resultsContainer.appendChild(createRepoCard(repo));
    });

    animateCardsIn(resultsContainer);
}

function updateResultsCount(count) {
    if (resultsCount) {
        if (count > 0) {
            resultsCount.textContent = `${count} results found`;
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
    const language = repo.language || 'Unknown';
    const description = repo.description || 'No description';
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
            <button class="like-btn ${isLiked ? 'liked' : ''}" aria-label="Like">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span>Open on GitHub</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
        </a>
    `;

    const likeBtn = card.querySelector('.like-btn');
    likeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLike(repo, likeBtn);
    });

    return card;
}

// Like System
function getLikedRepos() {
    return JSON.parse(localStorage.getItem('likedRepos') || '[]');
}

function isRepoLiked(url) {
    const likes = getLikedRepos();
    return likes.some(r => r.url === url);
}

function likePop(btn) {
    anim(btn, { transform: ['scale(1)', 'scale(1.22)', 'scale(1)'] }, {
        duration: 0.4,
        ease: EASE_SPRING
    });
}

function toggleLike(repo, btn) {
    if (isRepoLiked(repo.url)) {
        removeLikedRepo(repo.url);
        btn.classList.remove('liked');
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="none" stroke="currentColor" stroke-width="2"/>
            </svg>
        `;
        likePop(btn);

        if (favoritesContainer.contains(btn.closest('.repo-card'))) {
            loadFavorites();
            loadRecommendations();
        }
    } else {
        saveLikedRepo(repo);
        btn.classList.add('liked');
        btn.innerHTML = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill="currentColor" stroke="none"/>
            </svg>
        `;
        likePop(btn);

        loadRecommendations();
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
    const container = document.getElementById('favorites-container');
    const countDisplay = document.getElementById('favorites-count');

    if (!container) return;

    const likes = getLikedRepos();
    container.innerHTML = '';

    if (likes.length === 0) {
        container.innerHTML = `
            <div class="repo-card empty-state">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" stroke-width="1.5"/>
                </svg>
                <h3>No Favorites Yet</h3>
                <p>Your liked projects will be stored here.</p>
                <button onclick="document.querySelector('[data-page=\\'search\\']').click()">Explore Projects</button>
            </div>
        `;
        if (countDisplay) countDisplay.textContent = '';
        return;
    }

    if (countDisplay) countDisplay.textContent = `${likes.length} favorite repos`;

    likes.forEach(repo => {
        container.appendChild(createRepoCard(repo));
    });
    animateCardsIn(container);
}

// Recommendation System
async function loadRecommendations() {
    const likes = getLikedRepos();
    if (likes.length === 0) {
        recommendationsSection.style.display = 'none';
        return;
    }

    const topics = {};
    likes.forEach(repo => {
        if (repo.topics) {
            repo.topics.forEach(t => {
                topics[t] = (topics[t] || 0) + 1;
            });
        }
    });

    const sortedTopics = Object.entries(topics)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(e => e[0]);

    if (sortedTopics.length === 0) {
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
        const data = await searchGitHub(query, 'stars', 1);

        if (data.items && data.items.length > 0) {
            const newRecs = data.items.filter(r => !isRepoLiked(r.url)).slice(0, 3);

            if (newRecs.length > 0) {
                recommendationsContainer.innerHTML = '';
                newRecs.forEach(repo => {
                    recommendationsContainer.appendChild(createRepoCard(repo));
                });
                recommendationsSection.style.display = 'block';
                animateCardsIn(recommendationsContainer);
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
        <div class="repo-card" style="text-align:center;grid-column:1/-1;">
            <p style="color:var(--text-2);font-size:1.05rem;">${escapeHtml(message)}</p>
        </div>
    `;
}

function showNoResults() {
    resultsContainer.innerHTML = `
        <div class="repo-card" style="text-align:center;grid-column:1/-1;">
            <p style="color:var(--text-2);font-size:1.05rem;">No results found. Try a different term.</p>
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

const originalPerformSearch = performSearch;
performSearch = async function (query) {
    await originalPerformSearch(query);
    setTimeout(scrollToResults, 300);
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
        searchInput.select();
    }

    if (e.key === 'Escape' && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
    }

    if (e.key === 'Enter' && document.activeElement === searchInput) {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        }
    }
});
