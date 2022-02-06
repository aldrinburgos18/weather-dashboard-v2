var apiKey = "a1d8b8f684383df9eff3ae909b0d743e";
var geocodingUrl = "http://api.openweathermap.org/geo/1.0/direct?q=";
var weatherUrl = "https://api.openweathermap.org/data/2.5/onecall?";
var imperialUnits;

var convertUnitEl = document.querySelector("#units");
var searchInput = document.querySelector("#location");
var userForm = document.querySelector("#search-city");
var weatherContainer = document.querySelector("#weather-container");
var title = document.querySelector("#title");
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
      displayWeatherData(weather, city, country, state);
    });
  });
};

var displayWeatherData = function (weather, city, country, state) {
  //clear page
  weatherContainer.textContent = "";
  title.classList.remove("invisible");
  if (state) {
    titleLocation.innerHTML = `${city}, ${state}`;
  } else {
    titleLocation.innerHTML = `${city}, ${country}`;
  }
  for (var i = 1; i < weather.daily.length - 2; i++) {
    //convert unix date to human readable date
    var date = convertDate(weather.daily[i].dt).split(",");

    // audit uv index
    var uvIndex = auditUVIndex(weather.daily[i].uvi);

    //create container
    var weatherDivContainer = document.createElement("div");
    weatherDivContainer.className = "col-md-2 card";
    weatherDivContainer.setAttribute("style", "width: 14rem;");

    //create card
    var weatherDiv = document.createElement("div");
    weatherDiv.className = "card-body";

    //display day
    var day = document.createElement("h6");
    day.className = "card-subtitle mb-2 text-info";
    day.textContent = date;

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

    var tempLow = Math.floor(weather.daily[i].temp.min);
    var tempHigh = Math.floor(weather.daily[i].temp.max);
    var humidity = weather.daily[i].humidity;
    var windSpeed = Math.floor(Math.floor(weather.daily[i].wind_speed));
    //convert wind deg to angle
    var windDirection = convertWind(weather.daily[i].wind_deg);
    if (convertUnitEl.checked) {
      var data = displayMetric(
        tempLow,
        tempHigh,
        humidity,
        windSpeed,
        windDirection
      );
    } else {
      var data = displayImperial(
        tempLow,
        tempHigh,
        humidity,
        windSpeed,
        windDirection
      );
    }

    //display data
    //append to page
    weatherDiv.append(day, weatherIcon, data, weatherTitle, uvIndex);
    weatherDivContainer.appendChild(weatherDiv);
    weatherContainer.appendChild(weatherDivContainer);
  }
};

var displayImperial = function (low, high, humidity, windSpeed, windDirection) {
  var weatherData = document.createElement("h6");
  weatherData.className = "card-subtitle mb-2 text-muted";
  weatherData.innerHTML = `Low: ${low}°F | High: ${high}°F<br /> Humidity: ${humidity}%<br />Wind: ${windSpeed}MPH ${windDirection}`;
  console.log(weatherData);
  return weatherData;
};

var displayMetric = function (low, high, humidity, windSpeed, windDirection) {
  var metricLow = Math.floor((low - 32) * 0.5556);
  var metricHigh = Math.floor((high - 32) * 0.5556);
  var metricSpeed = Math.floor(windSpeed * 1.609344);
  var weatherData = document.createElement("h6");
  weatherData.className = "card-subtitle mb-2 text-muted";
  weatherData.innerHTML = `Low: ${metricLow}°C | High: ${metricHigh}°C<br /> Humidity: ${humidity}%<br />Wind: ${metricSpeed}KPH ${windDirection}`;
  return weatherData;
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

var convertUnit = function () {
  var card = weatherContainer.querySelector(".card");
  imperialUnits = weatherContainer.innerHTML;
  //metric
  if (convertUnitEl.checked) {
    //check if page has content
    if (card) {
      console.log("container has content");
      weatherContainer.innerHTML = "";
      weatherContainer.innerHTML = "display celsius";
    } else {
      //NOOP
    }
  }
  //imperial
  else {
    if (card) {
      weatherContainer.innerHTML = "";
      weatherContainer.innerHTML = `${imperialUnits}`;
    } else {
      //NOOP
    }
  }
};

convertUnitEl.addEventListener("click", convertUnit);
userForm.addEventListener("submit", formSubmitHandler);
