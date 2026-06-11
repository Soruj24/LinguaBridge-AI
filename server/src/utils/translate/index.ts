export { POPULAR_LANGUAGES } from './popularLanguages';
export {
    SUPPORTED_LANGUAGES,
    isLanguageSupported,
    getLanguageName,
    getAllLanguageCodes,
    searchLanguages,
    getLanguageCode,
    getPopularLanguages,
    getAllLanguages,
    needsTranslation
} from './helpers';
export { detectLanguage } from './detection';
export { translateText, translateTextRobust } from './translation';
export { translateMultiple } from './batch';

import { SUPPORTED_LANGUAGES } from './helpers';
import { POPULAR_LANGUAGES } from './popularLanguages';
import { detectLanguage } from './detection';
import { translateText, translateTextRobust } from './translation';
import { translateMultiple } from './batch';
import {
    getLanguageName,
    getAllLanguageCodes,
    searchLanguages,
    isLanguageSupported,
    getLanguageCode,
    getPopularLanguages,
    getAllLanguages,
    needsTranslation
} from './helpers';

export default {
    SUPPORTED_LANGUAGES,
    POPULAR_LANGUAGES,
    detectLanguage,
    translateText,
    translateTextRobust,
    translateMultiple,
    getLanguageName,
    getAllLanguageCodes,
    searchLanguages,
    isLanguageSupported,
    getLanguageCode,
    getPopularLanguages,
    getAllLanguages,
    needsTranslation
};
