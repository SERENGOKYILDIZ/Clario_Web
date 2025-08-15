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
- **Edit functionality**: Modify task details, dates, priorities, and project associations
- **Real-time updates**: UI automatically reflects changes without page refresh
- **Drag & Drop**: Reorder tasks by dragging and dropping for better organization
- **Optimized Layouts**: Better spacing and sizing for improved data visibility
- **Date Format**: dd-mm-yyyy format with automatic validation

### 📁 **Project Management**
- Create and manage projects
- Project descriptions
- Task-project association
- Project-based task filtering
- **Edit functionality**: Modify project details, colors, and descriptions
- **Task association**: Automatically unassign tasks when projects are deleted
- **Drag & Drop**: Reorder projects by dragging and dropping for better organization

### 🔐 **User System**
- Firebase Authentication
- Secure login/logout
- User-based data management
- Session management
- User preferences and settings
- Activity logging and tracking
- **Profile Management**: Comprehensive user profile with personal information
- **International Phone Support**: Country-based phone formatting with flag selectors
- **Location Selection**: Searchable combobox with popular cities worldwide
- **Gender Selection**: Modern radio button interface for profile customization
- **Simplified Settings**: Unified interface for all user preferences and security settings

### 📝 **Notes System**
- Quick notes creation and management
- Shopping lists with todo-style completion tracking
- Drag & drop reordering for better organization
- Full CRUD operations (Create, Read, Update, Delete)
- Real-time updates and synchronization
- Multi-language support for all note content

### 🎨 **Modern UI/UX**
- Responsive design
- Dark theme
- Smooth animations
- Expandable/collapsible panels
- Performance optimizations
- **Daily Tasks**: Recurring tasks with streak tracking and drag & drop reordering
- **Edit Modals**: User-friendly editing interfaces for all content types
- **Error Handling**: Comprehensive error messages and user feedback
- **Enhanced Drag & Drop**: Smooth card reordering for all content types with visual feedback
- **Visual Indicators**: Drag handles and drop zone highlighting
- **Tab-Free Interface**: Simplified navigation without complex tab systems
- **Country Flag Selectors**: Visual country selection with emoji flags
- **Modern Form Controls**: Enhanced input fields with better validation
- **Optimized Grid Layouts**: Improved spacing and sizing for better data display
- **Loading Screens**: i18n-ready loading states for better user experience

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting (recommended)
- **Database**: NoSQL (Firestore)
- **Drag & Drop**: HTML5 Drag & Drop API
- **Responsive Design**: CSS Grid, Flexbox, Media Queries
- **Performance**: CSS animations, JavaScript optimizations
- **Form Validation**: HTML5 validation with custom patterns
- **Internationalization**: Multi-country phone format support
- **🌍 Multi-Language Support**: Complete i18n system with 5 languages (TR, EN, DE, ES, FR)
- **🔤 Dynamic Language Switching**: Real-time language changes without page reload
- **📝 Localized Content**: All UI elements, modals, forms, and buttons translated
- **Modern CSS**: Backdrop filters, CSS Grid, advanced animations

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase account
- Node.js (optional, for development)
- JavaScript enabled
- Touch device support for mobile drag & drop
- **Form Support**: Modern browser with HTML5 form validation
- **Emoji Support**: Browser with emoji rendering for country flags
- **CSS Support**: Modern CSS features (backdrop-filter, CSS Grid)
- **Responsive Design**: Mobile and desktop compatible browsers

## 📝 Recent Updates

