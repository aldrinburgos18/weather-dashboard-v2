var apiKey = "a1d8b8f684383df9eff3ae909b0d743e";
var geocodingUrl = "https://api.openweathermap.org/geo/1.0/direct?q=";
var weatherUrl = "https://api.openweathermap.org/data/2.5/onecall?";
var imperialUnits = [{ unit: "imperial" }];
var metricUnits = [{ unit: "metric" }];

var convertUnitEl = document.querySelector("#units");
var searchInputEl = document.querySelector("#location");
var userFormEl = document.querySelector("#search-city");
var weatherContainerEl = document.querySelector("#weather-container");
var titleEl = document.querySelector("#title");
var titleLocationEl = document.querySelector("#title-location");
var footerEl = document.querySelector("footer");

var getWeatherData = function (lat, lon, city, country, state) {
  fetch(
    weatherUrl +
      "&lat=" +
      lat +
      "&lon=" +
      lon +
      "&exclude=hourly,minutely&units=imperial&appid=" +
      apiKey
  ).then(function (response) {
    response.json().then(function (weather) {
      saveWeatherData(weather, city, country, state);
    });
  });
};

var saveWeatherData = function (weather, city, country, state) {
  //reset array every time function runs
  imperialUnits = [{ unit: "imperial" }];
  metricUnits = [{ unit: "metric" }];
  for (var i = 1; i < weather.daily.length - 2; i++) {
    var day = convertDate(weather.daily[i].dt);
    var data = {
      city: city,
      country: country,
      state: state,
      date: day,
      icon: weather.daily[i].weather[0].icon,
      desc: weather.daily[i].weather[0].main,
      humidity: weather.daily[i].humidity,
      windDir: convertWind(weather.daily[i].wind_deg),
      uv: weather.daily[i].uvi,
    };
    imperialUnits.push({
      tempLow: Math.floor(weather.daily[i].temp.min) + "°F",
      tempHigh: Math.floor(weather.daily[i].temp.max) + "°F",
      windSpeed: Math.floor(weather.daily[i].wind_speed) + "MPH",
      data,
    });
    metricUnits.push({
      tempLow: Math.floor((weather.daily[i].temp.min - 32) * 0.5556) + "°C",
      tempHigh: Math.floor((weather.daily[i].temp.max - 32) * 0.5556) + "°C",
      windSpeed: Math.floor(weather.daily[i].wind_speed * 1.609344) + "KPH",
      data,
    });
  }
  checkUnit();
};

var switchUnit = function () {
  var card = weatherContainerEl.querySelector(".card");
  //check if page has content
  if (card) {
    checkUnit();
  } else {
    //NOOP
  }
};

var checkUnit = function () {
  //if checked, display metric
  if (convertUnitEl.checked) {
    displayWeatherData(metricUnits);
  } else {
    displayWeatherData(imperialUnits);
  }
};

var displayWeatherData = function (weatherData) {
  titleLocationEl.textContent = "";
  titleEl.classList.remove("invisible");
  weatherContainerEl.textContent = "";
  if (weatherData[1].data.state) {
    titleLocationEl.textContent = `${weatherData[1].data.city}, ${weatherData[1].data.state}`;
  } else {
    titleLocationEl.textContent = `${weatherData[1].data.city}, ${weatherData[1].data.country}`;
  }

  for (var i = 1; i < weatherData.length; i++) {
    var cardContainer = document.createElement("div");
    cardContainer.className = "col-sm-12 col-md-2 card";
    cardContainer.setAttribute("style", "width: 14rem;");
    var weatherCard = document.createElement("div");
    weatherCard.className = "card-body";
    //display day
    var day = document.createElement("h6");
    day.className = "card-subtitle mb-2 card-text";
    day.textContent = weatherData[i].data.date;
    //display icon
    var weatherIcon = document.createElement("img");
    weatherIcon.className = "d-block mx-auto mb-1";
    weatherIcon.setAttribute(
      "src",
      `https://openweathermap.org/img/wn/${weatherData[i].data.icon}.png`
    );
    weatherIcon.setAttribute("height", "100");
    //display weather title
    var weatherTitle = document.createElement("h5");
    weatherTitle.className = "card-title text-center";
    weatherTitle.innerText = weatherData[i].data.desc;
    var data = document.createElement("h6");
    data.className = "card-subtitle mb-2 card-text";
    // audit uv index
    var uvIndex = auditUVIndex(weatherData[i].data.uv);
    data.innerHTML = `Low: ${weatherData[i].tempLow} | High: ${weatherData[i].tempHigh}<br />Humidity: ${weatherData[i].data.humidity}%<br />Wind: ${weatherData[i].windSpeed} ${weatherData[i].data.windDir}`;
    //append to page
    weatherCard.append(day, weatherIcon, data, uvIndex);
    cardContainer.appendChild(weatherCard);
    weatherContainerEl.appendChild(cardContainer);
  }
};

var convertDate = function (unixDate) {
  var milliseconds = unixDate * 1000;
  var dateObject = new Date(milliseconds);
  var humanDateFormat = dateObject.toLocaleString("en-US", {
    weekday: "long",
  });
  return humanDateFormat;
};

var convertWind = function (wind) {
  var val = Math.floor(wind / 45 + 0.5);
  var arr = ["↑N", "↗NE", "→E", "↘SE", "↓S", "↙SW", "←W", "↖NW"];
  return arr[val % 8];
};

var auditUVIndex = function (uvIndex) {
  var uvIndexEl = document.createElement("h6");
  if (uvIndex <= 3) {
    uvIndexEl.className = "card-subtitle mb-2 uv-low";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  } else if (uvIndex <= 7) {
    uvIndexEl.className = "card-subtitle mb-2 uv-med";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  } else {
    uvIndexEl.className = "card-subtitle mb-2 uv-high";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  }
  return uvIndexEl;
};

var formSubmitHandler = function (event) {
  event.preventDefault();

  //get value from input element
  var location = searchInputEl.value.trim();
  getCoordinates(location);
};

var getCoordinates = function (loc) {
  fetch(geocodingUrl + loc + "&limit=1&appid=" + apiKey).then(function (
    response
  ) {
    response.json().then(function (coord) {
      if (coord.length === 0) {
        alert("Please enter a valid city.");
      } else {
        //get data from first index
        var latitude = coord[0].lat;
        var longitude = coord[0].lon;
        var country = coord[0].country;
        if (coord[0].state) {
          var state = coord[0].state;
        }
        var city = coord[0].name;
        getWeatherData(latitude, longitude, city, country, state);
      }
    });
  });
};
convertUnitEl.addEventListener("click", switchUnit);
userFormEl.addEventListener("submit", formSubmitHandler);
