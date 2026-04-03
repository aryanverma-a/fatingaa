import { citySpecificActivities, normalizeCityName } from './cityData.js';

/**
 * Maps standard WMO weather codes to our simpler condition string and icons.
 */
export function parseWeatherCode(wmoCode) {
    if (wmoCode === 0) return { condition: 'Clear Sky', icon: 'fa-sun', desc: 'Sunny and clear' };
    if (wmoCode >= 1 && wmoCode <= 3) return { condition: 'Partly Cloudy', icon: 'fa-cloud-sun', desc: 'A few clouds' };
    if (wmoCode >= 45 && wmoCode <= 48) return { condition: 'Foggy', icon: 'fa-smog', desc: 'Foggy conditions' };
    if (wmoCode >= 51 && wmoCode <= 67) return { condition: 'Drizzle / Rain', icon: 'fa-cloud-rain', desc: 'Light rain' };
    if (wmoCode >= 71 && wmoCode <= 77) return { condition: 'Snow', icon: 'fa-snowflake', desc: 'Snowy' };
    if (wmoCode >= 80 && wmoCode <= 82) return { condition: 'Rain Showers', icon: 'fa-cloud-showers-heavy', desc: 'Heavy showers' };
    if (wmoCode >= 95 && wmoCode <= 99) return { condition: 'Thunderstorm', icon: 'fa-cloud-bolt', desc: 'Thunderstorms' };
    
    // Default fallback
    return { condition: 'Partly Cloudy', icon: 'fa-cloud', desc: 'Cloudy' };
}

