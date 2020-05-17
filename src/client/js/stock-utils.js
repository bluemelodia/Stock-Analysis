export const stockOps = {
    tickerSearch: 'TICKER',
    globalQuote: 'QUOTE'
};

function cleanKeys(rawData) {
    let cleanData = {};
    for (let [key, value] of Object.entries(rawData)) {
      key = key.split('. ')[1];
      cleanData[key] = value;
    }
    return cleanData;
}

export function parseSymbol(rawQuote, stockAction, symbolData) {
    let cleanedData = cleanKeys(rawQuote);
    let cleanedSymbol = stockAction === stockOps.tickerSearch ? cleanedData : symbolData;
    console.log("CLEANED: ", cleanedSymbol);
    let symbol = {
        symbol : cleanedSymbol.symbol,
        name : cleanedSymbol.name,
        type : cleanedSymbol.type,
        currency: cleanedSymbol.currency,
        matchScore : cleanedSymbol.matchScore
    };

    if (stockAction === stockOps.tickerSearch) {
        console.log("SYMBIOL ONLY");
        return symbol;
    } else {
        let quote = {
            change: cleanedData.change,
            percentChange: cleanedData['change percent'],
            high: cleanedData.high, 
            low: cleanedData.low,
            open: cleanedData.open, 
            previousClose: cleanedData['previous close'],
            price: cleanedData.price, 
            volume: cleanedData.volume
        }
        quote = Object.assign({}, quote, symbol);
        console.log("OUR QUOTE, ", quote);
        return quote;
    }
}

export function idFromSymbol(symbol) {
    return symbol.replace(/\W/g, '');
}
