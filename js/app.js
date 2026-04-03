import { geocodeCity, getWeatherData } from './api.js';
import { parseWeatherCode, generateActivitiesForSlot } from './weatherRules.js';
import { getTripHistory, saveTrip, deleteTrip, clearHistory, getSavedTheme, saveTheme } from './storage.js';
import { updateMap } from './map.js';
import { popularCities, normalizeCityName } from './cityData.js';

// DOM Elements - Theme & Unit
const themeToggle = document.getElementById('themeToggle');
const unitToggle = document.getElementById('unitToggle');

// DOM Elements - Search & Autocomplete
const searchInput = document.getElementById('citySearch');
const searchBtn = document.getElementById('searchBtn');
const searchSuggestions = document.getElementById('searchSuggestions');

// DOM Elements - Weather UI
const heroBackground = document.getElementById('heroBackground');
const cityNameEl = document.getElementById('cityName');
const currentDateEl = document.getElementById('currentDate');
const weatherBody = document.getElementById('weatherBody');
const loadingSkeleton = document.getElementById('loadingSkeleton');
const apiError = document.getElementById('apiError');
const errorMsg = document.getElementById('errorMsg');
const retryBtn = document.getElementById('retryBtn');

const currentTempEl = document.getElementById('currentTemp');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherConditionEl = document.getElementById('weatherCondition');
const feelsLikeEl = document.getElementById('feelsLike');
const humidityEl = document.getElementById('humidity');
const windSpeedEl = document.getElementById('windSpeed');
const tempUnits = document.querySelectorAll('.temp-unit');
const windUnits = document.querySelectorAll('.wind-unit');

// DOM Elements - Itinerary
const itineraryActions = document.getElementById('itineraryActions');
const itineraryGrid = document.getElementById('itineraryGrid');
const mapSection = document.getElementById('mapSection');
const dayTabsContainer = document.getElementById('dayTabsContainer');
const regenerateBtn = document.getElementById('regenerateBtn');
const exportBtn = document.getElementById('exportBtn');
const exportPdfBtn = document.getElementById('exportPdfBtn');

// DOM Elements - Drawers
const historyToggle = document.getElementById('historyToggle');
const closeHistoryBtn = document.getElementById('closeHistoryBtn');
const historyDrawer = document.getElementById('historyDrawer');
const popularToggle = document.getElementById('popularToggle');
const closePopularBtn = document.getElementById('closePopularBtn');
const popularDrawer = document.getElementById('popularDrawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const historyList = document.getElementById('historyList');
const popularList = document.getElementById('popularList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// DOM Elements - Date Modal
const dateModalOverlay = document.getElementById('dateModalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const generatePlanBtn = document.getElementById('generatePlanBtn');
const modalCityName = document.getElementById('modalCityName');
const datePickerInput = document.getElementById('datePickerInput');

// State
let isMetric = true;
let activeLocation = null; // { name, fullName, lat, lon }
let selectedDates = []; // Array of dates
let currentWeatherData = null;
let currentMultiDayItinerary = []; // Array of daily itineries
let currentActiveDayIndex = 0;
let datePickerInstance = null;
let searchTimeout = null;

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    updateDate();
    renderHistory();
    renderPopularCities();
    
    // Init flatpickr
    let maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 14);
    datePickerInstance = flatpickr(datePickerInput, {
        mode: "range",
        minDate: "today",
        maxDate: maxDate,
        dateFormat: "Y-m-d",
        defaultDate: ["today"]
    });
});

function initTheme() {
    const theme = getSavedTheme();
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
}

