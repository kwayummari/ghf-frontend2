export const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const isImageFile = (file) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
};

export const isPdfFile = (file) => {
    return file.type === 'application/pdf';
};

export const isDocumentFile = (file) => {
    const documentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    return documentTypes.includes(file.type);
};

export const validateFileSize = (file, maxSizeInBytes) => {
    return file.size <= maxSizeInBytes;
};

export const validateFileType = (file, allowedTypes) => {
    return allowedTypes.includes(file.type);
};

export const createFileFromBase64 = (base64Data, filename, mimeType) => {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
  };