﻿﻿﻿﻿﻿// Clario Advanced Planning Application
// Based on Taslak.json data structure

// Global variables
let currentUser = null;
let userData = null;
let db = null;
let auth = null;

// Show status message function
function showStatus(message, type = 'info') {
    // Remove existing status messages
    const existingStatus = document.querySelector('.status-message');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Create new status message
    const statusElement = document.createElement('div');
    statusElement.className = `status-message status-${type}`;
    statusElement.textContent = message;
    
    // Add to body
    document.body.appendChild(statusElement);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (statusElement.parentNode) {
            statusElement.remove();
        }
    }, 5000);
}

// Load dashboard data function
function loadDashboardData() {
    if (userData) {
        updateDashboardCounts();
        renderRecentTasks();
    }
}

// Initialize application
async function initializeApp() {
    try {
        console.log('🚀 Starting app initialization...');
        
        // Show loading screen
        showLoadingScreen('Initializing Firebase...');
        
        await loadFirebase();
        updateLoadingText('Checking authentication...');
        
        await checkAuthState();
        updateLoadingText('Loading user data...');
        
        setupEventListeners();
        updateLoadingText('Setting up interface...');
        
        setupDateInputs(); // Set default dates for inputs
        toggleTaskDateInputs(); // Initialize date input visibility
        
        updateLoadingText('Loading dashboard data...');
        await loadDashboardData();
        
        updateLoadingText('Initializing language system...');
        // Initialize language system
        await initializeAppLanguage();
        
        updateLoadingText('Setting up drag and drop...');
        // Initialize drag and drop functionality after data is loaded
        setTimeout(() => {
            initializeDragAndDrop();
        }, 1000);
        
        // App fully initialized
        console.log('✅ App initialization completed');
        
        // Hide loading screen and show app
        hideLoadingScreen();
        
    } catch (error) {
        console.error('App initialization failed:', error);
        updateLoadingText('Initialization failed: ' + error.message);
        showStatus('Application initialization failed', 'error');
        
        // Hide loading screen even on error after a delay
        setTimeout(() => {
            hideLoadingScreen();
        }, 3000);
    }
}

// Load Firebase
/**
 * Initialize language system for app page
 */
async function initializeAppLanguage() {
    console.log('🌐 initializeAppLanguage called');
    
    // Wait for i18n system to be ready
    if (typeof i18n !== 'undefined' && i18n.initialized) {
        console.log('🌐 i18n system is ready, updating translations');
        
        // Wait a bit for database language to be loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update UI with current language
        updateAppLanguageUI();
        
        // Update all translations
        if (typeof updatePageTranslations === 'function') {
            updatePageTranslations();
        }
        
        // Force update all translatable elements
        forceUpdateAllTranslations();
        
        // Update language selector in settings
        updateLanguageSelector();
    } else {
        console.log('🌐 i18n system not ready, waiting...');
        // Wait for i18n system to be ready
        if (typeof i18n !== 'undefined') {
            console.log('🌐 Registering locale change callback');
            i18n.onLocaleChange(async () => {
                console.log('🌐 Locale change callback triggered');
                
                // Wait a bit for database language to be loaded
                await new Promise(resolve => setTimeout(resolve, 500));
                
                updateAppLanguageUI();
                if (typeof updatePageTranslations === 'function') {
                    updatePageTranslations();
                }
                // Force update all translatable elements
                forceUpdateAllTranslations();
                
                // Update language selector in settings
                updateLanguageSelector();
            });
        } else {
            console.log('🌐 i18n object not found, retrying in 500ms');
            setTimeout(initializeAppLanguage, 500);
        }
    }
}

/**
 * Update language selector in settings
 */
function updateLanguageSelector() {
    if (typeof i18n !== 'undefined') {
        const currentLocale = i18n.getCurrentLocale();
        const languageSelect = document.getElementById('languageSelect');
        
        if (languageSelect) {
            languageSelect.value = currentLocale;
            console.log(`🌐 Updated language selector to: ${currentLocale}`);
        }
    }
}

/**
 * Save all settings including language preference
 */
async function saveAllSettings() {
    console.log('💾 saveAllSettings called - SIMPLE VERSION');
    console.log('💾 Function execution started');
    
    try {
        // Get selected language
        console.log('💾 Looking for languageSelect element...');
        const languageSelect = document.getElementById('languageSelect');
        console.log('💾 languageSelect element:', languageSelect);
        
        if (!languageSelect) {
            console.error('❌ languageSelect element not found!');
            showStatus('Language selector not found!', 'error');
            return;
        }
        
        const selectedLanguage = languageSelect.value;
        console.log(`🌐 Selected language: ${selectedLanguage}`);
        console.log(`🌐 All options:`, Array.from(languageSelect.options).map(opt => ({value: opt.value, text: opt.text})));
        
        // Save to localStorage
        console.log('💾 Saving to localStorage...');
        localStorage.setItem('clario_locale', selectedLanguage);
        console.log('💾 Saved to localStorage:', selectedLanguage);
        
        // Update i18n system
        if (typeof i18n !== 'undefined' && i18n.setLocale) {
            try {
                console.log('🌐 Updating i18n system...');
                await i18n.setLocale(selectedLanguage);
                console.log('🌐 i18n system updated');
                
                // Update language selector to show new value
                updateLanguageSelector();
                
                // Update all translations
                forceUpdateAllTranslations();
                
                        // Save to Firebase database
        console.log('💾 Checking Firebase availability...');
        console.log('💾 typeof firebase:', typeof firebase);
        console.log('💾 firebase.auth():', typeof firebase !== 'undefined' ? firebase.auth() : 'undefined');
        console.log('💾 firebase.auth().currentUser:', typeof firebase !== 'undefined' ? firebase.auth().currentUser : 'undefined');
        
        if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
            try {
                const user = firebase.auth().currentUser;
                console.log('💾 User found:', user.uid);
                console.log('💾 Saving language preference to database...');
                
                const userRef = firebase.firestore().collection('user_data').doc(user.uid);
                console.log('💾 User reference:', userRef);
                
                // Check if user document exists
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                    console.log('💾 User document exists, updating...');
                    await userRef.update({
                        'preferences.language': selectedLanguage,
                        'preferences.languageUpdatedAt': firebase.firestore.FieldValue.serverTimestamp()
                    });
                } else {
                    console.log('💾 User document does not exist, creating...');
                    await userRef.set({
                        preferences: {
                            language: selectedLanguage,
                            languageUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        },
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        email: user.email || '',
                        displayName: user.displayName || ''
                    });
                }
                console.log('💾 Language preference saved to database successfully');
            } catch (dbError) {
                console.error('💾 Error saving to database:', dbError);
                console.error('💾 Error details:', {
                    message: dbError.message,
                    code: dbError.code,
                    stack: dbError.stack
                });
                showStatus('Warning: Language saved locally but not to database', 'warning');
            }
        } else {
            console.log('💾 Firebase not available or user not authenticated, skipping database save');
            console.log('💾 Firebase available:', typeof firebase !== 'undefined');
            console.log('💾 User authenticated:', typeof firebase !== 'undefined' && firebase.auth().currentUser);
        }
                
                showStatus(`Language changed to ${selectedLanguage}!`, 'success');
                console.log('💾 Status message shown');
                
                // Update UI immediately without page reload
                console.log('💾 Updating UI immediately...');
                forceUpdateAllTranslations();
                
            } catch (error) {
                console.error('🌐 Error updating i18n system:', error);
                showStatus('Error updating language system: ' + error.message, 'error');
            }
        } else {
            showStatus(`Language changed to ${selectedLanguage}! Reloading page...`, 'success');
            console.log('💾 Status message shown');
            
            // Wait 2 seconds and reload
            console.log('💾 Setting timeout for page reload...');
            setTimeout(() => {
                console.log('💾 Reloading page now...');
                window.location.reload();
            }, 2000);
        }
        
    } catch (error) {
        console.error('💾 Error saving settings:', error);
        showStatus('Error: ' + error.message, 'error');
    }
}

/**
 * Test language change function
 */
async function testLanguageChange() {
    console.log('🧪 Test language change function called');
    console.log('🧪 Current i18n state:', {
        initialized: i18n?.initialized,
        currentLocale: i18n?.getCurrentLocale(),
        translations: i18n?.translations
    });
    
    try {
        // Test with Turkish
        console.log('🧪 Testing with Turkish locale');
        await changeLanguageFromSettings('tr');
        
        // Wait 2 seconds and test with English
        setTimeout(async () => {
            console.log('🧪 Testing with English locale');
            await changeLanguageFromSettings('en');
        }, 2000);
    } catch (error) {
        console.error('🧪 Test failed:', error);
    }
}

/**
 * Change language from settings
 */
async function changeLanguageFromSettings(locale) {
    console.log('🌐 changeLanguageFromSettings called with locale:', locale);
    console.log('🌐 i18n object:', i18n);
    
    if (typeof i18n !== 'undefined' && i18n.setLocale) {
        try {
            console.log('🌐 Calling i18n.setLocale with:', locale);
            const result = await i18n.setLocale(locale);
            console.log('🌐 setLocale result:', result);
            
            if (result) {
                // Update UI
                updateAppLanguageUI();
                
                // Show success message
                showStatus('Language changed successfully!', 'success');
                
                // Update all translations
                if (typeof updatePageTranslations === 'function') {
                    updatePageTranslations();
                }
                
                // Force update all translatable elements
                forceUpdateAllTranslations();
                
                console.log('🌐 Language change completed successfully');
            } else {
                console.error('🌐 Failed to change language');
                showStatus('Failed to change language', 'error');
            }
        } catch (error) {
            console.error('🌐 Error changing language:', error);
            showStatus('Error changing language: ' + error.message, 'error');
        }
    } else {
        console.error('🌐 Language system not available');
        showStatus('Language system not available', 'error');
    }
}

/**
 * Force update all translatable elements on the page
 */
function forceUpdateAllTranslations() {
    console.log('🌐 forceUpdateAllTranslations called');
    
    if (typeof i18n === 'undefined') {
        console.error('🌐 i18n is undefined in forceUpdateAllTranslations');
            return;
        }

    // Update elements with data-i18n attribute
    const translatableElements = document.querySelectorAll('[data-i18n]');
    console.log('🌐 Found translatable elements:', translatableElements.length);
    
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-i18n');
        try {
            const translation = i18n.t(key);
            console.log(`🌐 Translating ${key} -> ${translation}`);
            if (translation && translation !== key) {
                element.textContent = translation;
                console.log(`🌐 Updated element text for key: ${key}`);
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
            const translation = i18n.t(key);
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
            const translation = i18n.t(key);
            if (translation && translation !== key) {
                element.title = translation;
            }
        } catch (error) {
            console.warn(`Title translation failed for key: ${key}`, error);
        }
    });
    
    // Force update all text content that might contain hardcoded English text
    forceUpdateAllTextContent();
    
    // Update dashboard labels
    updateDashboardLabels();
    
    // Update all card translations
    updateTaskCardTranslations();
    updateProjectCardTranslations();
    updateDailyTaskCardTranslations();
}

/**
 * Force update all text content on the page to current language
 */
function forceUpdateAllTextContent() {
    console.log('🌐 forceUpdateAllTextContent called');
    
    if (typeof i18n === 'undefined') {
        console.error('🌐 i18n is undefined in forceUpdateAllTextContent');
            return;
        }

    // Common text patterns to translate
    const textPatterns = {
        'Dashboard': 'navigation.dashboard',
        'Tasks': 'navigation.tasks',
        'Projects': 'navigation.projects',
        'Daily Tasks': 'navigation.dailyTasks',
        'Settings': 'navigation.settings',
        'Profile': 'navigation.profile',
        'Add Task': 'tasks.addTask',
        'Add Project': 'projects.addProject',
        'Add Daily Task': 'dailyTasks.addDailyTask',
        'Quick Actions': 'dashboard.quickActions',
        'Recent Tasks': 'dashboard.recentTasks',
        'All': 'common.all',
        'High': 'tasks.priorityHigh',
        'Medium': 'tasks.priorityMedium',
        'Low': 'tasks.priorityLow',
        'Today': 'dates.today',
        'Overdue': 'tasks.overdue',
        'Task Management': 'tasks.title',
        'Project Management': 'projects.name',
        'Daily Task Management': 'dailyTasks.title'
    };
    
    // Update all text nodes in the document
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
    );
    
    let textNode;
    let updatedCount = 0;
    
    while (textNode = walker.nextNode()) {
        const text = textNode.textContent.trim();
        if (text && textPatterns[text]) {
            try {
                const translation = i18n.t(textPatterns[text]);
                if (translation && translation !== textPatterns[text]) {
                    textNode.textContent = textNode.textContent.replace(text, translation);
                    updatedCount++;
                    console.log(`🌐 Updated text: "${text}" -> "${translation}"`);
                }
            } catch (error) {
                console.warn(`Failed to translate text: ${text}`, error);
            }
        }
    }
    
    console.log(`🌐 Updated ${updatedCount} text nodes`);
}

/**
 * Update app language UI elements
 */
function updateAppLanguageUI() {
    if (typeof i18n === 'undefined') return;
    
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
    
    // Update dashboard labels
    updateDashboardLabels();
    
    // Update all card translations
    updateTaskCardTranslations();
    updateProjectCardTranslations();
    updateDailyTaskCardTranslations();
}

async function loadFirebase() {
    try {
        // Check if Firebase SDK is loaded
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase SDK not loaded. Please check your internet connection.');
        }
        
        // Load configuration
        await loadFirebaseConfig();
        
        // Initialize Firebase
        if (initializeFirebase()) {
            console.log('Firebase loaded and initialized successfully');
        } else {
            throw new Error('Firebase initialization failed');
        }
    } catch (error) {
        throw new Error('Firebase loading failed: ' + error.message);
    }
}

// Load Firebase configuration
async function loadFirebaseConfig() {
    return new Promise((resolve, reject) => {
        // Check if config is already loaded
        if (window.firebaseConfig) {
            resolve();
            return;
        }
        
    const script = document.createElement('script');
        script.src = '../config.js';
        script.onload = () => {
            // Wait a bit for the script to execute
        setTimeout(() => {
            if (window.firebaseConfig) {
            resolve();
            } else {
                    reject(new Error('Firebase configuration not found'));
            }
            }, 100);
    };
        script.onerror = () => reject(new Error('Failed to load Firebase configuration'));
        document.head.appendChild(script);
    });
}

// Initialize Firebase
function initializeFirebase() {
    try {
        // Check if Firebase is already initialized
        let app;
        try {
            app = firebase.app();
        } catch (error) {
            // No app exists, create new one
            if (window.firebaseConfig) {
                app = firebase.initializeApp(window.firebaseConfig);
            } else {
                throw new Error('Firebase configuration not found');
            }
        }
        
            auth = firebase.auth(app);
            db = firebase.firestore(app);
            
        // Listen for auth state changes
            auth.onAuthStateChanged(handleAuthStateChanged);
        
        console.log('Firebase initialized successfully');
        return true;
        } catch (error) {
            console.error('Firebase initialization error:', error);
        showStatus('Firebase initialization failed: ' + error.message, 'error');
        return false;
    }
}

// Handle authentication state changes
async function handleAuthStateChanged(user) {
    if (user) {
        currentUser = user;
            await loadUserData();
        updateUserInterface();
    } else {
        // Redirect to login if not authenticated
        window.location.href = '../index.html';
    }
}

// Check authentication state
async function checkAuthState() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                currentUser = user;
                console.log('✅ User authenticated:', user.uid);
                resolve();
            } else {
                console.log('❌ User not authenticated');
                currentUser = null;
                // Redirect to login page if not authenticated
                window.location.href = '../index.html';
                resolve();
            }
        });
    });
}

// Load user data from Firestore
async function loadUserData() {
    try {
        // First try to load from new user_data collection
        let userDoc = await db.collection('user_data').doc(currentUser.uid).get();
        
        if (userDoc.exists) {
            userData = userDoc.data();
            console.log('User data loaded from user_data collection:', userData);
        } else {
            // Check if user exists in old users collection (migration)
            const oldUserDoc = await db.collection('users').doc(currentUser.uid).get();
            
            if (oldUserDoc.exists) {
                // Migrate old user data to new structure
                const oldData = oldUserDoc.data();
                userData = migrateOldUserData(oldData);
                
                // Save to new collection
                await db.collection('user_data').doc(currentUser.uid).set(userData);
                
                // Delete old document
                await db.collection('users').doc(currentUser.uid).delete();
                
                console.log('User data migrated from old structure:', userData);
            } else {
                // Create new user document with default structure
                userData = createDefaultUserData();
                await db.collection('user_data').doc(currentUser.uid).set(userData);
                console.log('New user data created:', userData);
            }
        }
        
        console.log('User data loaded:', userData);
    } catch (error) {
        console.error('Failed to load user data:', error);
        showStatus('Failed to load user data', 'error');
    }
}

// Migrate old user data to new structure
function migrateOldUserData(oldData) {
    return {
        profile: {
            name: oldData.userInfo?.username || oldData.userInfo?.email?.split('@')[0] || 'User',
            email: oldData.userInfo?.email || currentUser.email,
            photoPATH: '',
            bio: 'Migrated user',
            createdAt: oldData.userInfo?.createdAt || new Date().toISOString()
        },
        preferences: {
            theme: 'dark',
            language: 'tr',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            defaultView: 'dashboard',
            notificationSettings: {
                email: true,
                push: true,
                reminderTime: '09:00'
            }
        },
        projects: oldData.projects || [],
        tasks: oldData.tasks || [],
        dailyTasks: [],
        activityLog: [
            {
                action: 'data_migrated',
                timestamp: new Date().toISOString()
            }
        ],
        budget: {
            settings: {
                currency: 'TRY',
                defaultPeriod: 'monthly',
                notifications: {
                    overspending: true,
                    budgetReminder: true,
                    billReminder: true
                }
            },
            categories: [],
            transactions: [],
            periods: {
                daily: { budget: 0, spent: 0, remaining: 0 },
                weekly: { budget: 0, spent: 0, remaining: 0 },
                monthly: { budget: 0, spent: 0, remaining: 0 },
                yearly: { budget: 0, spent: 0, remaining: 0 }
            },
            goals: []
        }
    };
}

// Create default user data structure based on Taslak.json
function createDefaultUserData() {
    return {
        profile: {
            name: currentUser.displayName || currentUser.email.split('@')[0],
            username: currentUser.email.split('@')[0],
            email: currentUser.email,
            phone: '',
            bio: 'Welcome to Clario!',
            location: '',
            gender: '',
            birthDate: '',
            jobTitle: '',
            company: '',
            website: '',
            photoPATH: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        preferences: {
            theme: 'dark',
            language: 'tr',
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            defaultView: 'dashboard',
            notificationSettings: {
                email: true,
                push: true,
                reminderTime: '09:00'
            }
        },
        projects: [],
        tasks: [],
        dailyTasks: [],
        activityLog: [],
        budget: {
            settings: {
                currency: 'TRY',
                defaultPeriod: 'monthly',
                notifications: {
                    overspending: true,
                    budgetReminder: true,
                    billReminder: true
                }
            },
            categories: [],
            transactions: [],
            periods: {
                daily: { budget: 0, spent: 0, remaining: 0 },
                weekly: { budget: 0, spent: 0, remaining: 0 },
                monthly: { budget: 0, spent: 0, remaining: 0 },
                yearly: { budget: 0, spent: 0, remaining: 0 }
            },
            goals: []
        }
    };
}

// Update user interface
function updateUserInterface() {
    updateUserInfo();
    updateDashboardCounts();
    updateDashboardLabels();
    renderRecentTasks();
    updateDashboardProfileInfo(); // Update dashboard profile info
    refreshAllProfilePhotos(); // Refresh all profile photos
    
    // Update all card translations after rendering
    setTimeout(() => {
        if (typeof i18n !== 'undefined' && i18n.t) {
            updateTaskCardTranslations();
            updateProjectCardTranslations();
            updateDailyTaskCardTranslations();
        }
    }, 100);
}

// Update user information display
function updateUserInfo() {
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (userData && userData.profile) {
        const name = userData.profile.name;
        userName.textContent = name;
        
        // Try to load profile photo for header avatar
        try {
            const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
            if (photoData) {
                const photo = JSON.parse(photoData);
                
                // Create image element for header
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = 'Profile Photo';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                
                // Clear placeholder and add image
                userAvatar.innerHTML = '';
                userAvatar.appendChild(img);
            } else {
                // Fallback to placeholder
                userAvatar.textContent = name.charAt(0).toUpperCase();
            }
        } catch (error) {
            // Fallback to placeholder
            userAvatar.textContent = name.charAt(0).toUpperCase();
        }
    }
}

// Update dashboard counts
function updateDashboardCounts() {
    if (!userData) return;
    
    // Update notes count if notes section exists
    const notesCount = userData.notes ? userData.notes.length : 0;
    const notesCountElement = document.getElementById('notesCount');
    if (notesCountElement) {
        notesCountElement.textContent = notesCount;
    }
    
    // Update other counts with translations
    const tasksCount = userData.tasks ? userData.tasks.length : 0;
    const tasksCountElement = document.getElementById('tasksCount');
    if (tasksCountElement) {
        tasksCountElement.textContent = tasksCount;
    }
    
    const projectsCount = userData.projects ? userData.projects.length : 0;
    const projectsCountElement = document.getElementById('projectsCount');
    if (projectsCountElement) {
        projectsCountElement.textContent = projectsCount;
    }
    
    const dailyTasksCount = userData.dailyTasks ? userData.dailyTasks.length : 0;
    const dailyTasksCountElement = document.getElementById('dailyTasksCount');
    if (dailyTasksCountElement) {
        dailyTasksCountElement.textContent = dailyTasksCount;
    }
}

// Update dashboard labels with translations
function updateDashboardLabels() {
    // Update section titles
    const recentTasksTitle = document.querySelector('[data-i18n="dashboard.recentTasks"]');
    if (recentTasksTitle) {
        recentTasksTitle.textContent = getText('dashboard.recentTasks');
    }
    
    const allTasksTitle = document.querySelector('[data-i18n="dashboard.allTasks"]');
    if (allTasksTitle) {
        allTasksTitle.textContent = getText('dashboard.allTasks');
    }
    
    const projectsTitle = document.querySelector('[data-i18n="dashboard.projects"]');
    if (projectsTitle) {
        projectsTitle.textContent = getText('dashboard.projects');
    }
    
    const dailyTasksTitle = document.querySelector('[data-i18n="dashboard.dailyTasks"]');
    if (dailyTasksTitle) {
        dailyTasksTitle.textContent = getText('dashboard.dailyTasks');
    }
    
    const notesTitle = document.querySelector('[data-i18n="settings.notes"]');
    if (notesTitle) {
        notesTitle.textContent = getText('settings.notes');
    }
}

// Render recent tasks
function renderRecentTasks() {
    if (!userData || !userData.tasks) return;
    
    const recentTasks = userData.tasks
        .filter(task => task.status === 'active')
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    
    const tasksGrid = document.getElementById('recentTasksGrid');
    tasksGrid.innerHTML = '';
    
    recentTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksGrid.appendChild(taskCard);
    });
    
    // Force update translations for task cards
    if (typeof i18n !== 'undefined' && i18n.t) {
        updateTaskCardTranslations();
    }
    
    // Add drag and drop event listeners (only once)
    if (!tasksGrid.hasAttribute('data-drag-initialized')) {
        tasksGrid.addEventListener('dragover', handleDragOver);
        tasksGrid.addEventListener('dragenter', handleDragEnter);
        tasksGrid.addEventListener('dragleave', handleDragLeave);
        tasksGrid.addEventListener('drop', (e) => handleDrop(e, 'tasks'));
        tasksGrid.setAttribute('data-drag-initialized', 'true');
    }
}

