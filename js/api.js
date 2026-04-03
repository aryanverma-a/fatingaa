// js/api.js

const GEOCODE_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * Convert a city name to coordinates (used for autocomplete as well)
 */
export async function geocodeCity(cityName) {
    const url = `${GEOCODE_API}?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Network response from Geocoding API was not ok.');
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
        throw new Error('City not found. Please try a different name.');
    }
    
    // Return all results for autocomplete, but we usually just take the first for direct search
    return data.results.map(city => ({
        name: city.name,
        fullName: `${city.name}, ${city.country || ''}`,
        lat: city.latitude,
        lon: city.longitude
    }));
}

/**
 * Fetch current weather and hourly weather codes from Open-Meteo.
 */
export async function getWeatherData(lat, lon) {
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,weather_code',
        timezone: 'auto',
        forecast_days: 16
    });

    const response = await fetch(`${WEATHER_API}?${params.toString()}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
    }
    
    const data = await response.json();
    return data;
}
