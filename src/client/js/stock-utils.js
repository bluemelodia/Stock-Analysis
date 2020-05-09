import { query } from "express";

export const stockOps = {
    tickerSearch: 'TICKER',
    globalQuote: 'QUOTE'
};

/* Including these in the query will decrease the relevancy of returned articles. */
const patterns = [ 
    'co',
    'com', 
    'company', 
    'corp',
    'corporation',
    'global',
    'group',
    'holding',
    'inc', 
    'incorporated', 
    'limited',
    'ltd',
    'lp',
    'plc',
    'technologies',
    'the'
];

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
    let symbol = {
        symbol : cleanedSymbol.symbol,
        name : cleanedSymbol.name,
        type : cleanedSymbol.type,
        currency: cleanedSymbol.currency,
        matchScore : cleanedSymbol.matchScore
    };

    if (stockAction === stockOps.tickerSearch) {
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
        return quote;
    }
}

export function idFromSymbol(symbol) {
    return symbol.replace(/\W/g, '');
}

export function meaningfulQuery(query) {
    const queryFragments = query.split(/[ ,.]+/);
    const queryArr = [];
    queryFragments.forEach(queryFragment => {
        const qf = queryFragment.toLowerCase();
        if (!containsPatterns(qf, patterns) && qf.length > 1) {
            queryArr.push(qf);
        }
    });
    return queryArr.join(' AND ');
}

function containsPatterns(query, patterns) {
    for (let pattern of patterns) {
        if (query === pattern) {
            return true;
        }
    }
    return false;
}