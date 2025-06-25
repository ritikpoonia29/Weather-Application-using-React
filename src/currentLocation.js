import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    weatherData: null, // Storing weather data here
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY",
    sunrise: undefined,
    sunset: undefined,
    errorMsg: undefined,
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch((err) => {
          this.getWeather(28.67, 77.22);
          alert(
            "You have disabled location service. Allow 'This APP' to access your location. Your current location will be used for calculating Real time weather."
          );
        });

        // Read city details from localStorage
    const selectedCity = JSON.parse(localStorage.getItem("selectedCity"));
    if (selectedCity) {
      this.setState({
        city: selectedCity.city,
        country: selectedCity.country,
      });
    }

    // Add event listener for custom city change event
    window.addEventListener('cityChanged', this.handleStorageChange);
  
    }

    this.timerID = setInterval(
      () => this.getWeather(this.state.lat, this.state.lon),
      600000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
      // Remove the event listener
      window.removeEventListener("storage", this.handleStorageChange);
  }

  getPosition = (options) => {
    return new Promise(function (resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  getWeather = async (lat, lon) => {
    try {
      const weatherResponse = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const weatherData = await weatherResponse.json();
      console.log("Weather Data:", weatherData);

      this.setState({
        lat: lat,
        lon: lon,
        weatherData, // Save entire data here for reuse
        city: weatherData.name,
        temperatureC: Math.round(weatherData.main.temp),
        temperatureF: Math.round(weatherData.main.temp * 1.8 + 32),
        humidity: weatherData.main.humidity,
        main: weatherData.weather[0].main,
        country: weatherData.sys.country,
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
  };

  handleStorageChange = async () => {
    const selectedCity = JSON.parse(localStorage.getItem("selectedCity"));
    if (selectedCity) {
      const { city } = selectedCity;
      try {
        // Fetch new weather data for the updated city
        const weatherResponse = await fetch(
          `${apiKeys.base}weather?q=${city}&units=metric&APPID=${apiKeys.key}`
        );
        const weatherData = await weatherResponse.json();
  
        // Update the state with new weather data
        this.setState({
          city: weatherData.name,
          country: weatherData.sys.country,
          weatherData,
          temperatureC: Math.round(weatherData.main.temp),
          temperatureF: Math.round(weatherData.main.temp * 1.8 + 32),
          humidity: weatherData.main.humidity,
          main: weatherData.weather[0].main,
        });
      } catch (error) {
        console.error("Error updating weather after storage change:", error);
      }
    }
  };


  render() {
    if (this.state.weatherData) {
      return (
        <React.Fragment>
          
          <div className="city">
            <div className="title">
              <h2>{this.state.city}</h2>
              <h3>{this.state.country}</h3>
            </div>
            <div className="mb-icon">
              <ReactAnimatedWeather
                icon={this.state.icon}
                color={defaults.color}
                size={defaults.size}
                animate={defaults.animate}
              />
              <p>{this.state.main}</p>
            </div>
            <div className="date-time">
              <div className="dmy">
                <div id="txt"></div>
                <div className="current-time">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
                <div className="current-date">{dateBuilder(new Date())}</div>
              </div>
              <div className="temperature">
                <p>
                  {this.state.temperatureC}°<span>C</span>
                </p>
              </div>
            </div>
          </div>
          {/* Passing weatherData as a prop to Forecast */}
          <Forcast weatherData={this.state.weatherData} />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          <img src={loader} style={{ width: "50%", WebkitUserDrag: "none" }} />
          <h3 style={{ color: "white", fontSize: "22px", fontWeight: "600" }}>
            Detecting your location
          </h3>
          <h3 style={{ color: "white", marginTop: "10px" }}>
            Your current location will be displayed on the App <br></br> & used
            for calculating Real time weather.
          </h3>
        </React.Fragment>
      );
    }
  }
}

export default Weather;
