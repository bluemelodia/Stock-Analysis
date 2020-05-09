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