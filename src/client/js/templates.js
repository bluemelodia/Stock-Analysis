import { 
    cssClassForNum, 
    formatCurrency, 
    formatNumber, 
    formatPercent 
} from './number-utils';

export const searchPrompt = `
    <div class='search-prompt-container'>
        <i class='far fa-chart-bar' style='font-size:24px'></i>
        <div class='search-prompt'>Search for symbols.</div>
    </div>`;
    
export const noResults = `
    <div class='no-results-container'>
        <i class='fa fa-info-circle' style='font-size:24px'></i>
        <div class='no-results'>No results found.</div>
    </div>
`;

export const quoteIcon = `<i class='fa fa-refresh' style='font-size:24px'></i>`;
const watchIcon = `<i class="fa fa-eye" style="font-size:24px"></i>`;
const unwatchIcon = `<i class="fa fa-eye-slash" style="font-size:24px"></i>`;
const analysisIcon = `<i class="fa fa-line-chart" style="font-size:24px"></i>`;
const deleteIcon = `<i class="fa fa-trash" style="font-size:24px"></i>`;

const smileIcon = `<i class="fa fa-smile-o" style="font-size:24px"></i>`;
const mehIcon = `<i class="fa fa-meh-o" style="font-size:24px"></i>`;
const frownIcon = `<i class="fa fa-frown-o" style="font-size:24px"></i>`;

export function elementWithClasses(element = 'div', classes = []) {
    let div = document.createElement(element);
    classes.forEach(classToAdd => {
        div.classList.add(classToAdd);
    });
    return div;
}

export function createQuoteHeader(quote, isWatching, handlers) {
    let headerContainer = elementWithClasses('div', ['quote-overview']);
    const quoteName = createQuoteName(quote);
    headerContainer.innerHTML = quoteName;

    let quoteActions = elementWithClasses('div', ['quote-actions']);
    
    let analysisButton = elementWithClasses('button', ['quote-insights']);
    analysisButton.addEventListener('click', handlers.insight);
    analysisButton.innerHTML = analysisIcon;

    let watchButton = elementWithClasses('button', ['watch-quote']);
    watchButton.innerHTML = watchIcon;
    watchButton.addEventListener('click', handlers.watch);

    let unwatchButton = elementWithClasses('button', ['unwatch-quote']);
    unwatchButton.innerHTML = unwatchIcon;
    unwatchButton.addEventListener('click', handlers.unwatch);

    let deleteButton = elementWithClasses('button', ['delete-quote']);
    deleteButton.innerHTML = deleteIcon;
    deleteButton.addEventListener('click', handlers.delete);

    /* Users must unwatch before deleting. */
    if (isWatching) {
        watchButton.classList.add('hidden');
        deleteButton.classList.add('hidden');
    } else {
        unwatchButton.classList.add('hidden');
    }
    
    quoteActions.appendChild(analysisButton);
    quoteActions.appendChild(watchButton);
    quoteActions.appendChild(unwatchButton);
    quoteActions.append(deleteButton);
    headerContainer.appendChild(quoteActions);

    return headerContainer;
}

function createQuoteName(quote) {
    return `
        <div class='quote-name'>
            <div class='symbol'>${quote.symbol}</div>
            <div class='name'>${quote.name}</div>
        </div>
    `;
}

export function createQuoteBody(quote) { 
    let bodyContainer = elementWithClasses('div', ['quote-info']);
    bodyContainer.innerHTML = createQuote(quote);
    return bodyContainer;
}

function createQuote(quote) {
    return `            
        <div class='quote-row'>
            <div class='field'>Price</div>
            <div class='value'>${formatCurrency(quote.price, quote.currency)}</div>
        </div>
        <div class='quote-row'>
            <div class='field'>Change</div>
            <div class='value'>
                <span class='${cssClassForNum(quote.change)}'>
                    ${formatCurrency(quote.change, quote.currency)} 
                </span>
                <span class='${cssClassForNum(quote.percentChange)}'>
                    (${formatPercent(quote.percentChange)})
                </span>
            </div>
        </div>
        <div class='quote-row'>
            <div class='field'>Open</div>
            <div field='value'>${formatCurrency(quote.open)}</div>
        </div>
        <div class='quote-row'>
            <div class='field'>Previous Close</div>
            <div class='value'>${formatCurrency(quote.previousClose)}</div>
        </div>
        <div class='quote-row'>
            <div class='field'>Range</div>
            <div class='value'>${formatCurrency(quote.low)} to ${formatCurrency(quote.high)}</div>
        </div>
        <div class='quote-row'>
            <div class='field'>Volume</div>
            <div class='value'>${formatNumber(quote.volume)}</div>
        </div>
    `;
}

export function createArticle(article, isBreakingNews = false) {
    let articleContainer = elementWithClasses('div', ['article']);
    if (isBreakingNews) {
        articleContainer.classList.add('breaking-news');
    }
    articleContainer.innerHTML = createArticleBody(article);

    return articleContainer;
}

function createArticleBody(article) {
    return `
        <div class="article-body">
            <div class="article-overview">
                <a href="${article.url}" target="_blank" class="title">${article.title}</a>
                <div class="article-source">
                    <div class="source">${article.source || ''}</div>
                    <div class="author">${article.author || ''}</div>
                </div>
            </div>
            <div class="article-details">
                <div class="article-description">
                    ${article.description || 'No description available.' }
                </div>
            </div>
        </div>
        ${article.image ? 
            `<div class="article-img">
                <img src="${article.image}"/>
            </div>` : ``}
    `;
}

export function createSentimentHeader(article) {
    let articleContainer = elementWithClasses('div', ['sentiment-header']);
    articleContainer.innerHTML = `
        <a href="${article.url}" target="_blank" class="title">${article.title}</a>
    `;
    return articleContainer;
}

export function createSentimentBody(sentiment) {
    let sentimentContainer = elementWithClasses('div', ['sentiment']);
    sentimentContainer.innerHTML = createSentimentCell(sentiment);

    return sentimentContainer;
}

function polarityCell(polarity) {
    let polarityIcon = smileIcon;
    let polarityClass = 'positive';
    if (polarity === 'neutral') {
        polarityIcon = mehIcon;
        polarityClass = 'neutral';
    } else if (polarity === 'negative') {
        polarityIcon = frownIcon;
        polarityClass = 'negative';
    }

    return `
        <div class='polarity ${polarityClass}'>
            ${polarityIcon}
        </div>
    `;
}

function createSentimentCell(sentiment) {
    const sen = sentiment.sentiment;
    const polarity = sen.polarity;
    const confidence = sen.confidence;
    const links = sentiment.links;

    const mentions = sentiment.mentions[0].text;
    let sentimentHeader = mentions;
    if (links && links.length > 0) {
        sentimentHeader = `
            <a href="${links[0].uri}" target="_blank" class="title">${mentions}</a>
        `;
    }

    return `
        <div class="sentiment-entity">${sentimentHeader}</div>
        <div class="sentiment-type">${sentiment.type}</div>
        <div class="sentiment-polarity">
            ${ polarityCell(polarity) }
            <div class="sentiment-confidence">${confidence}</div>
        </div>
    `;
}