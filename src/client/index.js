import { 
    findMatchingStocks, 
    hideSearchOverlay, 
    showSearchOverlay,
    wipeOldResults 
} from './js/stock-service';

import { 
    findNews
} from './js/news-service';

import './styles/app.scss';
import './styles/alert.scss';
import './styles/article.scss';
import './styles/quote-common.scss';
import './styles/quote-insights.scss';
import './styles/quote-search.scss';

let searchButton;
let searchInput;
let overlay;

let alertOverlay;
let alertMessage;
let closeAlertsButton;
let alertPopup;

let insightsOverlay;
let insightsSymbol;
let insightsName;

let newsTab;
let newsPanel;
let sentimentTab;
let sentimentPanel;
let tabs = [];

let closeInsightsButton;

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
    closeAlertsButton = alertOverlay.querySelector('.alert-button');
    alertPopup = alertOverlay.querySelector('.alert-popup');

    insightsOverlay = document.querySelector('.insights');
    closeInsightsButton = insightsOverlay.querySelector('.close-button');
    insightsSymbol = insightsOverlay.querySelector('.symbol');
    insightsName = insightsOverlay.querySelector('.name');

    newsTab = insightsOverlay.querySelector('.news');
    sentimentTab = insightsOverlay.querySelector('.sentiment');
    newsPanel = insightsOverlay.querySelector('.quote-news');
    sentimentPanel = insightsOverlay.querySelector('.quote-sentiment');
    tabs.push({ tab: newsTab, panel: newsPanel });
    tabs.push({ tab: sentimentTab, panel: sentimentPanel });

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
    closeAlertsButton.addEventListener('click', () => dismissAlert());
    closeInsightsButton.addEventListener('click', () => dismissInsights());

    newsTab.addEventListener('click', () => switchTabs(newsTab));
    sentimentTab.addEventListener('click', () => switchTabs(sentimentTab));
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

    findNews(symbol, name);
}

function dismissInsights() {
    insightsOverlay.classList.add('hidden');
    insightsSymbol.innerHTML = '';
    insightsName.innerHTML = '';
}

function switchTabs(selectedTab) {
    tabs.forEach(tab => {
        if (tab.tab === selectedTab) {
            tab.tab.classList.add('selected');
            tab.panel.classList.remove('hidden');
        } else {
            tab.tab.classList.remove('selected');
            tab.panel.classList.add('hidden');
        }
    });
}

export {
    init,
    showAlert,
    alertType,
    showInsights,
    dismissInsights
};