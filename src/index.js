//src/index.js
import './styles/main.css';
import './styles/adaptive.css';
import './styles/buttons.css';
import './styles/images.css'
import './assets/fonts/Montserrat-Regular.ttf';
import { fetchUnsplashImages } from './api.js';

const CACHE_KEY = 'unsplash_cache';
const LAST_QUERY_KEY = 'unsplash_last_query';

function saveCache(query, page, data) {
    if (page === 1) {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ query, page, data }));
        localStorage.setItem(LAST_QUERY_KEY, query);
    }
}

function loadCache(query, page) {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached && cached.query === query && cached.page === page) {
        return cached.data;
    }
    return null;
}

window.onload = () => {
    const images = document.getElementById('images');
    const searchInput = document.getElementById('search');
    const searchBtn = document.getElementById('search-btn');
    const actions = document.getElementById('actions');

    let page = 1;
    let totalPage = null;
    let loading = false;

    function renderImages(data) {
        if (!data.results || data.results.length === 0) {
            if (page > 1) {
                page--;
                actions.classList.remove('active');
                images.innerHTML = '<div class="no-results">Больше изображений нет.</div>';
            } else {
                images.innerHTML = '<div class="no-results">Ничего не найдено.</div>';
                actions.classList.remove('active');
            }
            return;
        }

        images.innerHTML = data.results.map(item => `
        <div class="images-item" onclick="window.open('${item.links.html}', '_blank')">
            <img class="images-item-image" 
                 src="${item.urls.small}" 
                 alt="${item.alt_description || ''}"
                 loading="lazy"
                 onload="this.style.opacity=1">
            <div class="images-item-overlay">
                <div class="images-item-title">
                    ${item.description ? item.description.slice(0, 60) + (item.description.length > 60 ? '...' : '') : ''}
                </div>
                <div class="images-item-author">Автор: ${item.user.name}</div>
            </div>
        </div>
    `).join('');

        totalPage = Math.ceil(data.total / 12); // <-- ключевое исправление

        actions.children[1].textContent = `Страница ${page}`;
        actions.classList.add('active');

        actions.children[0].disabled = (page <= 1);
        actions.children[2].disabled = (page >= totalPage);
    }

    async function loadImages() {
        const query = searchInput.value.trim();
        if (!query) return;

        try {
            loading = true;
            images.innerHTML = '';
            actions.classList.remove('active');
            totalPage = null;

            const cached = loadCache(query, page);
            if (cached) {
                renderImages(cached);
                return;
            }

            const data = await fetchUnsplashImages(query, page);
            saveCache(query, page, data);
            renderImages(data);
        } catch {
            console.error('Ошибка загрузки');
        } finally {
            loading = false;
        }
    }

    searchBtn.onclick = () => {
        const query = searchInput.value.trim();
        if (query) {
            // Удаляем предыдущий кэш
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(LAST_QUERY_KEY);

            page = 1;
            loadImages();
        }
    };

    actions.children[0].onclick = () => {
        if (page > 1) {
            page--;
            loadImages();
        }
    };

    actions.children[2].onclick = () => {
        if (page < totalPage) {
            page++;
            loadImages();
        }
    };
    
    const lastQuery = localStorage.getItem(LAST_QUERY_KEY);

    if (lastQuery) {
        searchInput.value = lastQuery;
    } else {
        searchInput.value = 'кот';
    loadImages();

};
