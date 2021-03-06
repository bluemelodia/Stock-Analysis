import { parseSymbol, idFromSymbol, stockOps } from './stock-utils';
import { currentDayAndTime } from './number-utils';
import { 
    createQuoteBody, 
    createQuoteHeader, 
    elementWithClasses,
    noResults, 
    quoteIcon,
    searchPrompt 
} from './templates';
import { alertType, showAlert, showLoader, hideLoader, showInsights } from '../index'

const overlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');
const quotes = document.querySelector('.quotes');

let timeOfLastRequest;

/* This is added because of Alpha Vantage API limits. */
const requestLimit = 5000;

/* In addition to AV API Limits, this timeout is intentionally kept long because 
 * users should not be trying to get updated information on securities too often. */
const fetchLimit = 15 * 60 * 1000;

const errorMessages = {
    ADD_EXISTING: 'This security is on your watch list.',
    REMOVE_NONEXISTING: 'This security is not currently on your watch list.', 
    FAILED_REMOVAL: 'We were unable to delete this card. Please try again.',
    FAILED_REQUEST: 'We were unable to complete your request. Please try again.',
    TOO_MANY_REQUESTS: 'You are making too many requests in a short period of time. Please wait a few seconds then try again.',
    TOO_MANY_REFRESHES: 'You are checking on this security too often. Please wait a few minutes then try again.'
}

const bookmarkOperation = {
    POST: 'POST',
    DELETE: 'DELETE'
}

const displayedStocks = {
    symbols: []
};

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
    let resultsParent = elementWithClasses();
    resultsParent.innerHTML = content;
    searchResults.appendChild(resultsParent);
}

export const fetchSymbols = async() => {
    const stocks = await fetch(`http://localhost:3000/loadSymbols`);
    try {
        const watchedStocks = await stocks.json();
        if (watchedStocks.statusCode === 0 && watchedStocks.responseData) {
            let iteration = 1;
            const watchData = watchedStocks.responseData
            showAlert("Fetching cached stocks.", alertType.info);

            for (var stock in watchData) {
                console.log("Getting cached stock: ", stock);
                setTimeout(
                    getStocks.bind(null,
                    `http://localhost:3000/quote/${stock}`, 
                    stockOps.globalQuote,
                    watchData[stock], 
                    true),
                    requestLimit * iteration
                );
                iteration += 1;
            }
        }
    } catch(error) {
        console.log("ERROR: ", error);
    }
}

export function findMatchingStocks(query) {
    const userQuery = query;
    if (userQuery && userQuery.length > 0) {
        getStocks(`http://localhost:3000/stocks/${userQuery}`, stockOps.tickerSearch);
    }
}

function displayMatchingStocks(stocks) {
    if (stocks.length < 1) {
        setResultsContent(noResults);
    } else {
        searchResults.innerHTML = '';

        let resultsParent = elementWithClasses();
        stocks.forEach(stock => {
            let stockTemplate = elementWithClasses('div', ['security']);
            stockTemplate.addEventListener('click', fetchQuote.bind(null, stock));
            stockTemplate.innerHTML = `
                <div class='symbol'>${stock.symbol}</div>
                <div class='name'>${stock.name}</div>
                <div class='type'>${stock.type}</div>
            `;
            resultsParent.appendChild(stockTemplate);
        })
        searchResults.appendChild(resultsParent);
    }
}

