import React, { useState, useEffect } from "react";
import axios from "axios";
import apiKeys from "./apiKeys";
import ReactAnimatedWeather from "react-animated-weather";

function Forcast({ weatherData, icon, weather }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [searchWeather, setSearchWeather] = useState(null); // Holds weather data from search functionality

  // Map OpenWeatherMap icons to react-animated-weather icons
  const getReactWeatherIcon = (owmIcon) => {
    const mapping = {
      "01d": "CLEAR",
      "01n": "CLEAR",
      "02d": "CLOUDY",
      "02n": "CLOUDY",
      "03d": "CLOUDY",
      "03n": "CLOUDY",
      "04d": "CLOUDY",
      "04n": "CLOUDY",
      "09d": "RAIN",
      "09n": "RAIN",
      "10d": "RAIN",
      "10n": "RAIN",
      "11d": "RAIN",
      "11n": "RAIN",
      "13d": "SNOW",
      "13n": "SNOW",
      "50d": "FOG",
      "50n": "FOG",
    };

    return mapping[owmIcon] || "CLEAR_DAY"; // Default to CLEAR_DAY if no match
  };

  const search = (city) => {
    axios
      .get(
        `${apiKeys.base}weather?q=${
          city || query
        }&units=metric&APPID=${apiKeys.key}`
      )
      .then((response) => {
        setSearchWeather(response.data);
        setQuery("");
        setError("");
        // Save city and country to localStorage
        const cityData = {
          city: response.data.name,
          country: response.data.sys.country,
        };
        localStorage.setItem("selectedCity", JSON.stringify(cityData));
        window.dispatchEvent(new CustomEvent("cityChanged", { detail: cityData }));
      })
      .catch((err) => {
        console.error(err);
        setSearchWeather(null);
        setError({ message: "City not found", query: city || query });
      });
  };

  useEffect(() => {
    if (!weatherData) {
      // Default city search (if no props provided)
      search("Delhi");
    }
  }, [weatherData]);

  const defaults = {
    color: "white",
    size: 112,
    animate: true,
  };
  const handleKeyPress = (e) => {
    // Trigger search when Enter is pressed
    if (e.key === 'Enter') {
      search(query);
    }
  };

  const displayWeather = searchWeather || weatherData; // Use searched weather data if available, otherwise use props

  return (
    <div className="forecast">
      <div className="forecast-icon">
        {displayWeather && displayWeather.weather[0] && (
          <ReactAnimatedWeather
            icon={getReactWeatherIcon(displayWeather.weather[0].icon)}
            color={defaults.color}
            size={defaults.size}
            animate={defaults.animate}
          />
        )}
      </div>
      <div className="today-weather">
        <h3>{weather || (displayWeather && displayWeather.weather[0].main)}</h3>
        <div className="search-box">
          <input
            type="text"
            className="search-bar"
            placeholder="Search any city"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          <div className="img-box">
            <img
              src="https://images.avishkaar.cc/workflow/newhp/search-white.png"
              alt="search"
              onKeyDown={handleKeyPress}
              onClick={() => search(query)}
            />
          </div>
        </div>
        <ul>
          {displayWeather ? (
            <div>
              <li className="cityHead">
                <p>
                  {displayWeather.name}, {displayWeather.sys.country}
                </p>
                <img
                  className="temp"
                  src={`https://openweathermap.org/img/w/${displayWeather.weather[0].icon}.png`}
                  alt="weather-icon"
                />
              </li>
              <li>
                Temperature{" "}
                <span className="temp">
                  {Math.round(displayWeather.main.temp)}°C
                </span>
              </li>
              <li>
                Humidity{" "}
                <span className="temp">{Math.round(displayWeather.main.humidity)}%</span>
              </li>
              <li>
                Visibility{" "}
                <span className="temp">
                  {Math.round(displayWeather.visibility / 1000)} km
                </span>
              </li>
              <li>
                Wind Speed{" "}
                <span className="temp">{Math.round(displayWeather.wind.speed)} km/h</span>
              </li>
            </div>
          ) : (
            <li>
              {error.query} - {error.message}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Forcast;
