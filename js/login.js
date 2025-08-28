// Login.js - Clario Authentication System (Optimized)

// Global variables
let auth = null;
let db = null;

// Security variables
let loginAttempts = 0;
let lastLoginAttempt = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Tab switching function
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    if (tabName === 'login') {
        document.querySelector('.tab:first-child').classList.add('active');
        document.getElementById('loginContent').classList.add('active');
        updateSecurityInfo();
    } else {
        document.querySelector('.tab:last-child').classList.add('active');
        document.getElementById('registerContent').classList.add('active');
        document.getElementById('securityInfo').style.display = 'none';
    }
    
    hideStatus();
}

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

function hideStatus() {
    document.getElementById('status').style.display = 'none';
}

// Security functions
function updateSecurityInfo() {
    const securityInfo = document.getElementById('securityInfo');
    const attemptsCount = document.getElementById('attemptsCount');
    const securityTimer = document.getElementById('securityTimer');
    const remainingTime = document.getElementById('remainingTime');
    
    if (loginAttempts > 0) {
        securityInfo.style.display = 'block';
        attemptsCount.textContent = loginAttempts;
        
        if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            const currentTime = Date.now();
            const timeLeft = Math.ceil((LOGIN_TIMEOUT - (currentTime - lastLoginAttempt)) / 1000 / 60);
            
            if (timeLeft > 0) {
                securityTimer.style.display = 'block';
                remainingTime.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    resetSecurityInfo();
                }
            } else {
                securityTimer.style.display = 'none';
            }
        } else {
            securityTimer.style.display = 'none';
        }
    } else {
        securityInfo.style.display = 'none';
    }
}

function resetSecurityInfo() {
    loginAttempts = 0;
    lastLoginAttempt = 0;
    updateSecurityInfo();
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
        showError('Konfigürasyon dosyası yüklenemedi');
    };
    document.head.appendChild(script);
}

// Initialize Firebase
function initializeFirebase() {
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
            setupFormListeners();
        } catch (error) {
            console.error('Firebase initialization error:', error);
            showError('Firebase başlatılamadı: ' + error.message);
        }
    } else {
        loadFirebaseFromCDN();
    }
}

// Load Firebase from CDN
function loadFirebaseFromCDN() {
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
                                setupFormListeners();
                            } else {
                                showError('Firebase yüklenemedi. Lütfen sayfayı yenileyin.');
                            }
                        } catch (error) {
                            showError('Firebase başlatılamadı: ' + error.message);
                        }
                }, 1000);
            }
        };
        document.head.appendChild(script);
    });
}

// Handle auth state changes
async function handleAuthStateChanged(user) {
    if (user) {
        try {
            // Check if user exists in new user_data collection
            let userDoc = await db.collection('user_data').doc(user.uid).get();
            
            // If not found in new collection, check old users collection for migration
            if (!userDoc.exists) {
                console.log('User not found in user_data collection, checking old users collection...');
                const oldUserDoc = await db.collection('user_data').doc(user.uid).get();
                
                if (oldUserDoc.exists) {
                    console.log('Found user in old collection, migrating to new structure...');
                    
                    // Migrate old user data to new structure
                    const oldData = oldUserDoc.data();
                    const newUserData = {
                        profile: {
                            name: oldData.username || oldData.displayName || user.email.split('@')[0],
                            email: user.email,
                            photoPATH: oldData.photoURL || '',
                            bio: oldData.bio || '',
                            createdAt: oldData.createdAt || new Date().toISOString()
                        },
                        preferences: {
                            theme: 'dark',
                            language: 'en',
                            timeZone: 'Europe/Istanbul',
                            defaultView: 'list',
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
                                action: 'user_migrated',
                                userId: user.uid,
                                timestamp: new Date().toISOString()
                            }
                        ]
                    };
                    
                    // Create new user_data document
                    await db.collection('user_data').doc(user.uid).set(newUserData);
                    
                    // Delete old document
                    await db.collection('user_data').doc(user.uid).delete();
                    
                    console.log('User data migrated successfully');
                    userDoc = await db.collection('user_data').doc(user.uid).get();
                } else {
                    console.log('User not found in any collection, creating new user data...');
                    
                    // Create new user data with default structure
                    const newUserData = {
                        profile: {
                            name: user.email.split('@')[0],
                            email: user.email,
                            photoPATH: '',
                            bio: '',
                            createdAt: new Date().toISOString()
                        },
                        preferences: {
                            theme: 'dark',
                            language: 'en',
                            timeZone: 'Europe/Istanbul',
                            defaultView: 'list',
                            notificationSettings: {
                                email: true,
                                push: true,
                                reminderTime: '09:00'
                            }
                        },
                        projects: [],
                        tasks: [],
                        dailyTasks: [],
                        activityLog: [
                            {
                                action: 'user_created',
                                userId: user.uid,
                                timestamp: new Date().toISOString()
                            }
                        ]
                    };
                    
                    await db.collection('user_data').doc(user.uid).set(newUserData);
                    userDoc = await db.collection('user_data').doc(user.uid).get();
                }
            }
            
            // User exists, proceed with login
            console.log('User verified in Firestore, proceeding with login...');
            
            localStorage.setItem('clario_last_login', Date.now().toString());
            localStorage.setItem('clario_user_data', JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: userDoc.data().profile.name
            }));
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect to app after successful verification
            setTimeout(() => {
                window.location.href = '../pages/app.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error checking user existence:', error);
            showError('User verification error: ' + error.message);
            
            // Sign out on error
            await auth.signOut();
            
            // Clear stored data
            localStorage.removeItem('clario_last_login');
            localStorage.removeItem('clario_user_data');
            sessionStorage.clear();
        }
    } else {
        localStorage.removeItem('clario_last_login');
        localStorage.removeItem('clario_user_data');
    }
}

