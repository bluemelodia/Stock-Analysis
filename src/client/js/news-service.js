import { alertType, showAlert, showLoader, hideLoader } from '../index'
import { advancedQuery, createSentiment, parseArticle } from './news-utils';
import { currentDayAndTime } from './number-utils';
import { createArticle, createSentimentHeader, createSentimentBody, elementWithClasses } from './templates';

const insights = document.querySelector('.quote-insights');
const newsPanel = insights.querySelector('.quote-news');
const sentimentPanel = insights.querySelector('.quote-sentiment');
const lastRefreshed = insights.querySelector('.last-refreshed');
const refreshButton = insights.querySelector('.refresh-button');
let refreshListener;

const fetchLimit = 60 * 60 * 1000;

/* Unlike with symbol search, this cache will not be cleared. */
const cache = {};

const errorMessages = {
        FAILED_REQUEST: 'We were unable to fetch the news. Please try again.',
        FETCH_CACHED: 'As you recently fetched insights for this security, a cached version of the data will be displayed.',
}

const emptyMessages = {
        NO_NEWS: 'There is no recent news for this security.',
        NO_SENTIMENTS: 'As there are no recent breaking news for this security, sentiment analyses are unavailable.'
}

export async function findNews(symbol, name) {
        showLoader();

        /* Empty everything out. */
        newsPanel.innerHTML = '';
        sentimentPanel.innerHTML = '';

        const currentTime = Date.parse(currentDayAndTime());
        /* Check if a recent request was made for this symbol. */
        if (cache[symbol]) {
                const cachedSymbol = cache[symbol];
                if (currentTime - Date.parse(cachedSymbol.lastRefresh) < fetchLimit) {
                        showAlert(errorMessages.FETCH_CACHED, alertType.info);
                        displayNews(cachedSymbol.breakingNews, cachedSymbol.allNews, symbol);
                        displaySentiments(cachedSymbol.breakingNews.news);
                        hideLoader();
                        return;
                }
        }
        
        const everythingQuery = `+(${symbol} OR (${advancedQuery(name, ' AND ')}))`;
        const simpleQuery = advancedQuery(name);

        const breakingNews = await getNews(`http://localhost:3000/breakingNews/${simpleQuery}`);
        const allNews = await getNews(`http://localhost:3000/allNews/${everythingQuery}`);

        /* Refresh the footer. */
        const lastRefreshedDate = currentDayAndTime();
        lastRefreshed.innerHTML = `Last refreshed: ${lastRefreshedDate}`;

        /* Remove the previous event listener. */
        if (refreshListener) {
                refreshButton.removeEventListener('click', refreshListener);
        }

        refreshListener = findNews.bind(this, symbol, name, lastRefreshedDate);
        refreshButton.addEventListener('click', refreshListener);

        /* Only get Aylien analysis on breaking news. */
        if (breakingNews && breakingNews.news) {
                let sentiments = [];
                for (let news of breakingNews.news) {
                        const newsSentiments = await getSentiment(news.url);
                        if (newsSentiments) {
                                sentiments = sentiments.concat(newsSentiments);
                        }
                        news.sentiments = sentiments;
                }
        }

        /* Cache the symbol, updating the last refreshed date. */
        cache[symbol] = {
                lastRefresh: lastRefreshedDate,
                breakingNews: breakingNews,
                allNews: allNews
        };
        console.log("CACHED: ", cache);

        displayNews(breakingNews, allNews, symbol);
        displaySentiments(breakingNews.news);
        hideLoader();
}

const getNews = async(url = '') => {
        const response = await fetch(url);

        try {
                const newsData = await response.json();
                if (newsData.statusCode !== 0) {
                        throw newsData.errorMsg;
                }
                let news = [];
                for (let rawArticle of newsData.responseData.articles) {
                        try {           
                                const article = parseArticle(rawArticle);
                                news.push(article);
                            } catch(error) {
                                console.log(`There was an error parsing: ${rawArticle}: `, error);
                                continue;
                            }
                }
                return { news: news, statusCode: 0};
        } catch (error) {
                console.log("ERROR: ", error);
                return { news: null, statusCode: -1 };
        }
}

const getSentiment = async(url = '') => {
        const requestOptions = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doc: url }) // body data type must match "Content-Type" header
            };
        const response = await fetch('http://localhost:3000/sentiment', requestOptions);

        try {
            const sentimentData = await response.json();
            if (sentimentData.statusCode !== 0) {
                return;
            }

            let sentiments = [];
            for (let sentiment of sentimentData.responseData.entities) {
                if (sentiment.mentions.length > 0) {
                        sentiments.push(createSentiment(sentiment));
                }
            } 
            return sentiments;
        }
        catch (error) {
                console.log("ERROR: ", error);
                return null;
        }
}

function displayNews(breakingNews, allNews) {
        newsPanel.innerHTML = '';

        const newsContainer = elementWithClasses('div', ['news-container']);
        const hasBreakingNews = breakingNews && breakingNews.news && breakingNews.news.length > 0;
        const hasNews = allNews && allNews.news && allNews.news.length > 0;

        if (!hasBreakingNews && !hasNews) {
                newsContainer.innerHTML = `
                        <div class="no-news">
                                ${emptyMessages.NO_NEWS}
                        </div>
                `;
        } else {
                if (hasBreakingNews) {
                        breakingNews.news.forEach(article => {
                                /* Don't need to use the articles w/o description and 
                                 * content, as the sentiment analysis API won't be able
                                 * to get much information from it. */
                                if (article.description || article.content) {
                                        const breakingArticle = createArticle(article, true);
                                        newsContainer.appendChild(breakingArticle);
                                }
                        });
                }  
        
                if (hasNews) {
                        allNews.news.forEach(article => {
                                if (article.description || article.content) {
                                        const normalArticle = createArticle(article);
                                        newsContainer.appendChild(normalArticle);
                                }
                        });
                }
        }

        newsPanel.appendChild(newsContainer);

        /* Scroll back to the top. */
        newsPanel.scrollTo({top: 0, behavior: 'smooth'});
}

function displaySentiments(news) {
        sentimentPanel.innerHTML = '';

        const sentimentsContainer = elementWithClasses('div', ['sentiments-container']);
        let hasSentiments = false;

        for (let breakingNews of news) {
                const sentiments = breakingNews.sentiments; 
                if (sentiments.length > 0) {
                        const newsHeader = createSentimentHeader(breakingNews);
                        sentimentsContainer.appendChild(newsHeader);
                }
                
                sentiments.forEach(sentiment => {
                        const sentimentTemplate = createSentimentBody(sentiment);
                        sentimentsContainer.appendChild(sentimentTemplate);
                        hasSentiments = true;
                });
        }

        if (!hasSentiments) {
                sentimentsContainer.innerHTML = `
                        <div class="no-sentiments">
                                ${emptyMessages.NO_SENTIMENTS}
                        </div>
                `;
        }

        sentimentPanel.appendChild(sentimentsContainer);

        /* Scroll back to the top. */
        sentimentPanel.scrollTo({top: 0, behavior: 'smooth'});
}