import { 
    findMatchingStocks, 
    hideSearchOverlay, 
    showSearchOverlay,
    wipeOldResults 
} from './js/stock-service';
import './styles/app.scss';
import './styles/alert.scss';
import './styles/quote-common.scss';
import './styles/quote-insights.scss';
import './styles/quote-search.scss';


let searchButton;
let searchInput;
let overlay;

let alertOverlay;
let alertMessage;
let alertButton;
let alertPopup;

let insightsOverlay;
let insightsSymbol;
let insightsName;

const alertTimeout = 5 * 1000;
const alertType = {
    success: 'SUCCESS',
    warning: 'WARNING', 
    error: 'ERROR'
}

function init() {
    searchButton = document.getElementById('search-button');
    searchInput = document.getElementById('search-input'); 
    overlay = document.querySelector('.search-overlay');

    alertOverlay = document.querySelector('.alert');
    alertMessage = alertOverlay.querySelector('.alert-message');
    alertButton = alertOverlay.querySelector('.alert-button');
    alertPopup = alertOverlay.querySelector('.alert-popup');

    insightsOverlay = document.querySelector('.insights');
    insightsSymbol = document.querySelector('.symbol');
    insightsName = document.querySelector('.name');

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
    alertButton.addEventListener('click', () => dismissAlert());
}

function showAlert(message, messageType) {
    alertMessage.innerHTML = message;
    alertOverlay.classList.remove('hidden');
    alertPopup.classList.remove('error', 'success', 'warning');

    if (messageType === alertType.error) {
        alertPopup.classList.add('error');
    } else if (messageType === alertType.success) {
        alertPopup.classList.add('success');
    } else {
        alertPopup.classList.add('warning');
    }

    setTimeout(() => {
        dismissAlert();
    }, alertTimeout);
}

function dismissAlert() {
    alertMessage.innerHTML = '';
    alertOverlay.classList.add('hidden');
}

function showInsights(symbol, name) {
    insightsOverlay.classList.remove('hidden');
    insightsSymbol.innerHTML = symbol;
    insightsName.innerHTML = name;
}

function dismissInsights() {
    insightsOverlay.classList.add('hidden');
    insightsSymbol.innerHTML = '';
    insightsName.innerHTML = '';
}

export {
    init,
    showAlert,
    alertType,
    showInsights,
    dismissInsights
};