// Update task card translations
function updateTaskCardTranslations() {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        // Update priority text
        const priorityElement = card.querySelector('.task-priority');
        if (priorityElement) {
            const priorityClass = priorityElement.className.match(/priority-(high|medium|low)/);
            if (priorityClass) {
                const priority = priorityClass[1];
                priorityElement.textContent = getText(`tasks.priority${priority.charAt(0).toUpperCase() + priority.slice(1)}`);
            }
        }
        
        // Update action buttons
        const completeBtn = card.querySelector('.btn-complete');
        if (completeBtn) {
            completeBtn.textContent = getText('common.complete');
        }
        
        const uncompleteBtn = card.querySelector('.btn-uncomplete');
        if (uncompleteBtn) {
            uncompleteBtn.textContent = getText('common.undo');
        }
        
        const editBtn = card.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.textContent = getText('common.edit');
        }
        
        const deleteBtn = card.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.textContent = getText('common.delete');
        }
    });
}

// Create task card element
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
    taskCard.dataset.itemId = task.id;
    taskCard.onclick = () => showTaskDetails(task);
    
    // Drag and drop functionality enabled
    taskCard.draggable = true;
    taskCard.addEventListener('dragstart', (e) => handleDragStart(e, taskCard, 'tasks', task.id));
    taskCard.addEventListener('dragend', (e) => handleDragEnd(e, taskCard));
    
    const priorityClass = getPriorityClass(task.priority);
    const projectName = getProjectName(task.projectId);
    const projectColor = getProjectColor(task.projectId);
    
    taskCard.innerHTML = `
        <div class="task-header">
            <div>
                <div class="task-title">${task.title}</div>
                <div class="task-priority ${priorityClass}">${getPriorityText(task.priority)}</div>
            </div>
        </div>
        <div class="task-description">${task.description || getText('tasks.noDescription')}</div>
        <div class="task-meta">
            <div class="task-project">
                <div class="project-color" style="background-color: ${projectColor}"></div>
                <span>${projectName || getText('tasks.noProject')}</span>
            </div>
            <span>${task.taskType === 'range' ? 
                formatDateRange(task.startDate, task.endDate) : 
                formatDate(task.dueDate)}</span>
        </div>
        <div class="task-actions">
            ${task.status === 'completed' 
                ? `<button class="action-btn btn-uncomplete" onclick="event.stopPropagation(); uncompleteTask('${task.id}')">${getText('common.undo')}</button>`
                : `<button class="action-btn btn-complete" onclick="event.stopPropagation(); completeTask('${task.id}')">${getText('common.complete')}</button>`
            }
            <button class="action-btn btn-edit" onclick="event.stopPropagation(); editTask('${task.id}')">${getText('common.edit')}</button>
            <button class="action-btn btn-delete" onclick="event.stopPropagation(); deleteTask('${task.id}')">${getText('common.delete')}</button>
        </div>
    `;
    
    return taskCard;
}

// Get priority class for styling
function getPriorityClass(priority) {
    switch (priority) {
        case 'high': return 'priority-high';
        case 'medium': return 'priority-medium';
        case 'low': return 'priority-low';
        default: return 'priority-medium';
    }
}

// Get priority text
function getPriorityText(priority) {
    switch (priority) {
        case 'high': return getText('tasks.priorityHigh');
        case 'medium': return getText('tasks.priorityMedium');
        case 'low': return getText('tasks.priorityLow');
        default: return getText('tasks.priorityMedium');
    }
}

// Get project name by ID
function getProjectName(projectId) {
    if (!userData || !userData.projects) return getText('tasks.noProject');
    const project = userData.projects.find(p => p.id === projectId);
    return project ? project.title : getText('tasks.noProject');
}

// Get project color by ID
function getProjectColor(projectId) {
    if (!userData || !userData.projects) return '#667eea';
    const project = userData.projects.find(p => p.id === projectId);
    return project ? project.color : '#667eea';
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return getText('tasks.noDueDate');
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return getText('tasks.invalidDate');
    
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format as dd-mm-yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    if (diffDays < 0) {
        const overdueText = getText('tasks.daysOverdue').replace('{days}', Math.abs(diffDays));
        return `${formattedDate} (${overdueText})`;
    } else if (diffDays === 0) {
        const dueTodayText = getText('tasks.dueToday');
        return `${formattedDate} (${dueTodayText})`;
    } else if (diffDays === 1) {
        const dueTomorrowText = getText('tasks.dueTomorrow');
        return `${formattedDate} (${dueTomorrowText})`;
    } else {
        const dueInText = getText('tasks.dueIn').replace('{days}', diffDays);
        return `${formattedDate} (${dueInText})`;
    }
}

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Show section based on navigation
async function showSection(sectionName) {
    // Check if i18n is ready, if not show loading screen
    if (typeof i18n === 'undefined' || !i18n.t || typeof i18n.t !== 'function') {
        showLoadingScreen();
    }
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.style.display = 'none');
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(sectionName + 'Section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }
    
    // Add active class to clicked nav item
    const clickedNavItem = event.currentTarget;
    clickedNavItem.classList.add('active');
    
    // Scroll to top of main content and sidebar
    scrollToTop();
    
    // Wait for i18n to be ready
    await waitForI18n();
    
    // Load section data
    await loadSectionData(sectionName);
    
    // Hide loading screen if it was shown
    hideLoadingScreen();
}

// Scroll to top of main content and sidebar
function scrollToTop() {
    // Scroll main content to top
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Scroll sidebar to top
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    // Scroll body to top (if needed)
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Performance optimization: Debounced scroll handler
let scrollTimeout;
function debouncedScrollHandler() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Perform scroll-related operations here if needed
    }, 16); // 60fps = ~16ms
}

// Performance optimization: Throttled resize handler
let resizeTimeout;
function throttledResizeHandler() {
    if (!resizeTimeout) {
        resizeTimeout = setTimeout(() => {
            // Perform resize-related operations here if needed
            resizeTimeout = null;
        }, 100); // Throttle to 100ms
    }
}

// Add performance event listeners
document.addEventListener('scroll', debouncedScrollHandler, { passive: true });
window.addEventListener('resize', throttledResizeHandler, { passive: true });

// Wait for i18n system to be ready
async function waitForI18n() {
    return new Promise((resolve) => {
        const checkI18n = () => {
            if (typeof i18n !== 'undefined' && i18n.t && typeof i18n.t === 'function') {
            resolve();
            } else {
                setTimeout(checkI18n, 50);
            }
        };
        checkI18n();
    });
}

// Show loading screen
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Hide loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Load data for specific section
async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            updateDashboardCounts();
            updateDashboardLabels();
            renderRecentTasks();
            break;
        case 'tasks':
            renderAllTasks();
            break;
        case 'projects':
            renderProjects();
            break;
        case 'daily':
            renderDailyTasks();
            break;
        case 'notes':
            renderNotes();
            break;
        case 'profile':
            renderProfileForm();
            break;
        case 'preferences':
            renderPreferencesForm();
            updateLanguageSelector();
            break;
        case 'activity':
            renderActivityLog();
            break;
        case 'budget':
            renderBudgetOverview();
            break;
    }
}

// Render all tasks
function renderAllTasks() {
    if (!userData || !userData.tasks) return;
    
    const tasksGrid = document.getElementById('allTasksGrid');
    tasksGrid.innerHTML = '';
    
    userData.tasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksGrid.appendChild(taskCard);
    });
    
    // Force update translations for task cards
    if (typeof i18n !== 'undefined' && i18n.t) {
        updateTaskCardTranslations();
    }
}

// Render projects
function renderProjects() {
    if (!userData || !userData.projects) return;
    
    const projectsGrid = document.getElementById('projectsGrid');
    projectsGrid.innerHTML = '';
    
    userData.projects.forEach(project => {
        const projectCard = createProjectCard(project);
        projectsGrid.appendChild(projectCard);
    });
    
    // Force update translations for project cards
    if (typeof i18n !== 'undefined' && i18n.t) {
        updateProjectCardTranslations();
    }
    
    // Add drag and drop event listeners (only once)
    if (!projectsGrid.hasAttribute('data-drag-initialized')) {
        projectsGrid.addEventListener('dragover', handleDragOver);
        projectsGrid.addEventListener('dragenter', handleDragEnter);
        projectsGrid.addEventListener('dragleave', handleDragLeave);
        projectsGrid.addEventListener('drop', (e) => handleDrop(e, 'projects'));
        projectsGrid.setAttribute('data-drag-initialized', 'true');
    }
}

// Update project card translations
function updateProjectCardTranslations() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        // Update action buttons
        const editBtn = card.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.textContent = getText('common.edit');
        }
        
        const deleteBtn = card.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.textContent = getText('common.delete');
        }
    });
}

// Create project card
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'dashboard-card project-card';
    projectCard.dataset.itemId = project.id;
    
    const taskCount = userData.tasks.filter(task => task.projectId === project.id).length;
    
    // Drag and drop functionality enabled
    projectCard.draggable = true;
    projectCard.addEventListener('dragstart', (e) => handleDragStart(e, projectCard, 'projects', project.id));
    projectCard.addEventListener('dragend', (e) => handleDragEnd(e, projectCard));
    
    projectCard.innerHTML = `
        <div class="card-header">
            <div class="card-title-container">
                ${project.color ? `<div class="project-color-indicator" style="background-color: ${project.color};"></div>` : ''}
                <span class="card-title">${project.title}</span>
            </div>
            <span class="card-count">${taskCount}</span>
        </div>
        <p>${project.description || getText('projects.noDescription')}</p>
        
        <!-- Progress Bar -->
        <div class="project-progress">
            <div class="progress-label">Progress: ${Math.round((project.progress || 0) * 100)}%</div>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${(project.progress || 0) * 100}%"></div>
            </div>
        </div>
        <!-- Debug Info -->
        <div style="font-size: 10px; color: #666; margin-top: 5px;">
            Debug: progress=${project.progress}, calculated=${Math.round((project.progress || 0) * 100)}%
        </div>
        
        <div class="task-actions">
            <button class="action-btn btn-edit" onclick="event.stopPropagation(); editProject('${project.id}')">${getText('common.edit')}</button>
            <button class="action-btn btn-delete" onclick="event.stopPropagation(); deleteProject('${project.id}')">${getText('common.delete')}</button>
        </div>
    `;
    
    return projectCard;
}

// Render daily tasks
function renderDailyTasks() {
    if (!userData || !userData.dailyTasks) return;
    
    const dailyTasksGrid = document.getElementById('dailyTasksGrid');
    dailyTasksGrid.innerHTML = '';
    
    userData.dailyTasks.forEach(dailyTask => {
        const dailyTaskCard = createDailyTaskCard(dailyTask);
        dailyTasksGrid.appendChild(dailyTaskCard);
    });
    
    // Force update translations for daily task cards
    if (typeof i18n !== 'undefined' && i18n.t) {
        updateDailyTaskCardTranslations();
    }
    
    // Add drag and drop event listeners (only once)
    if (!dailyTasksGrid.hasAttribute('data-drag-initialized')) {
        dailyTasksGrid.addEventListener('dragover', handleDragOver);
        dailyTasksGrid.addEventListener('dragenter', handleDragEnter);
        dailyTasksGrid.addEventListener('dragleave', handleDragLeave);
        dailyTasksGrid.addEventListener('drop', (e) => handleDrop(e, 'dailyTasks'));
        dailyTasksGrid.setAttribute('data-drag-initialized', 'true');
    }
}

// Update daily task card translations
function updateDailyTaskCardTranslations() {
    const dailyTaskCards = document.querySelectorAll('.dashboard-card');
    dailyTaskCards.forEach(card => {
        // Update action buttons
        const completeBtn = card.querySelector('.btn-complete');
        if (completeBtn) {
            completeBtn.textContent = getText('common.complete');
        }
        
        const editBtn = card.querySelector('.btn-edit');
        if (editBtn) {
            editBtn.textContent = getText('common.edit');
        }
        
        const deleteBtn = card.querySelector('.btn-delete');
        if (deleteBtn) {
            deleteBtn.textContent = getText('common.delete');
        }
    });
}

// Create daily task card
function createDailyTaskCard(dailyTask) {
    const dailyTaskCard = document.createElement('div');
    dailyTaskCard.className = 'dashboard-card';
    dailyTaskCard.dataset.itemId = dailyTask.id;
    
    const today = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
    
    // Drag and drop functionality enabled
    dailyTaskCard.draggable = true;
    dailyTaskCard.addEventListener('dragstart', (e) => handleDragStart(e, dailyTaskCard, 'dailyTasks', dailyTask.id));
    dailyTaskCard.addEventListener('dragend', (e) => handleDragEnd(e, dailyTaskCard));
    
    // Safely handle progress field - provide defaults if missing
    const progress = dailyTask.progress || {
        completedDates: [],
        currentStreak: dailyTask.streak || 0,
        longestStreak: dailyTask.streak || 0
    };
    
    const isCompletedToday = progress.completedDates.includes(today);
    
    // Check if task is active for today (based on selected days)
    const todayDay = window.getCurrentDayOfWeek ? window.getCurrentDayOfWeek() : new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // Use debug time if available
    
    // Safely handle schedule field
    const scheduleDays = (dailyTask.schedule && dailyTask.schedule.recurrence && dailyTask.schedule.recurrence.days) || 
                         dailyTask.days || 
                         [];
    const isActiveToday = scheduleDays.includes(todayDay);
    
    // Get next active day info
    const nextActiveDay = getNextActiveDay(scheduleDays);
    
    // Safely handle time field
    const taskTime = (dailyTask.schedule && dailyTask.schedule.recurrence && dailyTask.schedule.recurrence.time) || 
                     dailyTask.time || 
                     '09:00';
    
    dailyTaskCard.innerHTML = `
        <div class="card-content">
            <div class="card-title">${dailyTask.title}</div>
            <div class="card-description">${dailyTask.description || getText('dailyTasks.noDescription')}</div>
            <div class="card-info">
                <div class="card-category">${dailyTask.category || getText('dailyTasks.noCategory')}</div>
                <div class="card-time">${taskTime}</div>
                <div class="card-days">${formatDays(scheduleDays)}</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn ${dailyTask.status === 'active' ? 'btn-active' : 'btn-inactive'}" 
                    onclick="event.stopPropagation(); toggleDailyTaskStatus('${dailyTask.id}')"
                    title="${dailyTask.status === 'active' ? 'Deactivate' : 'Activate'}">
                ${dailyTask.status === 'active' ? '🟢' : '🔴'}
            </button>
            <button class="btn btn-edit" onclick="event.stopPropagation(); editDailyTask('${dailyTask.id}')">${getText('common.edit')}</button>
            <button class="btn btn-delete" onclick="event.stopPropagation(); deleteDailyTask('${dailyTask.id}')">${getText('common.delete')}</button>
        </div>
    `;
    
    return dailyTaskCard;
}

// Render profile form
function renderProfileForm() {
    const profileContent = document.getElementById('profileContent');
    
    // Get current translations if available
    const getText = (key) => {
        if (typeof i18n !== 'undefined' && i18n.t) {
            return i18n.t(key);
        }
        return key; // Fallback to key if i18n not available
    };
    
    profileContent.innerHTML = `
        <div class="profile-container">
            <div class="profile-header">
                <div class="profile-avatar">
                    <div class="avatar-placeholder" id="avatarPlaceholder">
                        ${userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U'}
                </div>
                    <div class="avatar-actions">
                        <button type="button" class="avatar-upload-btn" onclick="document.getElementById('avatarInput').click()" title="Upload Photo">
                            <i>📷</i>
                        </button>
                        <button type="button" class="avatar-remove-btn" onclick="removeProfilePhoto()" title="Remove Photo" style="display: none;">
                            <i>🗑️</i>
                        </button>
                    </div>
                    <input type="file" id="avatarInput" accept="image/*" style="display: none;" onchange="handleAvatarUpload(event)">
                </div>
                <div class="profile-info">
                    <h3>${userData.profile.name || 'User'}</h3>
                    <p class="user-email">${userData.profile.email || 'No email'}</p>
                    <p class="member-since">Member since ${userData.profile.createdAt ? new Date(userData.profile.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
            </div>




                    <form id="profileForm" class="profile-form">
                        <div class="form-section">
                            <h4>${getText('settings.basicInformation')}</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileName">${getText('settings.fullName')}</label>
                                    <input type="text" id="profileName" placeholder="${getText('settings.enterYourFullName')}" value="${userData.profile.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="profileUsername">${getText('settings.username')}</label>
                                    <input type="text" id="profileUsername" placeholder="${getText('settings.chooseAUsername')}" value="${userData.profile.username || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileEmail">${getText('settings.emailAddress')}</label>
                                <input type="email" id="profileEmail" placeholder="${getText('settings.enterYourEmail')}" value="${userData.profile.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="profilePhone">${getText('settings.phoneNumber')}</label>
                                <div class="phone-input-container">
                                    <div class="country-flag-selector" onclick="toggleCountrySelector()">
                                        <span class="flag" id="selectedFlag">🇹🇷</span>
                                        <span class="country-code" id="selectedCountryCode">+90</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </div>
                                    <input type="tel" id="profilePhone" placeholder="${getText('settings.enterPhoneNumber')}" value="${userData.profile.phone || ''}" oninput="formatPhoneNumber(this)">
                                    <div class="country-selector-dropdown" id="countrySelectorDropdown" style="display: none;">
                                        <div class="country-option" onclick="selectCountry('🇹🇷', '+90', 'TR')">
                                            <span class="flag">🇹🇷</span>
                                            <span class="country-name">Turkey</span>
                                            <span class="country-code">+90</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇺🇸', '+1', 'US')">
                                            <span class="flag">🇺🇸</span>
                                            <span class="country-name">United States</span>
                                            <span class="country-code">+1</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇬🇧', '+44', 'GB')">
                                            <span class="flag">🇬🇧</span>
                                            <span class="country-name">United Kingdom</span>
                                            <span class="country-code">+44</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇩🇪', '+49', 'DE')">
                                            <span class="flag">🇩🇪</span>
                                            <span class="country-name">Germany</span>
                                            <span class="country-code">+49</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇫🇷', '+33', 'FR')">
                                            <span class="flag">🇫🇷</span>
                                            <span class="country-name">France</span>
                                            <span class="country-code">+33</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇮🇹', '+39', 'IT')">
                                            <span class="flag">🇮🇹</span>
                                            <span class="country-name">Italy</span>
                                            <span class="country-code">+39</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇪🇸', '+34', 'ES')">
                                            <span class="flag">🇪🇸</span>
                                            <span class="country-name">Spain</span>
                                            <span class="country-code">+34</span>
                                        </div>
                                        <div class="country-option" onclick="selectCountry('🇯🇵', '+81', 'JP')">
                                            <span class="flag">🇯🇵</span>
                                            <span class="country-name">Japan</span>
                                            <span class="country-code">+81</span>
                                        </div>
                                    </div>
                                </div>
                                <small class="input-hint">${getText('settings.selectCountryAndEnterPhone')}</small>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>${getText('settings.personalDetails')}</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileBirthDate">${getText('settings.birthDate')}</label>
                                    <input type="date" id="profileBirthDate" value="${userData.profile.birthDate || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="profileGender">${getText('settings.gender')}</label>
                                    <div class="gender-toggle">
                                        <input type="radio" id="genderMale" name="gender" value="male" ${userData.profile.gender === 'male' ? 'checked' : ''}>
                                        <label for="genderMale" class="gender-option">
                                            <span class="gender-icon">👨</span>
                                            <span>${getText('settings.male')}</span>
                                        </label>
                                        <input type="radio" id="genderFemale" name="gender" value="female" ${userData.profile.gender === 'female' ? 'checked' : ''}>
                                        <label for="genderFemale" class="gender-option">
                                            <span class="gender-icon">👩</span>
                                            <span>${getText('settings.female')}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileBio">${getText('settings.bio')}</label>
                                <textarea id="profileBio" placeholder="${getText('settings.tellUsAboutYourself')}" rows="4">${userData.profile.bio || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="profileLocation">${getText('settings.location')}</label>
                                <div class="location-combobox">
                                    <input type="text" id="profileLocation" placeholder="${getText('settings.typeToSearchOrSelect')}" value="${userData.profile.location || ''}" oninput="filterLocations(this)" onfocus="showLocationDropdown()" onblur="hideLocationDropdown()">
                                    <div class="location-dropdown" id="locationDropdown" style="display: none;">
                                        <div class="location-option" onclick="selectLocation('Istanbul, Turkey')">Istanbul, Turkey</div>
                                        <div class="location-option" onclick="selectLocation('Ankara, Turkey')">Ankara, Turkey</div>
                                        <div class="location-option" onclick="selectLocation('Izmir, Turkey')">Izmir, Turkey</div>
                                        <div class="location-option" onclick="selectLocation('Bursa, Turkey')">Bursa, Turkey</div>
                                        <div class="location-option" onclick="selectLocation('Antalya, Turkey')">Antalya, Turkey</div>
                                        <div class="location-option" onclick="selectLocation('London, UK')">London, UK</div>
                                        <div class="location-option" onclick="selectLocation('New York, USA')">New York, USA</div>
                                        <div class="location-option" onclick="selectLocation('Berlin, Germany')">Berlin, Germany</div>
                                        <div class="location-option" onclick="selectLocation('Paris, France')">Paris, France</div>
                                        <div class="location-option" onclick="selectLocation('Tokyo, Japan')">Tokyo, Japan</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>${getText('settings.professionalInformation')}</h4>
                            <div class="form-group">
                                <label for="profileJobTitle">${getText('settings.jobTitle')}</label>
                                <input type="text" id="profileJobTitle" placeholder="e.g., Software Developer" value="${userData.profile.jobTitle || ''}">
                            </div>
                            <div class="form-group">
                                <label for="profileCompany">${getText('settings.company')}</label>
                                <input type="text" id="profileCompany" placeholder="${getText('settings.companyName')}" value="${userData.profile.company || ''}">
                            </div>
                            <div class="form-group">
                                <label for="profileWebsite">${getText('settings.website')}</label>
                                <input type="url" id="profileWebsite" placeholder="${getText('settings.websiteUrl')}" value="${userData.profile.website || ''}">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="resetProfileBtn">${getText('settings.reset')}</button>
                            <button type="submit" class="btn-primary">${getText('settings.saveChanges')}</button>
                        </div>
                    </form>
                </div>


            </div>
        </div>
    `;
    
    // Add event listeners
    setupProfileTabListeners();
    
    // Add form submit event listener
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfileChanges();
        });
    }
    
    // Add reset button event listener
    const resetBtn = document.getElementById('resetProfileBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetProfileForm);
    }
    
    // Load profile photo if exists
    refreshAllProfilePhotos();
}

