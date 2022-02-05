var apiKey = "a1d8b8f684383df9eff3ae909b0d743e";
var userForm = document.querySelector("#search-city");
var locationSearch = document.querySelector("#location");

var formSubmitHandler = function (event) {
  event.preventDefault();

  //get value from input element
  var location = locationSearch.value.trim();

  console.log(location);
};

userForm.addEventListener("submit", formSubmitHandler);
