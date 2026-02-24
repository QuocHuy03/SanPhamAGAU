import React, { createContext, useContext, useState, useEffect } from 'react';

const LANGUAGES = {
    vi: {
        code: 'vi',
        name: 'Tiếng Việt',
        flag: '🇻🇳',
        currency: 'VND',
        currencySymbol: '₫',
        locale: 'vi-VN'
    },
    en: {
        code: 'en',
        name: 'English',
        flag: '🇺🇸',
        currency: 'USD',
        currencySymbol: '$',
        locale: 'en-US'
    },
    zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        currency: 'CNY',
        currencySymbol: '¥',
        locale: 'zh-CN'
    }
};

// Exchange rates (base: VND)
const EXCHANGE_RATES = {
    VND: 1,
    USD: 1 / 25000,    // 1 USD = 25,000 VND
    CNY: 1 / 3500      // 1 CNY = 3,500 VND
};

// Basic translations
const TRANSLATIONS = {
    vi: {
        home: 'Trang chủ',
        shop: 'Cửa hàng',
        cart: 'Giỏ hàng',
        orders: 'Đơn hàng',
        profile: 'Tài khoản',
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        search: 'Tìm kiếm...',
        addToCart: 'Thêm vào giỏ',
        buyNow: 'Mua ngay',
        inStock: 'Còn hàng',
        outOfStock: 'Hết hàng',
        total: 'Tổng cộng',
        shippingFee: 'Phí vận chuyển',
        freeShipping: 'Miễn phí',
        checkout: 'Thanh toán',
    },
    en: {
        home: 'Home',
        shop: 'Shop',
        cart: 'Cart',
        orders: 'Orders',
        profile: 'Account',
        login: 'Login',
        logout: 'Logout',
        search: 'Search...',
        addToCart: 'Add to Cart',
        buyNow: 'Buy Now',
        inStock: 'In Stock',
        outOfStock: 'Out of Stock',
        total: 'Total',
        shippingFee: 'Shipping',
        freeShipping: 'Free',
        checkout: 'Checkout',
    },
    zh: {
        home: '首页',
        shop: '商店',
        cart: '购物车',
        orders: '订单',
        profile: '账户',
        login: '登录',
        logout: '退出',
        search: '搜索...',
        addToCart: '加入购物车',
        buyNow: '立即购买',
        inStock: '有货',
        outOfStock: '缺货',
        total: '合计',
        shippingFee: '运费',
        freeShipping: '免费',
        checkout: '结账',
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const stored = localStorage.getItem('language') || 'vi';
    const [language, setLanguage] = useState(stored);
    const langConfig = LANGUAGES[language] || LANGUAGES.vi;

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const changeLanguage = (lang) => {
        if (LANGUAGES[lang]) setLanguage(lang);
    };

    const formatPrice = (amountVND) => {
        if (amountVND == null || isNaN(amountVND)) return '—';
        const { currency, currencySymbol, locale } = langConfig;
        const converted = amountVND * EXCHANGE_RATES[currency];

        if (currency === 'VND') {
            return `${converted.toLocaleString('vi-VN')}₫`;
        } else if (currency === 'USD') {
            return `$${converted.toFixed(2)}`;
        } else if (currency === 'CNY') {
            return `¥${converted.toFixed(2)}`;
        }
        return `${currencySymbol}${converted.toLocaleString(locale)}`;
    };

    const t = (key) => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS.vi[key] || key;
    };

    return (
        <LanguageContext.Provider value={{
            language,
            langConfig,
            changeLanguage,
            formatPrice,
            t,
            languages: LANGUAGES
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
};

export default LanguageContext;
