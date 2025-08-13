// Firebase Configuration
// ⚠️ GÜVENLİK UYARISI: API anahtarlarını firebase-keys.txt dosyasından otomatik olarak alır!

// Anahtarları otomatik olarak yükle
async function loadFirebaseKeys() {
    try {
        // Fetch API ile firebase-keys.txt dosyasını oku
        const response = await fetch('../security/firebase-keys.txt');
        
        if (response.ok) {
            const content = await response.text();
            const keys = {};
            
            // Her satırı parse et
            const lines = content.split('\n');
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Yorum satırlarını ve boş satırları atla
                if (trimmedLine.startsWith('#') || trimmedLine === '') {
                    continue;
                }
                
                // key: value formatını parse et
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex > 0) {
                    const key = trimmedLine.substring(0, colonIndex).trim();
                    const value = trimmedLine.substring(colonIndex + 1).trim();
                    
                    // Tırnak işaretlerini kaldır (eğer varsa)
                    const cleanValue = value.replace(/^["']|["']$/g, '');
                    keys[key] = cleanValue;
                }
            }
            
            console.log('✅ Firebase anahtarları otomatik olarak yüklendi');
            return keys;
        } else {
            throw new Error('firebase-keys.txt dosyası okunamadı');
        }
    } catch (error) {
        console.error('❌ Firebase anahtarları yüklenemedi:', error.message);
        console.log('⚠️  Placeholder değerler kullanılıyor...');
        
        // Hata durumunda placeholder değerler döndür
        return {
            apiKey: "YOUR_API_KEY_HERE",
            authDomain: "YOUR_AUTH_DOMAIN_HERE",
            projectId: "YOUR_PROJECT_ID_HERE",
            storageBucket: "YOUR_STORAGE_BUCKET_HERE",
            messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
            appId: "YOUR_APP_ID_HERE"
        };
    }
}

// Anahtarları yükle ve config'i oluştur
let firebaseConfig = null;

// Async olarak anahtarları yükle
loadFirebaseKeys().then(keys => {
    firebaseConfig = {
        apiKey: keys.apiKey,
        authDomain: keys.authDomain,
        projectId: keys.projectId,
        storageBucket: keys.storageBucket,
        messagingSenderId: keys.messagingSenderId,
        appId: keys.appId
    };
    
    // Global olarak erişilebilir yap
    if (typeof window !== 'undefined') {
        window.firebaseConfig = firebaseConfig;
    }
    
    console.log('✅ Firebase config hazır:', firebaseConfig);
}).catch(error => {
    console.error('❌ Firebase config yüklenemedi:', error);
    
    // Hata durumunda placeholder config oluştur
    firebaseConfig = {
        apiKey: "YOUR_API_KEY_HERE",
        authDomain: "YOUR_AUTH_DOMAIN_HERE",
        projectId: "YOUR_PROJECT_ID_HERE",
        storageBucket: "YOUR_STORAGE_BUCKET_HERE",
        messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
        appId: "YOUR_APP_ID_HERE"
    };
    
    if (typeof window !== 'undefined') {
        window.firebaseConfig = firebaseConfig;
    }
});

// Module export için (Node.js ortamında)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, loadFirebaseKeys };
}

// GÜVENLİK NOTU:
// 1. firebase-keys.txt dosyası .gitignore'da olmalı
// 2. Bu dosyayı GitHub'a yüklemeden önce gerçek anahtarları kaldırın
// 3. Production'da environment variables kullanın