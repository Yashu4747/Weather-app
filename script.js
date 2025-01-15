const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const weatherDetails = document.querySelector('.weather-details');
const hourlyForecast = document.querySelector('.hourly-forecast');

// Function to format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// Function to format time
function formatTime(timestamp) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        hour12: true
    }).format(new Date(timestamp));
}

// Function to get weather icon
function getWeatherIcon(weatherCode) {
    const weatherIcons = {
        0: 'sun',              // Clear sky
        1: 'cloud-sun',        // Mainly clear
        2: 'cloud-sun',        // Partly cloudy
        3: 'clouds',           // Overcast
        45: 'cloud-fog',       // Foggy
        48: 'cloud-fog',       // Depositing rime fog
        51: 'cloud-drizzle',   // Light drizzle
        53: 'cloud-drizzle',   // Moderate drizzle
        55: 'cloud-drizzle',   // Dense drizzle
        61: 'cloud-rain',      // Slight rain
        63: 'cloud-rain',      // Moderate rain
        65: 'cloud-rain',      // Heavy rain
        71: 'snow',            // Slight snow
        73: 'snow',            // Moderate snow
        75: 'snow',            // Heavy snow
        77: 'snow',            // Snow grains
        80: 'cloud-rain',      // Slight rain showers
        81: 'cloud-rain',      // Moderate rain showers
        82: 'cloud-rain',      // Violent rain showers
        85: 'snow',            // Slight snow showers
        86: 'snow',            // Heavy snow showers
        95: 'cloud-lightning', // Thunderstorm
    };
    return `bi-${weatherIcons[weatherCode] || 'cloud'}`;
}

// Function to get weather condition text
function getWeatherCondition(weatherCode) {
    const conditions = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        71: 'Slight snow',
        73: 'Moderate snow',
        75: 'Heavy snow',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
    };
    return conditions[weatherCode] || 'Unknown';
}

// Function to get weather data
async function getWeatherData(cityName) {
    // Get coordinates for the city
    const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`);
    const geoData = await geoResponse.json();

    if (geoData.results && geoData.results.length > 0) {
        const location = geoData.results[0];
        const { latitude, longitude, name, country } = location;

        // Get weather data
        const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature&hourly=temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m&timezone=auto`);
        const weatherData = await weatherResponse.json();

        // Get air quality data
        const aqiResponse = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=us_aqi&timezone=auto`);
        const aqiData = await aqiResponse.json();

        updateUI(weatherData, aqiData, name, country);
    }
}

// Function to update UI with weather data
function updateUI(weatherData, aqiData, city, country) {
    const current = weatherData.current;
    
    // Update current weather
    document.querySelector('.city').textContent = `${city}, ${country}`;
    document.querySelector('.date').textContent = formatDate(new Date());
    document.querySelector('.temperature').textContent = `${Math.round(current.temperature_2m)}°C`;
    document.querySelector('.weather-icon').className = `bi ${getWeatherIcon(current.weather_code)} weather-icon`;
    document.querySelector('.condition').textContent = getWeatherCondition(current.weather_code);
    document.querySelector('.feels-like').textContent = `${Math.round(current.apparent_temperature)}°C`;
    document.querySelector('.humidity').textContent = `${current.relative_humidity_2m}%`;
    document.querySelector('.wind-speed').textContent = `${current.wind_speed_10m} km/h`;
    document.querySelector('.aqi').textContent = aqiData.current?.us_aqi || 'N/A';

    // Update hourly forecast
    const hourlyContainer = document.querySelector('.hourly-container');
    hourlyContainer.innerHTML = '';

    // Show next 24 hours
    const hours = weatherData.hourly.time.slice(0, 24);
    hours.forEach((time, index) => {
        const temp = weatherData.hourly.temperature_2m[index];
        const weatherCode = weatherData.hourly.weather_code[index];
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'hourly-item';
        hourlyItem.innerHTML = `
            <div class="time">${formatTime(new Date(time))}</div>
            <i class="bi ${getWeatherIcon(weatherCode)} hourly-icon"></i>
            <div class="hourly-temp">${Math.round(temp)}°C</div>
        `;
        hourlyContainer.appendChild(hourlyItem);
    });

    weatherDetails.classList.remove('d-none');
    hourlyForecast.classList.remove('d-none');
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
});
