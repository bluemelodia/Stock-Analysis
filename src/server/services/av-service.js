const apiKeys = require('../secrets/api-keys');

const baseURL = "https://www.alphavantage.co/query";
const key = `&apikey=${apiKeys.avKey}`;

/* API Functions */
const AVActions = {
    GlobalQuote: "GLOBAL_QUOTE",
    SymbolSearch: "SYMBOL_SEARCH",
    TimeSeriesIntraday: "TIME_SERIES_INTRADAY",
    TimeSeriesDaily: "TIME_SERIES_DAILY_ADJUSTED",
    TimeSeriesWeekly: "TIME_SERIES_WEEKLY_ADJUSTED",
    TimeSeriesMonthly: "TIME_SERIES_MONTHLY"
};

const buildAVURL = (action) => (query) => {
    const base = `${baseURL}?function=${action}`;
    let queryParams = "";
    
    switch (action) {
        case AVActions.GlobalQuote:
            /* Ex: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=MSFT&apikey=demo */
            queryParams = `&symbol=${query}`;
            break;
        case AVActions.SymbolSearch: 
            /* Ex: https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=BA&apikey=demo */
            queryParams = `&keywords=${query}`;
            break;
        default:
            break;
    }
    
    return base + queryParams + key;
}

module.exports = {
    AVActions,
    avURL: buildAVURL
};