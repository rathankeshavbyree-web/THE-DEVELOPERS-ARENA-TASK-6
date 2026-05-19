/**
 * ATMOSPHERE - Main Application Logic
 * Handles DOM rendering, event listeners, UI updates, and state management
 */

"use strict";

// Application State
const AppState = {
    currentCity: null,
    currentWeather: null,
    forecast: null,
    units: 'metric',
    isLoading: false,
    lastSearchedCity: null
};

// DOM Elements
const elements = {
    atmosphereBg: document.getElementById('atmosphereBg'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    searchForm: document.getElementById('searchForm'),
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    recentChips: document.getElementById('recentChips'),
    favoriteChips: document.getElementById('favoriteChips'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    celsiusBtn: document.getElementById('celsiusBtn'),
    fahrenheitBtn: document.getElementById('fahrenheitBtn'),
    favoriteBtn: document.getElementById('favoriteBtn'),
    errorCard: document.getElementById('errorCard'),
    errorMessage: document.getElementById('errorMessage'),
    retryBtn: document.getElementById('retryBtn'),
    emptyState: document.getElementById('emptyState'),
    currentWeatherSection: document.getElementById('currentWeatherSection'),
    cityName: document.getElementById('cityName'),
    weatherDate: document.getElementById('weatherDate'),
    weatherIcon: document.getElementById('weatherIcon'),
    temperature: document.getElementById('temperature'),
    tempUnit: document.getElementById('tempUnit'),
    weatherDescription: document.getElementById('weatherDescription'),
    feelsLike: document.getElementById('feelsLike'),
    highLow: document.getElementById('highLow'),
    humidity: document.getElementById('humidity'),
    wind: document.getElementById('wind'),
    hourlySection: document.getElementById('hourlySection'),
    hourlyContainer: document.getElementById('hourlyContainer'),
    dailySection: document.getElementById('dailySection'),
    dailyContainer: document.getElementById('dailyContainer'),
    metricsSection: document.getElementById('metricsSection'),
    metricHumidity: document.getElementById('metricHumidity'),
    metricWind: document.getElementById('metricWind'),
    metricPressure: document.getElementById('metricPressure'),
    metricVisibility: document.getElementById('metricVisibility'),
    metricSunrise: document.getElementById('metricSunrise'),
    metricSunset: document.getElementById('metricSunset'),
    metricFeelsLike: document.getElementById('metricFeelsLike')
};

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize Application
function init() {
    // Load saved preferences
    AppState.units = getUnits();
    AppState.lastSearchedCity = getLastCity();
    
    // Update UI based on saved preferences
    updateUnitButtons();
    renderRecentSearches();
    renderFavorites();
    
    // Load last searched city if available
    if (AppState.lastSearchedCity) {
        elements.searchInput.value = AppState.lastSearchedCity;
        searchWeather(AppState.lastSearchedCity);
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Create atmospheric particles
    createAtmosphericParticles();
}

// Set up Event Listeners
function setupEventListeners() {
    // Search form submission
    elements.searchForm.addEventListener('submit', handleSearch);
    
    // Clear history button
    elements.clearHistoryBtn.addEventListener('click', handleClearHistory);
    
    // Unit toggle buttons
    elements.celsiusBtn.addEventListener('click', () => handleUnitChange('metric'));
    elements.fahrenheitBtn.addEventListener('click', () => handleUnitChange('imperial'));
    
    // Favorite button
    elements.favoriteBtn.addEventListener('click', handleFavoriteToggle);
    
    // Retry button
    elements.retryBtn.addEventListener('click', handleRetry);
    
    // Keyboard accessibility
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Handle Search
async function handleSearch(event) {
    event.preventDefault();
    
    const city = elements.searchInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }
    
    await searchWeather(city);
}

// Search Weather
async function searchWeather(city) {
    if (AppState.isLoading) return;
    
    showLoading();
    hideError();
    
    try {
        const data = await getCompleteWeatherData(city, AppState.units);
        
        // Update state
        AppState.currentCity = data.city;
        AppState.currentWeather = data.current;
        AppState.forecast = data.forecast;
        AppState.lastSearchedCity = city;
        
        // Save to storage
        saveLastCity(city);
        addToSearchHistory(city);
        
        // Update UI
        renderCurrentWeather();
        renderHourlyForecast();
        renderDailyForecast();
        renderMetrics();
        updateAtmosphericBackground();
        updateFavoriteButton();
        
        // Show weather sections
        showWeatherSections();
        
        // Render updated chips
        renderRecentSearches();
        
    } catch (error) {
        showError(error.message);
        hideWeatherSections();
    } finally {
        hideLoading();
    }
}

// Handle Unit Change
async function handleUnitChange(unit) {
    if (AppState.units === unit) return;
    
    AppState.units = unit;
    saveUnits(unit);
    updateUnitButtons();
    
    // Re-fetch weather data with new units
    if (AppState.lastSearchedCity) {
        await searchWeather(AppState.lastSearchedCity);
    }
}

// Update Unit Buttons
function updateUnitButtons() {
    if (AppState.units === 'metric') {
        elements.celsiusBtn.classList.add('active');
        elements.celsiusBtn.setAttribute('aria-pressed', 'true');
        elements.fahrenheitBtn.classList.remove('active');
        elements.fahrenheitBtn.setAttribute('aria-pressed', 'false');
        elements.tempUnit.textContent = '°C';
    } else {
        elements.fahrenheitBtn.classList.add('active');
        elements.fahrenheitBtn.setAttribute('aria-pressed', 'true');
        elements.celsiusBtn.classList.remove('active');
        elements.celsiusBtn.setAttribute('aria-pressed', 'false');
        elements.tempUnit.textContent = '°F';
    }
}

// Handle Favorite Toggle
function handleFavoriteToggle() {
    if (!AppState.currentCity) return;
    
    const cityData = {
        name: AppState.currentCity.name,
        country: AppState.currentCity.country,
        lat: AppState.currentCity.lat,
        lon: AppState.currentCity.lon
    };
    
    const favorites = getFavorites();
    const exists = favorites.some(city => 
        city.name.toLowerCase() === cityData.name.toLowerCase() &&
        city.country === cityData.country
    );
    
    if (exists) {
        removeFromFavorites(cityData.name, cityData.country);
        elements.favoriteBtn.classList.remove('active');
    } else {
        addToFavorites(cityData);
        elements.favoriteBtn.classList.add('active');
    }
    
    renderFavorites();
}

// Update Favorite Button
function updateFavoriteButton() {
    if (!AppState.currentCity) return;
    
    const favorites = getFavorites();
    const exists = favorites.some(city => 
        city.name.toLowerCase() === AppState.currentCity.name.toLowerCase() &&
        city.country === AppState.currentCity.country
    );
    
    if (exists) {
        elements.favoriteBtn.classList.add('active');
    } else {
        elements.favoriteBtn.classList.remove('active');
    }
}

// Handle Clear History
function handleClearHistory() {
    clearSearchHistory();
    renderRecentSearches();
}

// Handle Retry
async function handleRetry() {
    const city = elements.searchInput.value.trim();
    if (city) {
        await searchWeather(city);
    }
}

// Handle Keyboard Navigation
function handleKeyboardNavigation(event) {
    // Escape key closes loading overlay
    if (event.key === 'Escape' && AppState.isLoading) {
        hideLoading();
    }
}

// Render Current Weather
function renderCurrentWeather() {
    const weather = AppState.currentWeather;
    const city = AppState.currentCity;
    
    elements.cityName.textContent = `${city.name}, ${city.country}`;
    elements.weatherDate.textContent = formatDate(weather.dt);
    elements.weatherIcon.src = getWeatherIconUrl(weather.weatherIcon);
    elements.weatherIcon.alt = weather.weatherDescription;
    elements.temperature.textContent = weather.temp;
    elements.weatherDescription.textContent = weather.weatherDescription;
    elements.feelsLike.textContent = `${weather.feelsLike}°`;
    elements.highLow.textContent = `${weather.tempMax}° / ${weather.tempMin}°`;
    elements.humidity.textContent = `${weather.humidity}%`;
    elements.wind.textContent = `${weather.windSpeed} ${AppState.units === 'metric' ? 'km/h' : 'mph'}`;
    
    // Add fade-in animation
    elements.currentWeatherSection.classList.add('fade-in');
}

// Render Hourly Forecast
function renderHourlyForecast() {
    const hourly = AppState.forecast.hourly;
    elements.hourlyContainer.innerHTML = '';
    
    hourly.forEach((hour, index) => {
        const item = document.createElement('div');
        item.className = 'hourly-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('fade-in');
        
        const time = formatTime(hour.time);
        const iconUrl = getWeatherIconUrl(hour.weatherIcon);
        
        item.innerHTML = `
            <span class="hourly-time">${time}</span>
            <img src="${iconUrl}" alt="${hour.weatherDescription}" class="hourly-icon">
            <span class="hourly-temp">${hour.temp}°</span>
            <span class="hourly-pop">${hour.pop > 0 ? hour.pop + '%' : ''}</span>
        `;
        
        elements.hourlyContainer.appendChild(item);
    });
}

// Render Daily Forecast
function renderDailyForecast() {
    const daily = AppState.forecast.daily;
    elements.dailyContainer.innerHTML = '';
    
    daily.forEach((day, index) => {
        const item = document.createElement('div');
        item.className = 'daily-item';
        item.style.animationDelay = `${index * 0.1}s`;
        item.classList.add('slide-up');
        
        const dayName = formatDayName(day.date);
        const iconUrl = getWeatherIconUrl(day.weatherIcon);
        
        item.innerHTML = `
            <span class="daily-day">${dayName}</span>
            <div class="daily-condition">
                <img src="${iconUrl}" alt="${day.weatherDescription}" class="daily-icon">
                <span class="daily-desc">${day.weatherDescription}</span>
            </div>
            <div class="daily-temp">
                <span class="daily-temp-range">${day.tempMax}° / ${day.tempMin}°</span>
                <span class="daily-pop">${day.pop > 0 ? '💧 ' + day.pop + '%' : ''}</span>
            </div>
        `;
        
        elements.dailyContainer.appendChild(item);
    });
}

// Render Metrics
function renderMetrics() {
    const weather = AppState.currentWeather;
    
    elements.metricHumidity.textContent = `${weather.humidity}%`;
    elements.metricWind.textContent = `${weather.windSpeed} ${AppState.units === 'metric' ? 'km/h' : 'mph'}`;
    elements.metricPressure.textContent = `${weather.pressure} hPa`;
    elements.metricVisibility.textContent = weather.visibility ? `${weather.visibility} km` : 'N/A';
    elements.metricSunrise.textContent = formatTime(weather.sunrise);
    elements.metricSunset.textContent = formatTime(weather.sunset);
    elements.metricFeelsLike.textContent = `${weather.feelsLike}°`;
}

// Render Recent Searches
function renderRecentSearches() {
    const recent = getSearchHistory();
    elements.recentChips.innerHTML = '';
    
    if (recent.length === 0) {
        elements.recentChips.innerHTML = '<span style="color: var(--text-muted); font-size: 0.875rem;">No recent searches</span>';
        return;
    }
    
    recent.forEach(city => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.textContent = city;
        chip.setAttribute('aria-label', `Search for ${city}`);
        chip.addEventListener('click', () => {
            elements.searchInput.value = city;
            searchWeather(city);
        });
        elements.recentChips.appendChild(chip);
    });
}

// Render Favorites
function renderFavorites() {
    const favorites = getFavorites();
    elements.favoriteChips.innerHTML = '';
    
    if (favorites.length === 0) {
        elements.favoriteChips.innerHTML = '<span style="color: var(--text-muted); font-size: 0.875rem;">No favorites yet</span>';
        return;
    }
    
    favorites.forEach(city => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span>${city.name}, ${city.country}</span>
            <button class="chip-remove" aria-label="Remove ${city.name} from favorites">×</button>
        `;
        
        // Click on chip to search
        chip.addEventListener('click', (e) => {
            if (!e.target.classList.contains('chip-remove')) {
                elements.searchInput.value = city.name;
                searchWeather(city.name);
            }
        });
        
        // Click on remove button
        chip.querySelector('.chip-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeFromFavorites(city.name, city.country);
            renderFavorites();
            updateFavoriteButton();
        });
        
        elements.favoriteChips.appendChild(chip);
    });
}

// Update Atmospheric Background
function updateAtmosphericBackground() {
    if (!AppState.currentWeather) return;
    
    const weather = AppState.currentWeather;
    const isNight = isNightTime(weather.dt, weather.sunrise, weather.sunset);
    const category = getWeatherCategory(weather.weatherId, isNight);
    
    // Remove all background classes
    elements.atmosphereBg.className = 'atmosphere-bg';
    
    // Add new background class
    elements.atmosphereBg.classList.add(`bg-${category}`);
    
    // Clear existing particles
    clearAtmosphericParticles();
    
    // Create new particles based on weather
    createAtmosphericParticles(category);
}

// Create Atmospheric Particles
function createAtmosphericParticles(category = 'clear') {
    const bg = elements.atmosphereBg;
    
    switch(category) {
        case 'rain':
            createRainParticles(bg, 100);
            break;
        case 'snow':
            createSnowParticles(bg, 50);
            break;
        case 'night':
            createStarParticles(bg, 50);
            break;
        default:
            break;
    }
}

// Create Rain Particles
function createRainParticles(container, count) {
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'raindrop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.animationDuration = `${0.5 + Math.random() * 0.5}s`;
        container.appendChild(drop);
    }
}

// Create Snow Particles
function createSnowParticles(container, count) {
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snowflake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        flake.style.animationDuration = `${3 + Math.random() * 4}s`;
        flake.style.width = `${4 + Math.random() * 6}px`;
        flake.style.height = flake.style.width;
        container.appendChild(flake);
    }
}

// Create Star Particles
function createStarParticles(container, count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 60}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(star);
    }
}

// Clear Atmospheric Particles
function clearAtmosphericParticles() {
    const particles = elements.atmosphereBg.querySelectorAll('.raindrop, .snowflake, .star');
    particles.forEach(p => p.remove());
}

// Show Loading
function showLoading() {
    AppState.isLoading = true;
    elements.loadingOverlay.classList.add('active');
    elements.searchBtn.disabled = true;
}

// Hide Loading
function hideLoading() {
    AppState.isLoading = false;
    elements.loadingOverlay.classList.remove('active');
    elements.searchBtn.disabled = false;
}

// Show Error
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorCard.classList.remove('hidden');
    elements.errorCard.classList.add('fade-in');
}

// Hide Error
function hideError() {
    elements.errorCard.classList.add('hidden');
    elements.errorCard.classList.remove('fade-in');
}

// Show Weather Sections
function showWeatherSections() {
    elements.emptyState.classList.add('hidden');
    elements.currentWeatherSection.classList.remove('hidden');
    elements.hourlySection.classList.remove('hidden');
    elements.dailySection.classList.remove('hidden');
    elements.metricsSection.classList.remove('hidden');
}

// Hide Weather Sections
function hideWeatherSections() {
    elements.currentWeatherSection.classList.add('hidden');
    elements.hourlySection.classList.add('hidden');
    elements.dailySection.classList.add('hidden');
    elements.metricsSection.classList.add('hidden');
    elements.emptyState.classList.remove('hidden');
}

// Format Date
function formatDate(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const options = { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    };
    return date.toLocaleTimeString('en-US', options);
}

// Format Day Name
function formatDayName(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        const options = { weekday: 'short' };
        return date.toLocaleDateString('en-US', options);
    }
}

// Check if Night Time
function isNightTime(currentTime, sunrise, sunset) {
    const current = new Date(currentTime).getHours();
    const rise = new Date(sunrise).getHours();
    const set = new Date(sunset).getHours();
    
    return current < rise || current >= set;
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
