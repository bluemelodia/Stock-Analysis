/* Tickers can only have alphanumeric characters. */
function isValidTicker(ticker) {
    const sanitizedTicker =  ticker.replace(/\W/g, '');
    return sanitizedTicker.length < 1 ? false : true;
}

module.exports = {
    isValidTicker,
};