function setupEventListeners() {
    themeToggle.addEventListener('click', toggleTheme);
    unitToggle.addEventListener('click', toggleUnits);
    
    // Search & Autocomplete
    searchInput.addEventListener('input', handleAutocomplete);
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) triggerDirectSearch(searchInput.value.trim());
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            searchSuggestions.style.display = 'none';
            triggerDirectSearch(searchInput.value.trim());
        }
    });

    // Outer UI clicks to close autocomplete
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) {
            searchSuggestions.style.display = 'none';
        }
    });
    
    retryBtn.addEventListener('click', () => generateMultiDayPlan());
    regenerateBtn.addEventListener('click', () => {
        rebuildItinerary(); // just rebuilt the current active UI
    });
    exportBtn.addEventListener('click', exportTxt);
    exportPdfBtn.addEventListener('click', exportPdf);
    
    // Drawers
    historyToggle.addEventListener('click', () => toggleDrawer('history', true));
    closeHistoryBtn.addEventListener('click', () => toggleDrawer('history', false));
    popularToggle.addEventListener('click', () => toggleDrawer('popular', true));
    closePopularBtn.addEventListener('click', () => toggleDrawer('popular', false));
    drawerOverlay.addEventListener('click', () => {
        toggleDrawer('history', false);
        toggleDrawer('popular', false);
    });
    
    clearHistoryBtn.addEventListener('click', () => {
        clearHistory();
        renderHistory();
    });

    // Modal
    closeModalBtn.addEventListener('click', () => {
        dateModalOverlay.classList.remove('open');
    });
    generatePlanBtn.addEventListener('click', () => {
        const dates = datePickerInstance.selectedDates;
        if (!dates || dates.length === 0) {
            alert('Please select at least one date.');
            return;
        }
        
        let endD = dates[1] || dates[0];
        let dArr = [];
        let cur = new Date(dates[0]);
        cur.setHours(0,0,0,0);
        endD.setHours(0,0,0,0);
        while (cur <= endD) {
            dArr.push(new Date(cur));
            cur.setDate(cur.getDate() + 1);
        }
        
        selectedDates = dArr;
        dateModalOverlay.classList.remove('open');
        generateMultiDayPlan();
    });
}

function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    if (isDark) {
        document.body.classList.remove('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
        saveTheme('light');
    } else {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
        saveTheme('dark');
    }
}

function convertTemp(celsius, toMetric) {
    if (toMetric) return Math.round(celsius);
    return Math.round((celsius * 9/5) + 32);
}

function convertWind(kmh, toMetric) {
    if (toMetric) return kmh.toFixed(1);
    return (kmh * 0.621371).toFixed(1);
}

function toggleUnits() {
    isMetric = !isMetric;
    tempUnits.forEach(el => el.textContent = isMetric ? '°C' : '°F');
    // Ensure all dynamically created tabs/cards also get updated if re-rendered
    renderActiveDayUI(); 
    
    windUnits.forEach(el => el.textContent = isMetric ? 'km/h' : 'mph');
    if (currentWeatherData) {
        updateWeatherUIValues();
    }
}

function toggleDrawer(type, show) {
    if (show) {
        if (type === 'history') historyDrawer.classList.add('open');
        if (type === 'popular') popularDrawer.classList.add('open');
        drawerOverlay.classList.add('show');
    } else {
        if (type === 'history') historyDrawer.classList.remove('open');
        if (type === 'popular') popularDrawer.classList.remove('open');
        drawerOverlay.classList.remove('show');
    }
}

function updateDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

