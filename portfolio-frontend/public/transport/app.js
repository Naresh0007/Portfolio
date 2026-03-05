/**
 * Instant Stop Info - App Logic
 * Designed for Australian Transport (TfNSW Focus)
 */

// Configuration & Constants
const API_CONFIG = {
    tfnsw_base_url: 'https://api.transport.nsw.gov.au/v1/tp',
    weather_base_url: 'https://api.open-meteo.com/v1/forecast',
    demo_mode: true,
    apiKey: localStorage.getItem('transport_api_key') || '',
    // GTFS-Realtime Endpoints (As per documentation)
    gtfsr_endpoints: {
        trains: 'https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains',
        metro: 'https://api.transport.nsw.gov.au/v2/gtfs/realtime/metro',
        lightrail: 'https://api.transport.nsw.gov.au/v2/gtfs/realtime/lightrail/innerwest',
        buses: 'https://api.transport.nsw.gov.au/v2/gtfs/realtime/buses'
    }
};

if (API_CONFIG.apiKey) API_CONFIG.demo_mode = false;

// Fare Lookup Table (Simple example based on NSW Opal zones for Trains)
const FARE_TABLE = {
    'train': { 'peak': '$ 4.00', 'off-peak': '$ 2.80' },
    'bus': { 'standard': '$ 3.20' },
    'ferry': { 'standard': '$ 6.79' },
    'lightrail': { 'standard': '$ 3.20' }
};

// State Management
let currentStop = null;
let currentTab = 'stop';
let favorites = JSON.parse(localStorage.getItem('transport_favorites') || '[]');

// DOM Elements
const searchBarStop = document.getElementById('stop-search-container');
const searchBarJourney = document.getElementById('journey-search-container');
const searchInput = document.getElementById('stop-search');
const originInput = document.getElementById('origin-search');
const destInput = document.getElementById('dest-search');
const searchBtn = document.getElementById('search-btn');
const journeyBtn = document.getElementById('journey-btn');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
const resultsSection = document.getElementById('results-section');
const emptyState = document.getElementById('empty-state');
const departuresList = document.getElementById('departures-list');
const alertsContainer = document.getElementById('alerts-container');
const saveFavoriteBtn = document.getElementById('save-favorite');
const stopNameEl = document.getElementById('current-stop-name');
const fareValueEl = document.getElementById('fare-value');
const insightTextEl = document.getElementById('insight-text');

// Initialize
function init() {
    renderFavorites();
    fetchWeather();
    setupEventListeners();
}

function setupEventListeners() {
    searchBtn.addEventListener('click', () => handleSearch(searchInput.value));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch(searchInput.value);
    });

    journeyBtn.addEventListener('click', handleJourneySearch);

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            currentTab = tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            if (tab === 'stop') {
                searchBarStop.classList.remove('hidden');
                searchBarJourney.classList.add('hidden');
            } else {
                searchBarStop.classList.add('hidden');
                searchBarJourney.classList.remove('hidden');
            }
        });
    });

    saveFavoriteBtn.addEventListener('click', toggleFavorite);

    // Config Modal
    document.getElementById('open-config').addEventListener('click', () => {
        document.getElementById('config-modal').classList.remove('hidden');
        document.getElementById('api-key-input').value = API_CONFIG.apiKey;
    });

    document.getElementById('close-config').addEventListener('click', () => {
        document.getElementById('config-modal').classList.add('hidden');
    });

    document.getElementById('save-config').addEventListener('click', () => {
        const newKey = document.getElementById('api-key-input').value;
        localStorage.setItem('transport_api_key', newKey);
        location.reload();
    });
}

// --- API Functions ---

async function handleSearch(query) {
    if (!query) return;
    showLoader(searchBtn);

    if (API_CONFIG.demo_mode) {
        setTimeout(() => {
            const mockStop = { id: '200060', name: query.includes('Central') ? 'Central Station' : query };
            displayStop(mockStop);
        }, 500);
    } else {
        const stop = await fetchStop(query);
        if (stop) displayStop(stop);
        else {
            alert('No stops found.');
            hideLoader(searchBtn, 'Search');
        }
    }
}

