// Firebase Configuration
// ⚠️ SECURITY WARNING: Enter your own Firebase information in this file!

// Firebase config object - enter your own information here
const firebaseConfig = {
    apiKey: "AIzaSyDj6QFgAXH182QLGU8BD1Br7ewll3Xnh2A",
    authDomain: "platform-uygulamasi.firebaseapp.com",
    projectId: "platform-uygulamasi",
    storageBucket: "platform-uygulamasi.firebasestorage.app",
    messagingSenderId: "776626966883",
    appId: "1:776626966883:web:57a4e00696d77baf91c356"
  };

// Make globally accessible
if (typeof window !== 'undefined') {
    window.firebaseConfig = firebaseConfig;
}

console.log('✅ Firebase config ready');

// Module export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig };
}

// SECURITY NOTE:
// 1. Add this file to .gitignore
// 2. Remove real keys before uploading to GitHub
// 3. Use environment variables in production