// Render preferences form
function renderPreferencesForm() {
    const preferencesContent = document.getElementById('preferencesContent');
    
    // Get current translations if available
    const getText = (key) => {
        if (typeof i18n !== 'undefined' && i18n.t) {
            return i18n.t(key);
        }
        return key; // Fallback to key if i18n not available
    };
    
    preferencesContent.innerHTML = `
        <div class="settings-container">
            <div class="settings-section">
                <h4>${getText('settings.appearance')}</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.darkMode')}</h5>
                        <p>${getText('settings.useDarkTheme')}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="darkMode" ${userData.preferences?.darkMode ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.languageSettings')}</h5>
                        <p>${getText('settings.languageDescription')}</p>
                    </div>
                    <select id="languageSelect" class="setting-select">
                                <option value="tr" ${userData.preferences?.language === 'tr' ? 'selected' : ''}>Türkçe</option>
        <option value="en" ${userData.preferences?.language === 'en' ? 'selected' : ''}>English</option>
        <option value="es" ${userData.preferences?.language === 'es' ? 'selected' : ''}>Español</option>
        <option value="fr" ${userData.preferences?.language === 'fr' ? 'selected' : ''}>Français</option>
        <option value="de" ${userData.preferences?.language === 'de' ? 'selected' : ''}>Deutsch</option>
                    </select>
                </div>
            </div>

            <div class="settings-section">
                <h4>${getText('settings.notificationPreferences')}</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.emailNotifications')}</h5>
                        <p>${getText('settings.emailNotificationsDesc')}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="emailNotifications" ${userData.preferences?.emailNotifications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.pushNotifications')}</h5>
                        <p>${getText('settings.pushNotificationsDesc')}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="pushNotifications" ${userData.preferences?.pushNotifications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <h4>${getText('settings.securitySettings')}</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.changePassword')}</h5>
                        <p>${getText('settings.changePasswordDesc')}</p>
                    </div>
                    <button type="button" class="btn-secondary" onclick="showChangePasswordForm()">${getText('settings.changePassword')}</button>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.twoFactorAuth')}</h5>
                        <p>${getText('settings.twoFactorAuthDesc')}</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="twoFactorAuth" ${userData.preferences?.twoFactorAuth ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.loginHistory')}</h5>
                        <p>${getText('settings.loginHistoryDesc')}</p>
                    </div>
                    <button type="button" class="btn-secondary" onclick="showLoginHistory()">${getText('settings.viewHistory')}</button>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>${getText('settings.accountDeletion')}</h5>
                        <p>${getText('settings.accountDeletionDesc')}</p>
                    </div>
                    <button type="button" class="btn-danger" onclick="showDeleteAccountConfirmation()">${getText('settings.deleteAccount')}</button>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="resetAllSettings()">${getText('settings.resetAll')}</button>
                <button type="button" class="btn-primary" onclick="saveAllSettings()">${getText('settings.saveAllSettings')}</button>
                </div>
        </div>
    `;
    
    // Add event listeners
    setupSettingsTabListeners();
}

// Render activity log
function renderActivityLog() {
    if (!userData || !userData.activityLog) return;
    
    const activityContent = document.getElementById('activityContent');
    activityContent.innerHTML = '';
    
    // Create activity list container
    const activityList = document.createElement('div');
    activityList.className = 'activity-list';
    
    userData.activityLog.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-row';
        activityItem.innerHTML = `
            <div class="activity-row-icon">📝</div>
            <div class="activity-row-content">
                <span class="activity-row-action">${activity.action}</span>
                <span class="activity-row-separator">•</span>
                <span class="activity-row-task-id">Task: ${activity.taskId}</span>
                <span class="activity-row-separator">•</span>
                <span class="activity-row-time">${formatDate(activity.timestamp)}</span>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
    
    activityContent.appendChild(activityList);
}

// Filter tasks
function filterTasks(filterType) {
    // Remove active class from all filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to clicked button
    event.target.classList.add('active');
    
    // Apply filter
    let filteredTasks = [];
    
    switch (filterType) {
        case 'high':
            filteredTasks = userData.tasks.filter(task => task.priority === 'high' && task.status === 'active');
            break;
        case 'today':
            const today = new Date().toISOString().split('T')[0];
            filteredTasks = userData.tasks.filter(task => task.dueDate === today && task.status === 'active');
            break;
        case 'overdue':
            const now = new Date();
            filteredTasks = userData.tasks.filter(task => 
                new Date(task.dueDate) < now && task.status === 'active'
            );
            break;
        default:
            filteredTasks = userData.tasks.filter(task => task.status === 'active');
    }
    
    // Render filtered tasks
    const tasksGrid = document.getElementById('recentTasksGrid');
    tasksGrid.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const taskCard = createTaskCard(task);
        tasksGrid.appendChild(taskCard);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Add any additional event listeners here
    
    // Setup progress bar event listeners
    setupProgressBars();
}

// Show add task modal
function showAddTaskModal() {
    console.log('🚀 showAddTaskModal called');
    console.log('👤 currentUser:', currentUser);
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.log('❌ User not authenticated');
        showStatus('Please login to add tasks', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding...');
    
    try {
        populateProjectSelect();
        console.log('✅ populateProjectSelect completed');
        
        // Reset and setup date inputs
        setupDateInputs();
        console.log('✅ setupDateInputs completed');
        
        toggleTaskDateInputs();
        console.log('✅ toggleTaskDateInputs completed');
        
        const modal = document.getElementById('addTaskModal');
        if (modal) {
            modal.style.display = 'flex';
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            console.log('✅ Modal displayed with show class');
            
            // Debug: Check modal state
            console.log('🔍 Modal display style:', modal.style.display);
            console.log('🔍 Modal classList:', modal.classList.toString());
            console.log('🔍 Modal computed style:', window.getComputedStyle(modal).display);
            console.log('🔍 Modal computed visibility:', window.getComputedStyle(modal).visibility);
            console.log('🔍 Modal computed opacity:', window.getComputedStyle(modal).opacity);
        } else {
            console.log('❌ Modal element not found');
        }
        
        setupFormValidation('addTaskForm', handleAddTask);
        console.log('✅ Form validation setup completed');
    } catch (error) {
        console.error('❌ Error in showAddTaskModal:', error);
    }
}

// Show add project modal
function showAddProjectModal() {
    console.log('🚀 showAddProjectModal called');
    console.log('👤 currentUser:', currentUser);
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.log('❌ User not authenticated');
        showStatus('Please login to add projects', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding...');
    
    try {
        const modal = document.getElementById('addProjectModal');
        if (modal) {
            modal.style.display = 'flex';
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            console.log('✅ Project Modal displayed with show class');
        } else {
            console.log('❌ Project Modal element not found');
        }
        
        setupFormValidation('addProjectForm', handleAddProject);
        console.log('✅ Project Form validation setup completed');
        
        // Setup progress bar for add project modal
        setupProgressBar('projectProgress', 'progressValue');
    } catch (error) {
        console.error('❌ Error in showAddProjectModal:', error);
    }
}

// Setup progress bars
function setupProgressBars() {
    // Setup progress bar for add project modal
    setupProgressBar('projectProgress', 'progressValue');
    
    // Setup progress bar for edit project modal
    setupProgressBar('editProjectProgress', 'editProgressValue');
}

// Setup individual progress bar
function setupProgressBar(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    
    if (slider && display) {
        // Update display when slider changes
        slider.addEventListener('input', function() {
            display.textContent = this.value + '%';
        });
        
        // Initialize display
        display.textContent = slider.value + '%';
    }
}

// Show add daily task modal
function showAddDailyTaskModal() {
    console.log('🚀 showAddDailyTaskModal called');
    console.log('👤 currentUser:', currentUser);
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.log('❌ User not authenticated');
        showStatus('Please login to add daily tasks', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding...');
    
    try {
        const modal = document.getElementById('addDailyTaskModal');
        if (modal) {
            modal.style.display = 'flex';
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            console.log('✅ Daily Task Modal displayed with show class');
        } else {
            console.log('❌ Daily Task Modal element not found');
        }
        
        setupFormValidation('addDailyTaskModal', handleAddDailyTask);
        console.log('✅ Daily Task Form validation setup completed');
    } catch (error) {
        console.error('❌ Error in showAddDailyTaskModal:', error);
    }
}

// Close modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for animation to complete
    }
    // Reset form
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

// Populate project select dropdown
function populateProjectSelect(selectId = 'taskProject') {
    const projectSelect = document.getElementById(selectId);
    if (!projectSelect) return;
    
    projectSelect.innerHTML = '<option value="">No Project</option>';
    
    if (userData && userData.projects) {
        userData.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = project.title;
            projectSelect.appendChild(option);
        });
    }
}

// Setup form validation
function setupFormValidation(formId, submitHandler) {
    const form = document.getElementById(formId);
    if (form) {
        console.log(`🔧 Setting up form validation for ${formId}`);
        form.onsubmit = (e) => {
            e.preventDefault();
            console.log(`🔧 Form ${formId} submitted, calling handler:`, submitHandler.name);
            submitHandler(e);
        };
        console.log(`✅ Form validation setup completed for ${formId}`);
    } else {
        console.log(`❌ Form ${formId} not found for validation setup`);
    }
}

// Handle add task
async function handleAddTask(event) {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add tasks', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const taskData = {
        id: generateId(),
        title: formData.get('taskTitle') || document.getElementById('taskTitle').value,
        description: formData.get('taskDescription') || document.getElementById('taskDescription').value,
        projectId: document.getElementById('taskProject').value || null,
        priority: document.getElementById('taskPriority').value,
        taskType: document.getElementById('taskType').value,
        startDate: document.getElementById('taskStartDate').value || null,
        endDate: document.getElementById('taskEndDate').value || null,
        dueDate: document.getElementById('taskType').value === 'single' ? 
                 (document.getElementById('taskDueDate').value || getTodayDate()) : null,
        labels: document.getElementById('taskLabels').value.split(',').map(label => label.trim()).filter(label => label),
        status: 'active',
        subtasks: [],
        assignedTo: currentUser.uid,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    try {
        // Add task to user data
        if (!userData.tasks) userData.tasks = [];
        userData.tasks.push(taskData);
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            tasks: userData.tasks
        });
        
        // Add to activity log
        addActivityLog('task_created', taskData.id);
        
        // Update UI
        console.log('🔄 Updating UI...');
        console.log('📊 Current userData.tasks:', userData.tasks);
        
        updateDashboardCounts();
        renderRecentTasks();
        renderAllTasks(); // Task sekmesini de güncelle
        
        console.log('✅ UI updated successfully');
        
        // Close modal and show success
        closeModal('addTaskModal');
        showStatus('Task added successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to add task:', error);
        showStatus('Failed to add task: ' + error.message, 'error');
    }
}

// Handle add project
async function handleAddProject(event) {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add projects', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const projectData = {
        id: generateId(),
        title: formData.get('projectTitle') || document.getElementById('projectTitle').value,
        description: formData.get('projectDescription') || document.getElementById('projectDescription').value,
        color: document.getElementById('projectColor').value,
        progress: parseFloat(formData.get('projectProgress') || 0) / 100, // Store as 0-1
        createdAt: new Date().toISOString(),
        members: [currentUser.uid],
        status: 'active'
    };

    try {
        // Add project to user data
        if (!userData.projects) userData.projects = [];
        userData.projects.push(projectData);
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            projects: userData.projects
        });
        
        // Add to activity log
        addActivityLog('project_created', projectData.id);
        
        // Update UI
        updateDashboardCounts();
        renderProjects(); // Projects sekmesini de güncelle
        
        // Close modal and show success
        closeModal('addProjectModal');
        showStatus('Project added successfully!', 'success');

    } catch (error) {
        console.error('Failed to add project:', error);
        showStatus('Failed to add project: ' + error.message, 'error');
    }
}

// Handle add daily task
async function handleAddDailyTask(event) {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add daily tasks', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const dailyTaskData = {
        id: generateId(),
        title: formData.get('dailyTaskTitle') || document.getElementById('dailyTaskTitle').value,
        description: formData.get('dailyTaskDescription') || document.getElementById('dailyTaskDescription').value,
        category: formData.get('dailyTaskCategory') || document.getElementById('dailyTaskCategory').value,
        status: 'active',
        streak: 0,
        lastCompleted: null,
        schedule: {
            recurrence: {
                type: 'weekly',
                days: Array.from(document.getElementById('dailyTaskDays').selectedOptions).map(option => option.value),
                time: document.getElementById('dailyTaskTime').value,
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            },
            reminder: {
                enable: true,
                methods: ['push'],
                advanceMinutes: 15
            }
        },
        progress: {
            completedDates: [],
            currentStreak: 0,
            longestStreak: 0
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    try {
        // Add daily task to user data
        if (!userData.dailyTasks) userData.dailyTasks = [];
        userData.dailyTasks.push(dailyTaskData);
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            dailyTasks: userData.dailyTasks
        });
        
        // Add to activity log
        addActivityLog('daily_task_created', dailyTaskData.id);
        
        // Update UI
        updateDashboardCounts();
        renderDailyTasks();
        
        // Close modal and show success
        closeModal('addDailyTaskModal');
        showStatus('Daily task added successfully!', 'success');

    } catch (error) {
        console.error('Failed to add daily task:', error);
        showStatus('Failed to add daily task: ' + error.message, 'error');
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get today's date in YYYY-MM-DD format for HTML date input
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Convert date to DD-MM-YYYY format for display
function formatDateForDisplay(dateString) {
    if (!dateString) return 'No date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

// Format date for display with status
function formatDate(dateString) {
    if (!dateString) return 'No due date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Format as dd-mm-yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    if (diffDays < 0) {
        return `${formattedDate} (${Math.abs(diffDays)} days overdue)`;
    } else if (diffDays === 0) {
        return `${formattedDate} (Due today)`;
    } else if (diffDays === 1) {
        return `${formattedDate} (Due tomorrow)`;
            } else {
        return `${formattedDate} (Due in ${diffDays} days)`;
    }
}

// Format date range for display
function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) return 'No dates set';
    
    if (startDate && endDate) {
        // Both dates exist - show duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Same day`;
        } else if (diffDays === 1) {
            return `1 day`;
        } else {
            return `${diffDays} days`;
        }
    } else if (startDate) {
        // Only start date exists - show relative time to start
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const diffTime = start - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Starts: Today`;
        } else if (diffDays === 1) {
            return `Starts: Tomorrow`;
        } else if (diffDays > 1) {
            return `Starts: In ${diffDays} days`;
        } else {
            return `Starts: ${Math.abs(diffDays)} days ago`;
        }
    } else if (endDate) {
        // Only end date exists - show relative time to due date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return `Due: Today`;
        } else if (diffDays === 1) {
            return `Due: Tomorrow`;
        } else if (diffDays > 1) {
            return `Due: In ${diffDays} days`;
        } else {
            return `Due: ${Math.abs(diffDays)} days ago`;
        }
    }
    
    return 'No dates set';
}

// Format days array to readable text
function formatDays(days) {
    if (!days || days.length === 0) return getText('dailyTasks.noDays');
    
    const dayNames = {
        'mon': getText('dailyTasks.monday').charAt(0),
        'tue': getText('dailyTasks.tuesday').charAt(0), 
        'wed': getText('dailyTasks.wednesday').charAt(0),
        'thu': getText('dailyTasks.thursday').charAt(0),
        'fri': getText('dailyTasks.friday').charAt(0),
        'sat': getText('dailyTasks.saturday').charAt(0),
        'sun': getText('dailyTasks.sunday').charAt(0)
    };
    
    // Return individual day tags with single letter abbreviations
    return days.map(day => `<span class="day-tag">${dayNames[day] || day}</span>`).join('');
}

// Get next active day for daily tasks
function getNextActiveDay(selectedDays) {
    if (!selectedDays || selectedDays.length === 0) return getText('dailyTasks.noDaysSelected');
    
    const today = window.getDebugTime ? window.getDebugTime() : new Date(); // Use debug time if available
    const todayDay = today.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    
    // Find today's position in the week
    const dayOrder = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const todayIndex = dayOrder.indexOf(todayDay);
    
    // Sort selected days by week order
    const sortedDays = selectedDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    
    // Find next active day (could be today if it's in the list)
    let nextDay = null;
    
    // First check if today is in the list
    if (selectedDays.includes(todayDay)) {
        return getText('dates.today');
    }
    
    // Find next day in current week
    for (let i = 0; i < sortedDays.length; i++) {
        const dayIndex = dayOrder.indexOf(sortedDays[i]);
        if (dayIndex > todayIndex) {
            nextDay = sortedDays[i];
            break;
        }
    }
    
    // If no next day in current week, get first day of next week
    if (!nextDay) {
        nextDay = sortedDays[0];
        }
    
    // Convert to readable format
    const dayNames = {
        'mon': getText('dailyTasks.monday'),
        'tue': getText('dailyTasks.tuesday'), 
        'wed': getText('dailyTasks.wednesday'),
        'thu': getText('dailyTasks.thursday'),
        'fri': getText('dailyTasks.friday'),
        'sat': getText('dailyTasks.saturday'),
        'sun': getText('dailyTasks.sunday')
    };
    
    return dayNames[nextDay] || nextDay;
}

// Calculate current streak for daily tasks
function calculateCurrentStreak(completedDates) {
    if (!completedDates || completedDates.length === 0) return 0;
    
    // Sort dates in descending order (most recent first)
    const sortedDates = completedDates.sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    const today = window.getDebugTime ? window.getDebugTime() : new Date(); // Use debug time if available
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    for (let i = 0; i < sortedDates.length; i++) {
        const completedDate = new Date(sortedDates[i]);
        completedDate.setHours(0, 0, 0, 0);
        
        // Check if this is a consecutive day
        if (i === 0) {
            // First date (most recent) - check if it's today or yesterday
            const diffTime = today - completedDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 1) {
                streak = 1;
            } else {
                break; // Gap is too large, no streak
            }
        } else {
            // Check if this date is consecutive to the previous one
            const prevDate = new Date(sortedDates[i - 1]);
            prevDate.setHours(0, 0, 0, 0);
            
            const diffTime = prevDate - completedDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
                streak++;
    } else {
                break; // Gap found, streak ends
            }
        }
    }
    
    return streak;
}

// Debug functions are now imported from debug.js

// Setup date inputs with default values
function setupDateInputs() {
    const todayString = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
    
    // Set default values for date inputs
    const dueDateInput = document.getElementById('taskDueDate');
    if (dueDateInput) {
        dueDateInput.value = todayString;
        dueDateInput.setAttribute('required', 'required'); // Single date is required by default
        setupDateInputListener(dueDateInput);
    }
    
    const startDateInput = document.getElementById('taskStartDate');
    if (startDateInput) {
        startDateInput.value = todayString;
        // Start date is not required initially
        setupDateInputListener(startDateInput);
    }
    
    const endDateInput = document.getElementById('taskEndDate');
    if (endDateInput) {
        endDateInput.value = todayString;
        // End date is not required initially
        setupDateInputListener(endDateInput);
    }
}

// Setup date input event listeners
function setupDateInputListener(inputElement) {
    // Add event listener to format display
    inputElement.addEventListener('change', function() {
        if (this.value) {
            this.setAttribute('data-formatted', formatDateForDisplay(this.value));
        }
    });
    
    // Add event listener to input event for real-time formatting
    inputElement.addEventListener('input', function() {
        if (this.value) {
            this.setAttribute('data-formatted', formatDateForDisplay(this.value));
        }
    });
}

// Toggle date input visibility based on task type
function toggleTaskDateInputs() {
    const taskType = document.getElementById('taskType').value;
    const singleDateRow = document.getElementById('singleDateRow');
    const dateRangeRow = document.getElementById('dateRangeRow');
    const todayString = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
    
    // Calculate tomorrow's date for end date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowString = tomorrow.toISOString().split('T')[0];
    
    if (taskType === 'single') {
        singleDateRow.style.display = 'flex';
        dateRangeRow.style.display = 'none';
        
        // Set single date to today and make it required
        const dueDateInput = document.getElementById('taskDueDate');
        dueDateInput.value = todayString;
        dueDateInput.setAttribute('required', 'required');
        
        // Set range dates as well (for consistency and easy switching)
        const startDateInput = document.getElementById('taskStartDate');
        const endDateInput = document.getElementById('taskEndDate');
        startDateInput.value = todayString;
        endDateInput.value = tomorrowString;
        startDateInput.setAttribute('required', 'required');
        endDateInput.setAttribute('required', 'required');
        
    } else {
        singleDateRow.style.display = 'none';
        dateRangeRow.style.display = 'flex';
        
        // Set range dates - start to today, end to tomorrow
        const startDateInput = document.getElementById('taskStartDate');
        const endDateInput = document.getElementById('taskEndDate');
        startDateInput.value = todayString;
        endDateInput.value = tomorrowString;
        startDateInput.setAttribute('required', 'required');
        endDateInput.setAttribute('required', 'required');
        
        // Clear single input and remove required
        const dueDateInput = document.getElementById('taskDueDate');
        dueDateInput.value = '';
        dueDateInput.removeAttribute('required');
    }
}

// Add activity log entry
async function addActivityLog(action, description, taskId = null) {
    const activityEntry = {
        action: action,
        description: description,
        taskId: taskId,
        timestamp: new Date().toISOString()
    };

    try {
        if (!userData.activityLog) userData.activityLog = [];
        userData.activityLog.push(activityEntry);
        
        // Keep only last 100 activities
        if (userData.activityLog.length > 100) {
            userData.activityLog = userData.activityLog.slice(-100);
        }
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            activityLog: userData.activityLog
        });
        
    } catch (error) {
        console.error('Failed to add activity log:', error);
    }
}

// Task management functions
async function completeTask(taskId) {
    event.stopPropagation();

    try {
        const task = userData.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'completed';
            task.completedAt = new Date().toISOString();
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                tasks: userData.tasks
            });
            
            // Add to activity log
            addActivityLog('task_completed', 'Task completed', taskId);
            
            // Update UI
            updateDashboardCounts();
            renderRecentTasks();
            renderAllTasks(); // Task sekmesini de güncelle
            
            // If task details modal is open, refresh it with updated data
            const taskDetailsModal = document.getElementById('taskDetailsModal');
            if (taskDetailsModal && taskDetailsModal.style.display !== 'none') {
                showTaskDetails(task);
            }
            
            showStatus('Task completed!', 'success');
        }
    } catch (error) {
        console.error('Failed to complete task:', error);
        showStatus('Failed to complete task: ' + error.message, 'error');
    }
}

async function uncompleteTask(taskId) {
    event.stopPropagation();
    
    try {
        const task = userData.tasks.find(t => t.id === taskId);
        if (task) {
            task.status = 'active';
            task.completedAt = null;
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                tasks: userData.tasks
            });
            
            // Add to activity log
            addActivityLog('task_uncompleted', 'Task uncompleted', taskId);
            
            // Update UI
            updateDashboardCounts();
            renderRecentTasks();
            renderAllTasks(); // Task sekmesini de güncelle
            
            // If task details modal is open, refresh it with updated data
            const taskDetailsModal = document.getElementById('taskDetailsModal');
            if (taskDetailsModal && taskDetailsModal.style.display !== 'none') {
                showTaskDetails(task);
            }
            
            showStatus('Task uncompleted!', 'info');
        }
    } catch (error) {
        console.error('Failed to uncomplete task:', error);
        showStatus('Failed to uncomplete task: ' + error.message, 'error');
    }
}



async function deleteTask(taskId) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            // Remove task from user data
            userData.tasks = userData.tasks.filter(t => t.id !== taskId);
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                tasks: userData.tasks
            });
            
            // Add to activity log
            addActivityLog('task_deleted', taskId);
            
            // Update UI
            updateDashboardCounts();
            renderRecentTasks();
            renderAllTasks(); // Task sekmesini de güncelle
            
            // Close task details modal if it's open
            const taskDetailsModal = document.getElementById('taskDetailsModal');
            if (taskDetailsModal && taskDetailsModal.style.display !== 'none') {
                closeModal('taskDetailsModal');
            }
            
            showStatus('Task deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete task:', error);
            showStatus('Failed to delete task: ' + error.message, 'error');
        }
    }
}

// Project management functions
async function editProject(projectId) {
    try {
        const project = userData.projects.find(p => p.id === projectId);
        if (project) {
            // Populate edit form
            document.getElementById('editProjectId').value = project.id;
            document.getElementById('editProjectTitle').value = project.title;
            document.getElementById('editProjectDescription').value = project.description || '';
            document.getElementById('editProjectColor').value = project.color || '#3AA8FF';
            
            // Populate progress field (convert from 0-1 to 0-100)
            const progressInput = document.getElementById('editProjectProgress');
            const progressDisplay = document.getElementById('editProgressValue');
            if (progressInput && progressDisplay) {
                const progressPercentage = Math.round((project.progress || 0) * 100);
                progressInput.value = progressPercentage;
                progressDisplay.textContent = progressPercentage + '%';
                
                console.log('🔧 Progress Population Debug:');
                console.log('  - Original progress:', project.progress);
                console.log('  - Calculated percentage:', progressPercentage);
                console.log('  - Input value set to:', progressInput.value);
                console.log('  - Display text set to:', progressDisplay.textContent);
                
                // Setup progress bar for edit modal
                setupProgressBar('editProjectProgress', 'editProgressValue');
            } else {
                console.log('❌ Progress elements not found:');
                console.log('  - progressInput:', progressInput);
                console.log('  - progressDisplay:', progressDisplay);
            }
            
            // Show edit modal
            const modal = document.getElementById('editProjectModal');
            if (modal) {
                modal.style.display = 'flex';
                // Add show class for animation
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                console.log('✅ Edit Project Modal displayed with show class');
            } else {
                console.log('❌ Edit Project Modal element not found');
            }
            
            // Setup progress bar for edit modal
            setupProgressBar('editProjectProgress', 'editProgressValue');
            
            // Setup form validation (this will handle the submit event)
            setupFormValidation('editProjectForm', handleEditProject);
        }
    } catch (error) {
        console.error('Failed to edit project:', error);
        showStatus('Failed to edit project: ' + error.message, 'error');
    }
}

// Handle edit project form submission
async function handleEditProject(event) {
    console.log('🚀 handleEditProject called with event:', event);
    event.preventDefault();
    
    try {
        const projectId = document.getElementById('editProjectId').value;
        const project = userData.projects.find(p => p.id === projectId);
        
        if (!project) {
            showStatus('Project not found', 'error');
                return;
        }
        
        // Update project data
        project.title = document.getElementById('editProjectTitle').value;
        project.description = document.getElementById('editProjectDescription').value;
        project.color = document.getElementById('editProjectColor').value;
        
        // Update progress (convert from 0-100 to 0-1)
        const progressInput = document.getElementById('editProjectProgress');
        console.log('🔧 Progress Update Debug - Step 1:');
        console.log('  - Progress input element:', progressInput);
        console.log('  - Progress input found:', !!progressInput);
        
        if (progressInput) {
            const progressValue = parseFloat(progressInput.value || 0);
            const oldProgress = project.progress;
            project.progress = progressValue / 100;
            
            console.log('🔧 Progress Update Debug - Step 2:');
            console.log('  - Input value:', progressInput.value);
            console.log('  - Parsed value:', progressValue);
            console.log('  - Old progress:', oldProgress);
            console.log('  - New progress:', project.progress);
            console.log('  - Project object before update:', JSON.stringify(project, null, 2));
            
            // Verify the project object reference
            console.log('🔧 Object Reference Debug:');
            console.log('  - Project object reference:', project);
            console.log('  - Project in userData.projects:', userData.projects.find(p => p.id === projectId));
            console.log('  - Are they the same object?', project === userData.projects.find(p => p.id === projectId));
        } else {
            console.log('❌ editProjectProgress input not found!');
            console.log('  - Available inputs:', Array.from(document.querySelectorAll('input')).map(i => ({id: i.id, name: i.name, type: i.type})));
        }
        
        // Update Firestore
        console.log('🔧 Firestore Update Debug - Before Update:');
        console.log('  - userData.projects:', JSON.stringify(userData.projects, null, 2));
        console.log('  - Project to update:', JSON.stringify(project, null, 2));
        
        const updateResult = await db.collection('user_data').doc(currentUser.uid).update({
            projects: userData.projects
        });
        
        console.log('🔧 Firestore Update Debug - After Update:');
        console.log('  - Update result:', updateResult);
        
        // Verify the update by reading back from Firestore
        try {
            const docRef = db.collection('user_data').doc(currentUser.uid);
            const docSnap = await docRef.get();
            if (docSnap && docSnap.exists) {
                const updatedData = docSnap.data();
                console.log('🔧 Firestore Verification:');
                console.log('  - Updated projects in Firestore:', JSON.stringify(updatedData.projects, null, 2));
                console.log('  - Our local projects:', JSON.stringify(userData.projects, null, 2));
            } else {
                console.log('🔧 Firestore Verification: Document not found or invalid snapshot');
            }
        } catch (verificationError) {
            console.log('🔧 Firestore Verification: Error during verification:', verificationError);
        }
        
        // Add to activity log
        addActivityLog('project_edited', projectId);
        
        // Update UI
        console.log('🔧 UI Update Debug:');
        console.log('  - Project progress after update:', project.progress);
        console.log('  - All projects:', userData.projects.map(p => ({id: p.id, title: p.title, progress: p.progress})));
        
        // Verify the project object is still in userData.projects
        const updatedProject = userData.projects.find(p => p.id === projectId);
        console.log('🔧 Verification Debug:');
        console.log('  - Updated project in userData.projects:', updatedProject);
        console.log('  - Progress value in updated project:', updatedProject?.progress);
        
        updateDashboardCounts();
        renderRecentTasks();
        renderProjects();
        
        console.log('  - UI updated, checking if progress bar reflects new value...');
        
        // Close modal
        closeModal('editProjectModal');
        
        showStatus('Project updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update project:', error);
        showStatus('Failed to update project: ' + error.message, 'error');
    }
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? All associated tasks will be unassigned.')) {
        try {
            // Remove project from user data
            userData.projects = userData.projects.filter(p => p.id !== projectId);
            
            // Unassign tasks from this project
            userData.tasks.forEach(task => {
            if (task.projectId === projectId) {
                    task.projectId = null;
                }
            });
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                projects: userData.projects,
                tasks: userData.tasks
            });
            
            // Add to activity log
            addActivityLog('project_deleted', projectId);
            
            // Update UI
            updateDashboardCounts();
            renderRecentTasks();
            renderProjects(); // Projects sekmesini de güncelle
            
            showStatus('Project deleted successfully!', 'success');
    } catch (error) {
            console.error('Failed to delete project:', error);
            showStatus('Failed to delete project: ' + error.message, 'error');
        }
    }
}

// Daily task management functions
async function completeDailyTask(dailyTaskId) {
    try {
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        if (dailyTask) {
            const today = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
            
            // Safely handle progress field - provide defaults if missing
            if (!dailyTask.progress) {
                dailyTask.progress = {
                    completedDates: [],
                    currentStreak: dailyTask.streak || 0,
                    longestStreak: dailyTask.streak || 0
                };
            }
            
            if (!dailyTask.progress.completedDates.includes(today)) {
                dailyTask.progress.completedDates.push(today);
                
                // Calculate current streak based on consecutive completed days
                dailyTask.progress.currentStreak = calculateCurrentStreak(dailyTask.progress.completedDates);
                
                if (dailyTask.progress.currentStreak > dailyTask.progress.longestStreak) {
                    dailyTask.progress.longestStreak = dailyTask.progress.currentStreak;
                }
                
                // Update Firestore
                await db.collection('user_data').doc(currentUser.uid).update({
                    dailyTasks: userData.dailyTasks
                });
                
                // Add to activity log
                addActivityLog('daily_task_completed', dailyTaskId);
                
                // Update UI
                updateDashboardCounts();
                renderDailyTasks(); // Daily tasks sekmesini de güncelle
                
                showStatus('Daily task completed for today!', 'success');
            } else {
                showStatus('Task already completed for today!', 'info');
            }
        }
    } catch (error) {
        console.error('Failed to complete daily task:', error);
        showStatus('Failed to complete daily task: ' + error.message, 'error');
    }
}

async function uncompleteDailyTask(dailyTaskId) {
    try {
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        if (dailyTask) {
            const today = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
            
            // Safely handle progress field - provide defaults if missing
            if (!dailyTask.progress) {
                dailyTask.progress = {
                    completedDates: [],
                    currentStreak: dailyTask.streak || 0,
                    longestStreak: dailyTask.streak || 0
                };
            }
        
            if (dailyTask.progress.completedDates.includes(today)) {
                dailyTask.progress.completedDates = dailyTask.progress.completedDates.filter(date => date !== today);
                
                // Recalculate current streak after removing today
                dailyTask.progress.currentStreak = calculateCurrentStreak(dailyTask.progress.completedDates);
                
                // Update Firestore
                await db.collection('user_data').doc(currentUser.uid).update({
                    dailyTasks: userData.dailyTasks
                });
                
                // Add to activity log
                addActivityLog('daily_task_uncompleted', dailyTaskId);
                
                // Update UI
                updateDashboardCounts();
                renderDailyTasks(); // Daily tasks sekmesini güncelle
                showStatus('Daily task uncompleted for today!', 'info');
            } else {
                showStatus('Task not completed for today!', 'info');
            }
        }
    }
    catch (error) {
        console.error('Failed to uncomplete daily task:', error);
        showStatus('Failed to uncomplete daily task: ' + error.message, 'error');
    }
}



// Edit daily task function
async function editDailyTask(dailyTaskId) {
    try {
        // Check if userData and dailyTasks exist
        if (!userData || !userData.dailyTasks) {
            showStatus('Daily tasks data not available', 'error');
            return;
        }
        
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        if (dailyTask) {
            console.log('Editing daily task:', dailyTask); // Debug log
            
            // Populate edit form
            document.getElementById('editDailyTaskId').value = dailyTask.id;
            document.getElementById('editDailyTaskTitle').value = dailyTask.title;
            document.getElementById('editDailyTaskDescription').value = dailyTask.description || '';
            document.getElementById('editDailyTaskCategory').value = dailyTask.category || '';
            
            // Safely handle time field
            const taskTime = (dailyTask.schedule && dailyTask.schedule.recurrence && dailyTask.schedule.recurrence.time) || 
                           dailyTask.time || 
                           '08:00';
            document.getElementById('editDailyTaskTime').value = taskTime;
            
            // Set selected days
            const daysSelect = document.getElementById('editDailyTaskDays');
            if (daysSelect) {
                // Clear all selections first
                Array.from(daysSelect.options).forEach(option => {
                    option.selected = false;
                });
                
                // Safely handle days field
                const scheduleDays = (dailyTask.schedule && dailyTask.schedule.recurrence && dailyTask.schedule.recurrence.days) || 
                                   dailyTask.days || 
                                   [];
                
                if (scheduleDays.length > 0) {
                    Array.from(daysSelect.options).forEach(option => {
                        option.selected = scheduleDays.includes(option.value);
                    });
                }
            }
            
            // Show edit modal
            const modal = document.getElementById('editDailyTaskModal');
            if (modal) {
                modal.style.display = 'flex';
                // Add show class for animation
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                console.log('✅ Edit Daily Task Modal displayed with show class');
            } else {
                console.log('❌ Edit Daily Task Modal element not found');
            }
            
            // Setup form validation
            setupFormValidation('editDailyTaskForm', handleEditDailyTask);
        } else {
            showStatus('Daily task not found', 'error');
        }
    } catch (error) {
        console.error('Failed to edit daily task:', error);
        showStatus('Failed to edit daily task: ' + error.message, 'error');
    }
}

// Handle edit daily task form submission
async function handleEditDailyTask(event) {
    event.preventDefault();
    
    try {
        // Check if userData and dailyTasks exist
        if (!userData || !userData.dailyTasks) {
            showStatus('Daily tasks data not available', 'error');
            return;
        }
        
        const dailyTaskId = document.getElementById('editDailyTaskId').value;
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        
        if (!dailyTask) {
            showStatus('Daily task not found', 'error');
            return;
        }
        
        console.log('Updating daily task:', dailyTask); // Debug log
        
        // Update daily task data
        dailyTask.title = document.getElementById('editDailyTaskTitle').value;
        dailyTask.description = document.getElementById('editDailyTaskDescription').value;
        dailyTask.category = document.getElementById('editDailyTaskCategory').value;
        
        // Safely handle schedule field
        if (!dailyTask.schedule) {
            dailyTask.schedule = {
                recurrence: {
                    type: 'weekly',
                    days: [],
                    time: '08:00',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                reminder: {
                    enable: true,
                    methods: ['push'],
                    advanceMinutes: 15
                }
            };
        }
        
        if (!dailyTask.schedule.recurrence) {
            dailyTask.schedule.recurrence = {
                type: 'weekly',
                days: [],
                time: '08:00',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }
        
        dailyTask.schedule.recurrence.time = document.getElementById('editDailyTaskTime').value;
        
        // Update selected days
        const daysSelect = document.getElementById('editDailyTaskDays');
        if (daysSelect) {
            dailyTask.schedule.recurrence.days = Array.from(daysSelect.selectedOptions).map(option => option.value);
        }
        
        // Update timestamps
        dailyTask.updatedAt = new Date().toISOString();
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            dailyTasks: userData.dailyTasks
        });
        
        // Add to activity log
        addActivityLog('daily_task_edited', dailyTaskId);
        
        // Update UI
        updateDashboardCounts();
        renderDailyTasks();
        
        // Close modal
        closeModal('editDailyTaskModal');
        
        showStatus('Daily task updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update daily task:', error);
        showStatus('Failed to update daily task: ' + error.message, 'error');
    }
}

// Toggle daily task status (active/inactive)
async function toggleDailyTaskStatus(dailyTaskId) {
    try {
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        if (!dailyTask) {
            showStatus('Daily task not found', 'error');
            return;
        }
        
        // Toggle status
        dailyTask.status = dailyTask.status === 'active' ? 'inactive' : 'active';
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            dailyTasks: userData.dailyTasks
        });
        
        // Add to activity log
        addActivityLog('daily_task_status_toggled', dailyTaskId);
        
        // Update UI
        updateDashboardCounts();
        renderDailyTasks();
        
        const statusText = dailyTask.status === 'active' ? 'activated' : 'deactivated';
        showStatus(`Daily task ${statusText} successfully!`, 'success');
        
    } catch (error) {
        console.error('Failed to toggle daily task status:', error);
        showStatus('Failed to toggle daily task status: ' + error.message, 'error');
    }
}

// Delete daily task
async function deleteDailyTask(dailyTaskId) {
    if (confirm('Are you sure you want to delete this daily task?')) {
        try {
            // Remove daily task from user data
            userData.dailyTasks = userData.dailyTasks.filter(dt => dt.id !== dailyTaskId);
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                dailyTasks: userData.dailyTasks
            });
            
            // Add to activity log
            addActivityLog('daily_task_deleted', dailyTaskId);
            
            // Update UI
            updateDashboardCounts();
            renderDailyTasks(); // Daily tasks sekmesini güncelle
            
            showStatus('Daily task deleted successfully!', 'success');
        } catch (error) {
            console.error('Failed to delete daily task:', error);
            showStatus('Failed to delete daily task: ' + error.message, 'error');
        }
    }
}

// Profile and preferences functions
async function updateProfile(event) {
    event.preventDefault();
    
    try {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const bio = document.getElementById('profileBio').value;
        
        userData.profile.name = name;
        userData.profile.email = email;
        userData.profile.bio = bio;
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            profile: userData.profile
        });
        
        // Update UI
        updateUserInfo();
        
        showStatus('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update profile:', error);
        showStatus('Failed to update profile: ' + error.message, 'error');
    }
}

async function updatePreferences(event) {
    event.preventDefault();
    
    try {
        const theme = document.getElementById('prefTheme').value;
        const language = document.getElementById('prefLanguage').value;
        const reminderTime = document.getElementById('prefReminderTime').value;
        
        userData.preferences.theme = theme;
        userData.preferences.language = language;
        userData.preferences.notificationSettings.reminderTime = reminderTime;
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            preferences: userData.preferences
        });
        
        showStatus('Preferences updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update preferences:', error);
        showStatus('Failed to update preferences: ' + error.message, 'error');
    }
}

// Show task details
function showTaskDetails(task) {
    const modal = document.getElementById('taskDetailsModal');
    const title = document.getElementById('taskDetailsTitle');
    const content = document.getElementById('taskDetailsContent');
    
    title.textContent = task.title;
    
    const projectName = getProjectName(task.projectId);
    const projectColor = getProjectColor(task.projectId);
    
    content.innerHTML = `
        <div class="dashboard-card ${task.status === 'completed' ? 'completed-task' : ''}">
            <div class="task-header">
                <div>
                    <div class="task-title ${task.status === 'completed' ? 'completed' : ''}">${task.title}</div>
                    <div class="task-priority ${getPriorityClass(task.priority)}">${getPriorityText(task.priority)}</div>
                </div>
            </div>
            <div class="task-description">${task.description || 'No description'}</div>
            <div class="task-meta">
                <div class="task-project">
                    <div class="project-color" style="background-color: ${projectColor}"></div>
                    <span>${projectName || 'No Project'}</span>
                </div>
                <div class="task-dates">
                    ${task.taskType === 'range' ? 
                        `<span>Period: ${formatDate(task.startDate)} - ${formatDate(task.endDate)}</span>` :
                        `<span>Due: ${formatDate(task.dueDate)}</span>`
                    }
                </div>
            </div>
            ${task.labels && task.labels.length > 0 ? `
                <div class="task-labels">
                    <strong>Labels:</strong> ${task.labels.map(label => `<span class="label">${label}</span>`).join(' ')}
                </div>
            ` : ''}
            <div class="task-info">
                <div class="task-detail-item">
                    <div class="task-detail-label">Status</div>
                    <div class="task-detail-value">${task.status === 'completed' ? 'Completed' : 'Active'}</div>
                </div>
                <div class="task-detail-item">
                    <div class="task-detail-label">Created</div>
                    <div class="task-detail-value">${formatDate(task.createdAt || task.dueDate)}</div>
                </div>
                ${task.updatedAt ? `
                    <div class="task-detail-item">
                        <div class="task-detail-label">Last Updated</div>
                        <div class="task-detail-value">${formatDate(task.updatedAt)}</div>
                    </div>
                ` : ''}
            </div>
            <div class="task-actions">
                ${task.status === 'completed' ? 
                    `<button class="action-btn btn-uncomplete" onclick="uncompleteTask('${task.id}')">Undo Complete</button>` :
                    `<button class="action-btn btn-complete" onclick="completeTask('${task.id}')">Complete</button>`
                }
                <button class="action-btn btn-edit" onclick="editTask('${task.id}')">Edit</button>
                <button class="delete-btn btn-delete" onclick="deleteTask('${task.id}')">Delete</button>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
}