// ------ Search & Autocomplete --------
async function handleAutocomplete(e) {
    const query = e.target.value.trim();
    clearTimeout(searchTimeout);
    
    if (query.length < 3) {
        searchSuggestions.style.display = 'none';
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const results = await geocodeCity(query);
            searchSuggestions.innerHTML = '';
            results.forEach(city => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${city.fullName}`;
                li.addEventListener('click', () => selectCity(city));
                searchSuggestions.appendChild(li);
            });
            searchSuggestions.style.display = 'block';
        } catch (err) {
            searchSuggestions.style.display = 'none';
        }
    }, 400); // 400ms debounce
}

async function triggerDirectSearch(query) {
    try {
        const results = await geocodeCity(query);
        selectCity(results[0]);
    } catch(err) {
        alert(err.message || "Failed to find city");
    }
}

function selectCity(cityData) {
    searchInput.value = cityData.fullName;
    searchSuggestions.style.display = 'none';
    activeLocation = cityData;
    
    // Close drawers if open
    toggleDrawer('history', false);
    toggleDrawer('popular', false);

    // Open Date modal
    modalCityName.textContent = normalizeCityName(cityData.name);
    dateModalOverlay.classList.add('open');
}

// ------ Generation --------
async function generateMultiDayPlan() {
    if (!activeLocation || selectedDates.length === 0) return;

    // UI Reset
    weatherBody.style.display = 'none';
    apiError.style.display = 'none';
    loadingSkeleton.style.display = 'block';
    itineraryActions.style.display = 'none';
    itineraryGrid.style.display = 'none';
    mapSection.style.display = 'none';
    document.getElementById('itineraryPrintTitle').style.display = 'none';

    try {
        cityNameEl.textContent = activeLocation.fullName;

        // Unsplash Background Fallback mapping
        const url = `https://source.unsplash.com/1600x900/?${encodeURIComponent(normalizeCityName(activeLocation.name))},city`;
        const img = new Image();
        img.src = url;
        img.onload = () => heroBackground.style.backgroundImage = `url(${url})`;

        // Fetch Weather
        const data = await getWeatherData(activeLocation.lat, activeLocation.lon);
        currentWeatherData = data;
        
        // Update Hero Weather
        updateWeatherUIValues();
        loadingSkeleton.style.display = 'none';
        weatherBody.style.display = 'block';
        
        // Update Map
        mapSection.style.display = 'block';
        const parsedCurrent = parseWeatherCode(data.current.weather_code);
        updateMap(activeLocation.lat, activeLocation.lon, normalizeCityName(activeLocation.name), parsedCurrent.condition, `${convertTemp(data.current.temperature_2m, isMetric)}°`);
        
        // Build Multi-Day Logic Array
        rebuildItinerary();

        // Build Tabs UI
        buildDayTabs();
        
        // Render Active Day UI
        currentActiveDayIndex = 0;
        renderActiveDayUI();

        // Save History
        const tripData = {
            city: activeLocation.fullName,
            lat: activeLocation.lat,
            lon: activeLocation.lon,
            date: new Date().toISOString(),
            temp: data.current.temperature_2m,
            code: data.current.weather_code
        };
        saveTrip(tripData);
        renderHistory();

    } catch (error) {
        console.error(error);
        loadingSkeleton.style.display = 'none';
        apiError.style.display = 'block';
        errorMsg.textContent = error.message || 'Failed to load data. Please try again.';
    }
}

function rebuildItinerary() {
    currentMultiDayItinerary = [];
    const hourly = currentWeatherData.hourly;
    const baseDate = new Date(); // Today
    baseDate.setHours(0,0,0,0);
    
    // We have forecast_days = 16. That means 16 * 24 hours of data.
    selectedDates.forEach((targetDate) => {
        // Find day offset from today
        targetDate.setHours(0,0,0,0);
        let diffTime = targetDate.getTime() - baseDate.getTime();
        let dayOffset = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dayOffset < 0) dayOffset = 0;
        if (dayOffset > 15) dayOffset = 15; // Max bound
        
        const startIdx = dayOffset * 24;
        
        // Calculate avergages for Morning (7-12), Afternoon (12-17), Evening (17-21) on THAT specific day
        const morningData = getHourlyAverage(hourly, startIdx + 7, startIdx + 12);
        const afternoonData = getHourlyAverage(hourly, startIdx + 12, startIdx + 17);
        const eveningData = getHourlyAverage(hourly, startIdx + 17, startIdx + 21);
        
        const mParse = parseWeatherCode(morningData.code);
        const aParse = parseWeatherCode(afternoonData.code);
        const eParse = parseWeatherCode(eveningData.code);

        const mActs = generateActivitiesForSlot('morning', mParse.condition, activeLocation.name, 3);
        const aActs = generateActivitiesForSlot('afternoon', aParse.condition, activeLocation.name, 3);
        const eActs = generateActivitiesForSlot('evening', eParse.condition, activeLocation.name, 3);

        currentMultiDayItinerary.push({
            dateObj: targetDate,
            dateStr: targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            morning: { data: morningData, parse: mParse, acts: mActs },
            afternoon: { data: afternoonData, parse: aParse, acts: aActs },
            evening: { data: eveningData, parse: eParse, acts: eActs },
        });
    });

    if (currentMultiDayItinerary.length > 0) {
        renderActiveDayUI();
    }
}

