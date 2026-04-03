// js/storage.js

const HISTORY_KEY = 'smart_travel_history';
const THEME_KEY = 'smart_travel_theme';

/**
 * Get saved trips from localStorage
 */
export function getTripHistory() {
    try {
        const data = localStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Error reading localStorage:", e);
        return [];
    }
}

/**
 * Save a new trip to history (max 10 trips)
 */
export function saveTrip(tripData) {
    let history = getTripHistory();
    // Use a unique ID based on timestamp
    const newTrip = { ...tripData, id: Date.now() };
    
    // Add to beginning of array
    history.unshift(newTrip);
    
    // Limit to last 10 trips as per PRD
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return newTrip;
}

/**
 * Delete a specific trip by its ID
 */
export function deleteTrip(id) {
    let history = getTripHistory();
    history = history.filter(trip => trip.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    return history;
}

/**
 * Clear entirely
 */
export function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
}

/**
 * Handle Theme Preferences
 */
export function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || 'light';
}

export function saveTheme(theme) {
    localStorage.setItem(THEME_KEY, theme);
}
