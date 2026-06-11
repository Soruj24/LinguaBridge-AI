export const getPasswordStrength = (password: string): {
    score: number;
    strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    feedback: string[];
} => {
    const checks = {
        length: password.length >= 12,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        number: /\d/.test(password),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
        noRepeating: !/(.)\1{2,}/.test(password),
        noSequential: !/(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password),
        noCommon: true,
        noPersonal: true
    };

    const commonPasswords = [
        'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
        'admin', 'letmein', 'welcome', '123456789', 'password1', 'iloveyou'
    ];

    checks.noCommon = !commonPasswords.includes(password.toLowerCase());

    const score = Object.values(checks).filter(Boolean).length;
    const feedback: string[] = [];

    if (!checks.length) feedback.push('Use at least 12 characters');
    if (!checks.lowercase) feedback.push('Add lowercase letters');
    if (!checks.uppercase) feedback.push('Add uppercase letters');
    if (!checks.number) feedback.push('Add numbers');
    if (!checks.special) feedback.push('Add special characters');
    if (!checks.noRepeating) feedback.push('Avoid repeating characters');
    if (!checks.noSequential) feedback.push('Avoid sequential patterns');
    if (!checks.noCommon) feedback.push('Avoid common passwords');

    let strength: 'very-weak' | 'weak' | 'fair' | 'good' | 'strong' | 'very-strong';
    if (score <= 2) strength = 'very-weak';
    else if (score <= 4) strength = 'weak';
    else if (score <= 6) strength = 'fair';
    else if (score <= 8) strength = 'good';
    else if (score <= 10) strength = 'strong';
    else strength = 'very-strong';

    return { score, strength, feedback };
};
