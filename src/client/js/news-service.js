import { alertType, showAlert, showLoader, hideLoader } from '../index'
import { advancedQuery, parseArticle } from './news-utils';
import { currentDayAndTime } from './number-utils';
import { createArticle, elementWithClasses } from './templates';

const insights = document.querySelector('.quote-insights');
const newsPanel = insights.querySelector('.quote-news');
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

export async function findNews(symbol, name) {
        showLoader();

        const currentTime = Date.parse(currentDayAndTime());
        /* Check if a recent request was made for this symbol. */
        console.log("CACHE: ", cache);
        if (cache[symbol]) {
                const cachedSymbol = cache[symbol];
                if (currentTime - Date.parse(cachedSymbol.lastRefresh) < fetchLimit) {
                        showAlert(errorMessages.FETCH_CACHED, alertType.info);
                        displayNews(cachedSymbol.breakingNews, cachedSymbol.allNews, symbol);
                        hideLoader();
                        return;
                }
        }
        
        const everythingQuery = `+(${symbol} OR (${advancedQuery(name, ' AND ')}))`;
        const simpleQuery = advancedQuery(name);

        const breakingNews = await getNews(`http://localhost:3000/breakingNews/${simpleQuery}`);
        const allNews = await getNews(`http://localhost:3000/allNews/${everythingQuery}`);

        console.log("Breaking news: ", breakingNews);
        console.log("All news: ", allNews);

        /* Refresh the footer. */
        const lastRefreshedDate = currentDayAndTime();
        lastRefreshed.innerHTML = `Last refreshed: ${lastRefreshedDate}`;

        /* Remove the previous event listener. */
        if (refreshListener) {
                refreshButton.removeEventListener('click', refreshListener);
        }

        refreshListener = findNews.bind(this, symbol, name, lastRefreshedDate);
        refreshButton.addEventListener('click', refreshListener);

        /* Cache the symbol, updating the last refreshed date. */
        cache[symbol] = {
                lastRefresh: lastRefreshedDate,
                breakingNews: breakingNews,
                allNews: allNews
        };

        displayNews(breakingNews, allNews, symbol);
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

const getSentiment = async(url = '', symbol) => {
        const requestOptions = {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ doc: url }) // body data type must match "Content-Type" header
            };
        const response = await fetch('http://localhost:3000/sentiment', requestOptions);
        console.log("RESPONSE: ", response);

        try {
            const sentimentData = await response.json();
            console.log("SENTIMENT DATA… ", sentimentData);
            if (sentimentData.statusCode !== 0) {
                showAlert(errorMessages.FAILED_REQUEST, alertType.error);
                return;
            }
            
            } catch (error) {
                    console.log("ERROR: ", error);
            }
}

function displayNews(breakingNews, allNews, symbol) {
        newsPanel.innerHTML = '';

        const newsContainer = elementWithClasses('div', ['news-container']);

        if (breakingNews && breakingNews.news) {
                breakingNews.news.forEach(article => {
                        /* Don't need to use the articles w/o description and 
                         * content, as the sentiment analysis API won't be able
                         * to get much information from it. */
                        if (article.description || article.content) {
                                const breakingArticle = createArticle(article, true);
                                newsContainer.appendChild(breakingArticle);
                        }

                        /* Only get Aylien analysis on breaking news. */
                        getSentiment(article.url, symbol);
                });
        }  

        if (allNews && allNews.news) {
                allNews.news.forEach(article => {
                        if (article.description || article.content) {
                                const normalArticle = createArticle(article);
                                newsContainer.appendChild(normalArticle);
                        }
                });
        }

        newsPanel.appendChild(newsContainer);

        /* Scroll back to the top. */
        newsPanel.scrollTo({top: 0, behavior: 'smooth'});
}