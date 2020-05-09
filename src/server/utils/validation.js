/* Check for alphanumeric characters. */
function isValid(query) {
    const sanitizedQuery =  query.replace(/\W/g, '');
    return sanitizedQuery.length < 1 ? false : true;
}

module.exports = {
    isValid
};