### **Latest Features (Current Version)**
- ✅ **🌍 Multi-Language Support**: Complete internationalization with 5 languages (TR, EN, DE, ES, FR)
- ✅ **🔤 Language Switcher**: Dynamic language switching without page reload
- ✅ **📝 Localized Content**: All UI elements, modals, and forms in multiple languages
- ✅ **🎯 Localized Modals**: Add New Project, Add Daily Task, and all form fields translated
- ✅ **🔑 Localized Buttons**: Logout, Cancel, Save, and all action buttons in multiple languages
- ✅ **📅 Localized Dates**: Day names, date formats, and time-related text in all languages
- ✅ **📝 Notes System**: Quick notes and shopping list management with CRUD operations
- ✅ **🛒 Shopping Lists**: Todo-style shopping lists with completion tracking
- ✅ **🎯 Enhanced Drag & Drop**: Smooth drag & drop reordering for all card types (notes, tasks, projects, daily tasks)
- ✅ **⚡ Performance Optimized**: DOM manipulation instead of full re-renders for smooth animations
- ✅ **🔄 Complete CRUD Operations**: Full edit functionality for all content types
- ✅ **📱 Loading Screen**: i18n-ready loading screen before main app display
- ✅ **🎨 Smooth Animations**: Visual feedback during drag operations with CSS transitions
- ✅ **Advanced Date Management**: Support for single dates and date ranges with dd-mm-yyyy format
- ✅ **Daily Task System**: Recurring tasks with completion tracking and streak calculation
- ✅ **Modal-based Editing**: Intuitive edit interfaces for all content types
- ✅ **Performance Optimizations**: Improved loading times and smooth interactions
- ✅ **Code Quality Improvements**: Enhanced code structure and formatting
- ✅ **International Phone Support**: Country-based phone formatting with flag selectors
- ✅ **Simplified Profile & Settings**: Clean, tab-free interface for better user experience
- ✅ **Enhanced Gender Selection**: Modern radio button design for profile customization
- ✅ **Location Combobox**: Searchable location selector with popular cities
- ✅ **Task Details Modal**: Comprehensive task information display with real-time updates
- ✅ **Smart Modal Refresh**: Automatic modal content updates when data changes
- ✅ **Enhanced Project Cards**: Color indicators positioned next to project titles
- ✅ **Improved Task Layouts**: Better visual hierarchy and information organization
- ✅ **Performance Enhancements**: Hardware acceleration and CSS containment optimizations
- ✅ **Optimized Task Layouts**: Better spacing and sizing for improved data visibility

### **Technical Improvements**
- 🔧 **Code Refactoring**: Cleaner, more maintainable codebase
- 🔧 **Error Prevention**: Better form validation and user feedback
- 🔧 **Firebase Integration**: Optimized Firestore operations and data structure
- 🔧 **Responsive Design**: Enhanced mobile and desktop experience
- 🔧 **Code Formatting**: Improved indentation and code structure consistency
- 🔧 **UI Simplification**: Removed unnecessary tabs and complex navigation
- 🔧 **Form Enhancements**: Better input handling and user experience
- 🔧 **Layout Optimization**: Improved grid systems and spacing for better data display

## 🚀 Installation

### 1. **Download the Project**
```bash
git clone https://github.com/SERENGOKYILDIZ/Clario_Web.git
cd Clario_Web
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
├── js/
│   ├── app.js            # Main application logic
│   ├── index.js          # Landing page logic
│   ├── login.js          # Login operations
│   ├── i18n.js           # Internationalization system
│   └── language-switcher.js # Language switching functionality
├── locales/
│   ├── tr.json           # Turkish translations
│   ├── en.json           # English translations
│   ├── de.json           # German translations
│   ├── es.json           # Spanish translations
│   └── fr.json           # French translations
├── pages/
│   ├── app.html          # Main application page
│   └── login.html        # Login page
├── images/
│   └── favicon/          # App icons and favicons
├── firestore.rules       # Firestore security rules
├── config.js             # Firebase configuration
├── main.py               # Flask web server (optimized)
├── index.html            # Main landing page (root)
└── README.md             # This file
```

## 🔧 Development

