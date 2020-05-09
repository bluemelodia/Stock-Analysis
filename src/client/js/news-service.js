import { currentDayAndTime } from './number-utils';
import { advancedQuery, parseArticle } from './news-utils';

let timeOfLastRequest;
const requestLimit = 5000;

const errorMessages = {
        FAILED_REQUEST: 'We were unable to fetch the news. Please try again.',
        TOO_MANY_REFRESHES: 'You are checking the news too often. Please wait a few minutes then try again.'
}

export async function findNews(symbol, name) {
        const everythingQuery = `+(${symbol} OR (${advancedQuery(name, ' AND ')}))`;
        const simpleQuery = advancedQuery(name);

        const breakingNews = await getNews(`http://localhost:3000/breakingNews/${simpleQuery}`);
        if (breakingNews.statusCode !== 0) {
                showAlert(errorMessages.FAILED_REQUEST, alertType.error);
        } else {
                const allNews = await getNews(`http://localhost:3000/allNews/${everythingQuery}`);
                if (allNews.statusCode !== 0) {
                        showAlert(errorMessages.FAILED_REQUEST, alertType.error);
                }
        }
}

const getNews = async(url = '') => {
        const currentTime = Date.parse(currentDayAndTime());

        if (timeOfLastRequest && currentTime - Date.parse(timeOfLastRequest) < requestLimit) {
                showAlert(errorMessages.TOO_MANY_REQUESTS, alertType.warning);
                return;
        }

        const response = await fetch(url);

        try {
                const newsData = await response.json();
                console.log("NEWS: ", newsData);
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
                console.log("news: ", news);
                return { news: news, statusCode: 0};
        } catch (error) {
                console.log("ERROR: ", error);
                return { news: null, statusCode: -1 };
        }
}

// TODO: send breaking news reports about the stocks in the investor's portfolio. 
// TODO: let users save and delete stocks (save in Firebase) - on login, retrieve their info. 
// TODO: when making service calls, if they have too many stocks, space out the calls (15 seconds between calls).
// TODO: the database only really needs the list of symbols. 
// TODO: add loadmasks
// TODO: there's an issue where the alert is shown for a very short time after being shown the first time.
