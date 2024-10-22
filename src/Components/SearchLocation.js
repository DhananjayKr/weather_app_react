import { useEffect, useState } from "react";
import axios from "axios";
import LocationFetch from "./LocationFetch";

function SearchLocation() {
  const [data, setData] = useState({});
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const userLocation = await LocationFetch();
        setQuery(userLocation ? userLocation : "");
        setLocation(userLocation ? userLocation : "");
        fetchWeather(userLocation);
      } catch (error) {
        console.error("Error fetching location:", error);
      }
    };
    fetchLocation();
  }, []);

  const fetchWeather = async (locationToFetch) => {
    setLoading(true);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${locationToFetch}&units=metric&appid=895284fb2d2c50a520ea537456963d9c`;

    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching location data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (event) => {
    if (event.key === "Enter") {
      fetchWeather(location);
      setLocation("");
    } else {
      setQuery(event.target.value);
      fetchSuggestions(event.target.value);
    }
  };

  /* Fetching Suggestions */
  const fetchSuggestions = async (input) => {
    if (input.length > 2) {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?city=${input}&format=json&limit=10`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching Suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestions) => {
    const location = `${suggestions.display_name}`;
    setLocation(location);
    fetchWeather(location);
    setSuggestions([]);
  };

  return (
    <>
      <div className="search">
        <input
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          onKeyPress={searchLocation}
          placeholder="Enter Location"
          type="text"
        />
        <div className="suggestionlist">
          {suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map((suggestions) => (
                <li
                  key={suggestions.place_id}
                  onClick={() => handleSuggestionClick(suggestions)}
                >
                  {suggestions.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      )}

      {!loading && data.name && (
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

          {data.name && (
            <div className="bottom">
              <div className="feels">
                {data.main ? (
                  <p className="bold">{data.main.feels_like.toFixed()}°F</p>
                ) : null}
                <p>Feels Like</p>
              </div>
              <div className="humidity">
                {data.main ? (
                  <p className="bold">{data.main.humidity}%</p>
                ) : null}
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
      )}
    </>
  );
}

export default SearchLocation;
