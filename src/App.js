import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { debounce, throttle } from "./utils";

function App() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const searchLocation = async (event) => {
    if (event.key === "Enter") {
      await fetchLocationData(location);
      setLocation("");
    }
  };

  const fetchLocationData = async (location) => {
    if (!location) return;
    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=895284fb2d2c50a520ea537456963d9c`;
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching location data:", error);
      throw error;
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  };

  const showPosition = (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    getCityName(lat, lon);
  };

  const showError = (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        setError("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        setError("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        setError("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        setError("An unknown error occurred.");
        break;
      default:
        break;
    }
  };

  const getCityName = (lat, lon) => {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setLocation(data.city || "location not found");
        if (data.city) fetchLocationData(data.city);
      })
      .catch((error) => {
        console.log(error);
        setError("Error fetching location name.");
      });
  };

  const [suggestions, setSuggestions] = useState([]);

  const fetchCities = useCallback(
    throttle(
      debounce(async (query) => {
        if (query.length < 3) return; // Ensure query is long enough

        const url = `https://nominatim.openstreetmap.org/search?city=${query}&format=json&limit=10`;
        try {
          const response = await axios.get(url);
          const cities = response.data.map((city) => ({
            name: `${city.display_name}`,
          }));
          setSuggestions(cities);
        } catch (error) {
          console.error("Error fetching city data:", error);
        }
      }, 300),
      1000
    ),
    []
  );

  useEffect(() => {
    fetchCities(location);
  }, [location, fetchCities]);

  return (
    <div className="app">
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter Location"
          type="text"
        />
        <ul>
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion.name}</li>
          ))}
        </ul>
      </div>
      <div className="container">
        <div className="top">
          <div className="location">
            <p>{data.name}</p>
          </div>
          <div className="temp">
            {data.main ? <h1>{data.main.temp.toFixed()}°C</h1> : null}
          </div>
          <div className="description">
            {data.weather ? <p>{data.weather[0].main}</p> : null}
          </div>
        </div>

        {data.name !== undefined && (
          <div className="bottom">
            <div className="feels">
              {data.main ? (
                <p className="bold">{data.main.feels_like.toFixed()}°F</p>
              ) : null}
              <p>Feels Like</p>
            </div>
            <div className="humidity">
              {data.main ? <p className="bold">{data.main.humidity}%</p> : null}
              <p>Humidity</p>
            </div>
            <div className="wind">
              {data.wind ? (
                <p className="bold">{data.wind.speed.toFixed()} km/h</p>
              ) : null}
              <p>Wind Speed</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