// Toggle edit task date inputs
function toggleEditTaskDateInputs() {
    const taskType = document.getElementById('editTaskType').value;
    const singleDateRow = document.getElementById('editSingleDateRow');
    const dateRangeRow = document.getElementById('editDateRangeRow');
    
    if (taskType === 'single') {
        singleDateRow.style.display = 'flex';
        dateRangeRow.style.display = 'none';
        
        // Set required attributes - due date required for single tasks
        document.getElementById('editTaskDueDate').setAttribute('required', 'required');
        // Start and end dates are always available but not required for single tasks
        document.getElementById('editTaskStartDate').removeAttribute('required');
        document.getElementById('editTaskEndDate').removeAttribute('required');
    } else {
        singleDateRow.style.display = 'none';
        dateRangeRow.style.display = 'flex';
        
        // Set required attributes - start and end dates required for range tasks
        document.getElementById('editTaskDueDate').removeAttribute('required');
        document.getElementById('editTaskStartDate').setAttribute('required', 'required');
        document.getElementById('editTaskEndDate').setAttribute('required', 'required');
    }
}

// Edit task function
function editTask(taskId) {
    const task = userData.tasks.find(t => t.id === taskId);
    if (!task) {
        showStatus('Task not found', 'error');
        return;
    }
    
    // Populate project select first
    populateProjectSelect('editTaskProject');
    
    // Populate form fields
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description || '';
    document.getElementById('editTaskType').value = task.taskType || 'single';
    document.getElementById('editTaskProject').value = task.projectId || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskLabels').value = task.labels ? task.labels.join(', ') : '';
    
    // Set dates - always populate start and end dates
    console.log('🔍 Task type:', task.taskType);
    console.log('🔍 Task dates - startDate:', task.startDate, 'endDate:', task.endDate, 'dueDate:', task.dueDate);
    
    // Always set start and end dates if they exist
    document.getElementById('editTaskStartDate').value = task.startDate || '';
    document.getElementById('editTaskEndDate').value = task.endDate || '';
    
    // Set due date for single tasks
    if (task.taskType === 'single') {
        document.getElementById('editTaskDueDate').value = task.dueDate || '';
    } else {
        document.getElementById('editTaskDueDate').value = '';
    }
    
    console.log('✅ Task dates set - startDate:', task.startDate, 'endDate:', task.endDate, 'dueDate:', task.dueDate);
    
    // Toggle date input visibility
    toggleEditTaskDateInputs();
    
    // Setup form validation
    setupFormValidation('editTaskForm', handleEditTask);
    
    // Show modal
    const modal = document.getElementById('editTaskModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add show class for animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        console.log('✅ Edit Task Modal displayed with show class');
    } else {
        console.log('❌ Edit Task Modal element not found');
    }
}







// Handle edit daily task form submission
async function handleEditDailyTask(event) {
    event.preventDefault();
    
    try {
        const dailyTaskId = document.getElementById('editDailyTaskId').value;
        const dailyTask = userData.dailyTasks.find(dt => dt.id === dailyTaskId);
        
        if (!dailyTask) {
            showStatus('Daily task not found', 'error');
            return;
        }
    
        // Update daily task data
        dailyTask.title = document.getElementById('editDailyTaskTitle').value;
        dailyTask.description = document.getElementById('editDailyTaskDescription').value;
        dailyTask.category = document.getElementById('editDailyTaskCategory').value;
        
        // Safely handle schedule field
        if (!dailyTask.schedule) {
            dailyTask.schedule = {
                recurrence: {
                    type: 'weekly',
                    days: [],
                    time: '08:00',
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
                },
                reminder: {
                    enable: true,
                    methods: ['push'],
                    advanceMinutes: 15
                }
            };
        }
        
        if (!dailyTask.schedule.recurrence) {
            dailyTask.schedule.recurrence = {
                type: 'weekly',
                days: [],
                time: '08:00',
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
            };
        }
        
        dailyTask.schedule.recurrence.time = document.getElementById('editDailyTaskTime').value;
        
        // Update selected days
        const daysSelect = document.getElementById('editDailyTaskDays');
        if (daysSelect) {
            dailyTask.schedule.recurrence.days = Array.from(daysSelect.selectedOptions).map(option => option.value);
        }
        
        // Update timestamps
        dailyTask.updatedAt = new Date().toISOString();
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            dailyTasks: userData.dailyTasks
        });
        
        // Add to activity log
        addActivityLog('daily_task_edited', dailyTaskId);
        
        // Update UI
        updateDashboardCounts();
        renderDailyTasks();
        
        // Close modal
        closeModal('editDailyTaskModal');
        
        showStatus('Daily task updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update daily task:', error);
        showStatus('Failed to update daily task: ' + error.message, 'error');
    }
}

// Handle edit task form submission
async function handleEditTask(event) {
    event.preventDefault();
    
    try {
        const taskId = document.getElementById('editTaskId').value;
        const task = userData.tasks.find(t => t.id === taskId);
        
        if (!task) {
            showStatus('Task not found', 'error');
            return;
        }
        
        // Update task data
        task.title = document.getElementById('editTaskTitle').value;
        task.description = document.getElementById('editTaskDescription').value;
        task.taskType = document.getElementById('editTaskType').value;
        task.projectId = document.getElementById('editTaskProject').value || null;
        task.priority = document.getElementById('editTaskPriority').value;
        task.labels = document.getElementById('editTaskLabels').value ? 
            document.getElementById('editTaskLabels').value.split(',').map(l => l.trim()) : [];
        
        // Update dates - always save start and end dates
        console.log('🔍 Updating task dates - taskType:', task.taskType);
        
        const startDate = document.getElementById('editTaskStartDate').value;
        const endDate = document.getElementById('editTaskEndDate').value;
        const dueDate = document.getElementById('editTaskDueDate').value;
        
        // Always save start and end dates
        task.startDate = startDate;
        task.endDate = endDate;
        
        // Save due date for single tasks
        if (task.taskType === 'single') {
            task.dueDate = dueDate;
        } else {
            task.dueDate = null;
        }
        
        console.log('✅ Task dates updated - startDate:', startDate, 'endDate:', endDate, 'dueDate:', dueDate);
        
        // Add updated timestamp
        task.updatedAt = new Date().toISOString();
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            tasks: userData.tasks
        });
        
        // Add to activity log
        addActivityLog('task_edited', taskId);
        
        // Update UI
        updateDashboardCounts();
        renderRecentTasks();
        renderAllTasks();
        
        // Close edit modal
        closeModal('editTaskModal');
        
        // If task details modal is open, refresh it with updated data
        const taskDetailsModal = document.getElementById('taskDetailsModal');
        if (taskDetailsModal && taskDetailsModal.style.display !== 'none') {
            showTaskDetails(task);
        }
        
        showStatus('Task updated successfully!', 'success');
        
        // Prevent any default navigation
        return false;
    } catch (error) {
        console.error('Failed to update task:', error);
        showStatus('Failed to update task: ' + error.message, 'error');
        return false;
    }
}

