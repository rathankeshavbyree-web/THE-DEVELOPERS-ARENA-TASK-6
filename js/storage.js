/**
 * ATMOSPHERE - Local Storage Utilities
 * Handles all local storage operations for the weather dashboard
 */

"use strict";

/**
 * Save data to local storage
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be JSON stringified)
 */
function saveToStorage(key, value) {
    try {
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
    } catch (error) {
        console.error(`Error saving to storage (${key}):`, error);
        return false;
    }
}

/**
 * Retrieve data from local storage
 * @param {string} key - Storage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed value or default
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    } catch (error) {
        console.error(`Error reading from storage (${key}):`, error);
        return defaultValue;
    }
}

/**
 * Remove a specific key from local storage
 * @param {string} key - Storage key to remove
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from storage (${key}):`, error);
        return false;
    }
}

/**
 * Clear all weather-related data from local storage
 */
function clearStorage() {
    const weatherKeys = [
        'weather_last_city',
        'weather_units',
        'weather_theme',
        'weather_favorites',
        'weather_search_history'
    ];
    
    weatherKeys.forEach(key => {
        removeFromStorage(key);
    });
}

/**
 * Save last searched city
 * @param {string} city - City name
 */
function saveLastCity(city) {
    saveToStorage('weather_last_city', city);
}

/**
 * Get last searched city
 * @returns {string} Last city or null
 */
function getLastCity() {
    return getFromStorage('weather_last_city', null);
}

/**
 * Save temperature unit preference
 * @param {string} unit - 'metric' or 'imperial'
 */
function saveUnits(unit) {
    saveToStorage('weather_units', unit);
}

/**
 * Get temperature unit preference
 * @returns {string} Unit preference (default: metric)
 */
function getUnits() {
    return getFromStorage('weather_units', 'metric');
}

/**
 * Save theme preference
 * @param {string} theme - Theme name
 */
function saveTheme(theme) {
    saveToStorage('weather_theme', theme);
}

/**
 * Get theme preference
 * @returns {string} Theme name (default: auto)
 */
function getTheme() {
    return getFromStorage('weather_theme', 'auto');
}

/**
 * Add city to favorites
 * @param {Object} cityData - City object with name, country, lat, lon
 * @returns {boolean} Success status
 */
function addToFavorites(cityData) {
    const favorites = getFavorites();
    
    // Check if already exists
    const exists = favorites.some(city => 
        city.name.toLowerCase() === cityData.name.toLowerCase() &&
        city.country === cityData.country
    );
    
    if (exists) {
        return false;
    }
    
    // Limit to 10 favorites
    if (favorites.length >= 10) {
        favorites.pop();
    }
    
    favorites.unshift(cityData);
    saveToStorage('weather_favorites', favorites);
    return true;
}

/**
 * Remove city from favorites
 * @param {string} cityName - City name to remove
 * @param {string} country - Country code
 */
function removeFromFavorites(cityName, country) {
    const favorites = getFavorites();
    const filtered = favorites.filter(city => 
        !(city.name.toLowerCase() === cityName.toLowerCase() && city.country === country)
    );
    saveToStorage('weather_favorites', filtered);
}

/**
 * Get favorites list
 * @returns {Array} Array of favorite cities
 */
function getFavorites() {
    return getFromStorage('weather_favorites', []);
}

/**
 * Add city to search history
 * @param {string} city - City name
 */
function addToSearchHistory(city) {
    const history = getSearchHistory();
    
    // Remove if already exists (to move to top)
    const filtered = history.filter(c => c.toLowerCase() !== city.toLowerCase());
    
    // Add to front
    filtered.unshift(city);
    
    // Limit to 5
    const limited = filtered.slice(0, 5);
    
    saveToStorage('weather_search_history', limited);
}

/**
 * Get search history
 * @returns {Array} Array of recent searches
 */
function getSearchHistory() {
    return getFromStorage('weather_search_history', []);
}

/**
 * Clear search history
 */
function clearSearchHistory() {
    removeFromStorage('weather_search_history');
}
