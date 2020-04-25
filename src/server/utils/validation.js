/* Tickers can only have alphanumeric characters. */
function isValidTicker(ticker) {
    const sanitizedTicker =  ticker.replace(/\W/g, '');
    console.log("Non alpha ticker? ", sanitizedTicker);
    return sanitizedTicker.length < 1 ? false : true;
}

module.exports = {
    isValidTicker,
};