export const formatCurrency = (amount, currency = 'TZS', locale = 'en-TZ') => {
    if (amount === null || amount === undefined) return '';

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    } catch (error) {
        console.error('Error formatting currency:', error);
        return `${currency} ${amount.toLocaleString()}`;
    }
};

export const formatNumber = (number, decimals = 0) => {
    if (number === null || number === undefined) return '';

    try {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(number);
    } catch (error) {
        console.error('Error formatting number:', error);
        return number.toString();
    }
};

export const formatPercentage = (value, decimals = 1) => {
    if (value === null || value === undefined) return '';

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        }).format(value / 100);
    } catch (error) {
        console.error('Error formatting percentage:', error);
        return `${value}%`;
    }
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;

    return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const formatName = (firstName, middleName, lastName) => {
    const parts = [firstName, middleName, lastName].filter(Boolean);
    return parts.join(' ');
  };