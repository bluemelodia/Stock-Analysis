import { 
    findMatchingStocks, 
    hideSearchOverlay, 
    showSearchOverlay,
    wipeOldResults 
} from './js/stock-service';
import './styles/app.scss';
import './styles/quote-search.scss';

let searchButton;
let searchInput;
let overlay;

function init() {
    searchButton = document.getElementById('search-button');
    searchInput = document.getElementById('search-input'); 
    overlay = document.querySelector('.search-overlay');

    setupEventListeners();
}

function setupEventListeners() {
    searchButton.addEventListener('click', () => findMatchingStocks(searchInput.value));
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            findMatchingStocks(searchInput.value);
        }
    });
    searchInput.addEventListener('click', () => {
        showSearchOverlay();
        if (searchInput.value.length < 1) {
            wipeOldResults();
        }
    });
    overlay.addEventListener('click', () => hideSearchOverlay());
}

export {
    init
};