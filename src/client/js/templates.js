import { 
    cssClassForNum, 
    formatCurrency, 
    formatNumber, 
    formatPercent 
} from './number-utils';

export const searchPrompt = `
    <div class="search-prompt-container">
        <i class='far fa-chart-bar' style='font-size:24px'></i>
        <div class="search-prompt">Search for symbols.</div>
    </div>`;
    
export const noResults = `
    <div class="no-results-container">
        <i class="fa fa-info-circle" style="font-size:24px"></i>
        <div class="no-results">No results found.</div>
    </div>
`;

export const quoteIcon = `<i class="fa fa-refresh" style="font-size:24px"></i>`;
export const plusIcon = `<i class="fa fa-plus" style="font-size:24px"></i>`;
export const minusIcon = `<i class="fa fa-minus" style="font-size:24px"></i>`;

export function createQuoteHeader(quote, isInPortfolio) {
    return `
        <div class="quote-overview">
            <div class="quote-name">
                <div class="symbol">${quote.symbol}</div>
                <div class="name">${quote.name}</div>
            </div>
            <div class="quote-actions">
                <button class="${ isInPortfolio ? 'remove-card' : 'add-card' }">
                    ${ isInPortfolio ? minusIcon : plusIcon }
                </button>
            </div>
        </div>`;
}

export function createQuoteBody(quote) { 
    return `            
            <div class="quote-info">
                <div class="quote-row">
                    <div class="field">Price</div>
                    <div class="value">${formatCurrency(quote.price, quote.currency)}</div>
                </div>
                <div class="quote-row">
                    <div class="field">Change</div>
                    <div class="value">
                        <span class="${cssClassForNum(quote.change)}">
                            ${formatCurrency(quote.change, quote.currency)} 
                        </span>
                        <span class="${cssClassForNum(quote.percentChange)}">
                            (${formatPercent(quote.percentChange)})
                        </span>
                    </div>
                </div>
                <div class="quote-row">
                    <div class="field">Open</div>
                    <div field="value">${formatCurrency(quote.open)}</div>
                </div>
                <div class="quote-row">
                    <div class="field">Previous Close</div>
                    <div class="value">${formatCurrency(quote.previousClose)}</div>
                </div>
                <div class="quote-row">
                    <div class="field">Range</div>
                    <div class="value">${formatCurrency(quote.low)} to ${formatCurrency(quote.high)}</div>
                </div>
                <div class="quote-row">
                    <div class="field">Volume</div>
                    <div class="value">${formatNumber(quote.volume)}</div>
                </div>
            </div>
    `;
}

