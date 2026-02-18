
function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-display");

    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");
    this.clearBtn = document.getElementById("clear-history-btn");

    this.recentSearches = [];
    this.maxRecentSearches = 5;

    this.init();
}

WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener("click", this.handleSearch.bind(this));
    this.cityInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") this.handleSearch();
    }.bind(this));

    this.clearBtn.addEventListener("click", this.clearHistory.bind(this));

    this.loadRecentSearches();
    this.loadLastCity();
};

WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();
    if (!city) return;
    this.getWeather(city);
    this.cityInput.value = "";
};

WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

    } catch (error) {
        this.showError("City not found or API error.");
    }
};

WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

WeatherApp.prototype.displayWeather = function (data) {
    this.weatherDisplay.innerHTML = `
        <h2 class="city-name">${data.name}</h2>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="weather-icon">
        <div class="temperature">${Math.round(data.main.temp)}°C</div>
        <p class="description">${data.weather[0].description}</p>
    `;
};

WeatherApp.prototype.displayForecast = function (data) {
    const daily = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0,5);

    const forecastHTML = daily.map(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString("en-US",{ weekday:"short" });
        return `
            <div class="forecast-card">
                <h4>${dayName}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <p>${day.weather[0].description}</p>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">${forecastHTML}</div>
        </div>
    `;
};

WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `<div class="spinner"></div>`;
};

WeatherApp.prototype.showError = function (msg) {
    this.weatherDisplay.innerHTML = `<div class="error-message">${msg}</div>`;
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const name = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(name);
    if (index > -1) this.recentSearches.splice(index,1);

    this.recentSearches.unshift(name);
    if (this.recentSearches.length > this.maxRecentSearches)
        this.recentSearches.pop();

    localStorage.setItem("recentSearches", JSON.stringify(this.recentSearches));
    this.displayRecentSearches();
};

WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");
    if (saved) this.recentSearches = JSON.parse(saved);
    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = "none";
        return;
    }

    this.recentSearchesSection.style.display = "block";

    this.recentSearches.forEach(function(city){
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;
        btn.addEventListener("click", function(){
            this.getWeather(city);
        }.bind(this));
        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

WeatherApp.prototype.loadLastCity = function () {
    const last = localStorage.getItem("lastCity");
    if (last) this.getWeather(last);
};

WeatherApp.prototype.clearHistory = function () {
    this.recentSearches = [];
    localStorage.removeItem("recentSearches");
    this.displayRecentSearches();
};

const app = new WeatherApp("850d60f32caba2a66f669adacfe77a80");