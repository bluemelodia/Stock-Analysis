import { findMatchingStocks, displayMatchingStocks, showSearchOverlay } from './js/stock-service';

import './styles/app.scss';
import './styles/quote-search.scss';

let searchButton;
let searchInput;

function init() {
    searchButton = document.getElementById('search-button');
    searchInput = document.getElementById('search-input'); 
    setupEventListeners();
}

function setupEventListeners() {
    searchButton.addEventListener('click', () => findMatchingStocks(searchInput.value));
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            findMatchingStocks(searchInput.value);
        }
    });
    searchInput.addEventListener('click', () => showSearchOverlay());
}

export {
    init
};