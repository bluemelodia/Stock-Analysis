
const apiKeys = require('../secrets/api-keys');
const baseURL = 'https://api.aylien.com/api/v1/elsa';

const aylienHeaders = {
    'X-AYLIEN-TextAPI-Application-Key' : apiKeys.aylienKey,
    'X-AYLIEN-TextAPI-Application-ID' : apiKeys.aylienAppID
};

const buildAylienURL = (url) => {
    return `${baseURL}?language=en&url=${encodeURI(url)}`;
}

module.exports = {
    aylienURL: buildAylienURL,
    aylienHeaders: aylienHeaders
};