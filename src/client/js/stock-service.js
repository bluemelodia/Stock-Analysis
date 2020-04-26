const searchPrompt = `<div class="search-prompt">Search for symbols.</div>`;
const noResults = `<div class="no-results">No results found.</div>`;

const overlay = document.querySelector('.search-overlay');
const searchInput = document.getElementById('search-input');
const searchResults = document.querySelector('.search-results');

export function showSearchOverlay() {
    searchInput.classList.add('search-active');
    overlay.classList.remove('hidden');
    searchResults.classList.remove('hidden');
}

export function hideSearchOverlay() {
    overlay.classList.add('hidden');
    searchResults.classList.add('hidden');
}

export function findMatchingStocks(query) {
    const userQuery = query;
    console.log("Query: ", userQuery);
    if (userQuery && userQuery.length > 0) {
        getStocks(`http://localhost:3000/stocks/${userQuery}`);
    }
}

export function displayMatchingStocks(stocks) {
    searchResults.innerHTML = '';
    if (stocks.length < 1) {

    } else {

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

function parseSymbol(rawQuote) {
    let cleanedSymbol = cleanKeys(rawQuote);
    let symbol = {
      symbol : cleanedSymbol.symbol,
      name : cleanedSymbol.name,
      type : cleanedSymbol.type,
      matchScore : cleanedSymbol.matchScore
    }
  
    return symbol;
}

/* Get list of stocks matching the user-queries ticker. */
const getStocks = async(url = '') => {
    let stocks = [];
    const response = await fetch(url);

    try {
        const stockData = await response.json();
        if (stockData.statusCode !== 0) {
            throw stockData.errorMsg;
        }

        for (rawStock of stockData.bestMatches) {
            let stock = parseSymbol(rawStock);
            stocks.push(stock);
        }
        displayMatchingStocks(stocks);
    } catch (error) {
        console.log("There was an error processing your request: ", error);
    }
}

