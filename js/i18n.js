/**
 * Clario Internationalization (i18n) System
 * Manages multiple languages and translations
 */

class I18nManager {
    constructor() {
        this.currentLocale = 'en'; // Default language
        this.fallbackLocale = 'tr'; // Fallback language
        this.translations = {};
        this.initialized = false;
        this.localeChangeCallbacks = [];
        
        // Supported locales
        this.supportedLocales = ['tr', 'en', 'de', 'es', 'fr'];
        
        // Initialize the system
        this.init();
    }
    
    /**
     * Initialize the i18n system
     */
    async init() {
        try {
            // Load translations
            await this.loadTranslations();
            
            // Set initial locale from database, localStorage, or browser
            await this.setLocaleFromStorage();
            
            // Mark as initialized
            this.initialized = true;
            
            // Trigger locale change event
            this.triggerLocaleChange();
            
            // Auto-update all translatable elements on the page after initialization
            setTimeout(() => {
                this.autoUpdatePageTranslations();
            }, 100);
            
            console.log('🌐 I18n system initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize i18n system:', error);
        }
    }
    
    /**
     * Load all translation files
     */
    async loadTranslations() {
        try {
            for (const locale of this.supportedLocales) {
                // Use the working path: ../locales/ (since app.html is in pages/ directory)
                const response = await fetch(`../locales/${locale}.json`);
                
                if (response.ok) {
                    const jsonData = await response.json();
                    // Extract the nested locale object (e.g., { "tr": {...} } -> {...})
                    this.translations[locale] = jsonData[locale];
                    console.log(`✅ Loaded translations for ${locale}:`, this.translations[locale]);
                } else {
                    console.warn(`⚠️ Failed to load translations for ${locale}`);
                }
            }
        } catch (error) {
            console.error('❌ Error loading translations:', error);
        }
    }
    
    /**
     * Set locale from database, localStorage, or browser preference
     */
    async setLocaleFromStorage() {
        try {
            // Check if Firebase is available and initialized
            if (typeof firebase !== 'undefined' && 
                firebase.apps && 
                firebase.apps.length > 0 && 
                firebase.auth && 
                firebase.auth().currentUser) {
                
                const user = firebase.auth().currentUser;
                const userDoc = await firebase.firestore().collection('user_data').doc(user.uid).get();
                
                if (userDoc.exists && userDoc.data().preferences && userDoc.data().preferences.language) {
                    const dbLocale = userDoc.data().preferences.language;
                    if (this.supportedLocales.includes(dbLocale)) {
                        this.currentLocale = dbLocale;
                        console.log(`🌐 Language loaded from database: ${dbLocale}`);
                        
                        // Update localStorage to match database
                        localStorage.setItem('clario_locale', dbLocale);
                        return;
                    }
                }
            }
            
            // Only if database is not available or no language preference found, use fallbacks
            console.log('🌐 No database language preference found, using fallbacks');
            
            // Try to detect from browser
            const browserLocale = navigator.language.split('-')[0];
            if (this.supportedLocales.includes(browserLocale)) {
                this.currentLocale = browserLocale;
                console.log(`🌐 Language detected from browser: ${browserLocale}`);
            } else {
                // Default to Turkish
                this.currentLocale = 'tr';
                console.log(`🌐 Using default language: ${this.currentLocale}`);
            }
            
            // Save to localStorage
            localStorage.setItem('clario_locale', this.currentLocale);
        } catch (error) {
            console.error('❌ Error loading language from database:', error);
            
            // Only on database error, use fallbacks
            console.log('🌐 Database error, using fallbacks');
            
            // Try to detect from browser
            const browserLocale = navigator.language.split('-')[0];
            if (this.supportedLocales.includes(browserLocale)) {
                this.currentLocale = browserLocale;
            } else {
                this.currentLocale = 'tr';
            }
            localStorage.setItem('clario_locale', this.currentLocale);
        }
    }
    