// Loading Screen Functions
function showLoadingScreen(message = 'Loading...') {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingText = document.querySelector('.loading-text');
    
    if (loadingScreen && loadingText) {
        loadingScreen.style.display = 'flex';
        loadingText.textContent = message;
        console.log('🔄 Loading screen shown:', message);
    }
}

function updateLoadingText(message) {
    const loadingText = document.querySelector('.loading-text');
    if (loadingText) {
        loadingText.textContent = message;
        console.log('🔄 Loading text updated:', message);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    const appContainer = document.getElementById('appContainer');
    
    if (loadingScreen && appContainer) {
        // Fade out loading screen
        loadingScreen.classList.add('hidden');
        
        // Show app container
        appContainer.classList.add('loaded');
        
        // Remove loading screen after animation
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
        
        console.log('✅ Loading screen hidden, app shown');
    }
}

// Logout function
async function logout() {
    try {
        await auth.signOut();
        window.location.href = '../index.html';
    } catch (error) {
        console.error('Logout failed:', error);
        showStatus('Logout failed: ' + error.message, 'error');
    }
}

// Drag and Drop Functionality
function initializeDragAndDrop() {
    // Initialize drag and drop for all grids
    initializeGridDragAndDrop('recentTasksGrid', 'tasks');
    initializeGridDragAndDrop('allTasksGrid', 'tasks');
    initializeGridDragAndDrop('projectsGrid', 'projects');
    initializeGridDragAndDrop('dailyTasksGrid', 'dailyTasks');
}

function initializeGridDragAndDrop(gridId, dataType) {
    const grid = document.getElementById(gridId);
    if (!grid) return;

    // Add drag and drop event listeners to the grid
    grid.addEventListener('dragover', handleDragOver);
    grid.addEventListener('drop', (e) => handleDrop(e, dataType));
    grid.addEventListener('dragenter', handleDragEnter);
    grid.addEventListener('dragleave', handleDragLeave);
}

function handleDragStart(e, element, dataType, itemId) {
    e.dataTransfer.setData('text/plain', JSON.stringify({
        type: dataType,
        id: itemId,
        sourceGrid: e.target.closest('[id$="Grid"]').id
    }));
    
    element.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e, element) {
    element.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const target = e.target.closest('.task-card, .dashboard-card, .note-card');
    const grid = e.target.closest('[id$="Grid"]');
    
    if (target) {
        target.classList.add('drag-over');
    }
    
    if (grid) {
        grid.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const target = e.target.closest('.task-card, .dashboard-card, .note-card');
    const grid = e.target.closest('[id$="Grid"]');
    
    if (target) {
        target.classList.remove('drag-over');
    }
    
    if (grid) {
        grid.classList.remove('drag-over');
    }
}

async function handleDrop(e, dataType) {
    e.preventDefault();
    
    try {
        const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
        const targetGrid = e.target.closest('[id$="Grid"]');
        
        if (!targetGrid || !dragData || dragData.type !== dataType) return;
        
        // Remove drag-over styling
        const cards = targetGrid.querySelectorAll('.task-card, .dashboard-card, .note-card');
        cards.forEach(card => card.classList.remove('drag-over'));
        targetGrid.classList.remove('drag-over');
        
        // Get the dragged element
        const draggedElement = document.querySelector('.dragging');
        if (!draggedElement) return;
        
        // Verify the dragged element is in the correct grid
        if (!targetGrid.contains(draggedElement)) return;
        
        // Get drop position
        const dropTarget = e.target.closest('.task-card, .dashboard-card, .note-card');
        if (!dropTarget || dropTarget === draggedElement) return;
        
        // Get the target item ID
        const targetId = dropTarget.dataset.itemId;
        if (!targetId) return;
        
        // Check if we're dropping on the same item
        if (dragData.id === targetId) return;
        
        // Reorder the data array
        await reorderItems(dragData.type, dragData.id, targetId, targetGrid.id);
        
        // Re-render the grid
        switch (dataType) {
            case 'tasks':
                // For tasks, just reorder the DOM elements instead of re-rendering
                const draggedTaskElement = targetGrid.querySelector(`[data-item-id="${dragData.id}"]`);
                const targetTaskElement = targetGrid.querySelector(`[data-item-id="${targetId}"]`);
                if (draggedTaskElement && targetTaskElement) {
                    const parent = targetTaskElement.parentNode;
                    parent.insertBefore(draggedTaskElement, targetTaskElement);
                }
                break;
            case 'projects':
                // For projects, just reorder the DOM elements instead of re-rendering
                const draggedProjectElement = targetGrid.querySelector(`[data-item-id="${dragData.id}"]`);
                const targetProjectElement = targetGrid.querySelector(`[data-item-id="${targetId}"]`);
                if (draggedProjectElement && targetProjectElement) {
                    const parent = targetProjectElement.parentNode;
                    parent.insertBefore(draggedProjectElement, targetProjectElement);
                }
                break;
            case 'dailyTasks':
                // For daily tasks, just reorder the DOM elements instead of re-rendering
                const draggedDailyTaskElement = targetGrid.querySelector(`[data-item-id="${dragData.id}"]`);
                const targetDailyTaskElement = targetGrid.querySelector(`[data-item-id="${targetId}"]`);
                if (draggedDailyTaskElement && targetDailyTaskElement) {
                    const parent = targetDailyTaskElement.parentNode;
                    parent.insertBefore(draggedDailyTaskElement, targetDailyTaskElement);
                }
                break;
            case 'notes':
                // For notes, just reorder the DOM elements instead of re-rendering
                const draggedElement = targetGrid.querySelector(`[data-item-id="${dragData.id}"]`);
                const targetElement = targetGrid.querySelector(`[data-item-id="${targetId}"]`);
                if (draggedElement && targetElement) {
                    const parent = targetElement.parentNode;
                    parent.insertBefore(draggedElement, targetElement);
                }
                break;
        }
        
        showStatus(`${dataType.charAt(0).toUpperCase() + dataType.slice(1)} reordered successfully!`, 'success');
        
    } catch (error) {
        console.error('Drop handling error:', error);
        showStatus('Failed to reorder items', 'error');
    }
}

async function reorderItems(dataType, draggedId, targetId, gridId) {
    if (!userData || !currentUser) return;
    
    try {
        let dataArray;
        switch (dataType) {
            case 'tasks':
                dataArray = userData.tasks;
                break;
            case 'projects':
                dataArray = userData.projects;
                break;
            case 'dailyTasks':
                dataArray = userData.dailyTasks;
                break;
            case 'notes':
                dataArray = userData.notes;
                break;
            default:
                return;
        }
        
        // Find the dragged item and target item
        const draggedIndex = dataArray.findIndex(item => item.id === draggedId);
        const targetIndex = dataArray.findIndex(item => item.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // Don't reorder if it's the same position
        if (draggedIndex === targetIndex) return;
        
        // Reorder the array
        const [draggedItem] = dataArray.splice(draggedIndex, 1);
        dataArray.splice(targetIndex, 0, draggedItem);
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            [dataType]: dataArray
        });
        
        // Update local data
        userData[dataType] = dataArray;
        
        // For notes, projects, and tasks, also update the DOM order to match the new array order
        if (dataType === 'notes') {
            const notesGrid = document.getElementById('notesGrid');
            if (notesGrid) {
                dataArray.forEach(note => {
                    const noteElement = notesGrid.querySelector(`[data-item-id="${note.id}"]`);
                    if (noteElement) {
                        notesGrid.appendChild(noteElement);
                    }
                });
            }
        } else if (dataType === 'projects') {
            const projectsGrid = document.getElementById('projectsGrid');
            if (projectsGrid) {
                dataArray.forEach(project => {
                    const projectElement = projectsGrid.querySelector(`[data-item-id="${project.id}"]`);
                    if (projectElement) {
                        projectsGrid.appendChild(projectElement);
                    }
                });
            }
        } else if (dataType === 'tasks') {
            // Update both recent tasks and all tasks grids
            const recentTasksGrid = document.getElementById('recentTasksGrid');
            const allTasksGrid = document.getElementById('allTasksGrid');
            
            if (recentTasksGrid) {
                dataArray.forEach(task => {
                    const taskElement = recentTasksGrid.querySelector(`[data-item-id="${task.id}"]`);
                    if (taskElement) {
                        recentTasksGrid.appendChild(taskElement);
                    }
                });
            }
            
            if (allTasksGrid) {
                dataArray.forEach(task => {
                    const taskElement = allTasksGrid.querySelector(`[data-item-id="${task.id}"]`);
                    if (taskElement) {
                        allTasksGrid.appendChild(taskElement);
                    }
                });
            }
        } else if (dataType === 'dailyTasks') {
            const dailyTasksGrid = document.getElementById('dailyTasksGrid');
            if (dailyTasksGrid) {
                dataArray.forEach(dailyTask => {
                    const dailyTaskElement = dailyTasksGrid.querySelector(`[data-item-id="${dailyTask.id}"]`);
                    if (dailyTaskElement) {
                        dailyTasksGrid.appendChild(dailyTaskElement);
                    }
                });
            }
        }
        
    } catch (error) {
        console.error('Failed to reorder items:', error);
        throw error;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Additional event listener for language system initialization
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for i18n system to be ready
                    setTimeout(() => {
        if (typeof i18n !== 'undefined' && i18n.initialized) {
            forceUpdateAllTranslations();
                        }
                    }, 500);
    
    // Setup budget form event listeners
    setupBudgetFormListeners();
});

// Global exports for HTML onclick handlers
window.editTask = editTask;
window.handleEditTask = handleEditTask;
window.editProject = editProject;
window.handleEditProject = handleEditProject;
window.editDailyTask = editDailyTask;
window.handleEditDailyTask = handleEditDailyTask;
window.toggleDailyTaskStatus = toggleDailyTaskStatus;
window.toggleEditTaskDateInputs = toggleEditTaskDateInputs;
window.logout = logout;
window.showLoadingScreen = showLoadingScreen;
window.updateLoadingText = updateLoadingText;
window.hideLoadingScreen = hideLoadingScreen;

// Global exports for drag and drop functionality
window.initializeDragAndDrop = initializeDragAndDrop;
window.handleDragStart = handleDragStart;
window.handleDrop = handleDrop;

// Profile Settings Functions
function setupProfileTabListeners() {
    // Add event listeners for profile functionality
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfileChanges);
    }
}

function switchProfileTab(tabName) {
    // Remove active class from all tabs and panes
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    const selectedTab = document.querySelector(`[onclick="switchProfileTab('${tabName}')"]`);
    const selectedPane = document.getElementById(`${tabName}Tab`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedPane) selectedPane.classList.add('active');
}

async function saveProfileChanges() {
    
    try {
        // Collect form data
        const profileData = {
            name: document.getElementById('profileName').value.trim(),
            username: document.getElementById('profileUsername').value.trim(),
            email: document.getElementById('profileEmail').value.trim(),
            phone: selectedCountryCode + document.getElementById('profilePhone').value.trim(),
            bio: document.getElementById('profileBio').value.trim(),
            location: document.getElementById('profileLocation').value.trim(),
            gender: document.querySelector('input[name="gender"]:checked')?.value || '',
            birthDate: document.getElementById('profileBirthDate').value || '',
            jobTitle: document.getElementById('profileJobTitle').value.trim() || '',
            company: document.getElementById('profileCompany').value.trim() || '',
            website: document.getElementById('profileWebsite').value.trim() || '',
            updatedAt: new Date().toISOString()
        };
        
        // Validate required fields
        if (!profileData.name || !profileData.username || !profileData.email) {
            showStatus('Please fill in all required fields', 'error');
            return;
        }
        
        // Update local data
        userData.profile = { ...userData.profile, ...profileData };
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            profile: userData.profile
        });
        
        showStatus('Profile updated successfully!', 'success');
        
        // Update profile header and user interface
        updateProfileHeader();
        updateUserInterface();
        
        // Add to activity log
        addActivityLog('profile_updated', 'Profile information updated');
        
    } catch (error) {
        console.error('Failed to update profile:', error);
        showStatus('Failed to update profile: ' + error.message, 'error');
    }
}

function updateProfileHeader() {
    const profileInfo = document.querySelector('.profile-info h3');
    const userEmail = document.querySelector('.user-email');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    
    if (profileInfo) profileInfo.textContent = userData.profile.name || 'User';
    if (userEmail) userEmail.textContent = userData.profile.email || 'No email';
    
    // Update avatar with profile photo if exists
    if (avatarPlaceholder) {
        try {
            const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
            if (photoData) {
                const photo = JSON.parse(photoData);
                
                // Create image element
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = 'Profile Photo';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                
                // Clear placeholder and add image
                avatarPlaceholder.innerHTML = '';
                avatarPlaceholder.appendChild(img);
                
                // Show remove button
                const removeBtn = document.querySelector('.avatar-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'block';
                }
            } else {
                // Fallback to placeholder
                avatarPlaceholder.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
                
                // Hide remove button
                const removeBtn = document.querySelector('.avatar-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Failed to update profile header avatar:', error);
            // Fallback to placeholder
            avatarPlaceholder.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
        }
    }
}

function resetProfileForm() {
    // Reset form to original values
    document.getElementById('profileName').value = userData.profile.name || '';
    document.getElementById('profileUsername').value = userData.profile.username || '';
    document.getElementById('profileEmail').value = userData.profile.email || '';
    // Reset phone number (remove country code if present)
    let phoneNumber = userData.profile.phone || '';
    if (phoneNumber.startsWith('+')) {
        // Extract country code and set it
        const countryMatch = phoneNumber.match(/^\+(\d+)\s/);
        if (countryMatch) {
            const countryCode = '+' + countryMatch[1];
            // Find and set the country
            if (countryCode === '+90') {
                selectCountry('🇹🇷', '+90', 'TR');
            } else if (countryCode === '+1') {
                selectCountry('🇺🇸', '+1', 'US');
            } else if (countryCode === '+44') {
                selectCountry('🇬🇧', '+44', 'GB');
            } else if (countryCode === '+49') {
                selectCountry('🇩🇪', '+49', 'DE');
            } else if (countryCode === '+33') {
                selectCountry('🇫🇷', '+33', 'FR');
            } else if (countryCode === '+39') {
                selectCountry('🇮🇹', '+39', 'IT');
            } else if (countryCode === '+34') {
                selectCountry('🇪🇸', '+34', 'ES');
            } else if (countryCode === '+81') {
                selectCountry('🇯🇵', '+81', 'JP');
            }
            // Remove country code from phone number
            phoneNumber = phoneNumber.replace(/^\+(\d+)\s/, '');
        }
    }
    document.getElementById('profilePhone').value = phoneNumber;
    document.getElementById('profileBirthDate').value = userData.profile.birthDate || '';
    // Reset gender radio buttons
    if (userData.profile.gender === 'male') {
        document.getElementById('genderMale').checked = true;
    } else if (userData.profile.gender === 'female') {
        document.getElementById('genderFemale').checked = true;
    } else {
        document.getElementById('genderMale').checked = false;
        document.getElementById('genderFemale').checked = false;
    }
    document.getElementById('profileBio').value = userData.profile.bio || '';
    document.getElementById('profileLocation').value = userData.profile.location || '';
    document.getElementById('profileBirthDate').value = userData.profile.birthDate || '';
    document.getElementById('profileJobTitle').value = userData.profile.jobTitle || '';
    document.getElementById('profileCompany').value = userData.profile.company || '';
    document.getElementById('profileWebsite').value = userData.profile.website || '';
    
    showStatus('Form reset to original values', 'info');
}

async function saveAccountSettings() {
    try {
        const preferences = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked,
            darkMode: document.getElementById('darkMode').checked,
            language: document.getElementById('languageSelect').value,
            timezone: document.getElementById('timezoneSelect').value
        };
        
        // Update local data
        if (!userData.preferences) userData.preferences = {};
        userData.preferences = { ...userData.preferences, ...preferences };
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            preferences: userData.preferences
        });
        
        showStatus('Account settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save account settings:', error);
        showStatus('Failed to save account settings: ' + error.message, 'error');
    }
}

function resetAccountSettings() {
    // Reset to original values
    document.getElementById('emailNotifications').checked = userData.preferences?.emailNotifications || false;
    document.getElementById('pushNotifications').checked = userData.preferences?.pushNotifications || false;
    document.getElementById('darkMode').checked = userData.preferences?.darkMode || false;
    document.getElementById('languageSelect').value = userData.preferences?.language || 'tr';
    document.getElementById('timezoneSelect').value = userData.preferences?.timezone || 'UTC';
    
    showStatus('Account settings reset to original values', 'info');
}

function showChangePasswordForm() {
    // Create a simple password change modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Change Password</h3>
                <span class="close" onclick="this.parentElement.parentElement.parentElement.remove()">&times;</span>
                </div>
            <form id="changePasswordForm">
                <div class="form-group">
                    <label for="currentPassword">Current Password</label>
                    <input type="password" id="currentPassword" required>
            </div>
                <div class="form-group">
                    <label for="newPassword">New Password</label>
                    <input type="password" id="newPassword" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm New Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.parentElement.parentElement.parentElement.remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Change Password</button>
            </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add form event listener
    document.getElementById('changePasswordForm').addEventListener('submit', handlePasswordChange);
}

async function handlePasswordChange(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        showStatus('New passwords do not match', 'error');
        return;
    }
    
    try {
        // Re-authenticate user
        const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
        await currentUser.reauthenticateWithCredential(credential);
        
        // Change password
        await currentUser.updatePassword(newPassword);
        
        showStatus('Password changed successfully!', 'success');
        
        // Close modal
        document.querySelector('.modal').remove();
        
    } catch (error) {
        console.error('Failed to change password:', error);
        showStatus('Failed to change password: ' + error.message, 'error');
    }
}

function showLoginHistory() {
    showStatus('Login history feature coming soon!', 'info');
}

function showDeleteAccountConfirmation() {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.')) {
        showStatus('Account deletion feature coming soon!', 'info');
    }
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showStatus('Please select a valid image file (JPEG, PNG, GIF)', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showStatus('Image size must be less than 5MB', 'error');
            return;
        }
        
        showStatus('Uploading profile photo...', 'info');
        
        // Create canvas to resize image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = async function() {
            // Set canvas size (profile photos should be square)
            const size = Math.min(img.width, img.height);
            canvas.width = 200;
            canvas.height = 200;
            
            // Calculate crop position (center crop)
            const cropX = (img.width - size) / 2;
            const cropY = (img.height - size) / 2;
            
            // Draw resized and cropped image
            ctx.drawImage(img, cropX, cropY, size, size, 0, 0, 200, 200);
            
            // Convert to blob
            canvas.toBlob(async (blob) => {
                try {
                    // Create file name with user ID
                    const fileName = `${currentUser.uid}_${Date.now()}.jpg`;
                    const filePath = `images/profile/${fileName}`;
                    
                    // Save to local storage (simulating file system)
                    await saveProfilePhoto(blob, fileName);
                    
                    // Update profile with new photo path
                    userData.profile.photoPATH = filePath;
                    userData.profile.updatedAt = new Date().toISOString();
                    
                    // Update Firestore
                    await db.collection('user_data').doc(currentUser.uid).update({
                        profile: userData.profile
                    });
                    
                    // Update UI
                    refreshAllProfilePhotos();
                    
                    // Add to activity log
                    addActivityLog('profile_photo_updated', 'Profile photo updated');
                    
                    showStatus('Profile photo updated successfully!', 'success');
                    
                } catch (error) {
                    console.error('Failed to save profile photo:', error);
                    showStatus('Failed to save profile photo: ' + error.message, 'error');
                }
            }, 'image/jpeg', 0.8);
        };
        
        img.src = URL.createObjectURL(file);
        
    } catch (error) {
        console.error('Failed to upload avatar:', error);
        showStatus('Failed to upload avatar: ' + error.message, 'error');
    }
}

// Save profile photo to local storage (simulating file system)
async function saveProfilePhoto(blob, fileName) {
    return new Promise((resolve, reject) => {
        try {
            // Convert blob to base64 for storage
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    // Store in localStorage (in a real app, this would be Firebase Storage)
                    const photoData = {
                        data: reader.result,
                        timestamp: Date.now(),
                        fileName: fileName
                    };
                    
                    localStorage.setItem(`profile_photo_${currentUser.uid}`, JSON.stringify(photoData));
                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        } catch (error) {
            reject(error);
        }
    });
}

// Update profile photo in UI
function updateProfilePhoto(photoPath) {
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const removeBtn = document.querySelector('.avatar-remove-btn');
    if (!avatarPlaceholder) return;
    
    try {
        // Try to load photo from localStorage
        const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
        if (photoData) {
            const photo = JSON.parse(photoData);
            
            // Create image element
            const img = document.createElement('img');
            img.src = photo.data;
            img.alt = 'Profile Photo';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            
            // Clear placeholder and add image
            avatarPlaceholder.innerHTML = '';
            avatarPlaceholder.appendChild(img);
            
            // Show remove button
            if (removeBtn) {
                removeBtn.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Failed to update profile photo:', error);
        // Fallback to placeholder
        avatarPlaceholder.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
        
        // Hide remove button
        if (removeBtn) {
            removeBtn.style.display = 'none';
        }
    }
}

// Load profile photo when page loads
function loadProfilePhoto() {
    if (!currentUser || !userData) return;
    
    try {
        const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
        if (photoData) {
            const photo = JSON.parse(photoData);
            updateProfilePhoto(photo.data);
            
            // Also update profile header if it exists
            setTimeout(() => {
                updateProfileHeader();
            }, 100);
        }
    } catch (error) {
        console.error('Failed to load profile photo:', error);
    }
}

// Remove profile photo
async function removeProfilePhoto() {
    if (!currentUser) return;
    
    try {
        if (confirm('Are you sure you want to remove your profile photo?')) {
            // Remove from localStorage
            localStorage.removeItem(`profile_photo_${currentUser.uid}`);
            
            // Update profile
            userData.profile.photoPATH = '';
            userData.profile.updatedAt = new Date().toISOString();
            
            // Update Firestore
            await db.collection('user_data').doc(currentUser.uid).update({
                profile: userData.profile
            });
            
            // Update UI
            refreshAllProfilePhotos();
            
            // Add to activity log
            addActivityLog('profile_photo_removed', 'Profile photo removed');
            
            showStatus('Profile photo removed successfully!', 'success');
        }
    } catch (error) {
        console.error('Failed to remove profile photo:', error);
        showStatus('Failed to remove profile photo: ' + error.message, 'error');
    }
}

// Refresh all profile photos across the application
function refreshAllProfilePhotos() {
    if (!currentUser || !userData) return;
    
    try {
        const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
        
        // Update profile settings avatar
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarPlaceholder) {
            if (photoData) {
                const photo = JSON.parse(photoData);
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = 'Profile Photo';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                
                avatarPlaceholder.innerHTML = '';
                avatarPlaceholder.appendChild(img);
                
                // Show remove button
                const removeBtn = document.querySelector('.avatar-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'block';
                }
                
                console.log('✅ Profile settings avatar updated with photo');
                } else {
                avatarPlaceholder.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
                
                // Hide remove button
                const removeBtn = document.querySelector('.avatar-remove-btn');
                if (removeBtn) {
                    removeBtn.style.display = 'none';
                }
                
                console.log('✅ Profile settings avatar updated with placeholder');
                }
            } else {
            console.log('⚠️ Profile settings avatar placeholder not found');
        }
        
        // Update header avatar
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            if (photoData) {
                const photo = JSON.parse(photoData);
                const img = document.createElement('img');
                img.src = photo.data;
                img.alt = 'Profile Photo';
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.borderRadius = '50%';
                img.style.objectFit = 'cover';
                
                userAvatar.innerHTML = '';
                userAvatar.appendChild(img);
                
                console.log('✅ Header avatar updated with photo');
            } else {
                userAvatar.textContent = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
                
                console.log('✅ Header avatar updated with placeholder');
            }
        } else {
            console.log('⚠️ Header avatar not found');
        }
        
        // Update dashboard profile info
        updateDashboardProfileInfo();
        
        console.log('🔄 All profile photos refreshed successfully');
        
    } catch (error) {
        console.error('❌ Failed to refresh profile photos:', error);
    }
}

