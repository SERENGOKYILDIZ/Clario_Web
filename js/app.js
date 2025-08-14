// Clario Advanced Planning Application
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
        await loadFirebase();
        await checkAuthState();
        setupEventListeners();
        setupDateInputs(); // Set default dates for inputs
        toggleTaskDateInputs(); // Initialize date input visibility
        loadDashboardData();
        // Debug panel is now initialized from debug.js
        
        // Initialize drag and drop functionality after data is loaded
        setTimeout(() => {
            initializeDragAndDrop();
        }, 1000);
    } catch (error) {
        console.error('App initialization failed:', error);
        showStatus('Application initialization failed', 'error');
    }
}

// Load Firebase
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
        window.location.href = 'login.html';
    }
}

// Check authentication state
async function checkAuthState() {
    return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            unsubscribe();
            if (user) {
                currentUser = user;
                resolve();
    } else {
                window.location.href = 'login.html';
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
            language: 'en',
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
        ]
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
            language: 'en',
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
        activityLog: []
    };
}

// Update user interface
function updateUserInterface() {
    updateUserInfo();
    updateDashboardCounts();
    renderRecentTasks();
    updateDashboardProfileInfo(); // Update dashboard profile info
    refreshAllProfilePhotos(); // Refresh all profile photos
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

// Update dashboard counts (removed dashboard cards)
function updateDashboardCounts() {
    // Dashboard cards removed, no counts to update
                return;
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
}

// Create task card element
function createTaskCard(task) {
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.status === 'completed' ? 'completed' : ''}`;
    taskCard.dataset.itemId = task.id;
    taskCard.draggable = true;
    taskCard.onclick = () => showTaskDetails(task);
    
    // Add drag and drop event listeners
    taskCard.addEventListener('dragstart', (e) => handleDragStart(e, taskCard, 'tasks', task.id));
    taskCard.addEventListener('dragend', () => taskCard.classList.remove('dragging'));
    
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
        <div class="task-description">${task.description || 'No description'}</div>
        <div class="task-meta">
            <div class="task-project">
                <div class="project-color" style="background-color: ${projectColor}"></div>
                <span>${projectName || 'No Project'}</span>
            </div>
            <span>${task.taskType === 'range' ? 
                formatDateRange(task.startDate, task.dueDate) : 
                formatDate(task.dueDate)}</span>
        </div>
        <div class="task-actions">
            ${task.status === 'completed' 
                ? `<button class="action-btn btn-uncomplete" onclick="event.stopPropagation(); uncompleteTask('${task.id}')">Undo</button>`
                : `<button class="action-btn btn-complete" onclick="event.stopPropagation(); completeTask('${task.id}')">Complete</button>`
            }
            <button class="action-btn btn-edit" onclick="event.stopPropagation(); editTask('${task.id}')">Edit</button>
            <button class="action-btn btn-delete" onclick="event.stopPropagation(); deleteTask('${task.id}')">Delete</button>
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
        case 'high': return 'High';
        case 'medium': return 'Medium';
        case 'low': return 'Low';
        default: return 'Medium';
    }
}

// Get project name by ID
function getProjectName(projectId) {
    if (!userData || !userData.projects) return 'No Project';
    const project = userData.projects.find(p => p.id === projectId);
    return project ? project.title : 'No Project';
}

// Get project color by ID
function getProjectColor(projectId) {
    if (!userData || !userData.projects) return '#667eea';
    const project = userData.projects.find(p => p.id === projectId);
    return project ? project.color : '#667eea';
}

// Format date for display
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

// Check if date is today
function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

// Show section based on navigation
function showSection(sectionName) {
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
    
    // Load section data
    loadSectionData(sectionName);
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

// Load data for specific section
async function loadSectionData(sectionName) {
    switch (sectionName) {
        case 'dashboard':
            updateDashboardCounts();
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
        case 'profile':
            renderProfileForm();
            break;
        case 'preferences':
            renderPreferencesForm();
            break;
        case 'activity':
            renderActivityLog();
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
}

// Create project card
function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'dashboard-card project-card';
    projectCard.dataset.itemId = project.id;
    projectCard.draggable = true;
    
    const taskCount = userData.tasks.filter(task => task.projectId === project.id).length;
    
    // Add drag and drop event listeners
    projectCard.addEventListener('dragstart', (e) => handleDragStart(e, projectCard, 'projects', project.id));
    projectCard.addEventListener('dragend', () => projectCard.classList.remove('dragging'));
    
    projectCard.innerHTML = `
        <div class="card-header">
            <div class="card-title-container">
                ${project.color ? `<div class="project-color-indicator" style="background-color: ${project.color};"></div>` : ''}
                <span class="card-title">${project.title}</span>
            </div>
            <span class="card-count">${taskCount}</span>
        </div>
        <p>${project.description || 'No description'}</span>
        <div class="task-actions">
            <button class="action-btn btn-edit" onclick="event.stopPropagation(); editProject('${project.id}')">Edit</button>
            <button class="action-btn btn-delete" onclick="event.stopPropagation(); deleteProject('${project.id}')">Delete</button>
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
}

