import { currentDayAndTime } from './number-utils';

let timeOfLastRequest;
const requestLimit = 5000;

const errorMessages = {
        FAILED_REQUEST: 'We were unable to fetch the news. Please try again.',
        TOO_MANY_REFRESHES: 'You are checking the news too often. Please wait a few minutes then try again.'
}

export function findNews(query) {
        getRecentNews(`http://localhost:3000/allNews/${query}`);
}

const getRecentNews = async(url = '', query = '') => {
        const currentTime = Date.parse(currentDayAndTime());

        if (timeOfLastRequest && currentTime - Date.parse(timeOfLastRequest) < requestLimit) {
                showAlert(errorMessages.TOO_MANY_REQUESTS, alertType.warning);
                return;
        }

        const response = await fetch(url);

        try {
                const newsData = await response.json();
                if (newsData.statusCode !== 0) {
                        throw newsData.errorMsg;
                }
                let news = [];
                for (let article of newsData.responseData.articles) {
                        news.push(article);
                }
                console.log("news: ", news);
        } catch (error) {
                showAlert(errorMessages.FAILED_REQUEST, alertType.error);
        }
}

// TODO: send breaking news reports about the stocks in the investor's portfolio. 
// TODO: let users save and delete stocks (save in Firebase) - on login, retrieve their info. 
// TODO: when making service calls, if they have too many stocks, space out the calls (15 seconds between calls).
// TODO: the database only really needs the list of symbols. 
// TODO: add loadmasks
// TODO: there's an issue where the alert is shown for a very short time after being shown the first time.
