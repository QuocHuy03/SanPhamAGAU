import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import viTranslation from './locales/vi.json';
import enTranslation from './locales/en.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            vi: { translation: viTranslation },
        },
        fallbackLng: 'vi',
        debug: process.env.NODE_ENV === 'development',
        interpolation: {
            escapeValue: false, // React already escaping
        },
    });

export default i18n;
