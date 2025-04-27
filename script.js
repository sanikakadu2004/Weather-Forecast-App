const apiKey = "9ec9963617b1877780c5a23a476b6075"; // Replace with your OpenWeatherMap API key

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Please enter a city name");

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      console.log('Fetched data:', data); // For debugging
      if (data.cod === 200) {
        showWeather(data);
        saveToHistory(city, data);

        // Simulate weather alert condition (in real case, this comes from API)
        let weatherAlertData = null;
        if (data.weather[0].main === "Clear") {
          weatherAlertData = {
            event: "Sunny Day Alert",
            description: "☀️ It's a beautiful sunny day! Don't forget your sunglasses!",
            severity: "low"
          };
        } else if (data.weather[0].main === "Rain") {
          weatherAlertData = {
            event: "Rainy Day Alert",
            description: "🌧️ Heavy rainfall expected today. Carry an umbrella!",
            severity: "moderate"
          };
        } else if (data.weather[0].main === "Thunderstorm") {
          weatherAlertData = {
            event: "Thunderstorm Alert",
            description: "⚡ Severe thunderstorms expected today. Stay indoors and stay safe!",
            severity: "high"
          };
        }

        // Show the alert banner if alert data is present
        if (weatherAlertData) {
          showWeatherAlert(weatherAlertData);
        }

      } else {
        alert("City not found!");
      }
    })
    .catch(err => alert("Error fetching weather!"));
}

// Show the alert banner if alert data is present
function showWeatherAlert(alert) {
  const alertBanner = document.getElementById("weather-alert");
  alertBanner.innerHTML = `<strong>⚠️ ${alert.event}:</strong> ${alert.description}`;
  
  // Show the alert
  alertBanner.classList.remove("hidden");
  alertBanner.classList.add("show");

  // Optional: Auto-hide after 10 seconds
  setTimeout(() => {
    alertBanner.classList.remove("show");
    alertBanner.classList.add("hidden");
  }, 10000);
}

function showWeather(data) {
  const resultDiv = document.getElementById("weatherResult");
  const tipDiv = document.getElementById("weatherTip");

  resultDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
    <p><strong>Weather:</strong> ${data.weather[0].description}</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
  `;

  // 💡 Generate weather tip
  let tip = "";

  if (data.weather[0].description.toLowerCase().includes("rain")) {
    tip = "Carry an umbrella ☔";
  } else if (data.main.temp < 15) {
    tip = "Bundle up! 🧥 It's cold outside.";
  } else if (data.main.temp > 35) {
    tip = "Stay cool & hydrated 🧊";
  } else if (data.main.temp >= 25) {
    tip = "Nice weather 😌 Enjoy your day!";
  }

  if (data.weather[0].main === "Clear") {
    tip += " Perfect day for a walk! 🚶‍♂️";
  }

  tipDiv.innerHTML = `<p><strong>Tip:</strong> ${tip}</p>`;

  // 🎨 Dynamic Background
  const weatherMain = data.weather[0].main.toLowerCase();
  document.body.className = ""; // Reset any previous class

  if (weatherMain.includes("clear")) {
    document.body.classList.add("sunny");
  } else if (weatherMain.includes("cloud")) {
    document.body.classList.add("cloudy");
  } else if (weatherMain.includes("rain")) {
    document.body.classList.add("rainy");
  } else if (weatherMain.includes("thunderstorm")) {
    document.body.classList.add("thunderstorm");
  } else if (weatherMain.includes("snow")) {
    document.body.classList.add("snow");
  } else {
    document.body.classList.add("default-bg");
  }
}

function saveToHistory(city, data) {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  let excelHistory = JSON.parse(localStorage.getItem("excelHistory")) || [];

  // Create an entry object to save
  const weatherEntry = {
    city: data.name,
    country: data.sys.country,
    temperature: data.main.temp,
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    time: new Date().toLocaleString()
  };

  // ✅ 1. Push to excel-only history (always add)
  excelHistory.push(weatherEntry);
  localStorage.setItem("excelHistory", JSON.stringify(excelHistory));

  // ✅ 2. Check if city already exists in display history
  const cityExists = history.some(entry => entry.city.toLowerCase() === data.name.toLowerCase());

  if (!cityExists) {
    history.push(weatherEntry);
    localStorage.setItem("weatherHistory", JSON.stringify(history));
    updateHistoryList();
  }
}


function updateHistoryList() {
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  history.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.city}, ${entry.country}`;
    li.onclick = () => {
      document.getElementById("cityInput").value = entry.city;
      getWeather();
    };
    historyList.appendChild(li);
  });
}

function clearHistory() {
  const confirmDelete = confirm("Are you sure you want to delete all search history?");
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  if (history.length === 0) {
    alert("No history to clear.");
    return;
  }

  // Show the modal
  document.getElementById("clearModal").classList.remove("hidden");

  // Populate the city checkboxes
  const list = document.getElementById("cityCheckboxList");
  list.innerHTML = "";

  history.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<label><input type="checkbox" class="cityCheckbox" data-index="${index}"> ${entry.city}, ${entry.country}</label>`;
    list.appendChild(li);
  });

  // Reset Select All
  document.getElementById("selectAll").checked = false;
}

function deleteSelectedCities() {
  let history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  const checkboxes = document.querySelectorAll(".cityCheckbox:checked");
  if (checkboxes.length === 0) {
    alert("Please select at least one city to delete.");
    return;
  }

  // Get indexes of cities to remove
  const indexesToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));

  // Filter out selected entries
  history = history.filter((_, index) => !indexesToDelete.includes(index));

  // Save updated history
  localStorage.setItem("weatherHistory", JSON.stringify(history));
  updateHistoryList();
  closeModal();
}

function closeModal() {
  document.getElementById("clearModal").classList.add("hidden");
}

function clearExcelHistory() {
  localStorage.removeItem("excelHistory");
  alert("Excel export data cleared.");
}


function downloadToExcel() {
  const excelHistory = JSON.parse(localStorage.getItem("excelHistory")) || [];

  if (excelHistory.length === 0) {
    alert("No data available to export!");
    return;
  }

  const excelData = [];

  excelData.push(["City", "Temperature (°C)", "Humidity (%)", "Wind Speed (m/s)", "Weather", "Time"]);

  excelHistory.forEach(entry => {
    excelData.push([
      entry.city || "N/A",
      entry.temperature || "N/A",
      entry.humidity || "N/A",
      entry.windSpeed || "N/A",
      entry.description || "N/A",
      entry.time || new Date().toLocaleString()
    ]);
  });

// Create a worksheet from the data
  const ws = XLSX.utils.aoa_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Weather Data");
  XLSX.writeFile(wb, "Weather_History.xlsx");   // Save the workbook as an Excel file
}


window.onload = function () {
  updateHistoryList();

  // Rebuild Excel sheet from localStorage on load
  const history = JSON.parse(localStorage.getItem("weatherHistory")) || [];
  history.forEach(entry => {
    excelSheetData.push([
      entry.city,
      entry.temperature,
      entry.humidity,
      entry.windSpeed,
      entry.description,
      entry.time
    ]);
  });
};

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(registration => console.log("Service Worker registered with scope:", registration.scope))
      .catch(error => console.log("Service Worker registration failed:", error));
  });
}

document.getElementById("selectAll").addEventListener("change", function() {
  const checked = this.checked;
  document.querySelectorAll(".cityCheckbox").forEach(cb => {
    cb.checked = checked;
  });
});


