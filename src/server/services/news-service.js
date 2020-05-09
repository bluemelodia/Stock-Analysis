const apiKeys = require('../secrets/api-keys');

const baseURL = 'https://newsapi.org/v2';
const key = `&apikey=${apiKeys.newsKey}`;

/* API Functions */
const NewsActions = {
    TopHeadlines: 'TOP_HEADLINES',
    Everything: 'EVERYTHING'
};

const domains = [
    'afr.com',
    'businessinsider.com',
    'uk.businessinsider.com',
    'business.financialpost.com',
    'bloomberg.com',
    'ccn.com',
    'cnbc.com',
    'fortune.com',
    'news.ycombinator.com',
    'recode.net',
    'techcrunch.com',
    'techcrunch.cn',
    'thenextweb.com',
    'theverge.com',
    'wsj.com',
    'wired.com'
]

function urlForNewsAction(action) {
    switch (action) {
        case NewsActions.TopHeadlines:
            return 'top-headlines';
        default:
            return 'everything';
    }
}

function formatDate(date) {
    let day = date.getDay(date); 
    day = `${day < 10 ? '0' : null }${day}`;

    /* January gives 0. */
    let month = date.getMonth() + 1;
    month = `${month < 10 ? '0' : null }${month}`;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`
}

function dateRange() {
    let to = new Date();
    let from = new Date(to);
    from.setDate(from.getDate() - 3);

    return {
        toDate: formatDate(to),
        fromDate: formatDate(from)
    }
} 

const buildNewsURL = (action) => (query) => {
    const base = `${baseURL}/${urlForNewsAction(action)}?`;
    let queryParams = '';
    
    switch (action) {
        case NewsActions.Everything: 
            /* Ex: https://newsapi.org/v2/everything?q=apple&from=2020-05-02&to=2020-05-02&sortBy=popularity&apiKey=demo */
            const dates = dateRange();
            queryParams = `qInTitle=${query}&from=${dates.fromDate}&to=${dates.toDate}&language=en&domains=${domains.join(',')}`;
            break;
        default:
            queryParams = `q=${query}&pageSize=40&category=business&country=us`;
            break;
    }
    
    return base + queryParams + key;
}

module.exports = {
    NewsActions,
    newsURL: buildNewsURL
};