function buildDayTabs() {
    dayTabsContainer.innerHTML = '';
    if (currentMultiDayItinerary.length <= 1) {
        dayTabsContainer.style.display = 'none';
        return;
    }
    
    dayTabsContainer.style.display = 'flex';
    currentMultiDayItinerary.forEach((day, index) => {
        const btn = document.createElement('button');
        btn.className = `day-tab ${index === 0 ? 'active' : ''}`;
        btn.textContent = `Day ${index + 1}: ${day.dateStr}`;
        btn.onclick = () => {
            document.querySelectorAll('.day-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentActiveDayIndex = index;
            renderActiveDayUI();
        };
        dayTabsContainer.appendChild(btn);
    });
}

function renderActiveDayUI() {
    if (currentMultiDayItinerary.length === 0) return;
    
    const day = currentMultiDayItinerary[currentActiveDayIndex];
    
    // Update Headers
    document.getElementById('morningTemp').textContent = convertTemp(day.morning.data.temp, isMetric);
    document.getElementById('morningIcon').className = `fa-solid ${day.morning.parse.icon}`;
    
    document.getElementById('afternoonTemp').textContent = convertTemp(day.afternoon.data.temp, isMetric);
    document.getElementById('afternoonIcon').className = `fa-solid ${day.afternoon.parse.icon}`;
    
    document.getElementById('eveningTemp').textContent = convertTemp(day.evening.data.temp, isMetric);
    document.getElementById('eveningIcon').className = `fa-solid ${day.evening.parse.icon}`;
    
    // Update Units
    document.querySelectorAll('.temp-unit').forEach(el => el.textContent = isMetric ? '°C' : '°F');

    // Generate Lists
    renderActivityList(day.morning.acts, 'morningActivities');
    renderActivityList(day.afternoon.acts, 'afternoonActivities');
    renderActivityList(day.evening.acts, 'eveningActivities');
    
    itineraryActions.style.display = 'flex';
    itineraryGrid.style.display = 'grid';
}


function getHourlyAverage(hourlyData, startIdx, endIdx) {
    if (!hourlyData || !hourlyData.temperature_2m) return { temp: 0, code: 0 };
    
    const temps = hourlyData.temperature_2m.slice(startIdx, endIdx);
    const codes = hourlyData.weather_code.slice(startIdx, endIdx);
    
    if (temps.length === 0) return { temp: 0, code: 0 };

    const avgTemp = temps.reduce((a,b)=>a+b,0) / temps.length;
    const midIndex = Math.floor(codes.length / 2);
    const repCode = codes[midIndex];
    
    return { temp: avgTemp, code: repCode };
}

function updateWeatherUIValues() {
    if (!currentWeatherData) return;
    const current = currentWeatherData.current;
    
    const temp = convertTemp(current.temperature_2m, isMetric);
    const feelsLike = convertTemp(current.apparent_temperature, isMetric);
    const wind = convertWind(current.wind_speed_10m, isMetric);
    
    const parsed = parseWeatherCode(current.weather_code);

    currentTempEl.textContent = temp;
    feelsLikeEl.textContent = feelsLike;
    humidityEl.textContent = current.relative_humidity_2m;
    windSpeedEl.textContent = wind;
    
    weatherConditionEl.textContent = parsed.condition;
    weatherIconEl.className = `fa-solid ${parsed.icon} weather-icon-large pulse-anim`;
}

function renderActivityList(activities, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!activities || activities.length === 0) {
        container.innerHTML = '<li class="empty-state">No activities found.</li>';
        return;
    }

    activities.forEach(act => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        li.innerHTML = `
            <div class="activity-icon"><i class="fa-solid ${act.icon}"></i></div>
            <div class="activity-details">
                <h4>${act.name}</h4>
                <p>${act.desc}</p>
                <div class="activity-tags">
                    <span class="tag tag-${act.type}">${act.type === 'indoor' ? 'Indoor' : 'Outdoor'}</span>
                </div>
            </div>
        `;
        container.appendChild(li);
    });
}