### **Local Development Server**
```bash
# Recommended: Use the built-in Flask server
python main.py              # Start on default port 8000
python main.py 8080         # Start on port 8080
python main.py --help       # Show help and usage

# Features:
# - Auto-reload on file changes
# - Better routing and error handling
# - Development tools and debugging
# - Professional web server capabilities

# Alternative methods:
python -m http.server 8000  # Simple Python server
npx http-server             # Node.js server
php -S localhost:8000       # PHP server
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
1. Start the server: `python main.py`
2. Open your browser and go to: `http://localhost:8000/`
3. The main landing page will load directly
4. Click "Sign Up" button
5. Enter email and password
6. Login

### **Adding Tasks**
1. Click "🎯 New Task" panel
2. Enter task title
3. Add description (optional)
4. Select project (optional)
5. Set priority
6. Choose date
7. Click "✅ Add Task" button

### **Reordering Items (Drag & Drop)**
1. **Tasks**: Click and drag any task card to reorder them
2. **Projects**: Drag project cards to change their display order
3. **Daily Tasks**: Reorder daily task cards for better organization
4. **Visual Feedback**: Cards show drag indicators and highlight drop zones
5. **Automatic Save**: Order changes are automatically saved to the database

### **Project Management**
1. Use "✨ New Project" section in left panel
2. Enter project name and description
3. **Color Selection**: Choose a color for visual identification
4. Click "🚀 Add Project" button
5. **Visual Indicators**: Color squares appear next to project titles
6. **Task Association**: Assign tasks to specific projects for better organization

### **Daily Tasks**
1. Use "📅 New Daily Task" section in left panel
2. Enter task title and description
3. Select category and time
4. Choose recurring days (Monday, Tuesday, etc.)
5. Click "✅ Add Daily Task" button

### **Editing Items**
1. **Tasks**: Click "Edit" button on any task card
2. **Projects**: Click "Edit" button on project cards
3. **Daily Tasks**: Click "Edit" button on daily task cards
4. Modify details in the modal that appears
5. Click "Update" button to save changes

### **Task Details & Real-time Updates**
1. **View Details**: Click on any task card to open detailed view
2. **Comprehensive Information**: See task status, dates, project, labels, and timestamps
3. **Real-time Updates**: Modal automatically refreshes when task data changes
4. **Smart Actions**: Complete, edit, or delete tasks directly from details view
5. **Status Tracking**: Visual indicators for completed vs. active tasks
6. **Auto-refresh**: Modal content updates instantly after any CRUD operation

### **Drag & Drop Tips**
- **Visual Feedback**: Cards show drag indicators (⋮⋮) on hover
- **Drop Zones**: Valid drop areas are highlighted in blue
- **Auto-save**: All reordering changes are automatically saved
- **Cross-grid**: Items can be reordered within their respective grids

### **Profile Management**
1. **Access Profile**: Click "Profile Settings" in the sidebar
2. **Personal Information**: Fill in name, username, email, phone, bio, location
3. **Phone Number**: Select country flag and enter phone number
   - **Country Selection**: Click flag to choose from 8 countries
   - **Auto-formatting**: Phone numbers are automatically formatted
   - **Supported Countries**: Turkey, US, UK, Germany, France, Italy, Spain, Japan
4. **Gender Selection**: Choose between Male (👨) and Female (👩)
5. **Location**: Type to search or select from popular cities
6. **Save Changes**: Click "Save Changes" button

### **Language Settings**
1. **Access Settings**: Click "Settings" in the sidebar
2. **Language Selection**: Choose from 5 supported languages:
   - 🇹🇷 **Türkçe** (Turkish)
   - 🇺🇸 **English** (English)
   - 🇩🇪 **Deutsch** (German)
   - 🇪🇸 **Español** (Spanish)
   - 🇫🇷 **Français** (French)
3. **Dynamic Switching**: Language changes apply instantly without page reload
4. **Localized Content**: All UI elements, modals, forms, and buttons are translated
5. **Persistent Settings**: Language preference is saved and remembered

