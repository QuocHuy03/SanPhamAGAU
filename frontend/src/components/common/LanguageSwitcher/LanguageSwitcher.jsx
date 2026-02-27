import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
// import './LanguageSwitcher.css';

const LanguageSwitcher = () => {
    const { language, langConfig, changeLanguage, languages } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (lang) => {
        changeLanguage(lang);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={ref}>
            <button
                className="flex items-center space-x-1 sm:space-x-2 px-3 py-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                onClick={() => setIsOpen(prev => !prev)}
                title="Đổi ngôn ngữ"
            >
                <span className="text-base sm:text-xl leading-none">{langConfig.flag}</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-700">{language.toUpperCase()}</span>
                <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50 transform origin-top-right transition-all duration-200">
                    <div className="py-2 overflow-hidden rounded-xl">
                        {Object.values(languages).map(lang => (
                            <button
                                key={lang.code}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${language === lang.code ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => handleSelect(lang.code)}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="text-xl leading-none">{lang.flag}</span>
                                    <span>{lang.name}</span>
                                </div>
                                <span className="text-xs text-gray-400 font-medium">{lang.currency}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