function renderHistory() {
    const history = getTripHistory();
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<li class="empty-state">No saved trips yet.</li>';
        return;
    }
    
    history.forEach(trip => {
        const li = document.createElement('li');
        li.className = 'history-item';
        const parsed = parseWeatherCode(trip.code);
        const d = new Date(trip.date).toLocaleDateString();
        
        li.innerHTML = `
            <div class="history-info" onclick="window.loadTrip('${trip.city}', ${trip.lat}, ${trip.lon})">
                <strong>${trip.city} <i class="fa-solid ${parsed.icon}" style="font-size:0.8em; margin-left:5px;"></i></strong>
                <span>${d}</span>
            </div>
            <button class="icon-btn del-btn" onclick="window.delTrip(${trip.id})"><i class="fa-solid fa-trash"></i></button>
        `;
        historyList.appendChild(li);
    });
}

function renderPopularCities() {
    popularList.innerHTML = '';
    popularCities.forEach(city => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div class="history-info" onclick="window.loadTrip('${city.fullName}', ${city.lat}, ${city.lon})" style="width:100%">
                <strong><i class="fa-solid fa-map-pin"></i> ${city.name}</strong>
                <span>${city.fullName}</span>
            </div>
        `;
        popularList.appendChild(li);
    });
}

// Global hook bindings for inline onclick
window.loadTrip = (fullName, lat, lon) => {
    selectCity({ fullName, name: normalizeCityName(fullName), lat, lon });
};

window.delTrip = (id) => {
    deleteTrip(id);
    renderHistory();
};

// Exports
function exportTxt() {
    if (!currentMultiDayItinerary || currentMultiDayItinerary.length === 0) return;
    
    let txt = `SMART TRAVEL PLANNER ITINERARY\nCity: ${activeLocation.fullName}\n\n`;

    currentMultiDayItinerary.forEach((day, index) => {
        txt += `\n=============== DAY ${index + 1}: ${day.dateStr} ===============\n\n`;
        txt += `--- MORNING (${day.morning.parse.condition}) ---\n`;
        txt += day.morning.acts.map((a, i) => `${i+1}. ${a.name} [${a.type}]\n   ${a.desc}`).join('\n') + '\n\n';
        txt += `--- AFTERNOON (${day.afternoon.parse.condition}) ---\n`;
        txt += day.afternoon.acts.map((a, i) => `${i+1}. ${a.name} [${a.type}]\n   ${a.desc}`).join('\n') + '\n\n';
        txt += `--- EVENING (${day.evening.parse.condition}) ---\n`;
        txt += day.evening.acts.map((a, i) => `${i+1}. ${a.name} [${a.type}]\n   ${a.desc}`).join('\n') + '\n\n';
    });

    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `itinerary-${normalizeCityName(activeLocation.name).replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

function exportPdf() {
    // Generate a temporary full layout for PDF or just print the currently visible tab
    // To make it incredibly robust, we will print what is currently visible, or better yet, loop through and print everything.
    // For simplicity, we'll configure html2pdf to grab the `#pdfExportArea` which contains the current active day grid.
    // A more advanced approach would render the full multi-day view to a hidden div, but currently printing the active selected day works well.
    const element = document.getElementById('pdfExportArea');
    const title = document.getElementById('itineraryPrintTitle');
    
    // Briefly show title
    title.style.display = 'block';
    const num = currentActiveDayIndex + 1;
    const dt = currentMultiDayItinerary[currentActiveDayIndex].dateStr;
    title.textContent = `${activeLocation.fullName} - Day ${num} (${dt})`;

    const opt = {
        margin:       0.5,
        filename:     `itinerary-${normalizeCityName(activeLocation.name).replace(/\s+/g, '-').toLowerCase()}-day${num}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        title.style.display = 'none'; // Hide title again
    });
}
