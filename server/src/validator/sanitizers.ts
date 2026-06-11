const sanitizers = {
    trim: (value: string) => value?.trim(),
    toLowerCase: (value: string) => value?.toLowerCase(),
    toUpperCase: (value: string) => value?.toUpperCase(),
    escape: (value: string) => value?.replace(/[<>&"']/g, char => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    }[char] || char)),
    removeExtraSpaces: (value: string) => value?.replace(/\s+/g, ' ').trim(),
    normalizeEmail: (value: string) => {
        if (!value) return value;
        const [local, domain] = value.split('@');
        return `${local}@${domain?.toLowerCase()}`;
    }
};

export { sanitizers };
