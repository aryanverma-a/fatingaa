// js/cityData.js

export const popularCities = [
    { name: 'Paris', fullName: 'Paris, France', lat: 48.8534, lon: 2.3488 },
    { name: 'London', fullName: 'London, UK', lat: 51.5085, lon: -0.1257 },
    { name: 'New York', fullName: 'New York, USA', lat: 40.7143, lon: -74.006 },
    { name: 'Tokyo', fullName: 'Tokyo, Japan', lat: 35.6895, lon: 139.6917 },
    { name: 'Rome', fullName: 'Rome, Italy', lat: 41.8947, lon: 12.4839 },
    { name: 'Sydney', fullName: 'Sydney, Australia', lat: -33.8678, lon: 151.2073 }
];

// Custom POI Activities matching our existing schema
// Cond strings: 'Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Snow', 'Rain Showers', 'Thunderstorm'
export const citySpecificActivities = {
    'Paris': [
        { name: 'Eiffel Tower', type: 'outdoor', desc: 'Experience breathtaking views if the sky is clear.', icon: 'fa-tower-observation', time: ['morning', 'afternoon', 'evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Louvre Museum', type: 'indoor', desc: 'Perfect indoor escape to see the Mona Lisa.', icon: 'fa-building-columns', time: ['morning', 'afternoon'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Foggy', 'Snow'] },
        { name: 'Montmartre Walk', type: 'outdoor', desc: 'Stroll through charming artisan streets.', icon: 'fa-person-walking', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Le Marais Cafés', type: 'indoor', desc: 'Cozy up in a classic Parisian café.', icon: 'fa-mug-hot', time: ['morning', 'afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Snow', 'Foggy'] },
        { name: 'Seine River Cruise', type: 'outdoor', desc: 'Enjoy a beautiful evening on the water.', icon: 'fa-ferry', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy'] }
    ],
    'London': [
        { name: 'The British Museum', type: 'indoor', desc: 'Vast history collections out of the rain.', icon: 'fa-building-columns', time: ['morning', 'afternoon'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Foggy', 'Snow'] },
        { name: 'London Eye', type: 'outdoor', desc: 'Panoramic city views on a clear day.', icon: 'fa-eye', time: ['morning', 'afternoon', 'evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Hyde Park Picnic', type: 'outdoor', desc: 'Enjoy the green spaces while the weather is nice.', icon: 'fa-tree', time: ['afternoon'], cond: ['Clear Sky'] },
        { name: 'West End Show', type: 'indoor', desc: 'Catch a world-class theatre performance.', icon: 'fa-masks-theater', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Snow', 'Thunderstorm'] }
    ],
    'New York': [
        { name: 'Central Park Walk', type: 'outdoor', desc: 'Wander through the iconic park safely.', icon: 'fa-tree', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy', 'Snow'] },
        { name: 'Metropolitan Museum of Art', type: 'indoor', desc: 'Get lost in art on a rainy day.', icon: 'fa-palette', time: ['morning', 'afternoon'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Foggy', 'Snow'] },
        { name: 'Top of the Rock', type: 'outdoor', desc: 'City skyline viewing over Manhattan.', icon: 'fa-city', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Broadway Show', type: 'indoor', desc: 'A cozy evening at a massive musical.', icon: 'fa-ticket', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Snow', 'Thunderstorm'] }
    ],
    'Tokyo': [
        { name: 'Shibuya Crossing & Hachiko', type: 'outdoor', desc: 'Experience the bustling city streets.', icon: 'fa-users', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'teamLab Planets', type: 'indoor', desc: 'Immersive indoor digital art.', icon: 'fa-lightbulb', time: ['morning', 'afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Foggy', 'Snow'] },
        { name: 'Shinjuku Gyoen', type: 'outdoor', desc: 'Beautiful seasonal gardens.', icon: 'fa-leaf', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Akihabara Arcades', type: 'indoor', desc: 'Dive into multi-story gaming centers.', icon: 'fa-gamepad', time: ['afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm'] }
    ],
    'Rome': [
        { name: 'Colosseum Tour', type: 'outdoor', desc: 'Step back into ancient history.', icon: 'fa-landmark', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Vatican Museums', type: 'indoor', desc: 'See the Sistine Chapel out of the rain.', icon: 'fa-building-columns', time: ['morning', 'afternoon'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Foggy', 'Snow'] },
        { name: 'Trevi Fountain', type: 'outdoor', desc: 'Toss a coin in the evening light.', icon: 'fa-water', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
        { name: 'Traditional Trattoria', type: 'indoor', desc: 'Cozy up with incredible pasta.', icon: 'fa-utensils', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] }
    ]
};

// Expose a helper to extract just the base city name loosely
export function normalizeCityName(cityName) {
    if (!cityName) return '';
    return cityName.split(',')[0].trim();
}
