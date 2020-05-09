import { alertType, showAlert } from '../index'
import { advancedQuery, parseArticle } from './news-utils';
import { currentDayAndTime } from './number-utils';
import { createArticle, elementWithClasses } from './templates';

const insights = document.querySelector('.quote-insights');
const newsPanel = insights.querySelector('.quote-news');

let timeOfLastRequest;
const requestLimit = 15000;

// TODO: cache articles & last refreshed date for each.

const errorMessages = {
        FAILED_REQUEST: 'We were unable to fetch the news. Please try again.',
        TOO_MANY_REQUESTS: 'You are making too many requests in a short period of time. Please wait a few seconds then try again.',
        TOO_MANY_REFRESHES: 'You are checking the news too often. Please wait a few minutes then try again.'
}

export async function findNews(symbol, name) {
        const currentTime = Date.parse(currentDayAndTime());

        if (timeOfLastRequest && currentTime - Date.parse(timeOfLastRequest) < requestLimit) {
                console.log("Showing alert:");
                showAlert(errorMessages.TOO_MANY_REQUESTS, alertType.warning);
                return;
        }
        
        const everythingQuery = `+(${symbol} OR (${advancedQuery(name, ' AND ')}))`;
        const simpleQuery = advancedQuery(name);

        const breakingNews = await getNews(`http://localhost:3000/breakingNews/${simpleQuery}`);
        const allNews = await getNews(`http://localhost:3000/allNews/${everythingQuery}`);

        console.log("Breaking news: ", breakingNews);
        console.log("All news: ", allNews);
        timeOfLastRequest = currentDayAndTime();
        displayNews(breakingNews, allNews);
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

function displayNews(breakingNews, allNews) {
        newsPanel.innerHTML = '';

        const newsContainer = elementWithClasses('div', ['news-container']);

        if (breakingNews && breakingNews.news) {
                breakingNews.news.forEach(article => {
                        const breakingArticle = createArticle(article, true);
                        newsContainer.appendChild(breakingArticle);
                });
        }  

        if (allNews && allNews.news) {
                allNews.news.forEach(article => {
                        const normalArticle = createArticle(article);
                        newsContainer.appendChild(normalArticle);
                });
        }

        newsPanel.appendChild(newsContainer);
}

// TODO: send breaking news reports about the stocks in the investor's portfolio. 
// TODO: let users save and delete stocks (save in Firebase) - on login, retrieve their info. 
// TODO: when making service calls, if they have too many stocks, space out the calls (15 seconds between calls).
// TODO: the database only really needs the list of symbols. 
// TODO: add loadmasks
// TODO: there's an issue where the alert is shown for a very short time after being shown the first time.
