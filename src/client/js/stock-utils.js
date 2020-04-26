export const stockOps = {
    tickerSearch: 'TICKER',
    globalQuote: 'QUOTE'
};

function cleanKeys(rawData) {
    let cleanData = {};
    for (let [key, value] of Object.entries(rawData)) {
      key = key.split(". ")[1];
      cleanData[key] = value;
    }
    return cleanData;
}

export function parseSymbol(rawQuote, stockAction) {
    let cleanedSymbol = cleanKeys(rawQuote);

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