// Create daily task card
function createDailyTaskCard(dailyTask) {
    const dailyTaskCard = document.createElement('div');
    dailyTaskCard.className = 'dashboard-card';
    dailyTaskCard.dataset.itemId = dailyTask.id;
    dailyTaskCard.draggable = true;
    
    const today = window.getTodayDate ? window.getTodayDate() : new Date().toISOString().split('T')[0]; // Use debug time if available
    
    // Add drag and drop event listeners
    dailyTaskCard.addEventListener('dragstart', (e) => handleDragStart(e, dailyTaskCard, 'dailyTasks', dailyTask.id));
    dailyTaskCard.addEventListener('dragend', () => dailyTaskCard.classList.remove('dragging'));
    const isCompletedToday = dailyTask.progress.completedDates.includes(today);
    
    // Check if task is active for today (based on selected days)
    const todayDay = window.getCurrentDayOfWeek ? window.getCurrentDayOfWeek() : new Date().toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase(); // Use debug time if available
    const isActiveToday = dailyTask.schedule.recurrence.days.includes(todayDay);
    
    // Get next active day info
    const nextActiveDay = getNextActiveDay(dailyTask.schedule.recurrence.days);
    
    dailyTaskCard.innerHTML = `
        <div class="card-content">
            <div class="card-title">${dailyTask.title}</div>
            <div class="card-description">${dailyTask.description || 'No description'}</div>
            <div class="card-info">
                <div class="card-category">${dailyTask.category || 'No category'}</div>
                <div class="card-time">${dailyTask.schedule.recurrence.time}</div>
                <div class="card-days">${formatDays(dailyTask.schedule.recurrence.days)}</div>
            </div>
        </div>
        <div class="card-actions">
            <button class="btn ${isCompletedToday ? 'btn-complete' : 'btn-edit'}" 
                    onclick="event.stopPropagation(); ${isCompletedToday ? 'uncompleteDailyTask' : 'completeDailyTask'}('${dailyTask.id}')"
                    ${!isActiveToday ? 'disabled' : ''}>
                ${isCompletedToday ? '✓' : 'Complete'}
            </button>
            <button class="btn btn-edit" onclick="event.stopPropagation(); editDailyTask('${dailyTask.id}')">Edit</button>
            <button class="btn btn-delete" onclick="event.stopPropagation(); deleteDailyTask('${dailyTask.id}')">Delete</button>
        </div>
    `;
    
    return dailyTaskCard;
}

