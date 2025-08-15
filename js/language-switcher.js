/**
 * Language Switcher Functions
 */

// Global variables
let languageDropdownOpen = false;

/**
 * Toggle language dropdown
 */
function toggleLanguageDropdown() {
    const dropdown = document.getElementById('languageDropdown');
    const switcher = document.getElementById('languageSwitcher');
    
    if (languageDropdownOpen) {
        // Close dropdown
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-10px)';
        switcher.classList.remove('open');
        languageDropdownOpen = false;
    } else {
        // Open dropdown
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
        switcher.classList.add('open');
        languageDropdownOpen = true;
    }
}

/**
 * Change language
 */
function changeLanguage(locale) {
    if (i18n.setLocale(locale)) {
        // Update UI
        updateLanguageUI();
        
        // Close dropdown
        toggleLanguageDropdown();
        
        // Show success message
        console.log(i18n.t('notifications.success') + ': ' + i18n.t('common.language') + ' ' + i18n.t('common.updated'));
        
        // Add animation to main content
        const mainContent = document.querySelector('.main-content') || document.body;
        mainContent.classList.add('language-change-animation');
        
        // Check if we're on app page or main page
        const isAppPage = window.location.pathname.includes('app.html');
        
        if (isAppPage) {
            // On app page, just update translations without refresh
            setTimeout(() => {
                if (mainContent) {
                    mainContent.classList.remove('language-change-animation');
                }
                
                // Show success message
                showLanguageChangeSuccess();
                
                // Update all translations
                updatePageTranslations();
            }, 300);
        } else {
            // On main page, refresh after language change
            setTimeout(() => {
                // Show refresh message
                if (mainContent) {
                    mainContent.classList.remove('language-change-animation');
                }
                
                // Display refresh notification
                showRefreshNotification();
                
                // Show countdown
                showRefreshCountdown();
                
                // Refresh page after 2 seconds
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }, 300);
        }
    }
}

/**
 * Show language change success message (for app page)
 */
function showLanguageChangeSuccess() {
    // Create success notification element
    const notification = document.createElement('div');
    notification.className = 'language-change-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-text">${i18n.t('notifications.success')}: ${i18n.t('common.language')} ${i18n.t('common.updated')}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(40, 167, 69, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInDown 0.3s ease;
        max-width: 90vw;
        text-align: center;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

/**
 * Show refresh notification
 */
function showRefreshNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'language-refresh-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">🔄</span>
            <span class="notification-text">${i18n.t('notifications.success')}: ${i18n.t('common.language')} ${i18n.t('common.updated')}. ${i18n.t('common.refreshing')}...</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(102, 126, 234, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 14px;
        font-weight: 500;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: slideInDown 0.3s ease;
        max-width: 90vw;
        text-align: center;
    `;
    
    // Add keyframes for animation
    if (!document.querySelector('#language-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'language-notification-styles';
        style.textContent = `
            @keyframes slideInDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .language-refresh-notification {
                animation: slideInDown 0.3s ease;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 8px;
                justify-content: center;
            }
            
            .notification-icon {
                font-size: 16px;
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove notification after page refresh
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 2000);
}

/**
 * Show refresh countdown
 */
function showRefreshCountdown() {
    // Create countdown element
    const countdown = document.createElement('div');
    countdown.className = 'language-refresh-countdown';
    countdown.innerHTML = `
        <div class="countdown-content">
            <span class="countdown-text">${i18n.t('common.refreshIn')} <span class="countdown-number">2</span> ${i18n.t('common.seconds')}</span>
        </div>
    `;
    
    // Add styles
    countdown.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-size: 12px;
        font-weight: 400;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: slideInUp 0.3s ease;
    `;
    
    // Add keyframes for animation
    if (!document.querySelector('#language-countdown-styles')) {
        const style = document.createElement('style');
        style.id = 'language-countdown-styles';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            
            .language-refresh-countdown {
                animation: slideInUp 0.3s ease;
            }
            
            .countdown-number {
                font-weight: bold;
                color: #667eea;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(countdown);
    
    // Update countdown
    let secondsLeft = 2;
    const countdownNumber = countdown.querySelector('.countdown-number');
    
    const countdownInterval = setInterval(() => {
        secondsLeft--;
        if (countdownNumber) {
            countdownNumber.textContent = secondsLeft;
        }
        
        if (secondsLeft <= 0) {
            clearInterval(countdownInterval);
            if (countdown.parentNode) {
                countdown.parentNode.removeChild(countdown);
            }
        }
    }, 1000);
    
    // Remove countdown after page refresh
    setTimeout(() => {
        if (countdown.parentNode) {
            countdown.parentNode.removeChild(countdown);
        }
    }, 3000);
}

/**
 * Update language UI elements
 */
function updateLanguageUI() {
    const currentLocale = i18n.getCurrentLocale();
    
    // Update current language display
    const flagElement = document.getElementById('currentLanguageFlag');
    const nameElement = document.getElementById('currentLanguageName');
    
    if (flagElement) {
        flagElement.textContent = i18n.getLocaleFlag(currentLocale);
    }
    
    if (nameElement) {
        nameElement.textContent = i18n.getLocaleDisplayName(currentLocale);
    }
    
    // Update active state in dropdown
    const options = document.querySelectorAll('.language-option');
    options.forEach(option => {
        option.classList.remove('active');
        if (option.onclick.toString().includes(currentLocale)) {
            option.classList.add('active');
        }
    });
    
    // Update all translatable elements
    updatePageTranslations();
}

/**
 * Update all translatable elements on the page
 */
function updatePageTranslations() {
    // Update elements with data-i18n attribute
    const translatableElements = document.querySelectorAll('[data-i18n]');
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
        element.textContent = i18n.t(key, params);
    });
    
    // Update elements with data-i18n-placeholder attribute
    const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
        element.placeholder = i18n.t(key, params);
    });
    
    // Update elements with data-i18n-title attribute
    const titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
        element.title = i18n.t(key, params);
    });
    
    // Update elements with data-i18n-aria-label attribute
    const ariaLabelElements = document.querySelectorAll('[data-i18n-aria-label]');
    ariaLabelElements.forEach(element => {
        const key = element.getAttribute('data-i18n-aria-label');
        const params = JSON.parse(element.getAttribute('data-i18n-params') || '{}');
        element.setAttribute('aria-label', i18n.t(key, params));
    });
}

/**
 * Close language dropdown when clicking outside
 */
document.addEventListener('click', function(event) {
    const switcher = document.getElementById('languageSwitcher');
    if (switcher && !switcher.contains(event.target)) {
        if (languageDropdownOpen) {
            toggleLanguageDropdown();
        }
    }
});

/**
 * Initialize language switcher
 */
function initLanguageSwitcher() {
    // Wait for i18n system to be ready
    if (i18n.initialized) {
        updateLanguageUI();
    } else {
        // Wait for initialization
        i18n.onLocaleChange(() => {
            updateLanguageUI();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize language switcher after a short delay
    setTimeout(initLanguageSwitcher, 100);
});
