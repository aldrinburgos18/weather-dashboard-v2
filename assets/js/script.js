var apiKey = "a1d8b8f684383df9eff3ae909b0d743e";
var geocodingUrl = "http://api.openweathermap.org/geo/1.0/direct?q=";
var weatherUrl = "https://api.openweathermap.org/data/2.5/onecall?";

var searchInput = document.querySelector("#location");
var userForm = document.querySelector("#search-city");
var weatherContainer = document.querySelector("#weather-container");
var titleLocation = document.querySelector("#title-location");

var formSubmitHandler = function (event) {
  event.preventDefault();

  //get value from input element
  var location = searchInput.value.trim();
  getCoordinates(location);
};

var getCoordinates = function (loc) {
  fetch(geocodingUrl + loc + "&limit=1&appid=" + apiKey).then(function (
    response
  ) {
    response.json().then(function (coord) {
      //get data from first index
      var latitude = coord[0].lat;
      var longitude = coord[0].lon;
      var country = coord[0].country;
      var city = coord[0].name;
      getWeatherData(latitude, longitude, city, country);
    });
  });
};

var getWeatherData = function (lat, lon, city, country) {
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
      displayWeatherData(weather, city, country);
    });
  });
};

var displayWeatherData = function (weather, city, country) {
  //clear page
  weatherContainer.innerHTML = "";
  titleLocation.innerHTML = `${city}, ${country}`;
  for (var i = 1; i < weather.daily.length - 2; i++) {
    //convert wind deg to angle
    var windDirection = convertWind(weather.daily[i].wind_deg);

    // audit uv index
    var uvIndex = auditUVIndex(weather.daily[i].uvi);

    //create container
    var weatherDivContainer = document.createElement("div");
    weatherDivContainer.className = "col-md-2 card";
    weatherDivContainer.setAttribute("style", "width: 14rem;");

    //create cards
    var weatherDiv = document.createElement("div");
    weatherDiv.className = "card-body";

    //display icon
    var weatherIcon = document.createElement("img");
    weatherIcon.className = "d-block mx-auto mb-1";
    weatherIcon.setAttribute(
      "src",
      "http://openweathermap.org/img/wn/" +
        weather.daily[i].weather[0].icon +
        ".png"
    );
    weatherIcon.setAttribute("height", "100");

    //display weather title
    var weatherTitle = document.createElement("h5");
    weatherTitle.className = "card-title text-center";
    weatherTitle.innerText = weather.daily[i].weather[0].main;

    //display data
    var weatherData = document.createElement("h6");
    weatherData.className = "card-subtitle mb-2 text-muted";
    weatherData.innerHTML = `High: ${Math.floor(
      weather.daily[i].temp.max
    )}°F | Low: ${Math.floor(weather.daily[i].temp.min)}°F<br /> Humidity: ${
      weather.daily[i].humidity
    }<br />Wind: ${Math.floor(
      weather.daily[i].wind_speed
    )}MPH ${windDirection}`;

    //append to page
    weatherDiv.append(weatherIcon, weatherTitle, weatherData, uvIndex);
    weatherDivContainer.appendChild(weatherDiv);
    weatherContainer.appendChild(weatherDivContainer);
  }
};

var convertWind = function (wind) {
  var val = Math.floor(wind / 45 + 0.5);
  var arr = ["↑N", "↗NE", "→E", "↘SE", "↓S", "↙SW", "←W", "↖NW"];
  return arr[val % 8];
};

var auditUVIndex = function (uvIndex) {
  var uvIndexEl = document.createElement("h6");
  if (uvIndex <= 2) {
    uvIndexEl.className = "card-subtitle mb-2 text-muted bg-success";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  } else if (uvIndex <= 7) {
    uvIndexEl.className = "card-subtitle mb-2 text-muted bg-warning";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  } else {
    uvIndexEl.className = "card-subtitle mb-2 text-muted bg-danger";
    uvIndexEl.innerHTML = `UV Index: ${uvIndex}`;
  }
  return uvIndexEl;
};

userForm.addEventListener("submit", formSubmitHandler);
