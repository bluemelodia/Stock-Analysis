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
        getStocks(`http://localhost:3000/stocks/${userQuery}`);
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
        for (let rawStock of stockData.responseData.bestMatches) {
            let stock = parseSymbol(rawStock);
            stocks.push(stock);
        }
        displayMatchingStocks(stocks);
    } catch (error) {
        console.log("There was an error processing your request: ", error);
    }
}

