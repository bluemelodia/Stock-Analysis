const apiKeys = require('../secrets/api-keys');

const baseURL = 'https://newsapi.org/v2';
const key = `&apikey=${apiKeys.newsKey}`;

/* API Functions */
const NewsActions = {
    TopHeadlines: 'TOP_HEADLINES',
    Everything: 'EVERYTHING'
};

function urlForNewsAction(action) {
    switch (action) {
        case NewsActions.TopHeadlines:
            return 'top-headlines';
        default:
            return 'everything';
    }
}

function currentDate() {
    const today = new Date();
    let day = today.getDate();
    day = `${day < 10 ? '0' : null }${day}`;

    /* January gives 0. */
    let month = today.getMonth() + 1;
    month = `${month < 10 ? '0' : null }${month}`;
    const year = today.getFullYear();
    return `${year}-${month}-${day}`
}

const buildNewsURL = (action) => (query) => {
    const base = `${baseURL}/${urlForNewsAction(action)}?q=${query}`;
    let queryParams = '';
    
    switch (action) {
        case NewsActions.Everything: 
            /* Ex: https://newsapi.org/v2/everything?q=apple&from=2020-05-02&to=2020-05-02&sortBy=popularity&apiKey=demo */
            const date = currentDate();
            queryParams = `&from=${date}&to=${date}&sortBy=relevancy&language=en`;
            break;
        default:
            queryParams = `&pageSize=25`;
            break;
    }
    
    return base + queryParams + key;
}

module.exports = {
    NewsActions,
    newsURL: buildNewsURL
};