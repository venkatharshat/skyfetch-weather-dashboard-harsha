
const API_KEY = "850d60f32caba2a66f669adacfe77a80
";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDisplay = document.getElementById("weather-display");

/* =======================
   GET WEATHER FUNCTION
======================= */
async function getWeather(city) {

    showLoading();
    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        displayWeather(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            showError("City not found. Please check spelling.");
        } else {
            showError("Something went wrong. Try again later.");
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "🔍 Search";
        cityInput.focus();
    }
}

/* =======================
   DISPLAY WEATHER
======================= */
function displayWeather(data) {
    const weatherHTML = `
        <div class="weather-info">
            <h2 class="city-name">${data.name}</h2>
            <img 
                src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" 
                alt="${data.weather[0].description}"
                class="weather-icon"
            >
            <div class="temperature">${Math.round(data.main.temp)}°C</div>
            <p class="description">${data.weather[0].description}</p>
        </div>
    `;

    weatherDisplay.innerHTML = weatherHTML;
}

/* =======================
   SHOW LOADING
======================= */
function showLoading() {
    weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
}

/* =======================
   SHOW ERROR
======================= */
function showError(message) {
    weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Error</h3>
            <p>${message}</p>
        </div>
    `;
}

/* =======================
   EVENT LISTENERS
======================= */
searchBtn.addEventListener("click", function () {

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
});

cityInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});