// 40+ Mock Activities tagged by condition and time-of-day
const activitiesDB = [
    // Outdoors - Clear Sky / Partly Cloudy
    { name: 'City Sightseeing Walk', type: 'outdoor', desc: 'Explore the city streets and landmarks.', icon: 'fa-person-walking', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
    { name: 'Beach or Lakeshore Relaxation', type: 'outdoor', desc: 'Enjoy the sun by the water.', icon: 'fa-umbrella-beach', time: ['morning', 'afternoon'], cond: ['Clear Sky'] },
    { name: 'Cycling Tour', type: 'outdoor', desc: 'Rent a bike and explore the local trails.', icon: 'fa-bicycle', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy'] },
    { name: 'Rooftop Dining', type: 'outdoor', desc: 'Enjoy a meal with a panoramic view.', icon: 'fa-utensils', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
    { name: 'Visit Botanical Gardens', type: 'outdoor', desc: 'Stroll through lush local gardens.', icon: 'fa-leaf', time: ['morning', 'afternoon'], cond: ['Partly Cloudy', 'Clear Sky'] },
    { name: 'Open Air Market', type: 'outdoor', desc: 'Shop for local crafts and fresh food.', icon: 'fa-store', time: ['morning', 'afternoon'], cond: ['Partly Cloudy', 'Clear Sky'] },
    { name: 'Street Food Tour', type: 'outdoor', desc: 'Taste the local street delicacies.', icon: 'fa-burger', time: ['afternoon', 'evening'], cond: ['Clear Sky', 'Partly Cloudy'] },
    { name: 'Sunset Viewpoint', type: 'outdoor', desc: 'Hike to an overlook for the perfect sunset.', icon: 'fa-mountain-sun', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy'] },

    // Outdoors - Foggy / Atmospheric
    { name: 'Scenic Photography', type: 'outdoor', desc: 'Capture the moody, foggy atmosphere.', icon: 'fa-camera', time: ['morning', 'afternoon'], cond: ['Foggy'] },
    { name: 'Hill Walk', type: 'outdoor', desc: 'A brisk walk through misty hills.', icon: 'fa-mountain', time: ['morning', 'afternoon'], cond: ['Foggy'] },
    
    // Outdoors - Snow
    { name: 'Snow Photography', type: 'outdoor', desc: 'Capture the winter wonderland.', icon: 'fa-camera-retro', time: ['morning', 'afternoon'], cond: ['Snow'] },
    { name: 'Ski Resort / Snow Park', type: 'outdoor', desc: 'Enjoy winter sports.', icon: 'fa-person-skiing', time: ['morning', 'afternoon'], cond: ['Snow'] },
    { name: 'Ice Skating', type: 'outdoor', desc: 'Try an outdoor ice rink.', icon: 'fa-person-skating', time: ['evening', 'afternoon'], cond: ['Snow', 'Clear Sky'] },

    // Mixed 
    { name: 'Brief Covered Market Visit', type: 'indoor', desc: 'Browse stalls while avoiding the drizzle.', icon: 'fa-shop', time: ['morning', 'afternoon'], cond: ['Drizzle / Rain'] },
    { name: 'Short Park Walk w/ Umbrella', type: 'outdoor', desc: 'A quick stroll between rain showers.', icon: 'fa-umbrella', time: ['morning', 'afternoon'], cond: ['Rain Showers'] },

    // Indoors - Versatile (Good for bad weather, but also fine for good weather)
    { name: 'Visit Art Gallery', type: 'indoor', desc: 'Admire classic and contemporary art.', icon: 'fa-palette', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Local History Museum', type: 'indoor', desc: 'Learn about the heritage of the area.', icon: 'fa-building-columns', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Café Hopping', type: 'indoor', desc: 'Relax with artisanal coffee and pastries.', icon: 'fa-mug-hot', time: ['morning', 'afternoon'], cond: ['Clear Sky', 'Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Cultural Center', type: 'indoor', desc: 'Experience local arts and culture.', icon: 'fa-masks-theater', time: ['afternoon', 'evening'], cond: ['Partly Cloudy', 'Foggy', 'Drizzle / Rain', 'Rain Showers'] },
    { name: 'Indoor Exhibitions', type: 'indoor', desc: 'Browse specialized, temporary exhibits.', icon: 'fa-landmark', time: ['afternoon', 'evening'], cond: ['Foggy', 'Drizzle / Rain', 'Rain Showers'] },
    { name: 'Luxury Spa', type: 'indoor', desc: 'Unwind and relax indoors.', icon: 'fa-spa', time: ['morning', 'afternoon', 'evening'], cond: ['Foggy', 'Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Shopping Mall', type: 'indoor', desc: 'Extensive indoor retail therapy.', icon: 'fa-bag-shopping', time: ['afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm'] },
    { name: 'Cinema / Movie Theater', type: 'indoor', desc: 'Catch the latest blockbuster or indie film.', icon: 'fa-film', time: ['afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Warm Café Relaxing', type: 'indoor', desc: 'Cozy up with a hot drink.', icon: 'fa-mug-steam', time: ['morning', 'afternoon', 'evening'], cond: ['Snow', 'Foggy', 'Drizzle / Rain'] },
    { name: 'Indoor Heated Pool', type: 'indoor', desc: 'Swim comfortably regardless of weather.', icon: 'fa-water-ladder', time: ['morning', 'afternoon'], cond: ['Snow', 'Thunderstorm'] },
    { name: 'Hot Springs', type: 'indoor', desc: 'Natural thermal heating.', icon: 'fa-hot-tub-person', time: [' вечер', 'evening'], cond: ['Snow', 'Foggy'] },
    { name: 'City Aquarium', type: 'indoor', desc: 'Discover marine life without getting wet.', icon: 'fa-fish', time: ['morning', 'afternoon'], cond: ['Rain Showers', 'Thunderstorm', 'Drizzle / Rain'] },
    { name: 'Public Library', type: 'indoor', desc: 'A quiet place to read and relax.', icon: 'fa-book', time: ['morning', 'afternoon'], cond: ['Rain Showers', 'Thunderstorm'] },
    { name: 'Indoor Food Court', type: 'indoor', desc: 'Sample multiple cuisines in one place.', icon: 'fa-utensils', time: ['afternoon', 'evening'], cond: ['Rain Showers', 'Thunderstorm'] },
    { name: 'Hotel Bar / Lounge', type: 'indoor', desc: 'Unwind safely during severe weather.', icon: 'fa-martini-glass-empty', time: ['evening'], cond: ['Thunderstorm', 'Rain Showers', 'Snow'] },
    { name: 'Coworking Space / Cafe', type: 'indoor', desc: 'Catch up on emails or reading safely.', icon: 'fa-laptop', time: ['morning', 'afternoon'], cond: ['Thunderstorm'] },
    { name: 'Live Theater / Musical', type: 'indoor', desc: 'Enjoy an evening performance.', icon: 'fa-ticket', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy', 'Drizzle / Rain', 'Rain Showers', 'Snow', 'Foggy'] },
    { name: 'Bowling Alley', type: 'indoor', desc: 'Fun indoor activity for groups.', icon: 'fa-bowling-ball', time: ['afternoon', 'evening'], cond: ['Drizzle / Rain', 'Rain Showers', 'Thunderstorm'] },
    { name: 'Arcade / Gaming Center', type: 'indoor', desc: 'Retro games and modern VR.', icon: 'fa-gamepad', time: ['afternoon', 'evening'], cond: ['Thunderstorm', 'Rain Showers'] },
    { name: 'Escape Room', type: 'indoor', desc: 'Solve puzzles indoors with friends.', icon: 'fa-key', time: ['afternoon', 'evening'], cond: ['Thunderstorm', 'Rain Showers'] },
    { name: 'Indoor Rock Climbing', type: 'indoor', desc: 'Stay active indoors.', icon: 'fa-mountain-city', time: ['morning', 'afternoon'], cond: ['Rain Showers', 'Thunderstorm', 'Snow'] },
    { name: 'Brewery Tour', type: 'indoor', desc: 'Sample local craft beers.', icon: 'fa-beer-mug-empty', time: ['afternoon', 'evening'], cond: ['Drizzle / Rain', 'Foggy'] },
    { name: 'Wine Tasting', type: 'indoor', desc: 'Explore local wines.', icon: 'fa-wine-glass', time: ['evening'], cond: ['Partly Cloudy', 'Clear Sky', 'Foggy'] },
    { name: 'Fine Dining Restaurant', type: 'indoor', desc: 'A premium culinary experience.', icon: 'fa-bell-concierge', time: ['evening'], cond: ['Clear Sky', 'Partly Cloudy', 'Snow', 'Foggy', 'Drizzle / Rain', 'Rain Showers'] },
    { name: 'Yoga Class', type: 'indoor', desc: 'Morning meditation and stretching.', icon: 'fa-yin-yang', time: ['morning'], cond: ['Thunderstorm', 'Rain Showers', 'Foggy', 'Snow'] }
];

/**
 * Shuffles an array in-place using Fisher-Yates algorithm.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Generates an itinerary for a given time slot based on the weather condition and city.
 * @param {string} timeSlot - 'morning', 'afternoon', or 'evening'
 * @param {string} condition - Weather condition string
 * @param {string} cityName - Name of the city
 * @param {number} count - Number of activities to return (default 3)
 */
export function generateActivitiesForSlot(timeSlot, condition, cityName, count = 3) {
    const normalCity = normalizeCityName(cityName);
    
    // Start with custom DB if it exists for this city
    let baseDB = activitiesDB;
    let customDB = [];
    if (citySpecificActivities[normalCity]) {
        customDB = citySpecificActivities[normalCity];
    }

    // Filter normal DB
    let suitable = activitiesDB.filter(a => 
        (a.time.includes(timeSlot) || a.time.includes(' вечер')) && 
        a.cond.includes(condition)
    );

    // Filter custom DB
    let customSuitable = customDB.filter(a => 
        (a.time.includes(timeSlot) || a.time.includes(' вечер')) && 
        a.cond.includes(condition)
    );

    // Provide generic fallbacks if too few activities match
    if (suitable.length + customSuitable.length < count) {
        const fallbacks = activitiesDB.filter(a => a.type === 'indoor' && a.time.includes(timeSlot));
        suitable = [...suitable, ...fallbacks];
    }
    
    // De-duplicate
    suitable = Array.from(new Set(suitable));
    customSuitable = Array.from(new Set(customSuitable));

    // Shuffle both
    suitable = shuffleArray(suitable);
    customSuitable = shuffleArray(customSuitable);

    // Prioritize custom DB items
    let finalSelection = [...customSuitable, ...suitable];
    
    // De-dup again to be safe
    finalSelection = Array.from(new Set(finalSelection));

    return finalSelection.slice(0, count);
}