// Setup form listeners
function setupFormListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email || !password) {
        showError('Email and password are required!');
        return;
    }
    
    // Check security restrictions
    const currentTime = Date.now();
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS && (currentTime - lastLoginAttempt) < LOGIN_TIMEOUT) {
        const timeLeft = Math.ceil((LOGIN_TIMEOUT - (currentTime - lastLoginAttempt)) / 1000 / 60);
        showError(`Too many failed attempts. Please wait ${timeLeft} minutes.`);
        return;
    }
    
    try {
        showStatus('Logging in...', 'info');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        if (userCredential.user) {
            loginAttempts = 0;
            lastLoginAttempt = 0;
            updateSecurityInfo();
            // Success message and redirect will be handled in handleAuthStateChanged
        }
        
    } catch (error) {
        console.error('Login error:', error);
        
        loginAttempts++;
        lastLoginAttempt = currentTime;
        updateSecurityInfo();
        
        let errorMessage = 'Login failed!';
        
        // Check for specific error patterns in the message
        if (error.message && error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
            errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'This email address is not registered. Please create an account first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Incorrect password. Please check your password and try again.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email format. Please enter a valid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled. Please contact support.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                case 'auth/internal-error':
                    // Check if it's a credentials error
                    if (error.message && error.message.includes('INVALID_LOGIN_CREDENTIALS')) {
                        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                    } else {
                        errorMessage = 'Authentication service error. Please try again later.';
                    }
                    break;
                default:
                    errorMessage = 'Login failed: ' + (error.message || 'Unknown error occurred');
            }
        }
        
        showError(errorMessage);
    }
}

// Handle register
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    
    if (!username || !email || !password || !passwordConfirm) {
        showError('All fields are required!');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters!');
        return;
    }
    
    if (password !== passwordConfirm) {
        showError('Passwords do not match!');
        return;
    }
    
    try {
        showStatus('Registering...', 'info');
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        if (userCredential.user) {
            // Update user profile
            await userCredential.user.updateProfile({
                displayName: username
            });
            
            // Create user document in Firestore with new Taslak.json structure
            const userData = {
                profile: {
                    name: username,
                    email: email,
                    photoPATH: null,
                    bio: "New user",
                    createdAt: new Date().toISOString()
                },
                preferences: {
                    theme: "dark",
                    language: "en",
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    defaultView: "list",
                    notificationSettings: {
                        email: true,
                        push: true,
                        reminderTime: "09:00"
                    }
                },
                projects: [],
                tasks: [],
                dailyTasks: [],
                activityLog: [
                    {
                        action: "user_created",
                        timestamp: new Date().toISOString()
                    }
                ]
            };
            
            // Save to user_data collection (new structure)
            await db.collection('user_data').doc(userCredential.user.uid).set(userData);
            
            showSuccess('Registration successful! Logging in...');
            
            // Auto login after registration
            setTimeout(() => {
                window.location.href = '../pages/app.html';
            }, 1500);
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        
        let errorMessage = 'Registration failed!';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email address is already in use!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format!';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak!';
                break;
            default:
                errorMessage = 'Registration error: ' + error.message;
        }
        
        showError(errorMessage);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadFirebase();
    setupFloatingLabels();
});

// Setup floating labels
function setupFloatingLabels() {
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        // Check if input has value on load
        if (input.value) {
            input.parentElement.classList.add('has-value');
        }
        
        // Handle input events
        input.addEventListener('input', function() {
            if (this.value) {
                this.parentElement.classList.add('has-value');
            } else {
                this.parentElement.classList.remove('has-value');
            }
        });
        
        // Handle focus events
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
}
