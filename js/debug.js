// Debug Panel Management for Clario Application
// This file contains all debug functionality for testing time-based features

// Debug Time Management
let debugTimeOffset = 0; // Time offset in milliseconds
let debugTimeActive = false;

// Get current time (real or debug)
function getDebugTime() {
    if (debugTimeActive) {
        return new Date(Date.now() + debugTimeOffset);
    }
    return new Date();
}

// Get today's date string for debug time
function getTodayDate() {
    const debugDate = getDebugTime();
    return debugDate.toISOString().split('T')[0];
}

// Get current day of week for debug time
function getCurrentDayOfWeek() {
    const debugDate = getDebugTime();
    return debugDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
}

// Set debug time
function setDebugTime() {
    const dateInput = document.getElementById('debugDateInput').value;
    const timeInput = document.getElementById('debugTimeInput').value;
    
    if (dateInput && timeInput) {
        const targetDateTime = new Date(dateInput + 'T' + timeInput);
        const realTime = new Date();
        
        debugTimeOffset = targetDateTime.getTime() - realTime.getTime();
        debugTimeActive = true;
        
        updateDebugDisplay();
        showStatus('Debug time set successfully!', 'success');
        
        // Refresh UI to show new time
        if (typeof userData !== 'undefined' && userData) {
            if (typeof updateDashboardCounts === 'function') updateDashboardCounts();
            if (typeof renderDailyTasks === 'function') renderDailyTasks();
            if (typeof renderTasks === 'function') renderTasks();
        }
    } else {
        showStatus('Please select both date and time!', 'error');
    }
}

// Reset debug time to real time
function resetDebugTime() {
    debugTimeOffset = 0;
    debugTimeActive = false;
    
    updateDebugDisplay();
    showStatus('Time reset to real time!', 'success');
    
    // Refresh UI to show real time
    if (typeof userData !== 'undefined' && userData) {
        if (typeof updateDashboardCounts === 'function') updateDashboardCounts();
        if (typeof renderDailyTasks === 'function') renderDailyTasks();
        if (typeof renderTasks === 'function') renderTasks();
    }
}

// Update debug panel display
function updateDebugDisplay() {
    const currentTime = getDebugTime();
    const realTime = new Date();
    
    document.getElementById('currentTimeDisplay').textContent = currentTime.toLocaleString();
    document.getElementById('debugModeStatus').textContent = debugTimeActive ? 'Active' : 'Inactive';
    
    if (debugTimeActive) {
        const offsetHours = Math.round(debugTimeOffset / (1000 * 60 * 60));
        document.getElementById('timeOffsetDisplay').textContent = `${offsetHours} hours`;
        document.getElementById('timeOffsetDisplay').style.color = '#ff6b6b';
    } else {
        document.getElementById('timeOffsetDisplay').textContent = '0 hours';
        document.getElementById('timeOffsetDisplay').style.color = '#ffffff';
    }
    
    // Only update input values if they're not focused (user is not typing)
    const dateInput = document.getElementById('debugDateInput');
    const timeInput = document.getElementById('debugTimeInput');
    
    if (!dateInput.matches(':focus')) {
        dateInput.value = currentTime.toISOString().split('T')[0];
    }
    
    if (!timeInput.matches(':focus')) {
        timeInput.value = currentTime.toTimeString().slice(0, 5);
    }
}

// Toggle debug panel
function toggleDebugPanel() {
    const panel = document.getElementById('debugPanel');
    const toggle = document.querySelector('.debug-toggle');
    
    if (panel.classList.contains('collapsed')) {
        panel.classList.remove('collapsed');
        toggle.textContent = '-';
    } else {
        panel.classList.add('collapsed');
        toggle.textContent = '+';
    }
}

// Initialize debug panel
function initializeDebugPanel() {
    updateDebugDisplay();
    
    // Update time display every second
    setInterval(updateDebugDisplay, 1000);
}

// Export functions for use in other files
window.getDebugTime = getDebugTime;
window.getTodayDate = getTodayDate;
window.getCurrentDayOfWeek = getCurrentDayOfWeek;
window.setDebugTime = setDebugTime;
window.resetDebugTime = resetDebugTime;
window.toggleDebugPanel = toggleDebugPanel;
window.initializeDebugPanel = initializeDebugPanel;
