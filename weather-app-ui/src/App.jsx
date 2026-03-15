
import React, { useState } from 'react';
import axios from 'axios';
import CityListObj from './assets/location.json';

import response from './assets/response.json';

const API_BASE_URL = 'http://localhost:5063/weatherforecast'; // Update to your .NET port if different

function App() {
  const [searchInput, setSearchInput] = useState('');
  // const [cities] = useState(['Jaipur', 'Lucknow', 'Bangalore', 'Chennai', 'Hyderabad']);
  const [cities, setCities] = useState([]);
  const [locationsData, setLocationsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const data = response.data; // Using local JSON response for testing
  const [daysData, setDaysData] = useState([]);
  let arr = [];
  const { CityList } = CityListObj;

  // Helper: Celsius to Fahrenheit
  const toFahrenheit = (celsius) => ((celsius * 9) / 5 + 32).toFixed(1);

  const fetchWeather = async (e) => {
    setDaysData([]);// Clear previous days data

    e.preventDefault();
    if (!searchInput) return;

    setLoading(true);
    setError('');
    try {
      // const response = await axios.get(`${API_BASE_URL}/${searchInput}`);
      // console.log("API Response:", response?.data); // Debug log

      const response2 = await axios.post(`${API_BASE_URL}`, cities);

      // const response2 = response; // Using local JSON response for testing

      console.log("2 API Response:2 ", response2.data); // Debug log

      daysData.push(...response2?.data?.dates || []);
      setDaysData([...daysData]);

      console.log("Days Data:", daysData);
      arr = response2?.data?.WeatherInfo || [];

      locationsData.push(...deltaCalc(arr));
      setLocationsData([...locationsData]);

      console.log("Locations Data after push:", locationsData); // Debug log

    } catch (err) {
      setError('Failed to fetch data. Please check the location name and your API key.');
      console.error(err);
    }
    setLoading(false);
  };

  function deltaCalc(weatherArr) {
    const deltas = [];
    let city1 = weatherArr?.shift();
    deltas.push(city1);

    for (const city of weatherArr) {
      let delta = {};

      for (let key in city) {

        if (key === 'city') {
          delta = { city: `Delta: ${city1.city} ~ ${city.city}` };
        }
        else {
          delta[key] = {
            AvgTemp: Math.abs(city1[key]?.AvgTemp - city[key]?.AvgTemp).toFixed(2),
            MinTemp: Math.abs(city1[key]?.MinTemp - city[key]?.MinTemp).toFixed(2),
            MaxTemp: Math.abs(city1[key]?.MaxTemp - city[key]?.MaxTemp).toFixed(2)
          };
        }

      }
      deltas.push(city);
      deltas.push(delta);

    }
    return deltas;
  }

  const averageCalc = (weather) => {

    let MinTemp = ((weather.day1?.MinTemp + weather.day2?.MinTemp + weather.day3?.MinTemp + weather.day4?.MinTemp + weather.day5?.MinTemp + weather.day6?.MinTemp + (weather.day7?.MinTemp || 0)) / daysData?.length).toFixed(2);
    let MaxTemp = ((weather.day1?.MaxTemp + weather.day2?.MaxTemp + weather.day3?.MaxTemp + weather.day4?.MaxTemp + weather.day5?.MaxTemp + weather.day6?.MaxTemp + (weather.day7?.MaxTemp || 0)) / daysData?.length).toFixed(2);

    return { MinTemp, MaxTemp };
  }

  const clearData = () => { setLocationsData([]); setCities([]); setDaysData([]); setSearchInput(''); };

  return (
    <div className="container">
      <h3>Weather Forecast Info App</h3>

      <form onSubmit={fetchWeather}>

        <select
          multiple
          value={cities}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setCities(selected);
            if (selected.length > 0) {
              setSearchInput(selected[selected.length - 1]);
            } else {
              setSearchInput('');
            }
          }}
          style={{ minWidth: 200, margin: '0 10px' }}
        >
          {CityList.map((city, idx) => (
            <option key={idx} value={city}>{city}</option>
          ))}
        </select>

        <button type="submit" disabled={loading}>Search</button>
        <button type="button" onClick={clearData} style={{ marginLeft: '10px' }}>Clear All</button>
      </form>

      {/* {error && <p style={{ color: 'red' }}>{error}</p>} */}
      <h3 style={{ marginTop: '20px' }}>Added Locations: {cities?.length}</h3>
      {cities?.map((city, i) => (
        <span key={i} style={{ padding: '0 10px 0 0' }}>{city},</span>
      ))}

      <table>
        <thead>
          <tr>
            <th key={'city'}>City</th>
            {daysData && daysData.map((day, i) => (
              <th key={`day-${i}`}>{day}</th>
            ))}
            <th key={'highLw'}>High/Low (C / F)</th>
          </tr>
        </thead>
        <tbody>

          {locationsData?.map((weather, i) => (
            <tr key={i}>
              <td>{weather?.city}</td>
              <td>{weather?.day1?.AvgTemp}°C <br /> {toFahrenheit(weather?.day1?.AvgTemp)}°F</td>
              <td>{weather?.day2?.AvgTemp}°C <br /> {toFahrenheit(weather?.day2?.AvgTemp)}°F</td>
              <td>{weather?.day3?.AvgTemp}°C <br /> {toFahrenheit(weather?.day3?.AvgTemp)}°F</td>
              <td>{weather?.day4?.AvgTemp}°C <br /> {toFahrenheit(weather?.day4?.AvgTemp)}°F</td>
              <td>{weather?.day5?.AvgTemp}°C <br /> {toFahrenheit(weather?.day5?.AvgTemp)}°F</td>
              <td>{weather?.day6?.AvgTemp}°C <br /> {toFahrenheit(weather?.day6?.AvgTemp)}°F</td>
              {weather?.day7 && (
                <td>{weather?.day7?.AvgTemp}°C <br /> {toFahrenheit(weather?.day7?.AvgTemp)}°F</td>
              )}

              <td> {averageCalc(weather)?.MaxTemp}°C Or {toFahrenheit(averageCalc(weather)?.MaxTemp || 0)}°F / {averageCalc(weather)?.MinTemp}°C Or{toFahrenheit(averageCalc(weather)?.MinTemp || 0)}°F </td>

            </tr>
          ))}

        </tbody>
      </table>



    </div>
  );
}

export default App;