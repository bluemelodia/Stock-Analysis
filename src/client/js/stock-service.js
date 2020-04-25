export function findMatchingStocks(query) {
    const userQuery = query;
    console.log("Query: ", userQuery);
    if (userQuery && userQuery.length > 0) {
        getStocks(`http://localhost:3000/stocks/${userQuery}`);
    }
}

/* Get list of stocks matching the user-queries ticker. */
const getStocks = async(url = '') => {
    const response = await fetch(url);

    try {
        const newData = await response.json();
        // hideLoadMask(container);
        // if (newData.statusCode !== 0) {
        //     throw `request failed with status code: ${newData.statusCode}`;
        // }
        // if (type === albumType.SEARCH) {
        //     processStockPhotos(newData, isNextPage);
        // } else {
        //     processSavedPhotos(newData);
        // }
        // displayStockPhotos(type, isNextPage);
    } catch (error) {
        console.log("There was an error processing your request: ", error);
        //hideLoadMask(container);
        //displayAlert(alertType.ERROR, `We are unable to process your query at this time. Please try again later.`);
    }
}