const validationPatterns = {
    username: /^[a-zA-Z0-9_-]{3,30}$/,
    name: /^[a-zA-ZÀ-ÿ\s'-]{1,50}$/,
    phone: /^(\+?[1-9]\d{1,14}|[0-9]{10,11})$/,
    zipCode: /^[0-9A-Za-z\s-]{3,10}$/,
    hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    url: /^https?:\/\/[^\s/$.?#].[^\s]*$/,
    objectId: /^[0-9a-fA-F]{24}$/,
    timezone: /^[A-Za-z]+\/[A-Za-z_]+$/,
    language: /^[a-z]{2}(-[A-Z]{2})?$/,
    currency: /^[A-Z]{3}$/,
    date: /^\d{4}-\d{2}-\d{2}$/,
    datetime: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/,
    ipAddress: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/,
    macAddress: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
};

export { validationPatterns };
