const searchPrompt = `
    <div class="search-prompt-container">
        <i class='far fa-chart-bar' style='font-size:24px'></i>
        <div class="search-prompt">Search for symbols.</div>
    </div>`;
const noResults = `
    <div class="no-results-container">
        <i class="fa fa-info-circle" style="font-size:24px"></i>
        <div class="no-results">No results found.</div>
    </div>
`;

const overlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');

const stockOps = {
    tickerSearch: 'TICKER',
    globalQuote: 'QUOTE'
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

export function displayMatchingStocks(stocks) {
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

function cleanKeys(rawData) {
    let cleanData = {};
    for (let [key, value] of Object.entries(rawData)) {
      key = key.split(". ")[1];
      cleanData[key] = value;
    }
    return cleanData;
}

function parseSymbol(rawQuote, stockAction) {
    let cleanedSymbol = cleanKeys(rawQuote);
    console.log("Clean symbol", cleanedSymbol);

    if (stockAction === stockOps.tickerSearch) {
        let symbol = {
            symbol : cleanedSymbol.symbol,
            name : cleanedSymbol.name,
            type : cleanedSymbol.type,
            matchScore : cleanedSymbol.matchScore
        }
        return symbol;
    } else {
        let quote = {
            change: cleanedSymbol.change,
            percentChange: cleanedSymbol['change percent'],
            high: cleanedSymbol.high, 
            low: cleanedSymbol.low,
            open: cleanedSymbol.open, 
            previousClose: cleanedSymbol['previous close'],
            price: cleanedSymbol.price, 
            volume: cleanedSymbol.volume
        }
        return quote;
    }
}

/* Get list of stocks matching the user-queries ticker. */
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
            let quote = Object.assign({}, 
                stock, 
                parseSymbol(stockData.responseData['Global Quote'], stockAction));
            delete quote.matchScore;
            console.log("Received quote: ", quote);
        }
    } catch (error) {
        console.log("There was an error processing your request: ", error);
    }
}

function fetchQuote(stock) {
    hideSearchOverlay();
    getStocks(`http://localhost:3000/quote/${stock.symbol}`, stockOps.globalQuote, stock);
}