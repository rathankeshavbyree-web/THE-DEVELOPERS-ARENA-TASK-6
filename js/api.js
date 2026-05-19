/**
 * ATMOSPHERE - Weather API Integration
 * Handles all Visual Crossing Weather API calls with error handling and timeout management
 */

"use strict";

// API Configuration
const API_KEY = "QPH3PF38T6GSDG9E6GV52DCF6"; // Replace with your Visual Crossing API key
const BASE_URL = "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
const TIMEOUT_MS = 10000; // 10 second timeout

/**
 * Create an AbortController with timeout
 * @returns {AbortController} Controller with timeout set
 */
function createTimeoutController() {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), TIMEOUT_MS);
    return controller;
}

/**
 * Generic API fetch function with error handling
 * @param {string} url - Full API URL
 * @param {string} errorMessage - Custom error message
 * @returns {Promise<Object>} Parsed JSON response
 */
async function fetchAPI(url, errorMessage = "API request failed") {
    const controller = createTimeoutController();
    
    try {
        const response = await fetch(url, {
            signal: controller.signal
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please check the spelling.");
            } else if (response.status === 401) {
                throw new Error("Invalid API key. Please check your configuration.");
            } else if (response.status === 429) {
                throw new Error("API rate limit exceeded. Please try again later.");
            } else {
                throw new Error(`${errorMessage} (Status: ${response.status})`);
            }
        }
        
        const data = await response.json();
        
        // Validate response has data
        if (!data || (Array.isArray(data) && data.length === 0)) {
            throw new Error("No data received from API");
        }
        
        return data;
        
    } catch (error) {
        if (error.name === 'AbortError') {
            throw new Error("Request timeout. Please check your connection and try again.");
        }
        if (error.message.includes('Failed to fetch')) {
            throw new Error("Network error. Please check your internet connection.");
        }
        throw error;
    }
}

/**
 * Get complete weather data for a city using Visual Crossing API
 * @param {string} city - City name
 * @param {string} units - 'metric' or 'us' (Visual Crossing uses 'us' for imperial)
 * @returns {Promise<Object>} Complete weather data
 */
async function getCompleteWeatherData(city, units = 'metric') {
    if (!city || city.trim() === '') {
        throw new Error("Please enter a city name");
    }
    
    // Visual Crossing uses 'us' for imperial units
    const unitGroup = units === 'imperial' ? 'us' : 'metric';
    const url = `${BASE_URL}/${encodeURIComponent(city)}?unitGroup=${unitGroup}&include=current,hours,days&key=${API_KEY}&contentType=json`;
    
    const data = await fetchAPI(url, "Weather data fetch failed");
    
    // Validate response structure
    if (!data || !data.currentConditions || !data.days) {
        throw new Error("Invalid weather data received");
    }
    
    return formatVisualCrossingData(data, city);
}

/**
 * Format Visual Crossing API data to match our application structure
 * @param {Object} data - Raw Visual Crossing API response
 * @param {string} city - City name
 * @returns {Object} Formatted weather data
 */
function formatVisualCrossingData(data, city) {
    const current = data.currentConditions;
    const address = data.address || city;
    const resolvedAddress = data.resolvedAddress || address;
    
    // Parse location info from resolved address
    const locationParts = resolvedAddress.split(',').map(p => p.trim());
    const cityName = locationParts[0] || city;
    const country = locationParts[locationParts.length - 1] || '';
    
    // Format current weather
    const formattedCurrent = {
        city: cityName,
        country: country,
        lat: data.latitude,
        lon: data.longitude,
        temp: Math.round(current.temp),
        feelsLike: Math.round(current.feelslike),
        tempMin: Math.round(data.days[0].tempmin),
        tempMax: Math.round(data.days[0].tempmax),
        humidity: current.humidity,
        pressure: current.pressure,
        visibility: current.visibility,
        windSpeed: current.windspeed,
        windDirection: current.winddir,
        windGust: current.windgust || null,
        weatherId: getWeatherIdFromCondition(current.conditions),
        weatherMain: current.conditions,
        weatherDescription: current.conditions.toLowerCase(),
        weatherIcon: getWeatherIconFromCondition(current.conditions),
        clouds: current.cloudcover || 0,
        sunrise: data.days[0].sunriseEpoch * 1000,
        sunset: data.days[0].sunsetEpoch * 1000,
        timezone: data.timezone,
        dt: current.datetimeEpoch ? current.datetimeEpoch * 1000 : Date.now(),
        uvIndex: current.uvindex || null
    };
    
    // Format hourly forecast (next 24 hours)
    const hourly = [];
    const todayHours = data.days[0].hours || [];
    
    for (let i = 0; i < Math.min(24, todayHours.length); i++) {
        const hour = todayHours[i];
        hourly.push({
            time: hour.datetimeEpoch * 1000,
            temp: Math.round(hour.temp),
            weatherId: getWeatherIdFromCondition(hour.conditions),
            weatherMain: hour.conditions,
            weatherDescription: hour.conditions.toLowerCase(),
            weatherIcon: getWeatherIconFromCondition(hour.conditions),
            pop: hour.precipprob || 0
        });
    }
    
    // Format daily forecast (5 days)
    const daily = data.days.slice(0, 5).map(day => ({
        date: new Date(day.datetimeEpoch * 1000).toDateString(),
        tempMin: Math.round(day.tempmin),
        tempMax: Math.round(day.tempmax),
        weatherId: getWeatherIdFromCondition(day.conditions),
        weatherMain: day.conditions,
        weatherDescription: day.conditions.toLowerCase(),
        weatherIcon: getWeatherIconFromCondition(day.conditions),
        pop: day.precipprob || 0
    }));
    
    return {
        city: {
            name: cityName,
            country: country,
            lat: data.latitude,
            lon: data.longitude,
            state: locationParts.length > 2 ? locationParts[1] : ''
        },
        current: formattedCurrent,
        forecast: {
            hourly: hourly,
            daily: daily
        },
        units: data.currentConditions.temp ? (current.temp > 50 ? 'imperial' : 'metric') : 'metric'
    };
}