    /**
     * Change the current locale
     */
    async setLocale(locale) {
        if (!this.supportedLocales.includes(locale)) {
            console.warn(`⚠️ Unsupported locale: ${locale}`);
            return false;
        }
        
        if (this.currentLocale === locale) {
            return true; // No change needed
        }
        
        this.currentLocale = locale;
        localStorage.setItem('clario_locale', this.currentLocale);
        
        // Save to database (Firebase)
        try {
            if (typeof firebase !== 'undefined' && 
                firebase.apps && 
                firebase.apps.length > 0 && 
                firebase.auth && 
                firebase.auth().currentUser) {
                
                const user = firebase.auth().currentUser;
                await firebase.firestore().collection('user_data').doc(user.uid).update({
                    'preferences.language': locale,
                    'preferences.languageUpdatedAt': firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (error) {
            console.error('❌ Error saving language to database:', error);
        }
        
        // Trigger locale change event
        this.triggerLocaleChange();
        
        // Auto-update all translatable elements on the page
        this.autoUpdatePageTranslations();
        
        return true;
    }
    
    /**
     * Get current locale
     */
    getCurrentLocale() {
        return this.currentLocale;
    }
    
    /**
     * Get supported locales
     */
    getSupportedLocales() {
        return this.supportedLocales;
    }
    
    /**
     * Get translation for a key
     */
    t(key, params = {}) {
        if (!this.initialized) {
            console.warn('⚠️ I18n system not initialized yet');
            return key;
        }
        
        // Split key by dots (e.g., "common.save" -> ["common", "save"])
        const keys = key.split('.');
        
        // Get translation from current locale
        let translation = this.getNestedValue(this.translations[this.currentLocale], keys);
        
        // If not found, try fallback locale
        if (!translation && this.currentLocale !== this.fallbackLocale) {
            translation = this.getNestedValue(this.translations[this.fallbackLocale], keys);
        }
        
        // If still not found, return the key
        if (!translation) {
            console.warn(`⚠️ Translation not found for key: ${key}`);
            return key;
        }
        
        // Replace parameters in translation
        return this.replaceParams(translation, params);
    }
    
    /**
     * Get nested value from object
     */
    getNestedValue(obj, keys) {
        let current = obj;
        
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            } else {
                return null;
            }
        }
        
        return current;
    }
    
    /**
     * Replace parameters in translation string
     */
    replaceParams(text, params) {
        if (typeof text !== 'string') {
            return text;
        }
        
        return text.replace(/\{(\w+)\}/g, (match, param) => {
            return params[param] !== undefined ? params[param] : match;
        });
    }
    
    /**
     * Register callback for locale changes
     */
    onLocaleChange(callback) {
        this.localeChangeCallbacks.push(callback);
    }
    
    /**
     * Trigger locale change event
     */
    triggerLocaleChange() {
        this.localeChangeCallbacks.forEach(callback => {
            try {
                callback(this.currentLocale);
            } catch (error) {
                console.error('❌ Error in locale change callback:', error);
            }
        });
    }
    
    /**
     * Auto-update all translatable elements on the page
     */
    autoUpdatePageTranslations() {
        // Update elements with data-i18n attribute
        const translatableElements = document.querySelectorAll('[data-i18n]');
        
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            try {
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.textContent = translation;
                }
            } catch (error) {
                console.warn(`Translation failed for key: ${key}`, error);
            }
        });
        
        // Update elements with data-i18n-placeholder attribute
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            try {
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.placeholder = translation;
                }
            } catch (error) {
                console.warn(`Placeholder translation failed for key: ${key}`, error);
            }
        });
        
        // Update elements with data-i18n-title attribute
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            try {
                const translation = this.t(key);
                if (translation && translation !== key) {
                    element.title = translation;
                }
            } catch (error) {
                console.warn(`Title translation failed for key: ${key}`, error);
            }
        });
    }
    
    /**
     * Get locale display name
     */
    getLocaleDisplayName(locale) {
        const names = {
            'tr': 'Türkçe',
            'en': 'English',
            'de': 'Deutsch',
            'es': 'Español',
            'fr': 'Français'
        };
        return names[locale] || locale;
    }
    
    /**
     * Get locale flag emoji
     */
    getLocaleFlag(locale) {
        const flags = {
            'tr': '🇹🇷',
            'en': '🇺🇸',
            'de': '🇩🇪',
            'es': '🇪🇸',
            'fr': '🇫🇷'
        };
        return flags[locale] || '🌐';
    }
    
    /**
     * Check if a key exists
     */
    hasKey(key) {
        const keys = key.split('.');
        const translation = this.getNestedValue(this.translations[this.currentLocale], keys);
        return translation !== null && translation !== undefined;
    }
    
    /**
     * Get all keys for a section
     */
    getSectionKeys(section) {
        const sectionData = this.translations[this.currentLocale]?.[section];
        if (!sectionData) return [];
        
        const keys = [];
        this.flattenObject(sectionData, keys, section);
        return keys;
    }
    
    /**
     * Flatten nested object to get all keys
     */
    flattenObject(obj, keys = [], prefix = '') {
        for (const key in obj) {
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                this.flattenObject(obj[key], keys, newKey);
            } else {
                keys.push(newKey);
            }
        }
    }
}

// Create global instance
const i18n = new I18nManager();

// Global translation function
function t(key, params = {}) {
    return i18n.t(key, params);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nManager, i18n, t };
}
