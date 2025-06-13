export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhone = (phone) => {
    // Tanzania phone number format
    const phoneRegex = /^(\+255|0)[67]\d{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidNIDA = (nida) => {
    // Tanzania NIDA format: YYYYMMDD-XXXXX-XXXXX-XX
    const nidaRegex = /^\d{8}-\d{5}-\d{5}-\d{2}$/;
    return nidaRegex.test(nida);
};

export const isStrongPassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

export const validateRequired = (value, fieldName = 'Field') => {
    if (!value || (typeof value === 'string' && !value.trim())) {
        return `${fieldName} is required`;
    }
    return null;
};

export const validateMinLength = (value, minLength, fieldName = 'Field') => {
    if (value && value.length < minLength) {
        return `${fieldName} must be at least ${minLength} characters`;
    }
    return null;
};

export const validateMaxLength = (value, maxLength, fieldName = 'Field') => {
    if (value && value.length > maxLength) {
        return `${fieldName} must be no more than ${maxLength} characters`;
    }
    return null;
  };