// Update dashboard profile information
function updateDashboardProfileInfo() {
    if (!userData || !userData.profile) return;
    
    try {
        // Update profile name
        const profileNameLarge = document.getElementById('profileNameLarge');
        if (profileNameLarge) {
            profileNameLarge.textContent = userData.profile.name || 'User Name';
        }
        
        // Update profile email
        const profileEmailLarge = document.getElementById('profileEmailLarge');
        if (profileEmailLarge) {
            profileEmailLarge.textContent = userData.profile.email || 'user@email.com';
        }
        
        // Update profile role (job title or company)
        const profileRoleLarge = document.getElementById('profileRoleLarge');
        if (profileRoleLarge) {
            if (userData.profile.jobTitle && userData.profile.company) {
                profileRoleLarge.textContent = `${userData.profile.jobTitle} at ${userData.profile.company}`;
            } else if (userData.profile.jobTitle) {
                profileRoleLarge.textContent = userData.profile.jobTitle;
            } else if (userData.profile.company) {
                profileRoleLarge.textContent = userData.profile.company;
            } else {
                profileRoleLarge.textContent = 'User';
            }
        }
        
        // Update dashboard profile avatar
        const profileAvatarLarge = document.getElementById('profileAvatarLarge');
        if (profileAvatarLarge) {
            try {
                const photoData = localStorage.getItem(`profile_photo_${currentUser.uid}`);
                if (photoData) {
                    const photo = JSON.parse(photoData);
                    const img = document.createElement('img');
                    img.src = photo.data;
                    img.alt = 'Profile Photo';
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';
                    
                    profileAvatarLarge.innerHTML = '';
                    profileAvatarLarge.appendChild(img);
                    
                    console.log('✅ Dashboard profile avatar updated with photo');
                } else {
                    profileAvatarLarge.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
                    console.log('✅ Dashboard profile avatar updated with placeholder');
                }
    } catch (error) {
                console.error('Failed to update dashboard profile avatar:', error);
                profileAvatarLarge.innerHTML = userData.profile.name ? userData.profile.name.charAt(0).toUpperCase() : 'U';
            }
        }
        
        console.log('✅ Dashboard profile info updated successfully');
        
    } catch (error) {
        console.error('❌ Failed to update dashboard profile info:', error);
    }
}

// Settings Functions
function setupSettingsTabListeners() {
    // Add event listeners for settings functionality
}

function switchSettingsTab(tabName) {
    // Remove active class from all tabs and panes
    const tabBtns = document.querySelectorAll('.settings-tabs .tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabPanes.forEach(pane => pane.classList.remove('active'));
    
    // Add active class to selected tab and pane
    const selectedTab = document.querySelector(`[onclick="switchSettingsTab('${tabName}')"]`);
    const selectedPane = document.getElementById(`${tabName}Tab`);
    
    if (selectedTab) selectedTab.classList.add('active');
    if (selectedPane) selectedPane.classList.add('active');
}

async function saveGeneralSettings() {
    try {
        const preferences = {
            darkMode: document.getElementById('darkMode').checked,
            language: document.getElementById('languageSelect').value,
            timezone: document.getElementById('timezoneSelect').value
        };
        
        // Update local data
        if (!userData.preferences) userData.preferences = {};
        userData.preferences = { ...userData.preferences, ...preferences };
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            preferences: userData.preferences
        });
        
        showStatus('General settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save general settings:', error);
        showStatus('Failed to save general settings: ' + error.message, 'error');
    }
}

function resetGeneralSettings() {
    // Reset to original values
    document.getElementById('darkMode').checked = userData.preferences?.darkMode || false;
    document.getElementById('languageSelect').value = userData.preferences?.language || 'tr';
    document.getElementById('timezoneSelect').value = userData.preferences?.timezone || 'UTC';
    
    showStatus('General settings reset to original values', 'info');
}

async function saveNotificationSettings() {
    try {
        const preferences = {
            emailNotifications: document.getElementById('emailNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked
        };
        
        // Update local data
        if (!userData.preferences) userData.preferences = {};
        userData.preferences = { ...userData.preferences, ...preferences };
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            preferences: userData.preferences
        });
        
        showStatus('Notification settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save notification settings:', error);
        showStatus('Failed to save notification settings: ' + error.message, 'error');
    }
}

function resetNotificationSettings() {
    // Reset to original values
    document.getElementById('emailNotifications').checked = userData.preferences?.emailNotifications || false;
    document.getElementById('pushNotifications').checked = userData.preferences?.pushNotifications || false;
    
    showStatus('Notification settings reset to original values', 'info');
}

function resetAllSettings() {
    // Reset all settings to original values
    document.getElementById('darkMode').checked = userData.preferences?.darkMode || false;
    document.getElementById('languageSelect').value = userData.preferences?.language || 'tr';
    document.getElementById('emailNotifications').checked = userData.preferences?.emailNotifications || false;
    document.getElementById('pushNotifications').checked = userData.preferences?.pushNotifications || false;
    document.getElementById('twoFactorAuth').checked = userData.preferences?.twoFactorAuth || false;
    
    showStatus('All settings reset to original values', 'info');
}

// This function was duplicated and removed

// Global exports for profile functionality
window.switchProfileTab = switchProfileTab;
window.saveProfileChanges = saveProfileChanges;
window.resetProfileForm = resetProfileForm;
window.showChangePasswordForm = showChangePasswordForm;
window.showLoginHistory = showLoginHistory;
window.showDeleteAccountConfirmation = showDeleteAccountConfirmation;
window.handleAvatarUpload = handleAvatarUpload;

// Phone and Location Functions
let selectedCountryCode = '+90';
let selectedCountry = 'TR';

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    const countryCode = selectedCountryCode;
    
    if (value.length > 0) {
        switch (countryCode) {
            case '+90': // Turkey
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
                } else if (value.length <= 9) {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6);
                } else {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
                }
                break;
            case '+1': // US/Canada
                if (value.length <= 3) {
                    value = value;
                } else if (value.length <= 6) {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3);
                } else {
                    value = '(' + value.substring(0, 3) + ') ' + value.substring(3, 6) + '-' + value.substring(6, 10);
                }
                break;
            case '+44': // UK
                if (value.length <= 4) {
                    value = value;
                } else if (value.length <= 7) {
                    value = value.substring(0, 4) + ' ' + value.substring(4);
                } else {
                    value = value.substring(0, 4) + ' ' + value.substring(4, 7) + ' ' + value.substring(7, 11);
                }
                break;
            default: // Other countries
                if (value.length <= 4) {
                    value = value;
                } else if (value.length <= 8) {
                    value = value.substring(0, 4) + ' ' + value.substring(4);
                } else {
                    value = value.substring(0, 4) + ' ' + value.substring(4, 8) + ' ' + value.substring(8, 12);
                }
        }
    }
    
    input.value = value;
}

function showLocationDropdown() {
    const dropdown = document.getElementById('locationDropdown');
    if (dropdown) {
        dropdown.style.display = 'block';
    }
}

