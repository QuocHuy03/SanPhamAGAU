import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import './LanguageSwitcher.css';

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
        <div className="lang-switcher" ref={ref}>
            <button
                className="lang-btn"
                onClick={() => setIsOpen(prev => !prev)}
                title="Đổi ngôn ngữ"
            >
                <span className="lang-flag">{langConfig.flag}</span>
                <span className="lang-code">{language.toUpperCase()}</span>
                <span className="lang-arrow">{isOpen ? '▲' : '▼'}</span>
            </button>

            {isOpen && (
                <div className="lang-dropdown">
                    {Object.values(languages).map(lang => (
                        <button
                            key={lang.code}
                            className={`lang-option ${language === lang.code ? 'active' : ''}`}
                            onClick={() => handleSelect(lang.code)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-name">{lang.name}</span>
                            <span className="lang-currency">{lang.currencySymbol} {lang.currency}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