### **Settings Management**
1. **Access Settings**: Click "Settings" in the sidebar
2. **Appearance**: Toggle dark mode and select language
3. **Notifications**: Configure email and push notifications
4. **Security**: Change password, enable 2FA, view login history
5. **Unified Actions**: Use "Save All Settings" or "Reset All" buttons

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

#### **Drag & Drop Not Working**
- Ensure JavaScript is enabled
- Check browser console for errors
- Try refreshing the page
- Verify you're using a modern browser (Chrome, Firefox, Safari, Edge)

#### **Phone Number Formatting Issues**
- Ensure you've selected a country flag first
- Check if the country is supported (8 countries available)
- Verify browser supports emoji rendering for country flags
- Try refreshing the page if formatting doesn't work

#### **Profile Settings Not Saving**
- Check if all required fields are filled
- Ensure you're logged in with valid credentials
- Check browser console for error messages
- Verify Firebase connection is working

#### **Settings Not Loading**
- Ensure you have proper permissions
- Check if user data is properly loaded
- Refresh the page and try again
- Verify all JavaScript files are loaded correctly

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

## 📋 Changelog

### **v2.4.0** - Multi-Language Support & Internationalization
- 🌍 **Complete Multi-Language Support**: Added support for 5 languages (TR, EN, DE, ES, FR)
- 🔤 **Dynamic Language Switcher**: Real-time language switching without page reload
- 📝 **Localized Content**: All UI elements, modals, forms, and buttons translated
- 🎯 **Localized Modals**: Add New Project, Add Daily Task, and all form fields in multiple languages
- 🔑 **Localized Buttons**: Logout, Cancel, Save, and all action buttons translated
- 📅 **Localized Dates**: Day names, time formats, and date-related text in all languages
- 🚀 **Performance**: Language changes apply instantly with no performance impact
- 💾 **Persistent Settings**: Language preference saved and remembered across sessions

### **v2.3.0** - UI/UX & Performance Enhancement
- ✨ Enhanced Task Details Modal with comprehensive information display
- 🔄 Smart Modal Refresh: Automatic content updates when data changes
- 🎨 Improved Project Cards: Color indicators positioned next to project titles
- 📱 Better Task Layouts: Enhanced visual hierarchy and information organization
- ⚡ Performance Enhancements: Hardware acceleration and CSS containment
- 🔧 Panel Navigation: Auto-scroll to top when switching between sections
- 🎯 Real-time Updates: Modal content reflects all CRUD operations instantly
- 🚀 Optimized Animations: Faster transitions and smoother interactions

### **v2.2.0** - Profile & Settings Enhancement
- ✨ Added international phone support with country flag selectors
- 🎨 Simplified Profile and Settings interfaces (removed tabs)
- 🔧 Enhanced gender selection with modern radio buttons
- 📍 Added searchable location combobox with popular cities
- 📱 Optimized task card layouts for better data visibility
- 🗑️ Removed unnecessary Time Zone setting
- 🎯 Unified save/reset functionality for all settings
- 🚀 Improved user experience with cleaner navigation

### **v2.1.0** - Drag & Drop Update
- ✨ Added drag & drop reordering for all card types
- 🎨 Enhanced visual feedback during drag operations
- 🔧 Improved code structure and formatting
- 📱 Better mobile and touch device support
- 🚀 Performance optimizations for smooth interactions
- 📁 Reorganized file structure (index.html in root)
- 🐍 Added Flask web server (main.py)
- 🔧 Optimized server with auto-reload and better routing

### **v2.0.0** - Major Update
- ✨ Complete CRUD operations for all content types
- 🎨 Modal-based editing system
- 🔧 Enhanced error handling and user feedback
- 📅 Advanced date management with range support
- 🎯 Daily task system with streak tracking

### **v1.0.0** - Initial Release
- 🚀 Basic task and project management
- 🔐 Firebase authentication system
- 📱 Responsive design implementation
- 🎨 Modern dark theme UI
