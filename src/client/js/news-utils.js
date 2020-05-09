
/* Including these in the query will decrease the relevancy of returned articles. */
const patterns = [ 
    'co',
    'com', 
    'company', 
    'corp',
    'corporation',
    'global',
    'group',
    'holding',
    'inc', 
    'incorporated', 
    'limited',
    'ltd',
    'lp',
    'plc',
    'technologies',
    'the'
];

export function parseArticle(rawArticle) {
    let article = {
        title : rawArticle.title,
        author: rawArticle.author,
        source: rawArticle.source.name,
        description : rawArticle.description,
        content : rawArticle.content,
        url: rawArticle.url,
        image : rawArticle.urlToImage
    };
    return article;
}

export function advancedQuery(query, separator = ' ') {
    const queryFragments = query.split(/[ ,.]+/);
    const queryArr = [];
    queryFragments.forEach(queryFragment => {
        const qf = queryFragment.toLowerCase();
        if (!containsPatterns(qf, patterns) && qf.length > 1) {
            queryArr.push(qf);
        }
    });
    return queryArr.join(separator);
}

function containsPatterns(query, patterns) {
    for (let pattern of patterns) {
        if (query === pattern) {
            return true;
        }
    }
    return false;
}