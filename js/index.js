// Index.js - Clario Landing Page (Optimized)

// Global variables
let auth = null;
let db = null;

// Show status message
function showStatus(message, type = 'info') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
        statusElement.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    showStatus(message, 'success');
}

// Show error message
function showError(message) {
    showStatus(message, 'error');
}

// Show info message
function showInfo(message) {
    showStatus(message, 'info');
}

// Load Firebase config
function loadFirebase() {
    const script = document.createElement('script');
    script.src = '../config.js';
    script.onload = () => {
        // Listen for config ready event
        window.addEventListener('firebaseConfigReady', () => {
            initializeFirebase();
        });
        
        // Fallback timeout
        setTimeout(() => {
            if (window.firebaseConfig && !auth) {
                initializeFirebase();
            }
        }, 500);
    };
    script.onerror = () => {
        showStatus('Konfigürasyon dosyası yüklenemedi', 'error');
        redirectToLogin(2000);
    };
    document.head.appendChild(script);
}

// Initialize Firebase
function initializeFirebase() {
    showStatus('Loading Firebase...');
    
    if (typeof firebase !== 'undefined') {
        try {
            // Check if Firebase is already initialized
            let app;
            try {
                app = firebase.app();
            } catch (error) {
                // No app exists, create new one
                app = firebase.initializeApp(window.firebaseConfig);
            }
            
            auth = firebase.auth(app);
            db = firebase.firestore(app);
            auth.onAuthStateChanged(handleAuthStateChanged);
        } catch (error) {
            console.error('Firebase initialization error:', error);
            showStatus('Firebase initialization failed: ' + error.message, 'error');
            redirectToLogin(2000);
        }
    } else {
        loadFirebaseFromCDN();
    }
}

// Load Firebase from CDN
function loadFirebaseFromCDN() {
    showStatus('Loading Firebase...');
    
    const scripts = [
        'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js',
        'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js',
        'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js'
    ];
    
    let loadedCount = 0;
    
    scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            loadedCount++;
            if (loadedCount === scripts.length) {
                setTimeout(() => {
                    try {
                        if (typeof firebase !== 'undefined') {
                            // Check if Firebase is already initialized
                            let app;
                            try {
                                app = firebase.app();
                            } catch (error) {
                                // No app exists, create new one
                                app = firebase.initializeApp(window.firebaseConfig);
                            }
                            
                            auth = firebase.auth(app);
                            db = firebase.firestore(app);
                            auth.onAuthStateChanged(handleAuthStateChanged);
                        } else {
                            showStatus('Firebase failed to load', 'error');
                            redirectToLogin(2000);
                        }
                    } catch (error) {
                        showStatus('Firebase initialization failed', 'error');
                        redirectToLogin(2000);
                    }
                }, 1000);
            }
        };
        document.head.appendChild(script);
    });
}

// Handle auth state changes
function handleAuthStateChanged(user) {
    if (user) {
        showStatus('Login successful, redirecting...', 'success');
        redirectToApp(1500);
    } else {
        showStatus('Not logged in, redirecting to login page...', 'info');
        redirectToLogin(2000);
    }
}

// Utility functions
function redirectToLogin(delay = 2000) {
    setTimeout(() => {
        window.location.href = 'pages/login.html';
    }, delay);
}

function redirectToApp(delay = 1500) {
    setTimeout(() => {
        window.location.href = 'pages/app.html';
    }, delay);
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadFirebase);
