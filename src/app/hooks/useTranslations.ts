import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export const useTranslations = () => {
  const { language, toggleLanguage } = useLanguage();
  
  const t = (path: string) => {
    const keys = path.split('.');
    let value: any = translations[language];
    
    for (const key of keys) {
      if (value === undefined) return path;
      value = value[key];
    }
    
    return value || path;
  };

  return { t, language, toggleLanguage };
}; 