// Render profile form
function renderProfileForm() {
    const profileContent = document.getElementById('profileContent');
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
                            <h4>Basic Information</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileName">Full Name</label>
                                    <input type="text" id="profileName" placeholder="Enter your full name" value="${userData.profile.name || ''}" required>
                                </div>
                                <div class="form-group">
                                    <label for="profileUsername">Username</label>
                                    <input type="text" id="profileUsername" placeholder="Choose a username" value="${userData.profile.username || ''}" required>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileEmail">Email Address</label>
                                <input type="email" id="profileEmail" placeholder="Enter your email" value="${userData.profile.email || ''}" required>
                            </div>
                            <div class="form-group">
                                <label for="profilePhone">Phone Number</label>
                                <div class="phone-input-container">
                                    <div class="country-flag-selector" onclick="toggleCountrySelector()">
                                        <span class="flag" id="selectedFlag">🇹🇷</span>
                                        <span class="country-code" id="selectedCountryCode">+90</span>
                                        <span class="dropdown-arrow">▼</span>
                                    </div>
                                    <input type="tel" id="profilePhone" placeholder="(555) 123-4567" value="${userData.profile.phone || ''}" oninput="formatPhoneNumber(this)">
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
                                <small class="input-hint">Select country and enter phone number</small>
                            </div>
                        </div>

                        <div class="form-section">
                            <h4>Personal Details</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="profileBirthDate">Birth Date</label>
                                    <input type="date" id="profileBirthDate" value="${userData.profile.birthDate || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="profileGender">Gender</label>
                                    <div class="gender-toggle">
                                        <input type="radio" id="genderMale" name="gender" value="male" ${userData.profile.gender === 'male' ? 'checked' : ''}>
                                        <label for="genderMale" class="gender-option">
                                            <span class="gender-icon">👨</span>
                                            <span>Male</span>
                                        </label>
                                        <input type="radio" id="genderFemale" name="gender" value="female" ${userData.profile.gender === 'female' ? 'checked' : ''}>
                                        <label for="genderFemale" class="gender-option">
                                            <span class="gender-icon">👩</span>
                                            <span>Female</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileBio">Bio</label>
                                <textarea id="profileBio" placeholder="Tell us about yourself..." rows="4">${userData.profile.bio || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label for="profileLocation">Location</label>
                                <div class="location-combobox">
                                    <input type="text" id="profileLocation" placeholder="Type to search or select..." value="${userData.profile.location || ''}" oninput="filterLocations(this)" onfocus="showLocationDropdown()" onblur="hideLocationDropdown()">
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
                            <h4>Professional Information</h4>
                            <div class="form-group">
                                <label for="profileJobTitle">Job Title</label>
                                <input type="text" id="profileJobTitle" placeholder="e.g., Software Developer" value="${userData.profile.jobTitle || ''}">
                            </div>
                            <div class="form-group">
                                <label for="profileCompany">Company</label>
                                <input type="text" id="profileCompany" placeholder="Company name" value="${userData.profile.company || ''}">
                            </div>
                            <div class="form-group">
                                <label for="profileWebsite">Website</label>
                                <input type="url" id="profileWebsite" placeholder="https://yourwebsite.com" value="${userData.profile.website || ''}">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="button" class="btn-secondary" id="resetProfileBtn">Reset</button>
                            <button type="submit" class="btn-primary">Save Changes</button>
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
    preferencesContent.innerHTML = `
        <div class="settings-container">
            <div class="settings-section">
                <h4>Appearance</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Dark Mode</h5>
                        <p>Use dark theme for the application</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="darkMode" ${userData.preferences?.darkMode ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Language</h5>
                        <p>Choose your preferred language</p>
                    </div>
                    <select id="languageSelect" class="setting-select">
                        <option value="en" ${userData.preferences?.language === 'en' ? 'selected' : ''}>English</option>
                        <option value="tr" ${userData.preferences?.language === 'tr' ? 'selected' : ''}>Türkçe</option>
                        <option value="es" ${userData.preferences?.language === 'es' ? 'selected' : ''}>Español</option>
                        <option value="fr" ${userData.preferences?.language === 'fr' ? 'selected' : ''}>Français</option>
                        <option value="de" ${userData.preferences?.language === 'de' ? 'selected' : ''}>Deutsch</option>
                    </select>
                </div>
            </div>

            <div class="settings-section">
                <h4>Notification Preferences</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Email Notifications</h5>
                        <p>Receive email notifications for important updates</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="emailNotifications" ${userData.preferences?.emailNotifications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Push Notifications</h5>
                        <p>Receive push notifications on your device</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="pushNotifications" ${userData.preferences?.pushNotifications ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
            </div>

            <div class="settings-section">
                <h4>Security Settings</h4>
                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Change Password</h5>
                        <p>Update your account password</p>
                    </div>
                    <button type="button" class="btn-secondary" onclick="showChangePasswordForm()">Change Password</button>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Two-Factor Authentication</h5>
                        <p>Add an extra layer of security to your account</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" id="twoFactorAuth" ${userData.preferences?.twoFactorAuth ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Login History</h5>
                        <p>View your recent login activities</p>
                    </div>
                    <button type="button" class="btn-secondary" onclick="showLoginHistory()">View History</button>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <h5>Account Deletion</h5>
                        <p>Permanently delete your account and all data</p>
                    </div>
                    <button type="button" class="btn-danger" onclick="showDeleteAccountConfirmation()">Delete Account</button>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" class="btn-secondary" onclick="resetAllSettings()">Reset All</button>
                <button type="button" class="btn-primary" onclick="saveAllSettings()">Save All Settings</button>
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
}

// Show add task modal
function showAddTaskModal() {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add tasks', 'error');
            return;
        }
    
    populateProjectSelect();
    
    // Reset and setup date inputs
    setupDateInputs();
    toggleTaskDateInputs();
    
    document.getElementById('addTaskModal').style.display = 'flex';
    setupFormValidation('addTaskForm', handleAddTask);
}

// Show add project modal
function showAddProjectModal() {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add projects', 'error');
            return;
        }
    
    document.getElementById('addProjectModal').style.display = 'flex';
    setupFormValidation('addProjectForm', handleAddProject);
}

// Show add daily task modal
function showAddDailyTaskModal() {
    // Check if user is authenticated
    if (!currentUser || !currentUser.uid) {
        showStatus('Please login to add daily tasks', 'error');
            return;
        }
        
    document.getElementById('addDailyTaskModal').style.display = 'flex';
    setupFormValidation('addDailyTaskModal', handleAddDailyTask);
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
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
        form.onsubmit = (e) => {
    e.preventDefault();
            submitHandler(e);
        };
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
        dueDate: document.getElementById('taskType').value === 'single' ? 
                 (document.getElementById('taskDueDate').value || getTodayDate()) : 
                 (document.getElementById('taskEndDate').value || getTodayDate()),
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
        isActive: true,
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
        createdAt: new Date().toISOString()
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
        renderDailyTasks(); // Daily tasks sekmesini de güncelle
        
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
    const start = new Date(startDate);
    const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const startFormatted = formatDateForDisplay(startDate);
        const endFormatted = formatDateForDisplay(endDate);
        
        if (diffDays === 0) {
            return `${startFormatted} - ${endFormatted} (Same day)`;
        } else if (diffDays === 1) {
            return `${startFormatted} - ${endFormatted} (1 day)`;
        } else {
            return `${startFormatted} - ${endFormatted} (${diffDays} days)`;
        }
    } else if (startDate) {
        return `Starts: ${formatDateForDisplay(startDate)}`;
    } else if (endDate) {
        return `Due: ${formatDateForDisplay(endDate)}`;
    }
    
    return 'No dates set';
}

// Format days array to readable text
function formatDays(days) {
    if (!days || days.length === 0) return 'No days';
    
    const dayNames = {
        'mon': 'M',
        'tue': 'T', 
        'wed': 'W',
        'thu': 'T',
        'fri': 'F',
        'sat': 'S',
        'sun': 'S'
    };
    
    // Return individual day tags with single letter abbreviations
    return days.map(day => `<span class="day-tag">${dayNames[day] || day}</span>`).join('');
}

// Get next active day for daily tasks
function getNextActiveDay(selectedDays) {
    if (!selectedDays || selectedDays.length === 0) return 'No days selected';
    
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
        return 'Today';
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
        'mon': 'Monday',
        'tue': 'Tuesday', 
        'wed': 'Wednesday',
        'thu': 'Thursday',
        'fri': 'Friday',
        'sat': 'Saturday',
        'sun': 'Sunday'
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
    
    if (taskType === 'single') {
        singleDateRow.style.display = 'flex';
        dateRangeRow.style.display = 'none';
        
        // Set single date to today and make it required
        const dueDateInput = document.getElementById('taskDueDate');
        dueDateInput.value = todayString;
        dueDateInput.setAttribute('required', 'required');
        
        // Clear range inputs and remove required
        const startDateInput = document.getElementById('taskStartDate');
        const endDateInput = document.getElementById('taskEndDate');
        startDateInput.value = '';
        endDateInput.value = '';
        startDateInput.removeAttribute('required');
        endDateInput.removeAttribute('required');
        
    } else {
        singleDateRow.style.display = 'none';
        dateRangeRow.style.display = 'flex';
        
        // Set range dates to today and make end date required
        const startDateInput = document.getElementById('taskStartDate');
        const endDateInput = document.getElementById('taskEndDate');
        startDateInput.value = todayString;
        endDateInput.value = todayString;
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
            
            // Show edit modal
            document.getElementById('editProjectModal').style.display = 'flex';
            
            // Setup form validation
            setupFormValidation('editProjectForm', handleEditProject);
        }
    } catch (error) {
        console.error('Failed to edit project:', error);
        showStatus('Failed to edit project: ' + error.message, 'error');
    }
}

// Handle edit project form submission
async function handleEditProject(event) {
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
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            projects: userData.projects
        });
        
        // Add to activity log
        addActivityLog('project_edited', projectId);
        
        // Update UI
        updateDashboardCounts();
        renderRecentTasks();
        renderProjects();
        
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
            document.getElementById('editDailyTaskTime').value = dailyTask.schedule.recurrence.time || '08:00';
            
            // Set selected days
            const daysSelect = document.getElementById('editDailyTaskDays');
            if (daysSelect && dailyTask.schedule && dailyTask.schedule.recurrence && dailyTask.schedule.recurrence.days) {
                Array.from(daysSelect.options).forEach(option => {
                    option.selected = dailyTask.schedule.recurrence.days.includes(option.value);
                });
            }
            
            // Show edit modal
            document.getElementById('editDailyTaskModal').style.display = 'flex';
            
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
        dailyTask.schedule.recurrence.time = document.getElementById('editDailyTaskTime').value;
        
        // Update selected days
        const daysSelect = document.getElementById('editDailyTaskDays');
        if (daysSelect) {
            dailyTask.schedule.recurrence.days = Array.from(daysSelect.selectedOptions).map(option => option.value);
        }
        
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
        
        // Set required attributes
        document.getElementById('editTaskDueDate').setAttribute('required', 'required');
        document.getElementById('editTaskStartDate').removeAttribute('required');
        document.getElementById('editTaskEndDate').removeAttribute('required');
    } else {
        singleDateRow.style.display = 'none';
        dateRangeRow.style.display = 'flex';
        
        // Set required attributes
        document.getElementById('editTaskDueDate').removeAttribute('required');
        document.getElementById('editTaskStartDate').removeAttribute('required');
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
    
    // Set dates based on task type
    if (task.taskType === 'range') {
        document.getElementById('editTaskStartDate').value = task.startDate || '';
        document.getElementById('editTaskEndDate').value = task.endDate || '';
        document.getElementById('editTaskDueDate').value = '';
    } else {
        document.getElementById('editTaskDueDate').value = task.dueDate || '';
        document.getElementById('editTaskStartDate').value = '';
        document.getElementById('editTaskEndDate').value = '';
    }
    
    // Toggle date input visibility
    toggleEditTaskDateInputs();
    
    // Setup form validation
    setupFormValidation('editTaskForm', handleEditTask);
    
    // Show modal
    document.getElementById('editTaskModal').style.display = 'flex';
}



// Handle edit project form submission
async function handleEditProject(event) {
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
        // Note: editProjectCategory element doesn't exist in the modal, so we skip it
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            projects: userData.projects
        });
        
        // Add to activity log
        addActivityLog('project_edited', projectId);
        
        // Update UI
        renderProjects();
        
        // Close modal
        closeModal('editProjectModal');
        
        showStatus('Project updated successfully!', 'success');
    } catch (error) {
        console.error('Failed to update project:', error);
        showStatus('Failed to update project: ' + error.message, 'error');
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
        dailyTask.schedule.recurrence.time = document.getElementById('editDailyTaskTime').value;
        
        // Update selected days
        const daysSelect = document.getElementById('editDailyTaskDays');
        if (daysSelect) {
            dailyTask.schedule.recurrence.days = Array.from(daysSelect.selectedOptions).map(option => option.value);
        }
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            dailyTasks: userData.dailyTasks
        });
        
        // Add to activity log
        addActivityLog('daily_task_edited', dailyTaskId);
        
        // Update UI
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
        
        // Update dates based on task type
        if (task.taskType === 'range') {
            task.startDate = document.getElementById('editTaskStartDate').value;
            task.endDate = document.getElementById('editTaskEndDate').value;
            task.dueDate = null;
        } else {
            task.dueDate = document.getElementById('editTaskDueDate').value;
            task.startDate = null;
            task.endDate = null;
        }
        
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

// Logout function
async function logout() {
    try {
        await auth.signOut();
        window.location.href = 'login.html';
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

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnter(e) {
    e.preventDefault();
    const target = e.target.closest('.task-card, .dashboard-card');
    const grid = e.target.closest('[id$="Grid"]');
    
    if (target) {
        target.classList.add('drag-over');
    }
    
    if (grid) {
        grid.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    const target = e.target.closest('.task-card, .dashboard-card');
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
        const cards = targetGrid.querySelectorAll('.task-card, .dashboard-card');
        cards.forEach(card => card.classList.remove('drag-over'));
        
        // Get the dragged element
        const draggedElement = document.querySelector('.dragging');
        if (!draggedElement) return;
        
        // Remove dragging class
        draggedElement.classList.remove('dragging');
        
        // Get drop position
        const dropTarget = e.target.closest('.task-card, .dashboard-card');
        if (!dropTarget || dropTarget === draggedElement) return;
        
        // Get the target item ID
        const targetId = dropTarget.dataset.itemId;
        if (!targetId) return;
        
        // Reorder the data array
        await reorderItems(dragData.type, dragData.id, targetId, targetGrid.id);
        
        // Re-render the grid
        switch (dataType) {
            case 'tasks':
                if (targetGrid.id === 'recentTasksGrid') {
                    renderRecentTasks();
                } else {
                    renderAllTasks();
                }
                break;
            case 'projects':
                renderProjects();
                break;
            case 'dailyTasks':
                renderDailyTasks();
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
            default:
                return;
        }
        
        // Find the dragged item and target item
        const draggedIndex = dataArray.findIndex(item => item.id === draggedId);
        const targetIndex = dataArray.findIndex(item => item.id === targetId);
        
        if (draggedIndex === -1 || targetIndex === -1) return;
        
        // Reorder the array
        const [draggedItem] = dataArray.splice(draggedIndex, 1);
        dataArray.splice(targetIndex, 0, draggedItem);
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            [dataType]: dataArray
        });
        
        // Update local data
        userData[dataType] = dataArray;
        
    } catch (error) {
        console.error('Failed to reorder items:', error);
        throw error;
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Global exports for HTML onclick handlers
window.editTask = editTask;
window.handleEditTask = handleEditTask;
window.editProject = editProject;
window.handleEditProject = handleEditProject;
window.editDailyTask = editDailyTask;
window.handleEditDailyTask = handleEditDailyTask;
window.toggleEditTaskDateInputs = toggleEditTaskDateInputs;
window.logout = logout;

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
    document.getElementById('languageSelect').value = userData.preferences?.language || 'en';
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
    document.getElementById('languageSelect').value = userData.preferences?.language || 'en';
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
    document.getElementById('languageSelect').value = userData.preferences?.language || 'en';
    document.getElementById('emailNotifications').checked = userData.preferences?.emailNotifications || false;
    document.getElementById('pushNotifications').checked = userData.preferences?.pushNotifications || false;
    document.getElementById('twoFactorAuth').checked = userData.preferences?.twoFactorAuth || false;
    
    showStatus('All settings reset to original values', 'info');
}

async function saveAllSettings() {
    try {
        const preferences = {
            darkMode: document.getElementById('darkMode').checked,
            language: document.getElementById('languageSelect').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            pushNotifications: document.getElementById('pushNotifications').checked,
            twoFactorAuth: document.getElementById('twoFactorAuth').checked
        };
        
        // Update local data
        if (!userData.preferences) userData.preferences = {};
        userData.preferences = { ...userData.preferences, ...preferences };
        
        // Update Firestore
        await db.collection('user_data').doc(currentUser.uid).update({
            preferences: userData.preferences
        });
        
        showStatus('All settings saved successfully!', 'success');
        
    } catch (error) {
        console.error('Failed to save all settings:', error);
        showStatus('Failed to save all settings: ' + error.message, 'error');
    }
}

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

// Global exports for phone and location functionality
window.formatPhoneNumber = formatPhoneNumber;
window.showLocationDropdown = showLocationDropdown;
window.hideLocationDropdown = hideLocationDropdown;
window.filterLocations = filterLocations;
window.selectLocation = selectLocation;
window.toggleCountrySelector = toggleCountrySelector;
window.selectCountry = selectCountry;