/* Handle ticker and stock API calls. */
const getStocks = async(url = '', stockAction, stock, isServerFetch = false) => {
    const currentTime = Date.parse(currentDayAndTime());

    if (timeOfLastRequest && currentTime - Date.parse(timeOfLastRequest) < requestLimit) {
        showAlert(errorMessages.TOO_MANY_REQUESTS, alertType.warning);
        return;
    }

    showLoader();

    timeOfLastRequest = currentDayAndTime();
    const response = await fetch(url);

    try {
        const stockData = await response.json();
        
        if (stockData.statusCode !== 0) {
            throw stockData.errorMsg;
        }

        if (stockAction === stockOps.tickerSearch) {
            let stocks = [];
            for (let rawStock of stockData.responseData.bestMatches) {
                try {           
                    let stock = parseSymbol(rawStock, stockAction);
                    stocks.push(stock);
                } catch(error) {
                    console.log(`There was an error parsing: ${rawStock}: `, error);
                    continue;
                }
            }
            displayMatchingStocks(stocks);
        } else {
            let quote = parseSymbol(
                stockData.responseData['Global Quote'], 
                stockAction,
                stock);
            displayQuote(quote);

            if (isServerFetch) {
                setFetchedQuoteToWatch(quote);
            }
        }
    } catch (error) {
        console.log("ERROR: ", error);
        showAlert(errorMessages.FAILED_REQUEST, alertType.error);
    } finally {
        hideLoader();
    }
}

function fetchDelayedQuote(lastRefresh, stock) {
    const currentTime = Date.parse(currentDayAndTime());
    const lastRefreshTime = Date.parse(lastRefresh);
    if (currentTime - lastRefreshTime < fetchLimit) {
        showAlert(errorMessages.TOO_MANY_REFRESHES, alertType.warning);
        return;
    }

    fetchQuote(stock);
}

function fetchQuote(stock) {
    hideSearchOverlay();
    getStocks(`http://localhost:3000/quote/${stock.symbol}`, stockOps.globalQuote, stock);
}

/* Functions related to displaying the details of a quote card. 
 * If the user is making a request for a security that they have already searched
 * for, the update will be made in place. Otherwise, a new card will be added. */
function displayQuote(quote) {
    const lastRefreshedDate = currentDayAndTime();
    const refreshHandler = fetchDelayedQuote.bind(this, lastRefreshedDate, quote);

    if (!displayedStocks[quote.symbol]) {
        displayedStocks.symbols.push(quote.symbol);

        /* Create the parent containers. */
        let quoteParent = elementWithClasses('div', ['quote']);
        quoteParent.id = idFromSymbol(quote.symbol);

        let quoteContainer = elementWithClasses('div', ['quote-container']); 
        updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler);
  
        quoteParent.appendChild(quoteContainer);
        quotes.appendChild(quoteParent);
    } else {
        /* Update the current entry. */
        const quoteCard = document.getElementById(idFromSymbol(quote.symbol));
        let quoteContainer = quoteCard.querySelector('.quote-container');
        quoteContainer.innerHTML = '';
        updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler);
    }

    displayedStocks[quote.symbol] = quote;
}

function updateQuoteContainer(quoteContainer, quote, lastRefreshedDate, refreshHandler) {
       const isWatching = isWatchedQuote(quote.symbol);
       const insightsHandler = showQuoteInsights.bind(null, quote);
       const watchHandler = watchQuote.bind(null, quote);
       const unwatchHandler = unwatchQuote.bind(null, quote);
       const deleteHandler = deleteQuote.bind(null, quote);

       const quoteHeader = createQuoteHeader(quote, isWatching, {
           insight: insightsHandler,
           watch: watchHandler,
           unwatch: unwatchHandler,
           delete: deleteHandler
       });
       const quoteBody = createQuoteBody(quote);

       /* Create the footer and add event listeners to it. */
       let quoteFooter = elementWithClasses('div', ['quote-footer']);
       let lastRefreshed = elementWithClasses('span', ['last-refreshed']);
       lastRefreshed.innerHTML = `Last Refreshed: ${lastRefreshedDate}`;
  
       let refreshButton = elementWithClasses('button', ['refresh-button']); 
       refreshButton.innerHTML = quoteIcon;
       refreshButton.addEventListener('click', refreshHandler);
  
       quoteFooter.appendChild(lastRefreshed);
       quoteFooter.appendChild(refreshButton);
  
       quoteContainer.appendChild(quoteHeader);
       quoteContainer.appendChild(quoteBody);
       quoteContainer.appendChild(quoteFooter);
}

/* Functions related to adding/removing securities from a watch list. Adding a security
 * to the watch list means that the server will fetch these securities at the start of
 * the next user session. */
function isWatchedQuote(symbol) {
    return bookmarkedStocks[symbol];
}

