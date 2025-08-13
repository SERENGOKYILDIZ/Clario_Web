# Planning Application

A modern and user-friendly planning application with secure Firebase authentication and data storage.

## 🚀 Features

- **Secure Login/Registration**: Secure user management with Firebase Authentication
- **Project Management**: Create and manage projects
- **Task Tracking**: Priority-based task management and tracking
- **Responsive Design**: Mobile and desktop compatible interface
- **Real-time Data**: Instant data synchronization with Firebase Firestore
- **Automatic Redirects**: Access to main application is blocked without login
- **Session Management**: Sessions are preserved when refreshing pages
- **Data Isolation**: Users can only access their own data

## 📁 File Structure

```
myAppTest/
├── index.html              # 🔐 Authentication control page (redirector)
├── README.md               # 📖 This comprehensive guide
├── .gitignore              # 🛡️ Security files
├── pages/                  # 📱 Application pages
│   ├── login.html          # 🔑 Login and registration page
│   └── app.html            # 📱 Main application page (planning)
├── config/                 # ⚙️ Configuration files
│   ├── config.js           # Firebase configuration (automatic key loader)
│   └── config.js.backup    # Backup configuration
├── security/               # 🔒 Security files
│   ├── firebase-keys.txt   # SECURE - API keys (.gitignore'd)
│   └── firestore.rules     # Firestore security rules
└── docs/                   # 📚 Documentation
    └── PROJECT_SUMMARY.md  # Project overview
```

## 🔥 Firebase Setup Guide

### 1. Firebase Console Setup
1. Open [Firebase Console](https://console.firebase.google.com/)
2. **"Create a project"** → Project name: `platform-uygulamasi`
3. Enable Google Analytics (optional)
4. Click **"Create project"** button

### 2. Create Firestore Database
1. From left menu, select **"Firestore Database"**
2. **"Create Database"** → **"Start in test mode"**
3. Select region (e.g., `europe-west3`)
4. Click **"Done"** button

### 3. Security Rules
1. Firestore → **"Rules"** tab
2. Paste the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow authenticated users to read/write their own data
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"** button

### 4. Authentication Setup
1. Left menu → **"Authentication"**
2. Click **"Get started"** button
3. **"Sign-in method"** tab
4. **"Email/Password"** → **"Enable"** → **"Save"**

### 5. Add Web App
1. Left menu → **"Project settings"** (⚙️ icon)
2. **"General"** tab → **"Your apps"** → **"Web app"** icon
3. App nickname: `planlama-uygulamasi`
4. Click **"Register app"** button
5. Copy Firebase SDKs (config information)

## 🔐 API Keys Security

### ⚠️ IMPORTANT SECURITY WARNING
Never share your Firebase API keys in public repositories!

### Security Measures:
- ✅ `firebase-keys.txt` file added to `.gitignore`
- ✅ `config.js` automatic key loader
- ✅ Detailed security guide

### Automatic Setup:
`config.js` automatically reads keys from `firebase-keys.txt`!

**You don't need to run any additional scripts.** Just:
1. Create `firebase-keys.txt` file
2. Write keys in `key: value` format:

```txt
# Firebase API Keys - KEEP SECURE!
apiKey: YOUR_ACTUAL_API_KEY
authDomain: YOUR_PROJECT_ID.firebaseapp.com
projectId: YOUR_PROJECT_ID
storageBucket: YOUR_PROJECT_ID.appspot.com
messagingSenderId: YOUR_SENDER_ID
appId: YOUR_APP_ID
```

3. Run the application

### Manual Setup (if needed):
If automatic reading doesn't work, replace the keys in `firebase-keys.txt` with the placeholders in `config.js`.

## 🚀 Running the Application

### 1. Firebase Config Setup
```bash
# Automatic setup - config.js automatically reads keys from firebase-keys.txt!
# You don't need to run any additional scripts.
```

### 2. Start HTTP Server
```bash
python -m http.server 8000
```

### 3. Open in Browser
```
http://localhost:8000/
```

**Note**: `index.html` opens automatically and checks login status. It will redirect to `pages/login.html` if not logged in, or to `pages/app.html` if logged in.

## 📱 Usage Guide

### Login/Registration
1. `index.html` opens automatically and checks login status
2. If not logged in, you're redirected to `pages/login.html`
3. Create account or login on `pages/login.html` page
4. After successful login, automatically redirected to `pages/app.html`

### Main Application
1. **Add Project**: Create new project from left sidebar
2. **Add Task**: Add tasks in main area and set priority
3. **Project Selection**: Assign tasks to specific projects
4. **Task Management**: Complete, edit, delete tasks

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase (Authentication, Firestore)
- **Responsive**: CSS Grid and Flexbox
- **State Management**: Firebase real-time listeners
- **Authentication Flow**: Secure redirects and session management

## 🐛 Troubleshooting

### Common Errors and Solutions

#### 1. "Firebase could not be initialized: firebase is not defined"
**Solution:**
- Ensure Firebase CDNs are loaded
- Check error messages in console
- Verify Firebase scripts are loaded in Network tab

#### 2. "Data not being saved"
**Solution:**
- Check Firestore rules
- Verify data saving in Firebase Console
- Check console logs

#### 3. "Cannot login"
**Solution:**
- Verify Email/Password authentication is enabled
- Check console logs
- Check users in Firebase Console

#### 4. "Returns to login page when refreshing"
**Solution:**
- Check if Firebase auth state listener is working
- Check authentication status in console

### Debug Steps
1. Open console (F12)
2. Monitor Firebase requests in Network tab
3. Check error messages in console
4. Verify data saving in Firebase Console

## 🔒 Security Checklist

- [ ] `firebase-keys.txt` file created
- [ ] `.gitignore` file updated
- [ ] `firebase-keys.txt` in `.gitignore`
- [ ] Firestore security rules published
- [ ] Authentication enabled
- [ ] Verified `firebase-keys.txt` is hidden with `git status`

## 🆘 Emergency

### If your API keys were accidentally uploaded to GitHub:

1. **Immediately renew keys in Firebase Console**
2. **Disable old keys**
3. **Add new keys to `firebase-keys.txt`**
4. **Update `config.js`**

## 📞 Support

If you encounter issues:
1. Check console logs
2. Check Firebase Console
3. Read the troubleshooting section in this README
4. Verify data saving in Firebase Console

## 🔄 Updates

- **v3.0**: Automatic Firebase key loading system
- **v2.0**: Separate login and main application pages
- **v1.0**: Single page application

## 📋 Final Check

Before committing to Git:

1. **Security Check:**
   ```bash
   git status
   # firebase-keys.txt file should not be visible!
   ```

2. **Test Check:**
   - Is the application working?
   - Is login/registration working?
   - Is data being saved?

3. **File Check:**
   - Are unnecessary files deleted?
   - Are all files up to date?

---
