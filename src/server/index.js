/* Express to run server and routes. */
const express = require('express');

/* Create an instance of express. */
const app = express();
const port = 3000;

/* Dependencies. */

/* Node does not implement the fetch API. */
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

/* Provides utilities for working with file and directory paths. */
const path = require('path');

/* Express v4+ requires a extra middle-ware layer to handle POST requests. 
 * Below is the configuration for express to use body-parser as middleware. */

/* For parsing application/json.
 * bodyParser.json() returns a function. When passed into app.use
 * as its sole argument, it acts just like middleware. */
app.use(bodyParser.json());

/* Provides Express middleware that can be used to enable CORS with
 * various options. Allows the browser/server to communicate without 
 * security interruptions. */
const cors = require('cors');
app.use(cors());

/* Initialize the main project folder. The express.static built-in
 * middleware function enables the serving of static files, such as
 * images, CSS files, and JS files. In this case, it allows server-side
 * code to connect to client-side code, which is in the 'website' folder.
 * 
 * Provide the root directory from which to serve the static assets.
 * This enables consumers to load files that are in this directory:
 * ex. http://localhost:3000/js/app.js
 * 
 * As Express looks up the files relative to the static directory, 
 * the name of the static directory is not part of the URL. Note that
 * the path provided to the express.static function is relative to the 
 * direction from where the node process is launched.
 * 
 * path.join uses path.normalize, which resolves . and .., handles multiple
 * or trailing slashes, and uses the appropraite file separator for the platform.
 * 
 * __dirname gives the absolute path of the directory containing the currently 
 * executing file. The value will depend on which file you invoke it in. 
 * 
 * Here, configure the server to look for assets file in the dist folder 
 * (as webpack will build the dist folder). */

app.use(express.static('dist'));
//app.use(express.static(path.join(__dirname, '../client/views')));

/* Spins up a simple local server that will allow the app to run 
 * locally in the browser. Tell the server which port to run on.
 *
 * To run the server: node server.js */
const server = app.listen(port, () => {
    console.log(`running on localhost: ${port}`);
}) 

/* Alpha Vantage URLs and utils. */
const aVService = require('./services/av-service');
const aVActions = aVService.AVActions;
const aVSymbolSearchURL = aVService.avURL(aVActions.SymbolSearch);
const avQuoteURL = aVService.avURL(aVActions.GlobalQuote);

/* News API URLs and utils. */
const newsService = require('./services/news-service');
const newsActions = newsService.NewsActions;
const newsEverythingURL = newsService.newsURL(newsActions.Everything);
const newsTopHeadlines = newsService.newsURL(newsActions.TopHeadlines);

/* Methods to provide input validation. */
const validation = require('./utils/validation');

/* Convenience methods for sending service responses to the client. */
const responses = require('./utils/response');

/* AVService - GET list of stocks matching user-queried symbol. */
app.get('/stocks/:ticker', getMatchingStocks);
async function getMatchingStocks(req, res) {
    getStocks(req, res, aVActions.SymbolSearch);
}

/* AVService - GET quote for user-queried symbol. */
app.get('/quote/:ticker', getGlobalQuote);
async function getGlobalQuote(req, res) {
    getStocks(req, res, aVActions.GlobalQuote);
}

async function getStocks(req, res, searchType) {
    if (!req.params.ticker || !validation.isValid(req.params.ticker)) {
        res.send(responses.reqError(responses.errMsg.MISSING_OR_INVALID_PARAMETERS));
        return;
    }

    const ticker = req.params.ticker;
    const stockURL = searchType === aVActions.SymbolSearch ? 
        aVSymbolSearchURL(ticker) : avQuoteURL(ticker);
    console.log('💰 GET stocks -> ', stockURL);

    const stockData = await fetch(stockURL);
    try {
        const stockDataJSON = await stockData.json();
        console.log('💰 GET stocks SUCCESS -> ', stockDataJSON);

        if (stockDataJSON['Error Message']) {
            res.send(responses.reqError(responses.errMsg.INVALID_REQUEST));
        } else if (stockDataJSON['Note']) {
            res.send(responses.reqError(responses.errMsg.LIMIT_EXCEEDED));
        } else {
            res.send(responses.reqSuccess(stockDataJSON));
        }
    } catch (error) {
        console.log('💰 ERROR -> ', error);
        res.send(responses.reqError(responses.errMsg.PROCESS_FAILED));
    }
}

/* New API - GET news related to this symbol. */
app.get('/allNews/:query', getAllNews);
async function getAllNews(req, res) {
    getNews(req, res, newsActions.Everything);
}

app.get('/breakingNews/:query', getBreakingNews);
async function getBreakingNews(req, res) {
    getNews(req, res, newsActions.TopHeadlines);
}

async function getNews(req, res, newsQueryType) {
    if (!req.params.query && !validation.isValid(newsQuery)) {
        res.send(responses.reqError(responses.errMsg.MISSING_OR_INVALID_PARAMETERS));
        return;
    }

    const query = req.params.query;
    const newsURL = newsQueryType === newsActions.TopHeadlines ? 
        newsTopHeadlines(query) : newsEverythingURL(query);
    console.log('🗞 GET news -> ', newsURL);

    const news = await fetch(newsURL);
    try {
        const newsJSON = await news.json();
        console.log('🗞 GET news SUCCESS -> ', newsJSON);

        if (newsJSON.status !== 'ok') {
            res.send(responses.reqError(responses.errMsg.INVALID_REQUEST));
        } else {
            res.send(responses.reqSuccess(newsJSON));
        }
    } catch (error) {
        console.log('🗞 ERROR -> ', error);
        res.send(responses.reqError(responses.errMsg.PROCESS_FAILED));
    }
}

app.get('*', function(req, res) {
    console.log('No other routes matched...');
});