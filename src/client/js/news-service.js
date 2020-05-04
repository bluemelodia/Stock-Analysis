

export const findBreakingNews = async(query = 'amazon') => {
        console.log('Finding breaking news');
        const response = await fetch(`http://localhost:3000/allNews/${query}`);
        const response2 = await fetch(`http://localhost:3000/breakingNews/${query}`);
}

export function findRecentNews(query) {

}

// TODO: send breaking news reports about the stocks in the investor's portfolio. 
// TODO: let users save and delete stocks (save in Firebase) - on login, retrieve their info. 
// TODO: when making service calls, if they have too many stocks, space out the calls (15 seconds between calls).
// TODO: the database only really needs the list of symbols. 
// TODO: add loadmasks