// js/map.js

let mapInstance = null;
let markerInstance = null;

/**
 * Initializes the map or updates it if already initialized
 */
export function updateMap(lat, lon, cityName, conditionDesc, tempInfo) {
    const coords = [lat, lon];
    
    // Lazy check if L (Leaflet) is loaded
    if (typeof L === 'undefined') {
        console.warn('Leaflet not loaded yet.');
        return;
    }

    if (!mapInstance) {
        // Initialize map
        mapInstance = L.map('map').setView(coords, 13);
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance);
    } else {
        // Smoothly fly to new location
        mapInstance.flyTo(coords, 13, {
            animate: true,
            duration: 1.5
        });
    }

    // Update marker
    if (markerInstance) {
        mapInstance.removeLayer(markerInstance);
    }

    markerInstance = L.marker(coords).addTo(mapInstance);
    
    // Setup popup content
    const popupContent = `
        <div style="text-align:center; padding: 5px;">
            <strong>${cityName}</strong><br>
            ${conditionDesc}<br>
            ${tempInfo}
        </div>
    `;
    
    markerInstance.bindPopup(popupContent).openPopup();
    
    // Ensure map Section is visible in DOM before invalidateSize
    setTimeout(() => {
        mapInstance.invalidateSize();
    }, 100);
}
