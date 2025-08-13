// Index.js - Clario Landing Page

// Global variables
let auth = null;
let db = null;

// Status functions
function showStatus(message, type = 'info') {
    const status = document.getElementById('status');
    if (status) {
        status.textContent = message;
        status.className = `status ${type}`;
    }
}

// Load Firebase config
function loadFirebase() {
    const script = document.createElement('script');
    script.src = 'config/config.js';
    script.onload = function() {
        setTimeout(() => {
            if (window.firebaseConfig) {
                initializeFirebase();
            } else {
                showStatus('Firebase konfigürasyonu yüklenemedi', 'error');
                setTimeout(() => {
                    window.location.href = 'pages/login.html';
                }, 2000);
            }
        }, 500);
    };
    script.onerror = function() {
        showStatus('Konfigürasyon dosyası yüklenemedi', 'error');
        setTimeout(() => {
            window.location.href = 'pages/login.html';
        }, 2000);
    };
    document.head.appendChild(script);
}

// Initialize Firebase
function initializeFirebase() {
    console.log('Initializing Firebase...');
    showStatus('Firebase başlatılıyor...');
    
    if (typeof firebase !== 'undefined') {
        try {
            const app = firebase.initializeApp(window.firebaseConfig);
            auth = firebase.auth(app);
            db = firebase.firestore(app);
            
            auth.onAuthStateChanged(handleAuthStateChanged);
            
        } catch (error) {
            console.error('Firebase initialization error:', error);
            showStatus('Firebase başlatılamadı', 'error');
            setTimeout(() => {
                window.location.href = 'pages/login.html';
            }, 2000);
        }
    } else {
        loadFirebaseFromCDN();
    }
}

// Load Firebase from CDN
function loadFirebaseFromCDN() {
    console.log('Loading Firebase from CDN...');
    showStatus('Firebase yükleniyor...');
    
    const firebaseApp = document.createElement('script');
    firebaseApp.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js';
    
    const firebaseAuth = document.createElement('script');
    firebaseAuth.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js';
    
    const firebaseFirestore = document.createElement('script');
    firebaseFirestore.src = 'https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js';
    
    firebaseApp.onload = function() {
        firebaseAuth.onload = function() {
            firebaseFirestore.onload = function() {
                setTimeout(() => {
                    try {
                        if (typeof firebase !== 'undefined') {
                            const app = firebase.initializeApp(window.firebaseConfig);
                            auth = firebase.auth(app);
                            db = firebase.firestore(app);
                            
                            auth.onAuthStateChanged(handleAuthStateChanged);
                        } else {
                            showStatus('Firebase yüklenemedi', 'error');
                            setTimeout(() => {
                                window.location.href = 'pages/login.html';
                            }, 2000);
                        }
                    } catch (error) {
                        showStatus('Firebase başlatılamadı', 'error');
                        setTimeout(() => {
                            window.location.href = 'pages/login.html';
                        }, 2000);
                    }
                }, 1500);
            };
            document.head.appendChild(firebaseFirestore);
        };
        document.head.appendChild(firebaseAuth);
    };
    document.head.appendChild(firebaseApp);
}

// Handle auth state changes
function handleAuthStateChanged(user) {
    if (user) {
        console.log('User is logged in, redirecting to main app...');
        showStatus('Giriş yapıldı, yönlendiriliyorsunuz...', 'success');
        
        setTimeout(() => {
            window.location.href = 'pages/app.html';
        }, 1500);
    } else {
        console.log('User is not logged in, redirecting to login...');
        showStatus('Giriş yapılmadı, giriş sayfasına yönlendiriliyorsunuz...', 'info');
        
        setTimeout(() => {
            window.location.href = 'pages/login.html';
        }, 2000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFirebase();
});
