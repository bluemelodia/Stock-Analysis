import { parseSymbol, stockOps } from './stock-utils';
import { currentDayAndTime } from './number-utils';
import { 
    createQuoteBody, 
    createQuoteHeader, 
    noResults, 
    quoteIcon,
    searchPrompt 
} from './templates';

const overlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');
const quotes = document.querySelector('.quotes');

const fetchLimit = 10000; //5 * 60 * 1000;

const bookmarkedStocks = {
    symbols: []
};

export function showSearchOverlay() {
    searchInput.classList.add('search-active');
    overlay.classList.remove('hidden');
    searchResults.classList.remove('hidden');    
}    

export function hideSearchOverlay() {
    overlay.classList.add('hidden');
    searchResults.classList.add('hidden');
}

export function wipeOldResults() {
    setResultsContent(searchPrompt);
}

function setResultsContent(content) {
    searchResults.innerHTML = '';
    let resultsParent = document.createElement('div');
    resultsParent.innerHTML = content;
    searchResults.appendChild(resultsParent);
}

export function findMatchingStocks(query) {
    const userQuery = query;
    console.log("Query: ", userQuery);
    if (userQuery && userQuery.length > 0) {
        getStocks(`http://localhost:3000/stocks/${userQuery}`, stockOps.tickerSearch);
    }
}

function displayMatchingStocks(stocks) {
    if (stocks.length < 1) {
        setResultsContent(noResults);
    } else {
        searchResults.innerHTML = '';

        let resultsParent = document.createElement('div');
        stocks.forEach(stock => {
            let stockTemplate = document.createElement('div');
            stockTemplate.classList.add('security');
            stockTemplate.addEventListener('click', fetchQuote.bind(null, stock));
            stockTemplate.innerHTML = `
                <div class="symbol">${stock.symbol}</div>
                <div class="name">${stock.name}</div>
                <div class="type">${stock.type}</div>
            `;
            resultsParent.appendChild(stockTemplate);
        })
        searchResults.appendChild(resultsParent);
    }
}

/* Handle ticker and stock API calls. */
const getStocks = async(url = '', stockAction, stock) => {
    const response = await fetch(url);

    try {
        const stockData = await response.json();
        
        if (stockData.statusCode !== 0) {
            throw stockData.errorMsg;
        }

        if (stockAction === stockOps.tickerSearch) {
            let stocks = [];
            for (let rawStock of stockData.responseData.bestMatches) {
                let stock = parseSymbol(rawStock, stockAction);
                stocks.push(stock);
            }
            displayMatchingStocks(stocks);
        } else {
            let quote = parseSymbol(
                stockData.responseData['Global Quote'], 
                stockAction,
                stock);
            displayQuote(quote);
        }
    } catch (error) {
        console.log("There was an error processing your request: ", error);
    }
}

function fetchDelayedQuote(lastRefresh, stock) {
    const currentTime = Date.parse(currentDayAndTime());
    const lastRefreshTime = Date.parse(lastRefresh);
    if (currentTime - lastRefreshTime < fetchLimit) {
        console.log("TOO SOON");
        // TODO: refreshing too soon
        return;
    }

    fetchQuote(stock);
}

function fetchQuote(stock) {
    hideSearchOverlay();
    getStocks(`http://localhost:3000/quote/${stock.symbol}`, stockOps.globalQuote, stock);
}

function displayQuote(quote) {
    console.log("Received quote: ", quote);

    const lastRefreshedDate = currentDayAndTime();
    console.log("Last refreshed date: ", lastRefreshedDate);
    const refreshHandler = fetchDelayedQuote.bind(this, lastRefreshedDate, quote);

    if (!bookmarkedStocks[quote.symbol]) {
        bookmarkedStocks.symbols.push(quote.symbol);

        /* Create the parent containers. */
        let quoteParent = document.createElement('div');
        quoteParent.classList.add(quote.symbol, "quote"); // for later removal

        let quoteContainer = document.createElement('div');
        quoteContainer.classList.add("quote-container");
 
        updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler);
  
        quoteParent.appendChild(quoteContainer);
        quotes.appendChild(quoteParent);
    } else {
        /* Update the current entry. */
        const quoteCard = document.querySelector(`.${quote.symbol}.quote`);
        let quoteContainer = quoteCard.querySelector('.quote-container');
        updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler);
    }

    bookmarkedStocks[quote.symbol] = quote;

    // TODO: show an alert if this was already added. 
    // TODO: show success/failures in general. 
    // TODO: show an error message if API limit is hit. 
}

function updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler) {
        let quoteHeader = createQuoteHeader(quote);
        let quoteBody = createQuoteBody(quote);

       /* Create the footer and add event listeners to it. */
       let quoteFooter = document.createElement('div');
       quoteFooter.classList.add("quote-footer");
  
       let lastRefreshed = document.createElement('span');
       lastRefreshed.classList.add("last-refreshed");
       lastRefreshed.innerHTML = `Last Refreshed: ${lastRefreshedDate}`;
  
       let refreshButton = document.createElement('button');
       refreshButton.classList.add("refresh-button");
       refreshButton.innerHTML = quoteIcon;
       refreshButton.addEventListener('click', refreshHandler);
  
       quoteFooter.appendChild(lastRefreshed);
       quoteFooter.appendChild(refreshButton);
  
       quoteContainer.innerHTML = quoteHeader + quoteBody;
       quoteContainer.appendChild(quoteFooter);
}