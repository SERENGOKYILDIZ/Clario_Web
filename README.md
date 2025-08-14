# 🚀 Clario - Planning Application

**Author:** Semi Eren Gökyıldız

A modern and user-friendly project and task management application. Powered by Firebase, featuring responsive design and performance-focused development.

## ✨ Features

### 🎯 **Task Management**
- Create, edit, and delete tasks
- Priority levels (High, Medium, Normal, Low)
- Date-based task planning
- Single date or date range options
- Task status tracking (Pending/Completed)

### 📁 **Project Management**
- Create and manage projects
- Project descriptions
- Task-project association
- Project-based task filtering

### 🔐 **User System**
- Firebase Authentication
- Secure login/logout
- User-based data management
- Session management

### 🎨 **Modern UI/UX**
- Responsive design
- Dark theme
- Smooth animations
- Expandable/collapsible panels
- Performance optimizations

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting (recommended)
- **Database**: NoSQL (Firestore)

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account
- Node.js (optional, for development)

## 🚀 Installation

### 1. **Download the Project**
```bash
git clone https://github.com/SERENGOKYILDIZ/Clario_Web_Test.git
cd Clario_Web_Test
```

### 2. **Create Firebase Project**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add new project"
3. Enter project name (e.g., "clario-app")
4. Enable Google Analytics (recommended)
5. Click "Create project"

### 3. **Enable Firebase Services**
1. **Authentication**:
   - Select "Authentication" from left menu
   - Go to "Sign-in method" tab
   - Enable "Email/Password" provider

2. **Firestore Database**:
   - Select "Firestore Database" from left menu
   - Click "Create database"
   - Select "Start in test mode"
   - Choose region as "europe-west3" (Frankfurt)

### 4. **Firebase Configuration**
1. Go to project settings (⚙️ icon)
2. In "General" tab, click "Add web app"
3. Enter app nickname (e.g., "clario-web")
4. Click "Register app"
5. Copy configuration information

### 5. **Update Configuration File**
Open `config/config.js` file and enter your Firebase information:

```javascript
// Firebase Configuration
// ⚠️ SECURITY WARNING: Enter your own Firebase information in this file!

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_AUTH_DOMAIN_HERE",
    projectId: "YOUR_PROJECT_ID_HERE",
    storageBucket: "YOUR_STORAGE_BUCKET_HERE",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
    appId: "YOUR_APP_ID_HERE"
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
```

### 6. **Firestore Security Rules**
Update `security/firestore.rules` file in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Tasks are user-based
    match /tasks/{taskId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // Projects are user-based
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

### 7. **Run the Application**
1. Host files on a web server
2. Open `index.html` in browser
3. Test Firebase connection

## 📁 Project Structure

```
Clario_Web_Test/
├── config/
│   └── config.js          # Firebase configuration
├── docs/
│   └── PROJECT_SUMMARY.md # Project summary
├── js/
│   ├── app.js            # Main application logic
│   ├── index.js          # Login page
│   └── login.js          # Login operations
├── pages/
│   ├── app.html          # Main application page
│   └── login.html        # Login page
├── security/
│   └── firestore.rules   # Firestore security rules
├── index.html            # Main page
└── README.md             # This file
```

## 🔧 Development

### **Local Development Server**
```bash
# Simple HTTP server with Python
python -m http.server 8000

# With Node.js
npx http-server

# With PHP
php -S localhost:8000
```

### **Firebase Emulator (Advanced)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init

# Run emulator
firebase emulators:start
```

## 🚀 Deployment

### **Firebase Hosting (Recommended)**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init hosting

# Deploy
firebase deploy
```

### **Other Platforms**
- **Netlify**: Drag & drop deployment
- **Vercel**: Git integration
- **GitHub Pages**: Free hosting
- **Heroku**: Node.js support

## 📱 Usage

### **First Use**
1. Open the application
2. Click "Sign Up" button
3. Enter email and password
4. Login

### **Adding Tasks**
1. Click "🎯 New Task" panel
2. Enter task title
3. Add description (optional)
4. Select project (optional)
5. Set priority
6. Choose date
7. Click "✅ Add Task" button

### **Project Management**
1. Use "✨ New Project" section in left panel
2. Enter project name and description
3. Click "🚀 Add Project" button

## 🔒 Security

### **Important Notes**
- Add `config/config.js` to `.gitignore`
- Don't share Firebase API keys in public repositories
- Use environment variables in production
- Regularly check Firestore security rules

### **Security Features**
- User-based data isolation
- Firebase Authentication
- Firestore security rules
- HTTPS requirement

## 🐛 Troubleshooting

### **Common Issues**

#### **"API key not valid" Error**
- Check Firebase configuration
- Ensure correct keys are in `config.js` file

#### **"Firebase App already exists" Error**
- Refresh the page
- Clear browser cache

#### **Calendar Not Opening**
- Ensure you're using a modern browser
- Check if JavaScript is enabled

### **Debug Mode**
To see debug messages in console:
```javascript
// Enable debug logs
localStorage.setItem('debug', 'true');
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 📞 Contact

**Author:** Semi Eren Gökyıldız

- **Email:** [Email](gokyildizsemieren@gmail.com)
- **GitHub:** [GitHub](https://github.com/SERENGOKYILDIZ)
- **LinkedIn:** [LinkedIn](https://www.linkedin.com/in/semi-eren-gokyildiz/)

## 🙏 Acknowledgments

- Firebase team for amazing platform
- Modern web standards
- Open source community

---

**⭐ Don't forget to star this project if you liked it!**
