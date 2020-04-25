import { hello } from './js/app.js';
import { findMatchingStocks } from './js/stock-service';

import './styles/app.scss';

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
}

export {
    init,
    findMatchingStocks
};