import React, { useState } from "react";
import CurrentLocation from "./currentLocation";
import Forcast from "./forcast";
import "./App.css";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  return (
    <React.Fragment>
      <div className="container">
        <CurrentLocation />
      </div>
    </React.Fragment>
  );
}

export default App;
