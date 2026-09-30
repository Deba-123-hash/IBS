import en from './en.json';
import hi from './hi.json';
import orLocale from './or.json';

const translations = {
  en,
  hi,
  or: orLocale
};

let currentLanguage = localStorage.getItem('campus_language') || 'en';

export const setLanguage = (lang) => {
  if (translations[lang]) {
    currentLanguage = lang;
    localStorage.setItem('campus_language', lang);
    window.dispatchEvent(new Event('languageChange'));
  }
};

export const getLanguage = () => currentLanguage;

export const t = (keyPath, fallback = '') => {
  const keys = keyPath.split('.');
  let current = translations[currentLanguage] || translations.en;

  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return fallback || keyPath;
    }
  }

  return current;
};

export default { t, setLanguage, getLanguage };