/* If fetching the quote from the server, automatically add it to the list of 
 * bookmarked stocks and set the configuration to watched. */
function setFetchedQuoteToWatch(quote) {
    const symbol = quote.symbol;
    if (configureWatchedCard(symbol)) {
        bookmarkedStocks.symbols.push(symbol);
        bookmarkedStocks[symbol] = quote;
    }
}

function watchQuote(quote) {
    const symbol = quote.symbol;
    if (!bookmarkedStocks[symbol]) {
        if (configureWatchedCard(symbol)) {
            bookmarkedStocks.symbols.push(symbol);
            bookmarkedStocks[symbol] = quote;
            showAlert(`Added ${symbol} to watch list.`, alertType.success);
            toggleBookmark(symbol, bookmarkOperation.POST, bookmarkedStocks[symbol]);
        } else {
            showAlert(
                `We were unable to add ${symbol} to your watch list. Please try again later.`, 
                alertType.error
            );
        }
    } else {
        showAlert(errorMessages.ADD_EXISTING, alertType.error);
    }
}

function configureWatchedCard(symbol) {
    const quoteCard = document.getElementById(idFromSymbol(symbol));

    try {
        let watchButton = quoteCard.querySelector('.watch-quote');
        watchButton.classList.add('hidden');

        let deleteButton = quoteCard.querySelector('.delete-quote');
        deleteButton.classList.add('hidden');

        let unwatchButton = quoteCard.querySelector('.unwatch-quote');
        unwatchButton.classList.remove('hidden');

        return true;
    } catch(error) {
        return false;
    }
}

function unwatchQuote(quote) {
    const symbol = quote.symbol;
    if (bookmarkedStocks[symbol]) {
        if (configureUnwatchedCard(symbol)) {
            bookmarkedStocks.symbols = bookmarkedStocks.symbols.filter(symbol => symbol !== quote.symbol);
            delete bookmarkedStocks[symbol];
            showAlert(`Removed ${symbol} from watch list.`, alertType.success);
            toggleBookmark(symbol, bookmarkOperation.DELETE);
        } else {
            showAlert(
                `We were unable to remove ${symbol} from your watch list. Please try again later.`,
                alertType.error
            );
        }
    } else {
        showAlert(errorMessages.REMOVE_NONEXISTING, alertType.error);
    }
}

function configureUnwatchedCard(symbol) {
    const quoteCard = document.getElementById(idFromSymbol(symbol));
    try {
        let watchButton = quoteCard.querySelector('.watch-quote');
        watchButton.classList.remove('hidden');

        let deleteButton = quoteCard.querySelector('.delete-quote');
        deleteButton.classList.remove('hidden');

        let unwatchButton = quoteCard.querySelector('.unwatch-quote');
        unwatchButton.classList.add('hidden');

        return true;
    } catch(error) {
        return false;
    }
}

function toggleBookmark(symbol, bookmarkOp = bookmarkOperation.POST, stock = null) {
    const isPost = bookmarkOp === bookmarkOperation.POST;
    let payload = symbol;
    if (isPost) {
        payload = {
            symbol : stock.symbol,
            name : stock.name,
            type : stock.type,
            currency: stock.currency,
            matchScore : stock.matchScore
        };
    }

    const requestOptions = {
        method: bookmarkOp,
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symbol : payload }) // body data type must match "Content-Type" header
    };
    fetch(`http://localhost:3000/${ isPost ? 'addSymbol' : 'removeSymbol' }`, requestOptions);
}

function deleteQuote(quote) {
    try {
        const symbol = quote.symbol;
        const quoteCard = document.getElementById(idFromSymbol(symbol));
        quoteCard.remove();

        displayedStocks.symbols = displayedStocks.symbols.filter(displayedSym => displayedSym !== symbol);
        delete displayedStocks[symbol];

        showAlert(`Deleted ${symbol} card.`, alertType.success);
    } catch (error) {
        showAlert(errorMessages.FAILED_REMOVAL, alertType.error);
    }
}

function showQuoteInsights(quote) {
    showInsights(quote.symbol, quote.name);
}