/**
 * Get weather condition ID from Visual Crossing conditions string
 * @param {string} conditions - Conditions string from Visual Crossing
 * @returns {number} Weather ID compatible with our system
 */
function getWeatherIdFromCondition(conditions) {
    if (!conditions) return 800;
    
    const lower = conditions.toLowerCase();
    
    if (lower.includes('thunder') || lower.includes('t-storm')) return 211;
    if (lower.includes('drizzle')) return 301;
    if (lower.includes('rain') || lower.includes('shower')) return 501;
    if (lower.includes('snow') || lower.includes('blizzard') || lower.includes('flurries')) return 601;
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return 741;
    if (lower.includes('clear') || lower.includes('sunny')) return 800;
    if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('partly')) return 801;
    
    return 800;
}

/**
 * Get weather icon code from Visual Crossing conditions
 * @param {string} conditions - Conditions string from Visual Crossing
 * @returns {string} Icon code
 */
function getWeatherIconFromCondition(conditions) {
    if (!conditions) return '01d';
    
    const lower = conditions.toLowerCase();
    
    if (lower.includes('thunder') || lower.includes('t-storm')) return '11d';
    if (lower.includes('drizzle')) return '09d';
    if (lower.includes('rain') || lower.includes('shower')) return '10d';
    if (lower.includes('snow') || lower.includes('blizzard') || lower.includes('flurries')) return '13d';
    if (lower.includes('fog') || lower.includes('mist') || lower.includes('haze')) return '50d';
    if (lower.includes('clear') || lower.includes('sunny')) return '01d';
    if (lower.includes('partly')) return '02d';
    if (lower.includes('cloud') || lower.includes('overcast')) return '04d';
    
    return '01d';
}

/**
 * Get weather condition category for backgrounds
 * @param {number} weatherId - Weather condition ID
 * @param {boolean} isNight - Whether it's nighttime
 * @returns {string} Weather category
 */
function getWeatherCategory(weatherId, isNight = false) {
    if (isNight) return 'night';
    
    // Thunderstorm
    if (weatherId >= 200 && weatherId < 300) return 'thunderstorm';
    
    // Drizzle
    if (weatherId >= 300 && weatherId < 400) return 'rain';
    
    // Rain
    if (weatherId >= 500 && weatherId < 600) return 'rain';
    
    // Snow
    if (weatherId >= 600 && weatherId < 700) return 'snow';
    
    // Atmosphere (fog, mist, etc.)
    if (weatherId >= 700 && weatherId < 800) return 'fog';
    
    // Clear
    if (weatherId === 800) return 'clear';
    
    // Clouds
    if (weatherId > 800) return 'cloudy';
    
    return 'clear';
}

/**
 * Convert temperature between units
 * @param {number} temp - Temperature value
 * @param {string} fromUnit - Source unit ('metric' or 'imperial')
 * @param {string} toUnit - Target unit ('metric' or 'imperial')
 * @returns {number} Converted temperature
 */
function convertTemperature(temp, fromUnit, toUnit) {
    if (fromUnit === toUnit) return temp;
    
    if (fromUnit === 'metric' && toUnit === 'imperial') {
        return (temp * 9/5) + 32;
    }
    
    if (fromUnit === 'imperial' && toUnit === 'metric') {
        return (temp - 32) * 5/9;
    }
    
    return temp;
}

/**
 * Get weather icon URL
 * @param {string} iconCode - Weather icon code
 * @returns {string} Full icon URL
 */
function getWeatherIconUrl(iconCode) {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
