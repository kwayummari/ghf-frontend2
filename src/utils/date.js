import { format, parseISO, isValid, differenceInDays, addDays, startOfWeek, endOfWeek } from 'date-fns';

export const formatDate = (date, formatString = 'dd/MM/yyyy') => {
    if (!date) return '';

    try {
        const parsedDate = typeof date === 'string' ? parseISO(date) : date;
        return isValid(parsedDate) ? format(parsedDate, formatString) : '';
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

export const formatDateTime = (date, formatString = 'dd/MM/yyyy HH:mm') => {
    return formatDate(date, formatString);
};

export const formatTime = (time, formatString = 'HH:mm') => {
    if (!time) return '';

    try {
        // Handle time strings like "14:30:00"
        if (typeof time === 'string' && time.includes(':')) {
            const [hours, minutes] = time.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            return format(date, formatString);
        }

        return formatDate(time, formatString);
    } catch (error) {
        console.error('Error formatting time:', error);
        return '';
    }
};

export const calculateDateDifference = (startDate, endDate) => {
    try {
        const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
        const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;

        if (!isValid(start) || !isValid(end)) return 0;

        return differenceInDays(end, start) + 1; // Include both start and end dates
    } catch (error) {
        console.error('Error calculating date difference:', error);
        return 0;
    }
};

export const getWeekRange = (date = new Date()) => {
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday

    return { start, end };
};

export const isDateInPast = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkDate = typeof date === 'string' ? parseISO(date) : date;
    return checkDate < today;
};

export const addBusinessDays = (date, days) => {
    let result = new Date(date);
    let addedDays = 0;

    while (addedDays < days) {
        result = addDays(result, 1);

        // Skip weekends (Saturday = 6, Sunday = 0)
        if (result.getDay() !== 0 && result.getDay() !== 6) {
            addedDays++;
        }
    }

    return result;
};