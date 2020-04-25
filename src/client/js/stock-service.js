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
        if (newData.statusCode !== 0) {
            throw newData.errorMsg;
        }

        
    } catch (error) {
        console.log("There was an error processing your request: ", error);
    }
}