import { 
    findMatchingStocks, 
    hideSearchOverlay, 
    showSearchOverlay,
    wipeOldResults 
} from './js/stock-service';
import './styles/app.scss';
import './styles/alert.scss';
import './styles/quote-search.scss';

let searchButton;
let searchInput;
let overlay;

let alert;
let alertMessage;
let alertButton;
let alertPopup;

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
    alert = document.querySelector('.alert');
    alertMessage = alert.querySelector('.alert-message');
    alertButton = alert.querySelector('.alert-button');
    alertPopup = alert.querySelector('.alert-popup');

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
    alert.classList.remove('hidden');
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
    alert.classList.add('hidden');
}

export {
    init,
    showAlert,
    alertType
};