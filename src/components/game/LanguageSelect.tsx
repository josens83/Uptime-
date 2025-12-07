import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useI18n, Language, languageInfo } from '../../i18n';
import { cn } from '../../utils/helpers';

interface LanguageSelectProps {
  compact?: boolean;
}

export function LanguageSelect({ compact = false }: LanguageSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage } = useI18n();

  const currentLang = languageInfo[language];
  const languages = Object.entries(languageInfo) as [Language, typeof currentLang][];

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors"
        >
          <span className="text-lg">{currentLang.flag}</span>
          <ChevronDown className={cn(
            'w-3 h-3 text-dark-400 transition-transform',
            isOpen && 'rotate-180'
          )} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-1 z-50 bg-dark-800 border border-dark-700 rounded-lg shadow-xl overflow-hidden"
              >
                {languages.map(([lang, info]) => (
                  <button
                    key={lang}
                    onClick={() => handleSelect(lang)}
                    className={cn(
                      'flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-dark-700 transition-colors',
                      language === lang && 'bg-dark-700'
                    )}
                  >
                    <span className="text-lg">{info.flag}</span>
                    <span className="text-sm text-dark-200">{info.name}</span>
                    {language === lang && (
                      <Check className="w-4 h-4 text-primary-400 ml-auto" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm text-dark-400">
        <Globe className="w-4 h-4" />
        언어 / Language
      </label>
      <div className="grid grid-cols-3 gap-2">
        {languages.map(([lang, info]) => (
          <button
            key={lang}
            onClick={() => handleSelect(lang)}
            className={cn(
              'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all',
              language === lang
                ? 'bg-primary-500/20 border-primary-500 text-primary-400'
                : 'bg-dark-800 border-dark-700 text-dark-300 hover:border-dark-600'
            )}
          >
            <span className="text-2xl">{info.flag}</span>
            <span className="text-xs">{info.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