async function fetchStop(name) {
    try {
        const response = await fetch(`${API_CONFIG.tfnsw_base_url}/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf=${encodeURIComponent(name)}&coordOutputFormat=EPSG%3A4326`, {
            headers: { 'Authorization': `apikey ${API_CONFIG.apiKey}` }
        });
        const data = await response.json();
        return data.locations?.[0] ? { id: data.locations[0].id, name: data.locations[0].name } : null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function handleJourneySearch() {
    const origin = originInput.value;
    const dest = destInput.value;
    if (!origin || !dest) return;

    showLoader(journeyBtn);

    if (API_CONFIG.demo_mode) {
        setTimeout(() => {
            renderJourneyResults(getMockJourneys(origin, dest));
            hideLoader(journeyBtn, 'Go');
        }, 800);
    } else {
        try {
            const originStop = await fetchStop(origin);
            const destStop = await fetchStop(dest);
            if (!originStop || !destStop) throw new Error('Could not find stops');

            const response = await fetch(`${API_CONFIG.tfnsw_base_url}/trip?outputFormat=rapidJSON&type_origin=any&name_origin=${originStop.id}&type_destination=any&name_destination=${destStop.id}&itdTripDateTimeDepArr=dep&calcNumberOfTrips=3`, {
                headers: { 'Authorization': `apikey ${API_CONFIG.apiKey}` }
            });
            const data = await response.json();
            renderJourneyResults((data.trips || []).map(t => formatTrip(t)));
        } catch (err) {
            console.error(err);
            alert('Journey search failed. For GTFS-Realtime direct feeds, use configured endpoints.');
        } finally {
            hideLoader(journeyBtn, 'Go');
        }
    }
}

async function fetchDepartures(stopId) {
    if (API_CONFIG.demo_mode) {
        return [
            { id: '1', route: 'T1', destination: 'Berowra via Gordon', time: new Date(Date.now() + 1000 * 60 * 4), scheduled: '14:15' },
            { id: '2', route: 'T2', destination: 'Parramatta', time: new Date(Date.now() + 1000 * 60 * 12), scheduled: '14:23' },
            { id: '3', route: 'T3', destination: 'Liverpool', time: new Date(Date.now() + 1000 * 60 * 18), scheduled: '14:29' }
        ];
    }

    try {
        const response = await fetch(`${API_CONFIG.tfnsw_base_url}/departure_mon?outputFormat=rapidJSON&type_dm=stop&name_dm=${stopId}&coordOutputFormat=EPSG%3A4326&mode=dep`, {
            headers: { 'Authorization': `apikey ${API_CONFIG.apiKey}` }
        });
        const data = await response.json();
        return (data.stopEvents || []).slice(0, 3).map(event => ({
            id: event.tripId,
            route: event.transportation.disassembledName,
            destination: event.transportation.destination.name,
            time: new Date(event.departureTimeEstimated || event.departureTimePlanned),
            scheduled: new Date(event.departureTimePlanned).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
    } catch (err) {
        console.warn('Departure fetch failed.');
        return [];
    }
}

async function fetchWeather() {
    try {
        const response = await fetch(`${API_CONFIG.weather_base_url}?latitude=-33.8688&longitude=151.2093&current_weather=true`);
        const data = await response.json();
        const weather = data.current_weather;
        document.querySelector('.temp').textContent = `${Math.round(weather.temperature)}°C`;
        document.querySelector('.condition').textContent = getWeatherDescription(weather.weathercode);
    } catch (err) {
        document.querySelector('.condition').textContent = 'Sunny';
    }
}

// --- UI Rendering ---

async function displayStop(stop) {
    currentStop = stop;
    stopNameEl.textContent = stop.name;
    resultsSection.classList.remove('hidden');
    emptyState.classList.add('hidden');
    saveFavoriteBtn.classList.remove('hidden');

    const isFav = favorites.some(f => f.id === stop.id);
    saveFavoriteBtn.classList.toggle('active', isFav);

    const departures = await fetchDepartures(stop.id);
    renderDepartures(departures);
    renderFare(departures[0]);
    renderInsights(departures);
    hideLoader(searchBtn, 'Search');
}

function renderDepartures(departures) {
    if (departures.length === 0) {
        departuresList.innerHTML = '<p style="text-align:center;color:var(--text-secondary)">No departures found.</p>';
        return;
    }
    departuresList.innerHTML = departures.map(dep => {
        const diffMs = dep.time - new Date();
        const diffMins = Math.max(0, Math.floor(diffMs / 60000));
        return `
            <div class="departure-item">
                <div class="route-info">
                    <span class="route-badge">${dep.route}</span>
                    <span class="destination">${dep.destination}</span>
                </div>
                <div class="time-info">
                    <span class="countdown">${diffMins}m</span>
                    <span class="scheduled-time">${dep.scheduled}</span>
                </div>
            </div>
        `;
    }).join('');
}

function renderJourneyResults(trips) {
    resultsSection.classList.remove('hidden');
    emptyState.classList.add('hidden');
    stopNameEl.textContent = `${originInput.value} ➜ ${destInput.value}`;
    saveFavoriteBtn.classList.add('hidden');

    departuresList.innerHTML = trips.map(trip => `
        <div class="departure-item journey-card" style="flex-direction: column; align-items: flex-start; gap: 0.5rem">
            <div style="display: flex; justify-content: space-between; width: 100%">
                <span class="countdown">${trip.duration} mins</span>
                <span class="scheduled-time">${trip.startTime} - ${trip.endTime}</span>
            </div>
            <div class="legs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items:center">
                ${trip.legs.map((leg, i) => `
                    <span class="route-badge" style="background:${leg.name === 'Walk' ? '#64748b' : ''}">${leg.name}</span>
                    ${i < trip.legs.length - 1 ? '<span style="color:var(--text-secondary);font-size:0.8rem">➜</span>' : ''}
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('fare-estimate').classList.add('hidden');
    document.getElementById('local-insight').classList.add('hidden');
}

function getMockJourneys(from, to) {
    return [
        { duration: 12, startTime: '14:45', endTime: '14:57', legs: [{ name: 'T1' }, { name: 'Walk' }] },
        { duration: 15, startTime: '15:02', endTime: '15:17', legs: [{ name: 'T4' }] },
        { duration: 22, startTime: '15:10', endTime: '15:32', legs: [{ name: 'Bus 343' }, { name: 'Walk' }] }
    ];
}

function formatTrip(trip) {
    const start = new Date(trip.legs[0].origin.departureTimeEstimated || trip.legs[0].origin.departureTimePlanned);
    const end = new Date(trip.legs[trip.legs.length - 1].destination.arrivalTimeEstimated || trip.legs[trip.legs.length - 1].destination.arrivalTimePlanned);
    return {
        duration: Math.round((end - start) / 60000),
        startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        legs: trip.legs.map(l => ({ name: l.transportation.disassembledName || l.transportation.name || 'Walk' }))
    };
}

function renderFare(nextDep) {
    if (!nextDep) return;
    const isPeak = isPeakTime();
    fareValueEl.textContent = FARE_TABLE.train[isPeak ? 'peak' : 'off-peak'];
    document.getElementById('fare-estimate').classList.remove('hidden');
}

function renderInsights(departures) {
    if (departures.length < 2) return;
    const diffMs = departures[1].time - departures[0].time;
    const diffMins = Math.floor(diffMs / 60000);
    insightTextEl.textContent = `If you miss the next service, the following one is in ${diffMins} minutes.`;
    document.getElementById('local-insight').classList.remove('hidden');
}

function renderFavorites() {
    if (favorites.length === 0) {
        favoritesSection.classList.add('hidden');
        return;
    }
    favoritesSection.classList.remove('hidden');
    favoritesList.innerHTML = favorites.map(fav => `
        <div class="departure-item" onclick="handleSearch('${fav.name}')" style="cursor:pointer">
            <span class="destination">${fav.name}</span>
            <span class="icon">➜</span>
        </div>
    `).join('');
}

function toggleFavorite() {
    if (!currentStop) return;
    const index = favorites.findIndex(f => f.id === currentStop.id);
    if (index > -1) {
        favorites.splice(index, 1);
        saveFavoriteBtn.classList.remove('active');
    } else {
        favorites.push(currentStop);
        saveFavoriteBtn.classList.add('active');
    }
    localStorage.setItem('transport_favorites', JSON.stringify(favorites));
    renderFavorites();
}

// --- Utilities ---

function isPeakTime() {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    if (day === 0 || day === 6) return false; // Weekend
    return (hour >= 7 && hour <= 9) || (hour >= 16 && hour <= 18.5);
}

function getWeatherDescription(code) {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly Cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 67) return 'Rainy';
    if (code <= 77) return 'Snowy';
    if (code <= 82) return 'Showers';
    return 'Stormy';
}

function showLoader(btn) {
    btn.disabled = true;
    btn.dataset.oldText = btn.textContent;
    btn.textContent = '...';
}

function hideLoader(btn, text) {
    btn.disabled = false;
    btn.textContent = text || btn.dataset.oldText || 'Go';
}

// Start the App
init();
