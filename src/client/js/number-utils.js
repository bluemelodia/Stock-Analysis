const currencyOptions = { style: 'currency', currency: 'USD' };
const currencyFormatter = new Intl.NumberFormat('en-US', currencyOptions);

const percentOptions = { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2};
const percentFormatter = new Intl.NumberFormat('en-US', percentOptions);

export function formatNumber(num) {
    return parseInt(num).toLocaleString();
}

export function formatCurrency(num) {
    return `${currencyFormatter.format(num)}`;
}

export function formatPercent(num) {
    return percentFormatter.format(num.replace('%', ''));
}

export function cssClassForNum(num) {
    const sign = Math.sign(parseFloat(num.replace('%', '')));
    console.log("SIGN: ", num, sign);
    return sign > 0 ? 'positive' : sign < 0 ? 'negative' : '';
}