function hideLocationDropdown() {
    // Delay hiding to allow click on options
        setTimeout(() => {
        const dropdown = document.getElementById('locationDropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }, 200);
}

function filterLocations(input) {
    const searchTerm = input.value.toLowerCase();
    const options = document.querySelectorAll('.location-option');
    
    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
    
    // Show dropdown when typing
    showLocationDropdown();
}

function selectLocation(location) {
    document.getElementById('profileLocation').value = location;
    hideLocationDropdown();
}

function toggleCountrySelector() {
    const dropdown = document.getElementById('countrySelectorDropdown');
    if (dropdown.style.display === 'none') {
        dropdown.style.display = 'block';
    } else {
        dropdown.style.display = 'none';
    }
}

function selectCountry(flag, countryCode, country) {
    selectedCountryCode = countryCode;
    selectedCountry = country;
    
    document.getElementById('selectedFlag').textContent = flag;
    document.getElementById('selectedCountryCode').textContent = countryCode;
    
    // Update phone input placeholder based on country
    const phoneInput = document.getElementById('profilePhone');
    switch (countryCode) {
        case '+90': // Turkey
            phoneInput.placeholder = '(555) 123-4567';
            break;
        case '+1': // US/Canada
            phoneInput.placeholder = '(555) 123-4567';
            break;
        case '+44': // UK
            phoneInput.placeholder = '1234 567 8901';
            break;
        default:
            phoneInput.placeholder = '1234 5678 9012';
    }
    
    // Hide dropdown
    document.getElementById('countrySelectorDropdown').style.display = 'none';
    
    // Clear phone input when country changes
    phoneInput.value = '';
}

// Global exports for settings functionality
window.saveGeneralSettings = saveGeneralSettings;
window.resetGeneralSettings = resetGeneralSettings;
window.saveNotificationSettings = saveNotificationSettings;
window.resetNotificationSettings = resetNotificationSettings;
window.resetAllSettings = resetAllSettings;
window.saveAllSettings = saveAllSettings;

// Profile functions
function saveProfile() {
    const profileData = {
        name: document.getElementById('profileName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value,
        bio: document.getElementById('profileBio').value
    };
    
    // Save to localStorage for now (can be extended to save to Firebase)
    localStorage.setItem('userProfile', JSON.stringify(profileData));
    
    showStatus('Profile saved successfully!', 'success');
}

function resetProfile() {
    // Reset form fields
    document.getElementById('profileName').value = '';
    document.getElementById('profileEmail').value = '';
    document.getElementById('profilePhone').value = '';
    document.getElementById('profileBio').value = '';
    
    showStatus('Profile reset successfully!', 'info');
}

// Global exports for phone and location functionality
window.formatPhoneNumber = formatPhoneNumber;
window.showLocationDropdown = showLocationDropdown;
window.hideLocationDropdown = hideLocationDropdown;
window.filterLocations = filterLocations;
window.selectLocation = selectLocation;
window.toggleCountrySelector = toggleCountrySelector;
window.selectCountry = selectCountry;

// Global exports for profile functionality
window.saveProfile = saveProfile;
window.resetProfile = resetProfile;

// ===== NOTES SYSTEM =====

// Show add note modal
function showAddNoteModal() {
    console.log('🚀 showAddNoteModal called');
    console.log('👤 currentUser:', currentUser);
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.log('❌ User not authenticated');
        showStatus('Please login to add notes', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding...');
    
    try {
        const modal = document.getElementById('addNoteModal');
        if (modal) {
            modal.style.display = 'flex';
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            console.log('✅ Note Modal displayed with show class');
        } else {
            console.log('❌ Note Modal element not found');
        }
        
        setupFormValidation('addNoteForm', handleAddNote);
        console.log('✅ Note Form validation setup completed');
    } catch (error) {
        console.error('❌ Error in showAddNoteModal:', error);
    }
}

// Show add shopping list modal
function showAddShoppingListModal() {
    console.log('🚀 showAddShoppingListModal called');
    console.log('👤 currentUser:', currentUser);
    
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        console.log('❌ User not authenticated');
        showStatus('Please login to add shopping lists', 'error');
        return;
    }
    
    console.log('✅ User authenticated, proceeding...');
    
    try {
        const modal = document.getElementById('addShoppingListModal');
        if (modal) {
            modal.style.display = 'flex';
            // Add show class for animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            console.log('✅ Shopping List Modal displayed with show class');
        } else {
            console.log('❌ Shopping List Modal element not found');
        }
        
        setupFormValidation('addShoppingListForm', handleAddShoppingList);
        console.log('✅ Shopping List Form validation setup completed');
    } catch (error) {
        console.error('❌ Error in showAddShoppingListModal:', error);
    }
}

// Handle add note
async function handleAddNote(event) {
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add notes', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const noteData = {
        id: generateId(),
        title: formData.get('noteTitle'),
        content: formData.get('noteContent'),
        type: formData.get('noteType'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid
    };

    try {
        if (!userData.notes) userData.notes = [];
        userData.notes.push(noteData);
        
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('note_created', 'Note created', noteData.id);
        
        updateDashboardCounts();
        renderNotes();
        
        closeModal('addNoteModal');
        showStatus(getText('settings.noteAdded'), 'success');
        
    } catch (error) {
        console.error('Failed to add note:', error);
        showStatus('Failed to add note: ' + error.message, 'error');
    }
}

// Handle add shopping list
async function handleAddShoppingList(event) {
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add shopping lists', 'error');
        return;
    }

    const formData = new FormData(event.target);
    const items = [];
    
    // Collect shopping items
    const itemRows = document.querySelectorAll('.shopping-item-row');
    itemRows.forEach(row => {
        const itemInput = row.querySelector('.shopping-item');
        const quantityInput = row.querySelector('.shopping-quantity');
        if (itemInput.value.trim()) {
            items.push({
                item: itemInput.value.trim(),
                quantity: parseInt(quantityInput.value) || 1,
                completed: false
            });
        }
    });

    const shoppingListData = {
        id: generateId(),
        title: formData.get('shoppingListTitle'),
        description: formData.get('shoppingListDescription'),
        type: 'shopping',
        items: items,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: currentUser.uid
    };

    try {
        if (!userData.notes) userData.notes = [];
        userData.notes.push(shoppingListData);
        
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('shopping_list_created', 'Shopping list created', shoppingListData.id);
        
        updateDashboardCounts();
        renderNotes();
        
        closeModal('addShoppingListModal');
        showStatus(getText('settings.shoppingListAdded'), 'success');
        
    } catch (error) {
        console.error('Failed to add shopping list:', error);
        showStatus('Failed to add shopping list: ' + error.message, 'error');
    }
}

// Render notes
function renderNotes() {
    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;

    notesGrid.innerHTML = '';

    if (!userData || !userData.notes || userData.notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="no-data">
                <p data-i18n="settings.noNotes">${getText('settings.noNotes')}</p>
            </div>
        `;
        return;
    }

    userData.notes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesGrid.appendChild(noteCard);
    });

    // Add drag and drop event listeners to notes grid (only once)
    if (!notesGrid.hasAttribute('data-drag-initialized')) {
        notesGrid.addEventListener('dragover', handleDragOver);
        notesGrid.addEventListener('dragenter', handleDragEnter);
        notesGrid.addEventListener('dragleave', handleDragLeave);
        notesGrid.addEventListener('drop', (e) => handleDrop(e, 'notes'));
        notesGrid.setAttribute('data-drag-initialized', 'true');
    }
}

// Create note card
function createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.itemId = note.id;
    card.dataset.itemType = 'note';
    card.draggable = true;
    
    // Add drag and drop event listeners
    let isDragging = false;
    card.addEventListener('dragstart', (e) => {
        handleDragStart(e, card, 'notes', note.id);
        isDragging = true;
    });
    card.addEventListener('dragend', (e) => {
        handleDragEnd(e, card);
        isDragging = false;
        setTimeout(() => { isDragging = false; }, 100);
    });
    
    card.onclick = (e) => {
        if (!isDragging) {
            showNoteDetails(note);
        }
    };

    let content = '';
    if (note.type === 'shopping') {
        const completedItems = note.items ? note.items.filter(item => item.completed).length : 0;
        const totalItems = note.items ? note.items.length : 0;
        const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
        
        content = `
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <span class="note-type shopping" data-i18n="settings.shoppingList">${getText('settings.shoppingList')}</span>
            </div>
            <div class="note-content">${note.description || ''}</div>
            <div class="shopping-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <span class="progress-text">${completedItems}/${totalItems} ${getText('settings.completed')}</span>
            </div>
            <div class="shopping-items-preview">
                ${note.items && note.items.length > 0 ? note.items.slice(0, 3).map(item => `
                    <div class="shopping-item-preview ${item.completed ? 'completed' : ''}">
                        <input type="checkbox" class="item-checkbox-small" 
                               ${item.completed ? 'checked' : ''} 
                               onchange="toggleShoppingItem('${note.id}', '${item.item}')">
                                                 <span class="item-text">${item.item} (${item.quantity})</span>
                    </div>
                `).join('') : `<span class="no-items">${getText('settings.noShoppingLists')}</span>`}
                ${note.items && note.items.length > 3 ? `<span class="more-items">+${note.items.length - 3} more</span>` : ''}
            </div>
            <div class="note-footer">
                <span>${formatDate(note.createdAt)}</span>
                <div class="note-actions">
                    <button class="btn-edit" onclick="editNote('${note.id}')" data-i18n="settings.editNote">${getText('settings.editNote')}</button>
                    <button class="btn-delete" onclick="deleteNote('${note.id}')" data-i18n="settings.deleteNote">${getText('settings.deleteNote')}</button>
                </div>
            </div>
        `;
    } else {
        content = `
            <div class="note-header">
                <h3 class="note-title">${note.title}</h3>
                <span class="note-type ${note.type}" data-i18n="settings.noteType${note.type.charAt(0).toUpperCase() + note.type.slice(1)}">${getText(`settings.noteType${note.type.charAt(0).toUpperCase() + note.type.slice(1)}`)}</span>
            </div>
            <div class="note-content">${note.content}</div>
            <div class="note-footer">
                <span>${formatDate(note.createdAt)}</span>
                <div class="note-actions">
                    <button class="btn-edit" onclick="editNote('${note.id}')" data-i18n="settings.editNote">${getText('settings.editNote')}</button>
                    <button class="btn-delete" onclick="deleteNote('${note.id}')" data-i18n="settings.deleteNote">${getText('settings.deleteNote')}</button>
                </div>
            </div>
        `;
    }

    card.innerHTML = content;
    return card;
}

// Filter notes
function filterNotes(type) {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const notesGrid = document.getElementById('notesGrid');
    if (!notesGrid) return;

    notesGrid.innerHTML = '';

    if (!userData || !userData.notes) {
        notesGrid.innerHTML = `
            <div class="no-data">
                <p data-i18n="settings.noNotes">${getText('settings.noNotes')}</p>
            </div>
        `;
        return;
    }

    let filteredNotes = userData.notes;
    if (type !== 'all') {
        filteredNotes = userData.notes.filter(note => note.type === type);
    }

    if (filteredNotes.length === 0) {
        notesGrid.innerHTML = `
            <div class="no-data">
                <p data-i18n="settings.noNotes">${getText('settings.noNotes')}</p>
            </div>
        `;
        return;
    }

    filteredNotes.forEach(note => {
        const noteCard = createNoteCard(note);
        notesGrid.appendChild(noteCard);
    });
}

// Add shopping item row
function addShoppingItem() {
    const container = document.getElementById('shoppingItemsContainer');
    const newRow = document.createElement('div');
    newRow.className = 'shopping-item-row';
    newRow.innerHTML = `
        <div class="item-checkbox">
            <input type="checkbox" class="item-completed" disabled>
        </div>
        <input type="text" class="shopping-item" placeholder="${getText('settings.shoppingItem')}" data-i18n-placeholder="settings.shoppingItem">
        <input type="number" class="shopping-quantity" placeholder="${getText('settings.shoppingQuantityShort')}" min="1" value="1">

        <button type="button" class="btn-remove" onclick="removeShoppingItem(this)" data-i18n="settings.removeItem">${getText('settings.removeItem')}</button>
    `;
    container.appendChild(newRow);
}

// Remove shopping item row
function removeShoppingItem(button) {
    button.parentElement.remove();
}

// Edit note
function editNote(noteId) {
    const note = userData.notes.find(n => n.id === noteId);
    if (!note) return;

    if (note.type === 'shopping') {
        showEditShoppingListModal(note);
    } else {
        showEditNoteModal(note);
    }
}

// Show edit note modal
function showEditNoteModal(note) {
    document.getElementById('editNoteId').value = note.id;
    document.getElementById('editNoteTitle').value = note.title;
    document.getElementById('editNoteContent').value = note.content;
    document.getElementById('editNoteType').value = note.type;
    
    const modal = document.getElementById('editNoteModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add show class for animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        console.log('✅ Edit Note Modal displayed with show class');
    } else {
        console.log('❌ Edit Note Modal element not found');
    }
    
    setupFormValidation('editNoteForm', handleEditNote);
}

// Show edit shopping list modal
function showEditShoppingListModal(note) {
    document.getElementById('editShoppingListId').value = note.id;
    document.getElementById('editShoppingListTitle').value = note.title;
    document.getElementById('editShoppingListDescription').value = note.description || '';
    
    // Load shopping items
    const container = document.getElementById('editShoppingItemsContainer');
    container.innerHTML = '';
    
    if (note.items && note.items.length > 0) {
        note.items.forEach(item => {
            const itemRow = createEditShoppingItemRow(item);
            container.appendChild(itemRow);
        });
    } else {
        const itemRow = createEditShoppingItemRow();
        container.appendChild(itemRow);
    }
    
    const modal = document.getElementById('editShoppingListModal');
    if (modal) {
        modal.style.display = 'flex';
        // Add show class for animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        console.log('✅ Edit Shopping List Modal displayed with show class');
    } else {
        console.log('❌ Edit Shopping List Modal element not found');
    }
    
    setupFormValidation('editShoppingListForm', handleEditShoppingList);
}

// Create edit shopping item row
function createEditShoppingItemRow(item = null) {
    const row = document.createElement('div');
    row.className = 'shopping-item-row';
    row.innerHTML = `
        <div class="item-checkbox">
            <input type="checkbox" class="item-completed" ${item && item.completed ? 'checked' : ''}>
        </div>
        <input type="text" class="shopping-item" placeholder="${getText('settings.shoppingItem')}" data-i18n-placeholder="settings.shoppingItem" value="${item ? item.item : ''}">
        <input type="number" class="shopping-quantity" placeholder="${getText('settings.shoppingQuantityShort')}" min="1" value="${item ? item.quantity : 1}">

        <button type="button" class="btn-remove" onclick="removeShoppingItem(this)" data-i18n="settings.removeItem">${getText('settings.removeItem')}</button>
    `;
    return row;
}

// Add edit shopping item
function addEditShoppingItem() {
    const container = document.getElementById('editShoppingItemsContainer');
    const newRow = createEditShoppingItemRow();
    container.appendChild(newRow);
}

// Handle edit note
async function handleEditNote(event) {
    const formData = new FormData(event.target);
    const noteId = formData.get('editNoteId');
    
    const noteIndex = userData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const updatedNote = {
        ...userData.notes[noteIndex],
        title: formData.get('editNoteTitle'),
        content: formData.get('editNoteContent'),
        type: formData.get('editNoteType'),
        updatedAt: new Date().toISOString()
    };

    try {
        userData.notes[noteIndex] = updatedNote;
        
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('note_updated', 'Note updated', noteId);
        
        updateDashboardCounts();
        renderNotes();
        
        closeModal('editNoteModal');
        showStatus(getText('settings.noteUpdated'), 'success');
        
    } catch (error) {
        console.error('Failed to update note:', error);
        showStatus('Failed to update note: ' + error.message, 'error');
    }
}

// Handle edit shopping list
async function handleEditShoppingList(event) {
    const formData = new FormData(event.target);
    const noteId = formData.get('editShoppingListId');
    
    const noteIndex = userData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const items = [];
    
    // Collect shopping items
    const itemRows = document.querySelectorAll('#editShoppingItemsContainer .shopping-item-row');
    itemRows.forEach(row => {
        const itemInput = row.querySelector('.shopping-item');
        const quantityInput = row.querySelector('.shopping-quantity');
        const completedCheckbox = row.querySelector('.item-completed');
        
        if (itemInput.value.trim()) {
            items.push({
                item: itemInput.value.trim(),
                quantity: parseInt(quantityInput.value) || 1,
                completed: completedCheckbox.checked
            });
        }
    });

    const updatedNote = {
        ...userData.notes[noteIndex],
        title: formData.get('editShoppingListTitle'),
        description: formData.get('editShoppingListDescription'),
        items: items,
        updatedAt: new Date().toISOString()
    };

    try {
        userData.notes[noteIndex] = updatedNote;
        
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('shopping_list_updated', 'Shopping list updated', noteId);
        
        updateDashboardCounts();
        renderNotes();
        
        closeModal('editShoppingListModal');
        showStatus(getText('settings.shoppingListUpdated'), 'success');
        
    } catch (error) {
        console.error('Failed to update shopping list:', error);
        showStatus('Failed to update shopping list: ' + error.message, 'error');
    }
}

// Delete note
async function deleteNote(noteId) {
    if (!confirm(getText('settings.confirmDelete'))) return;

    try {
        userData.notes = userData.notes.filter(note => note.id !== noteId);
        
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('note_deleted', 'Note deleted', noteId);
        
        updateDashboardCounts();
        renderNotes();
        
        showStatus(getText('settings.noteDeleted'), 'success');
        
    } catch (error) {
        console.error('Failed to delete note:', error);
        showStatus('Failed to delete note: ' + error.message, 'error');
    }
}

// Show note details
function showNoteDetails(note) {
    // Implementation for showing note details
    console.log('Show note details:', note);
}

// Get text from i18n system
function getText(key) {
    if (typeof i18n !== 'undefined' && i18n.t) {
        return i18n.t(key);
    }
    // Fallback to key if i18n is not available
        return key;
}

// Toggle shopping item completion
async function toggleShoppingItem(noteId, itemName) {
    const noteIndex = userData.notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;

    const note = userData.notes[noteIndex];
    if (!note.items) return;

    const itemIndex = note.items.findIndex(item => item.item === itemName);
    if (itemIndex === -1) return;

    // Toggle completion status
    note.items[itemIndex].completed = !note.items[itemIndex].completed;
    note.updatedAt = new Date().toISOString();

    try {
        await db.collection('user_data').doc(currentUser.uid).update({
            notes: userData.notes
        });
        
        addActivityLog('shopping_item_toggled', 'Shopping item toggled', noteId);
        
        updateDashboardCounts();
        renderNotes();
        
    } catch (error) {
        console.error('Failed to toggle shopping item:', error);
        showStatus('Failed to toggle item: ' + error.message, 'error');
    }
}

// Global exports for notes functionality
window.showAddNoteModal = showAddNoteModal;
window.showAddShoppingListModal = showAddShoppingListModal;
window.addShoppingItem = addShoppingItem;
window.removeShoppingItem = removeShoppingItem;
window.editNote = editNote;
window.deleteNote = deleteNote;
window.filterNotes = filterNotes;
window.toggleShoppingItem = toggleShoppingItem;

// Budget Overview Functions
async function renderBudgetOverview() {
    console.log('🔍 Debug: renderBudgetOverview called');
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, initializing...');
        // Initialize budget data if it doesn't exist
        await initializeBudgetData();
    } else {
        console.log('✅ Debug: Budget data exists, cleaning sample data if any...');
        // Clean existing budget data to remove sample data
        await cleanExistingBudgetData();
    }
    
    console.log('🔍 Debug: After initialization/cleaning, userData.budget:', userData.budget);
    console.log('🔍 Debug: Categories count:', userData.budget?.categories?.length || 0);
    console.log('🔍 Debug: Transactions count:', userData.budget?.transactions?.length || 0);
    console.log('🔍 Debug: Goals count:', userData.budget?.goals?.length || 0);
    
    // Initialize chart if not already done
    if (!budgetChart) {
        console.log('🔍 Debug: Initializing chart...');
        initializeCharts();
    }
    
    // Set up real-time listener if not already set up
    if (!window.budgetUnsubscribe) {
        console.log('🔍 Debug: Setting up real-time listener...');
        setupBudgetRealtimeListener();
    }
    
    // Update all budget components
    console.log('🔍 Debug: Updating budget overview...');
    updateBudgetOverview();
    
    console.log('🔍 Debug: renderBudgetOverview completed');
}

async function initializeBudgetData() {
    const defaultBudget = {
        settings: {
            currency: 'TRY',
            defaultPeriod: 'monthly',
            notifications: {
                overspending: true,
                budgetReminder: true,
                billReminder: true
            }
        },
        categories: [],
        transactions: [],
        periods: {
            daily: { budget: 0, spent: 0, remaining: 0 },
            weekly: { budget: 0, spent: 0, remaining: 0 },
            monthly: { budget: 0, spent: 0, remaining: 0 },
            yearly: { budget: 0, spent: 0, remaining: 0 }
        },
        goals: []
    };
    
    userData.budget = defaultBudget;
    
    // Save to Firestore
    await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
    console.log('✅ Budget data initialized for new user');
    
    // Set up real-time listener for budget data
    setupBudgetRealtimeListener();
}

// Clean existing budget data to remove sample data
async function cleanExistingBudgetData() {
    // Check if budget data contains sample data
    const hasSampleData = userData.budget.categories.some(cat => 
        cat.name === 'Gıda' || cat.name === 'Ulaşım' || cat.name === 'Maaş'
    ) || userData.budget.transactions.some(trans => 
        trans.description === 'Market alışverişi' || trans.description === 'Ocak maaşı'
    );
    
    if (hasSampleData) {
        console.log('🧹 Cleaning sample budget data...');
        
        // Reset to clean state
        userData.budget.categories = [];
        userData.budget.transactions = [];
        userData.budget.periods = {
            daily: { budget: 0, spent: 0, remaining: 0 },
            weekly: { budget: 0, spent: 0, remaining: 0 },
            monthly: { budget: 0, spent: 0, remaining: 0 },
            yearly: { budget: 0, spent: 0, remaining: 0 }
        };
        userData.budget.goals = [];
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        console.log('✅ Sample budget data cleaned');
    }
}



// Set up real-time listener for budget data updates
function setupBudgetRealtimeListener() {
    if (!currentUser || !currentUser.uid) {
        console.log('⚠️ No current user, skipping real-time listener setup');
            return;
        }
    
    console.log('🔄 Setting up real-time budget data listener...');
    
    // Listen for real-time updates to user's budget data
    const unsubscribe = db.collection('user_data').doc(currentUser.uid)
        .onSnapshot((doc) => {
            if (doc.exists()) {
                const updatedData = doc.data();
                if (updatedData.budget && JSON.stringify(updatedData.budget) !== JSON.stringify(userData.budget)) {
                    console.log('🔄 Real-time budget data update received');
                    userData.budget = updatedData.budget;
                    updateBudgetOverview();
                }
            }
        }, (error) => {
            console.error('❌ Error in real-time budget listener:', error);
        });
    
    // Store the unsubscribe function for cleanup
    window.budgetUnsubscribe = unsubscribe;
    console.log('✅ Real-time budget listener set up successfully');
}

function updateBudgetCards() {
    if (!userData || !userData.budget || !userData.budget.periods) return;
    
    const periods = userData.budget.periods;
    
    // Update daily budget
    const dailyBudgetElement = document.getElementById('dailyBudgetAmount');
    const dailyProgressElement = document.getElementById('dailyProgressFill');
    if (dailyBudgetElement && dailyProgressElement) {
        const daily = periods.daily;
        dailyBudgetElement.textContent = `${daily.remaining} ₺`;
        const progress = daily.budget > 0 ? ((daily.budget - daily.remaining) / daily.budget) * 100 : 0;
        dailyProgressElement.style.width = `${Math.min(progress, 100)}%`;
    }
    
    // Update weekly budget
    const weeklyBudgetElement = document.getElementById('weeklyBudgetAmount');
    const weeklyProgressElement = document.getElementById('weeklyProgressFill');
    if (weeklyBudgetElement && weeklyProgressElement) {
        const weekly = periods.weekly;
        weeklyBudgetElement.textContent = `${weekly.remaining} ₺`;
        const progress = weekly.budget > 0 ? ((weekly.budget - weekly.remaining) / weekly.budget) * 100 : 0;
        weeklyProgressElement.style.width = `${Math.min(progress, 100)}%`;
    }
    
    // Update monthly budget
    const monthlyBudgetElement = document.getElementById('monthlyBudgetAmount');
    const monthlyProgressElement = document.getElementById('monthlyProgressFill');
    if (monthlyBudgetElement && monthlyProgressElement) {
        const monthly = periods.monthly;
        monthlyBudgetElement.textContent = `${monthly.remaining} ₺`;
        const progress = monthly.budget > 0 ? ((monthly.budget - monthly.remaining) / monthly.budget) * 100 : 0;
        monthlyProgressElement.style.width = `${Math.min(progress, 100)}%`;
    }
}
window.addEditShoppingItem = addEditShoppingItem;

// Budget Management Functions
let budgetChart = null;
let currentBudgetPeriod = 'daily';
let customDateRange = null;

// Switch budget period
function switchBudgetPeriod(period) {
    console.log('🔍 Debug: Switching budget period from', currentBudgetPeriod, 'to', period);
    
    currentBudgetPeriod = period;
    
    // Hide custom date selector if switching to a standard period
    if (period !== 'custom') {
        hideCustomDateSelector();
    }
    
    // Update active tab
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.period === period) {
            tab.classList.add('active');
        }
    });
    
    console.log('🔍 Debug: Period switched, updating budget overview...');
    updateBudgetOverview();
}

// Custom date selector functions
function showCustomDateSelector() {
    const selector = document.getElementById('customDateSelector');
    if (selector) {
        selector.style.display = 'flex';
        // Set default dates (current month)
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        
        document.getElementById('customStartDate').value = firstDay.toISOString().split('T')[0];
        document.getElementById('customEndDate').value = lastDay.toISOString().split('T')[0];
    }
}

function hideCustomDateSelector() {
    const selector = document.getElementById('customDateSelector');
    if (selector) {
        selector.style.display = 'none';
    }
}

function updateCustomDateRange() {
    // This function can be used to validate date ranges or provide real-time feedback
    const startDate = document.getElementById('customStartDate').value;
    const endDate = document.getElementById('customEndDate').value;
    
    if (startDate && endDate && startDate > endDate) {
        // Show warning or swap dates
        document.getElementById('customEndDate').value = startDate;
    }
}

function applyCustomDateRange() {
    const startDate = document.getElementById('customStartDate').value;
    const endDate = document.getElementById('customEndDate').value;
    
    if (!startDate || !endDate) {
        showStatus('Lütfen başlangıç ve bitiş tarihlerini seçin.', 'error');
        return;
    }
    
    if (startDate > endDate) {
        showStatus('Başlangıç tarihi bitiş tarihinden sonra olamaz.', 'error');
        return;
    }
    
    // Update the current period to custom and refresh the view
    currentBudgetPeriod = 'custom';
    customDateRange = { start: startDate, end: endDate };
    
    // Update active tab
    document.querySelectorAll('.period-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.period === 'custom') {
            tab.classList.add('active');
        }
    });
    
    hideCustomDateSelector();
    updateBudgetOverview();
}

// Update budget overview
async function updateBudgetOverview() {
    console.log('🔍 Debug: updateBudgetOverview called');
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, returning early');
        return;
    }
    
    console.log('🔍 Debug: Calling updateOverviewCards...');
    updateOverviewCards();
    console.log('🔍 Debug: Calling updateTransactionsList...');
    updateTransactionsList();
    console.log('🔍 Debug: Calling updateCategoriesList...');
    updateCategoriesList();
    console.log('🔍 Debug: Calling updateGoalsList...');
    updateGoalsList();
    console.log('🔍 Debug: Calling updateCharts...');
    updateCharts();
    console.log('🔍 Debug: updateBudgetOverview completed');
}

// Update overview cards
function updateOverviewCards() {
    console.log('🔍 Debug: updateOverviewCards called');
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, returning early');
        return;
    }
    
    const transactions = userData.budget.transactions || [];
    console.log('🔍 Debug: All transactions:', transactions);
    
    // Calculate totals for current period only
    let totalIncome = 0;
    let totalExpense = 0;
    
    const currentPeriodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        
        switch (currentBudgetPeriod) {
            case 'daily':
                return isSameDay(transactionDate, today);
            case 'weekly':
                return isSameWeek(transactionDate, today);
            case 'monthly':
                return isSameMonth(transactionDate, today);
            case 'yearly':
                return isSameYear(transactionDate, today);
            case 'custom':
                if (customDateRange && customDateRange.start && customDateRange.end) {
                    const startDate = new Date(customDateRange.start);
                    const endDate = new Date(customDateRange.end);
                    return transactionDate >= startDate && transactionDate <= endDate;
                }
                return false;
            default:
                return false;
        }
    });
    
    console.log('🔍 Debug: Current period transactions for overview:', currentPeriodTransactions);
    
    currentPeriodTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    
    const netBalance = totalIncome - totalExpense;
    const remainingBudget = Math.max(0, netBalance);
    
    console.log('🔍 Debug: Overview calculations - income:', totalIncome, 'expense:', totalExpense, 'netBalance:', netBalance, 'remaining:', remainingBudget);
    
    // Calculate total net (all time)
    const allTransactions = userData.budget.transactions || [];
    let totalAllTimeIncome = 0;
    let totalAllTimeExpense = 0;
    
    allTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalAllTimeIncome += transaction.amount;
        } else {
            totalAllTimeExpense += transaction.amount;
        }
    });
    
    const totalNet = totalAllTimeIncome - totalAllTimeExpense;
    
    console.log('🔍 Debug: Total all time calculations - income:', totalAllTimeIncome, 'expense:', totalAllTimeExpense, 'totalNet:', totalNet);
    
    // Update DOM elements
    const totalIncomeElement = document.getElementById('totalIncome');
    const totalExpenseElement = document.getElementById('totalExpense');
    const netBalanceElement = document.getElementById('netBalance');
    const totalNetElement = document.getElementById('totalNet');
    
    if (totalIncomeElement) totalIncomeElement.textContent = `${totalIncome.toFixed(2)} ₺`;
    if (totalExpenseElement) totalExpenseElement.textContent = `${totalExpense.toFixed(2)} ₺`;
    if (netBalanceElement) netBalanceElement.textContent = `${netBalance.toFixed(2)} ₺`;
    if (totalNetElement) totalNetElement.textContent = `${totalNet.toFixed(2)} ₺`;
    
    // Add last updated timestamp
    const lastUpdatedElement = document.getElementById('lastUpdated');
    if (lastUpdatedElement) {
        const now = new Date();
        lastUpdatedElement.textContent = `Son Güncelleme: ${formatDateTime(now.toISOString())}`;
    }
    
    console.log('🔍 Debug: Overview cards updated successfully');
}

// Update transactions list
function updateTransactionsList() {
    console.log('🔍 Debug: updateTransactionsList called');
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, returning early');
        return;
    }
    
    const transactionsList = document.getElementById('transactionsList');
    console.log('🔍 Debug: transactionsList element:', transactionsList);
    
    if (!transactionsList) {
        console.log('⚠️ Debug: transactionsList element not found, returning early');
        return;
    }
    
    const transactions = userData.budget.transactions || [];
    const categories = userData.budget.categories || [];
    
    console.log('🔍 Debug: Transactions array:', transactions);
    console.log('🔍 Debug: Transactions length:', transactions.length);
    console.log('🔍 Debug: Categories array:', categories);
    console.log('🔍 Debug: Categories length:', categories.length);
    
    // Filter transactions for current period
    const currentPeriodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        
        switch (currentBudgetPeriod) {
            case 'daily':
                return isSameDay(transactionDate, today);
            case 'weekly':
                return isSameWeek(transactionDate, today);
            case 'monthly':
                return isSameMonth(transactionDate, today);
            case 'yearly':
                return isSameYear(transactionDate, today);
            case 'custom':
                if (customDateRange && customDateRange.start && customDateRange.end) {
                    const startDate = new Date(customDateRange.start);
                    const endDate = new Date(customDateRange.end);
                    return transactionDate >= startDate && transactionDate <= endDate;
                }
                return false;
            default:
                return false;
        }
    });
    
    // Sort transactions by date (newest first)
    const sortedTransactions = currentPeriodTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Take only the latest 10 transactions
    const recentTransactions = sortedTransactions.slice(0, 10);
    
    console.log('🔍 Debug: Recent transactions:', recentTransactions);
    
    let html = '';
    
    if (recentTransactions.length === 0) {
        html = '<p style="color: #888; text-align: center; padding: 20px;">Henüz işlem bulunmuyor</p>';
        console.log('🔍 Debug: No transactions, showing empty message');
    } else {
        console.log('🔍 Debug: Rendering transactions...');
        recentTransactions.forEach(transaction => {
            console.log('🔍 Debug: Processing transaction:', transaction);
            const category = categories.find(cat => cat.id === transaction.categoryId);
            const categoryName = category ? category.name : 'Bilinmeyen';
            const categoryIcon = category ? category.icon : '💰';
            
            html += `
                <div class="transaction-item">
                    <div class="transaction-header">
                        <span class="transaction-amount ${transaction.type}">
                            ${transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)} ₺
                        </span>
                        <span class="transaction-category">${categoryIcon} ${categoryName}</span>
                    </div>
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-date">${formatDateTime(transaction.date)}</div>
                    <div class="transaction-actions">
                        <button class="btn-edit" onclick="editTransaction('${transaction.id}')">✏️</button>
                        <button class="btn-delete" onclick="deleteTransaction('${transaction.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });
    }
    
    console.log('🔍 Debug: Final HTML:', html);
    transactionsList.innerHTML = html;
    console.log('🔍 Debug: Transactions list updated in DOM');
}

// Update categories list
function updateCategoriesList() {
    console.log('🔍 Debug: updateCategoriesList called');
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, returning early');
        return;
    }
    
    const categoriesList = document.getElementById('categoriesList');
    console.log('🔍 Debug: categoriesList element:', categoriesList);
    
    if (!categoriesList) {
        console.log('⚠️ Debug: categoriesList element not found, returning early');
        return;
    }
    
    const categories = userData.budget.categories || [];
    console.log('🔍 Debug: Categories array:', categories);
    console.log('🔍 Debug: Categories length:', categories.length);
    
    let html = '';
    
    if (categories.length === 0) {
        html = '<p style="color: #888; text-align: center; padding: 20px;">Henüz kategori bulunmuyor</p>';
        console.log('🔍 Debug: No categories, showing empty message');
    } else {
        console.log('🔍 Debug: Rendering categories...');
        categories.forEach(category => {
            console.log('🔍 Debug: Processing category:', category);
            html += `
                <div class="category-item">
                    <div class="category-info">
                        <span class="category-icon">${category.icon}</span>
                        <div class="category-details">
                            <h4>${category.name}</h4>
                            <div class="category-type">${category.type === 'income' ? 'Gelir' : 'Gider'}</div>
                            ${category.createdAt ? `<div class="category-created">Oluşturulma: ${formatDateTime(category.createdAt)}</div>` : ''}
                        </div>
                    </div>
                    <div class="category-actions">
                        <button class="btn-edit" onclick="editCategory('${category.id}')">✏️</button>
                        <button class="btn-delete" onclick="deleteCategory('${category.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });
    }
    
    console.log('🔍 Debug: Final HTML:', html);
    categoriesList.innerHTML = html;
    console.log('🔍 Debug: Categories list updated in DOM');
}

// Update goals list
function updateGoalsList() {
    console.log('🔍 Debug: updateGoalsList called');
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!userData || !userData.budget) {
        console.log('⚠️ Debug: userData or userData.budget is missing, returning early');
        return;
    }
    
    const goalsList = document.getElementById('goalsList');
    console.log('🔍 Debug: goalsList element:', goalsList);
    
    if (!goalsList) {
        console.log('⚠️ Debug: goalsList element not found, returning early');
        return;
    }
    
    const goals = userData.budget.goals || [];
    console.log('🔍 Debug: Goals array:', goals);
    console.log('🔍 Debug: Goals length:', goals.length);
    
    let html = '';
    
    if (goals.length === 0) {
        html = '<p style="color: #888; text-align: center; padding: 20px;">Henüz hedef bulunmuyor</p>';
        console.log('🔍 Debug: No goals, showing empty message');
    } else {
        console.log('🔍 Debug: Rendering goals...');
        goals.forEach(goal => {
            console.log('🔍 Debug: Processing goal:', goal);
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            
            html += `
                <div class="goal-item">
                    <div class="goal-header">
                        <span class="goal-name">${goal.name}</span>
                        <span class="goal-priority ${goal.priority}">${goal.priority}</span>
                    </div>
                    <div class="goal-amounts">
                        <span>Mevcut: ${goal.currentAmount.toFixed(2)} ₺</span>
                        <span>Hedef: ${goal.targetAmount.toFixed(2)} ₺</span>
                    </div>
                    <div class="goal-progress">
                        <div class="goal-progress-fill" style="width: ${Math.min(progress, 100)}%"></div>
                    </div>
                    <div class="goal-deadline">Hedef Tarih: ${formatDateTime(goal.deadline)}</div>
                    <div class="goal-actions">
                        <button class="btn-goal-deposit" onclick="showGoalTransactionModal('${goal.id}', 'deposit')" title="Para Yatır">💰</button>
                        <button class="btn-goal-withdraw" onclick="showGoalTransactionModal('${goal.id}', 'withdraw')" title="Para Çek">💸</button>
                        <button class="btn-edit" onclick="editGoal('${goal.id}')">✏️</button>
                        <button class="btn-delete" onclick="deleteGoal('${goal.id}')">🗑️</button>
                    </div>
                </div>
            `;
        });
    }
    
    console.log('🔍 Debug: Final HTML:', html);
    goalsList.innerHTML = html;
    console.log('🔍 Debug: Goals list updated in DOM');
}

// Initialize and update charts
function initializeCharts() {
    console.log('🔍 Debug: initializeCharts called');
    const chartCanvas = document.getElementById('budgetChart');
    console.log('🔍 Debug: chartCanvas found:', !!chartCanvas);
    if (!chartCanvas) {
        console.error('❌ Debug: budgetChart canvas not found!');
        return;
    }
    
    const ctx = chartCanvas.getContext('2d');
    console.log('🔍 Debug: canvas context:', !!ctx);
    console.log('🔍 Debug: Chart.js available:', typeof Chart !== 'undefined');
    
    if (typeof Chart === 'undefined') {
        console.error('❌ Debug: Chart.js not loaded!');
        return;
    }
    
    budgetChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Gelir', 'Gider'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#51cf66', '#ff6b6b'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#b8c5d6',
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
    
    console.log('✅ Debug: budgetChart created successfully:', !!budgetChart);
}

// Update charts
function updateCharts() {
    console.log('🔍 Debug: updateCharts called');
    console.log('🔍 Debug: budgetChart:', budgetChart);
    console.log('🔍 Debug: userData:', userData);
    console.log('🔍 Debug: userData.budget:', userData?.budget);
    
    if (!budgetChart || !userData || !userData.budget) {
        console.log('⚠️ Debug: Missing required data for chart update, returning early');
        return;
    }
    
    console.log('🔍 Debug: currentBudgetPeriod:', currentBudgetPeriod);
    
    // Calculate actual spent and remaining based on CURRENT PERIOD transactions
    const transactions = userData.budget.transactions || [];
    
    console.log('🔍 Debug: All transactions:', transactions);
    
    let totalSpent = 0;
    let totalIncome = 0;
    
    // Filter transactions based on current period
    const currentPeriodTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const today = new Date();
        
        switch (currentBudgetPeriod) {
            case 'daily':
                return isSameDay(transactionDate, today);
            case 'weekly':
                return isSameWeek(transactionDate, today);
            case 'monthly':
                return isSameMonth(transactionDate, today);
            case 'yearly':
                return isSameYear(transactionDate, today);
            case 'custom':
                if (customDateRange && customDateRange.start && customDateRange.end) {
                    const startDate = new Date(customDateRange.start);
                    const endDate = new Date(customDateRange.end);
                    return transactionDate >= startDate && transactionDate <= endDate;
                }
                return false;
            default:
                return false;
        }
    });
    
    console.log('🔍 Debug: Current period transactions for chart:', currentPeriodTransactions);
    
    // Use only current period transactions for the chart
    currentPeriodTransactions.forEach(transaction => {
        if (transaction.type === 'expense') {
            totalSpent += transaction.amount;
        } else if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        }
    });
    
    const netBalance = totalIncome - totalSpent;
    const remainingBudget = Math.max(0, netBalance);
    
    console.log('🔍 Debug: Chart calculations - spent:', totalSpent, 'income:', totalIncome, 'netBalance:', netBalance, 'remaining:', remainingBudget);
    
    // Update chart data
    if (totalSpent > 0 || totalIncome > 0) {
        // Show income vs expense for better visualization
        budgetChart.data.datasets[0].data = [totalIncome, totalSpent];
        
        // Update chart labels based on current period
        let periodLabel = '';
        switch (currentBudgetPeriod) {
            case 'daily':
                periodLabel = 'Bugün';
                break;
            case 'weekly':
                periodLabel = 'Bu Hafta';
                break;
            case 'monthly':
                periodLabel = 'Bu Ay';
                break;
            case 'yearly':
                periodLabel = 'Bu Yıl';
                break;
            case 'custom':
                periodLabel = 'Seçilen Tarih';
                break;
            default:
                periodLabel = '';
        }
        
        budgetChart.data.labels = [`${periodLabel} Gelir`, `${periodLabel} Gider`];
        
        // Update chart colors based on data
        budgetChart.data.datasets[0].backgroundColor = ['#51cf66', '#ff6b6b']; // Green for income, Red for expense
        
        budgetChart.update();
        
        // Update chart title based on current period
        const chartTitle = document.querySelector('.chart-container h3');
        if (chartTitle) {
            chartTitle.textContent = `${periodLabel} Bütçe İlerlemesi`;
        }
        
        console.log('🔍 Debug: Chart updated successfully with new data for period:', currentBudgetPeriod);
    } else {
        // If no transactions, show empty state with period-specific labels
        let periodLabel = '';
        switch (currentBudgetPeriod) {
            case 'daily':
                periodLabel = 'Bugün';
                break;
            case 'weekly':
                periodLabel = 'Bu Hafta';
                break;
            case 'monthly':
                periodLabel = 'Bu Ay';
                break;
            case 'yearly':
                periodLabel = 'Bu Yıl';
                break;
            case 'custom':
                periodLabel = 'Seçilen Tarih';
                break;
            default:
                periodLabel = '';
        }
        
        budgetChart.data.datasets[0].data = [0, 0];
        budgetChart.data.labels = [`${periodLabel} Gelir`, `${periodLabel} Gider`];
        budgetChart.data.datasets[0].backgroundColor = ['#51cf66', '#ff6b6b'];
        
        // Update chart title for empty state
        const chartTitle = document.querySelector('.chart-container h3');
        if (chartTitle) {
            chartTitle.textContent = `${periodLabel} Bütçe İlerlemesi`;
        }
        
        budgetChart.update();
        console.log('🔍 Debug: Chart updated with empty state for period:', currentBudgetPeriod);
    }
}

// Show add transaction modal
function showAddTransactionModal() {
    const modal = document.getElementById('addTransactionModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        loadCategoriesForTransaction();
        setDefaultDate();
        
        // Focus on the first input field after modal opens
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

// Show add category modal
function showAddCategoryModal() {
    const modal = document.getElementById('addCategoryModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        // Focus on the first input field after modal opens
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

// Show add goal modal
function showAddGoalModal() {
    const modal = document.getElementById('addGoalModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        setDefaultGoalDate();
        
        // Focus on the first input field after modal opens
        setTimeout(() => {
            const firstInput = modal.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 100);
    }
}

// Load categories for transaction modal
function loadCategoriesForTransaction() {
    if (!userData || !userData.budget) return;
    
    const categorySelect = document.getElementById('transactionCategory');
    if (!categorySelect) return;
    
    const categories = userData.budget.categories || [];
    
    categorySelect.innerHTML = '<option value="">Kategori Seçin</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = `${category.icon} ${category.name}`;
        categorySelect.appendChild(option);
    });
}

// Set default date and time for transaction
function setDefaultDate() {
    const dateTimeInput = document.getElementById('transactionDateTime');
    
    if (dateTimeInput) {
        const now = new Date();
        
        // Format datetime-local input value (YYYY-MM-DDTHH:MM)
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        const dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        dateTimeInput.value = dateTimeValue;
        
        console.log('🕐 Debug: Default datetime set:', dateTimeValue);
    }
}

// Set default goal date and time
function setDefaultGoalDate() {
    const dateTimeInput = document.getElementById('goalDeadline');
    
    if (dateTimeInput) {
        const nextYear = new Date();
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        
        // Set next year date with end of day time (23:59)
        const year = nextYear.getFullYear();
        const month = String(nextYear.getMonth() + 1).padStart(2, '0');
        const day = String(nextYear.getDate()).padStart(2, '0');
        
        const dateTimeValue = `${year}-${month}-${day}T23:59`;
        dateTimeInput.value = dateTimeValue;
        
        console.log('🕐 Debug: Default goal datetime set:', dateTimeValue);
    }
}

// Add or edit transaction
async function addTransaction(formData) {
    try {
        const form = document.getElementById('addTransactionForm');
        const editId = form.getAttribute('data-edit-id');
        
        if (editId) {
            // Edit existing transaction
            const transactionIndex = userData.budget.transactions.findIndex(t => t.id === editId);
            if (transactionIndex !== -1) {
                userData.budget.transactions[transactionIndex] = {
                    ...userData.budget.transactions[transactionIndex],
                    type: formData.get('transactionType'),
                    categoryId: formData.get('transactionCategory'),
                    amount: parseFloat(formData.get('transactionAmount')),
                    description: formData.get('transactionDescription'),
                    date: formData.get('transactionDateTime'),
                    updatedAt: new Date().toISOString()
                };
                
                console.log('✅ Transaction updated successfully');
                showStatus('İşlem başarıyla güncellendi', 'success');
            }
        } else {
            // Add new transaction
            const transaction = {
                id: 'trans_' + Date.now(),
                type: formData.get('transactionType'),
                categoryId: formData.get('transactionCategory'),
                amount: parseFloat(formData.get('transactionAmount')),
                description: formData.get('transactionDescription'),
                date: formData.get('transactionDateTime'),
                createdAt: new Date().toISOString()
            };
            
            if (!userData.budget.transactions) {
                userData.budget.transactions = [];
            }
            
            userData.budget.transactions.push(transaction);
            
            // Update period data
            await updatePeriodData(transaction);
            
            console.log('✅ Transaction added successfully');
            showStatus('İşlem başarıyla eklendi', 'success');
        }
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        // Update UI
        updateBudgetOverview();
        
        // Close modal and reset form
        closeModal('addTransactionModal');
        form.removeAttribute('data-edit-id');
        form.reset();
        
        // Reset button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'İşlem Ekle';
        }
        
    } catch (error) {
        console.error('❌ Error adding/updating transaction:', error);
        showStatus('İşlem eklenirken/güncellenirken hata oluştu', 'error');
    }
}

// Add or edit category
async function addCategory(formData) {
    try {
        const form = document.getElementById('addCategoryForm');
        const editId = form.getAttribute('data-edit-id');
        
        if (editId) {
            // Edit existing category
            const categoryIndex = userData.budget.categories.findIndex(c => c.id === editId);
            if (categoryIndex !== -1) {
                userData.budget.categories[categoryIndex] = {
                    ...userData.budget.categories[categoryIndex],
                    name: formData.get('categoryName'),
                    type: formData.get('categoryType'),
                    color: formData.get('categoryColor'),
                    icon: formData.get('categoryIcon'),
                    updatedAt: new Date().toISOString()
                };
                
                console.log('✅ Category updated successfully');
                showStatus('Kategori başarıyla güncellendi', 'success');
            }
        } else {
            // Add new category
            const category = {
                id: 'cat_' + Date.now(),
                name: formData.get('categoryName'),
                type: formData.get('categoryType'),
                color: formData.get('categoryColor'),
                icon: formData.get('categoryIcon'),
                createdAt: new Date().toISOString()
            };
            
            if (!userData.budget.categories) {
                userData.budget.categories = [];
            }
            
            userData.budget.categories.push(category);
            
            console.log('✅ Category added successfully');
            showStatus('Kategori başarıyla eklendi', 'success');
        }
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        // Update UI
        updateBudgetOverview();
        
        // Close modal and reset form
        closeModal('addCategoryModal');
        form.removeAttribute('data-edit-id');
        form.reset();
        
        // Reset button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Kategori Ekle';
        }
        
    } catch (error) {
        console.error('❌ Error adding/updating category:', error);
        showStatus('Kategori eklenirken/güncellenirken hata oluştu', 'error');
    }
}

// Add or edit goal
async function addGoal(formData) {
    try {
        const form = document.getElementById('addGoalForm');
        const editId = form.getAttribute('data-edit-id');
        
        if (editId) {
            // Edit existing goal
            const goalIndex = userData.budget.goals.findIndex(g => g.id === editId);
            if (goalIndex !== -1) {
                userData.budget.goals[goalIndex] = {
                    ...userData.budget.goals[goalIndex],
                    name: formData.get('goalName'),
                    targetAmount: parseFloat(formData.get('goalTargetAmount')),
                    currentAmount: parseFloat(formData.get('goalCurrentAmount')),
                    deadline: formData.get('goalDeadline'),
                    priority: formData.get('goalPriority'),
                    updatedAt: new Date().toISOString()
                };
                
                console.log('✅ Goal updated successfully');
                showStatus('Hedef başarıyla güncellendi', 'success');
            }
        } else {
            // Add new goal
            const goal = {
                id: 'goal_' + Date.now(),
                name: formData.get('goalName'),
                targetAmount: parseFloat(formData.get('goalTargetAmount')),
                currentAmount: parseFloat(formData.get('goalCurrentAmount')),
                deadline: formData.get('goalDeadline'),
                priority: formData.get('goalPriority'),
                createdAt: new Date().toISOString()
            };
            
            if (!userData.budget.goals) {
                userData.budget.goals = [];
            }
            
            userData.budget.goals.push(goal);
            
            console.log('✅ Goal added successfully');
            showStatus('Hedef başarıyla eklendi', 'success');
        }
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        // Update UI
        updateBudgetOverview();
        
        // Close modal and reset form
        closeModal('addGoalModal');
        form.removeAttribute('data-edit-id');
        form.reset();
        
        // Reset button text
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.textContent = 'Hedef Ekle';
        }
        
    } catch (error) {
        console.error('❌ Error adding/updating goal:', error);
        showStatus('Hedef eklenirken/güncellenirken hata oluştu', 'error');
    }
}

// Update period data when transaction is added
async function updatePeriodData(transaction) {
    if (!userData.budget.periods) return;
    
    const periods = userData.budget.periods;
    const transactionDate = new Date(transaction.date);
    const today = new Date();
    
    // Update daily period
    if (isSameDay(transactionDate, today)) {
        if (transaction.type === 'expense') {
            periods.daily.spent += transaction.amount;
            periods.daily.remaining -= transaction.amount;
        } else {
            periods.daily.budget += transaction.amount;
            periods.daily.remaining += transaction.amount;
        }
    }
    
    // Update weekly period
    if (isSameWeek(transactionDate, today)) {
        if (transaction.type === 'expense') {
            periods.weekly.spent += transaction.amount;
            periods.weekly.remaining -= transaction.amount;
        } else {
            periods.weekly.budget += transaction.amount;
            periods.weekly.remaining += transaction.amount;
        }
    }
    
    // Update monthly period
    if (isSameMonth(transactionDate, today)) {
        if (transaction.type === 'expense') {
            periods.monthly.spent += transaction.amount;
            periods.monthly.remaining -= transaction.amount;
        } else {
            periods.monthly.budget += transaction.amount;
            periods.monthly.remaining += transaction.amount;
        }
    }
    
    // Update yearly period
    if (isSameYear(transactionDate, today)) {
        if (transaction.type === 'expense') {
            periods.yearly.spent += transaction.amount;
            periods.yearly.remaining -= transaction.amount;
        } else {
            periods.yearly.budget += transaction.amount;
            periods.yearly.remaining += transaction.amount;
        }
    }
}

// Utility functions for date comparison
function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function isSameWeek(date1, date2) {
    const d1 = new Date(date1.getTime());
    const d2 = new Date(date2.getTime());
    d1.setHours(0, 0, 0, 0);
    d2.setHours(0, 0, 0, 0);
    
    const oneDay = 24 * 60 * 60 * 1000;
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / oneDay);
    
    return diffDays <= 7;
}

function isSameMonth(date1, date2) {
    return date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

function isSameYear(date1, date2) {
    return date1.getFullYear() === date2.getFullYear();
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format date and time for display
function formatDateTime(dateString) {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    return `${dateStr} - ${timeStr}`;
}

// Setup budget form event listeners
function setupBudgetFormListeners() {
    // Transaction form
    const transactionForm = document.getElementById('addTransactionForm');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(transactionForm);
            addTransaction(formData);
        });
    }
    
    // Category form
    const categoryForm = document.getElementById('addCategoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(categoryForm);
            addCategory(formData);
        });
    }
    
    // Goal form
    const goalForm = document.getElementById('addGoalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(goalForm);
            addGoal(formData);
        });
    }
    
    // Goal transaction form
    const goalTransactionForm = document.getElementById('goalTransactionForm');
    if (goalTransactionForm) {
        goalTransactionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const formData = new FormData(goalTransactionForm);
            handleGoalTransaction(formData);
        });
    }
}

// Make functions globally available
window.switchBudgetPeriod = switchBudgetPeriod;
window.showAddTransactionModal = showAddTransactionModal;
window.showAddCategoryModal = showAddCategoryModal;
window.showAddGoalModal = showAddGoalModal;
window.showCustomDateSelector = showCustomDateSelector;
window.hideCustomDateSelector = hideCustomDateSelector;
window.updateCustomDateRange = updateCustomDateRange;
window.applyCustomDateRange = applyCustomDateRange;

// Make essential UI functions globally available
window.closeModal = closeModal;
window.showSection = showSection;
window.filterTasks = filterTasks;
window.showAddTaskModal = showAddTaskModal;
window.showAddProjectModal = showAddProjectModal;
window.showAddDailyTaskModal = showAddDailyTaskModal;

// Icon selection function for category modal
function selectIcon(icon) {
    // Remove selected class from all options
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    event.target.classList.add('selected');
    
    // Update the input field
    document.getElementById('categoryIcon').value = icon;
}

// Make icon selection function globally available
window.selectIcon = selectIcon;


// Cleanup function for budget real-time listeners
function cleanupBudgetListeners() {
    if (window.budgetUnsubscribe) {
        window.budgetUnsubscribe();
        window.budgetUnsubscribe = null;
        console.log('🧹 Budget real-time listeners cleaned up');
    }
}

// Make cleanup function globally available
window.cleanupBudgetListeners = cleanupBudgetListeners;

// Edit Transaction
async function editTransaction(transactionId) {
    const transaction = userData.budget.transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    // Pre-fill modal with existing data
    document.getElementById('transactionType').value = transaction.type;
    document.getElementById('transactionCategory').value = transaction.categoryId;
    document.getElementById('transactionAmount').value = transaction.amount;
    document.getElementById('transactionDescription').value = transaction.description;
    
    // Convert date string to datetime-local format
    if (transaction.date) {
        const date = new Date(transaction.date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('transactionDateTime').value = dateTimeValue;
    }
    
            // Show modal
        const modal = document.getElementById('addTransactionModal');
        if (modal) {
            modal.style.display = 'flex';
        setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            loadCategoriesForTransaction();
            
            // Change form to edit mode
            const form = document.getElementById('addTransactionForm');
            form.setAttribute('data-edit-id', transactionId);
            
            // Change button text
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'İşlemi Güncelle';
            }
        }
}

// Delete Transaction
async function deleteTransaction(transactionId) {
    if (!confirm('Bu işlemi silmek istediğinizden emin misiniz?')) return;
    
    try {
        // Remove transaction from array
        userData.budget.transactions = userData.budget.transactions.filter(t => t.id !== transactionId);
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        console.log('✅ Transaction deleted successfully');
        showStatus('İşlem başarıyla silindi', 'success');
        
        // Update UI
        updateBudgetOverview();
        
    } catch (error) {
        console.error('❌ Error deleting transaction:', error);
        showStatus('İşlem silinirken hata oluştu', 'error');
    }
}

// Edit Category
async function editCategory(categoryId) {
    const category = userData.budget.categories.find(c => c.id === categoryId);
    if (!category) return;
    
    // Pre-fill modal with existing data
    document.getElementById('categoryName').value = category.name;
    document.getElementById('categoryType').value = category.type;
    document.getElementById('categoryColor').value = category.color;
    document.getElementById('categoryIcon').value = category.icon;
    
    // Update icon selection
    document.querySelectorAll('.icon-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.icon === category.icon) {
            option.classList.add('selected');
        }
    });
    
            // Show modal
        const modal = document.getElementById('addCategoryModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Change form to edit mode
            const form = document.getElementById('addCategoryForm');
            form.setAttribute('data-edit-id', categoryId);
            
            // Change button text
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Kategoriyi Güncelle';
            }
        }
}

// Delete Category
async function deleteCategory(categoryId) {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) return;
    
    try {
        // Remove category from array
        userData.budget.categories = userData.budget.categories.filter(c => c.id !== categoryId);
        
        // Also remove any transactions with this category
        userData.budget.transactions = userData.budget.transactions.filter(t => t.categoryId !== categoryId);
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        console.log('✅ Category deleted successfully');
        showStatus('Kategori başarıyla silindi', 'success');
        
        // Update UI
        updateBudgetOverview();
        
    } catch (error) {
        console.error('❌ Error deleting category:', error);
        showStatus('Kategori silinirken hata oluştu', 'error');
    }
}

// Edit Goal
async function editGoal(goalId) {
    const goal = userData.budget.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    // Pre-fill modal with existing data
    document.getElementById('goalName').value = goal.name;
    document.getElementById('goalTargetAmount').value = goal.targetAmount;
    document.getElementById('goalCurrentAmount').value = goal.currentAmount;
    
    // Convert deadline string to datetime-local format
    if (goal.deadline) {
        const date = new Date(goal.deadline);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const dateTimeValue = `${year}-${month}-${day}T${hours}:${minutes}`;
        document.getElementById('goalDeadline').value = dateTimeValue;
    }
    
    document.getElementById('goalPriority').value = goal.priority;
    
            // Show modal
        const modal = document.getElementById('addGoalModal');
        if (modal) {
            modal.style.display = 'flex';
    setTimeout(() => {
                modal.classList.add('show');
            }, 10);
            
            // Change form to edit mode
            const form = document.getElementById('addGoalForm');
            form.setAttribute('data-edit-id', goalId);
            
            // Change button text
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.textContent = 'Hedefi Güncelle';
            }
        }
}

// Delete Goal
async function deleteGoal(goalId) {
    if (!confirm('Bu hedefi silmek istediğinizden emin misiniz?')) return;
    
    try {
        // Remove goal from array
        userData.budget.goals = userData.budget.goals.filter(g => g.id !== goalId);
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        console.log('✅ Goal deleted successfully');
        showStatus('Hedef başarıyla silindi', 'success');
        
        // Update UI
        updateBudgetOverview();
        
    } catch (error) {
        console.error('❌ Error deleting goal:', error);
        showStatus('Hedef silinirken hata oluştu', 'error');
    }
}

// Show goal transaction modal
function showGoalTransactionModal(goalId, transactionType) {
    const goal = userData.budget.goals.find(g => g.id === goalId);
    if (!goal) return;
    
    const modal = document.getElementById('goalTransactionModal');
    const title = document.getElementById('goalTransactionTitle');
    const submitButton = document.getElementById('goalTransactionSubmit');
    
    if (modal && title && submitButton) {
        // Set modal title and button text based on transaction type
        if (transactionType === 'deposit') {
            title.textContent = `${goal.name} - Para Yatır`;
            submitButton.textContent = 'Para Yatır';
            submitButton.style.background = 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)';
        } else {
            title.textContent = `${goal.name} - Para Çek`;
            submitButton.textContent = 'Para Çek';
            submitButton.style.background = 'linear-gradient(135deg, #ffc107 0%, #ff9800 100%)';
        }
        
        // Store goal ID and transaction type for form submission
        const form = document.getElementById('goalTransactionForm');
        form.setAttribute('data-goal-id', goalId);
        form.setAttribute('data-transaction-type', transactionType);
        
        // Show modal
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
}

// Handle goal transaction
async function handleGoalTransaction(formData) {
    try {
        const form = document.getElementById('goalTransactionForm');
        const goalId = form.getAttribute('data-goal-id');
        const transactionType = form.getAttribute('data-transaction-type');
        const amount = parseFloat(formData.get('goalTransactionAmount'));
        const description = formData.get('goalTransactionDescription');
        
        console.log('🔍 Debug: Goal transaction - goalId:', goalId, 'type:', transactionType, 'amount:', amount);
        
        // Find the goal
        const goalIndex = userData.budget.goals.findIndex(g => g.id === goalId);
        if (goalIndex === -1) {
            console.error('❌ Goal not found:', goalId);
            return;
        }
        
        const goal = userData.budget.goals[goalIndex];
        
        // Update goal's current amount
        if (transactionType === 'deposit') {
            goal.currentAmount += amount;
            console.log('✅ Deposited', amount, 'to goal. New amount:', goal.currentAmount);
        } else if (transactionType === 'withdraw') {
            if (goal.currentAmount >= amount) {
                goal.currentAmount -= amount;
                console.log('✅ Withdrew', amount, 'from goal. New amount:', goal.currentAmount);
            } else {
                showStatus('Yetersiz bakiye! Hedeften çekilebilecek miktar: ' + goal.currentAmount.toFixed(2) + ' ₺', 'error');
                return;
            }
        }
        
        // Create a transaction record for tracking
        const transaction = {
            id: 'goal_trans_' + Date.now(),
            type: transactionType === 'deposit' ? 'expense' : 'income', // Reverse because it's moving money to/from goal
            categoryId: null,
            amount: amount,
            description: `${transactionType === 'deposit' ? 'Hedef yatırımı' : 'Hedef çekimi'}: ${goal.name} - ${description}`,
            date: new Date().toISOString().split('T')[0],
            goalId: goalId,
            goalTransaction: true,
            createdAt: new Date().toISOString()
        };
        
        // Add transaction to budget
        if (!userData.budget.transactions) {
            userData.budget.transactions = [];
        }
        userData.budget.transactions.push(transaction);
        
        // Save to Firestore
        await db.collection('user_data').doc(currentUser.uid).set(userData, { merge: true });
        
        console.log('✅ Goal transaction completed successfully');
        showStatus(`${transactionType === 'deposit' ? 'Para yatırma' : 'Para çekme'} işlemi başarıyla tamamlandı`, 'success');
        
        // Update UI
        updateBudgetOverview();
        
        // Close modal and reset form
        closeModal('goalTransactionModal');
        form.removeAttribute('data-goal-id');
        form.removeAttribute('data-transaction-type');
        form.reset();
        
    } catch (error) {
        console.error('❌ Error in goal transaction:', error);
        showStatus('İşlem sırasında hata oluştu', 'error');
    }
}

// Make edit and delete functions globally available
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editGoal = editGoal;
window.deleteGoal = deleteGoal;
window.showGoalTransactionModal = showGoalTransactionModal;


