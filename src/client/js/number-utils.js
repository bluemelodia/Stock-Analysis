const percentOptions = { style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2};
const percentFormatter = new Intl.NumberFormat('en-US', percentOptions);

export function formatNumber(num) {
    return parseInt(num).toLocaleString();
}

export function formatCurrency(num, currency = 'USD') {
    return new Intl.NumberFormat({ style: 'currency', currency: currency }).format(num);
}

export function formatPercent(num) {
    return percentFormatter.format(num.replace('%', ''));
}

export function cssClassForNum(num) {
    const sign = Math.sign(parseFloat(num.replace('%', '')));
    return sign > 0 ? 'positive' : sign < 0 ? 'negative' : '';
}

export function currentDayAndTime() {
    var day = new Date();
    return day.toLocaleString();
}