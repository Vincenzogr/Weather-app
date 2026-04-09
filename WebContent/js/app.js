const { useState, useEffect, useRef } = React;

// ── WEATHERCODE → DESCRIZIONE
function getWeatherDesc(code) {
    const codes = {
        0:"Cielo sereno", 1:"Prevalentemente sereno", 2:"Parzialmente nuvoloso",
        3:"Coperto", 45:"Nebbia", 48:"Nebbia con brina", 51:"Pioggerella leggera",
        53:"Pioggerella moderata", 55:"Pioggerella intensa", 61:"Pioggia leggera",
        63:"Pioggia moderata", 65:"Pioggia intensa", 71:"Neve leggera",
        73:"Neve moderata", 75:"Neve intensa", 80:"Rovesci leggeri",
        81:"Rovesci moderati", 82:"Rovesci intensi", 95:"Temporale",
        99:"Temporale con grandine"
    };
    return codes[code] || "N/D";
}

// ── CONDIZIONE METEO → QUERY PEXELS
function getWeatherQuery(description) {
    const desc = description.toLowerCase();
    if (desc.includes("pioggia") || desc.includes("pioggerella") || desc.includes("rovesci"))
        return "rain storm";
    if (desc.includes("neve")) return "snow winter";
    if (desc.includes("temporale")) return "thunderstorm lightning";
    if (desc.includes("nebbia")) return "fog mist";
    if (desc.includes("nuvoloso") || desc.includes("coperto")) return "cloudy sky";
    return "sunny blue sky";
}

// ── PEXELS: ottieni URL immagine di sfondo
async function getBackgroundUrl(description) {
    const query = getWeatherQuery(description);
    const PEXELS_KEY = "JcNbbeDEuibvPz02KNjkWls77aMA8b6H8tBSPeElrdmoT3EDJ9SZ7IKo";
    try {
        const res = await fetch(
            `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
            { headers: { Authorization: PEXELS_KEY } }
        );
        const data = await res.json();
        if (data.photos && data.photos.length > 0) return data.photos[0].src.landscape;
    } catch (err) {
        console.error("Errore Pexels:", err);
    }
    return null;
}

// ── NOMI GIORNI
function getDayName(dateStr) {
    const days = ["Dom","Lun","Mar","Mer","Gio","Ven","Sab"];
    return days[new Date(dateStr).getDay()];
}

// ── UNIX TIMESTAMP → ORA LOCALE
function unixToTime(unix, timezone) {
    return new Date(unix * 1000).toLocaleTimeString("it-IT", {
        timeZone: timezone || "UTC",
        hour: "2-digit",
        minute: "2-digit"
    });
}

// ── ORA LOCALE DELLA CITTÀ
function getCityLocalTime(timezoneOffset) {
    // timezoneOffset da OpenWeatherMap è in secondi
    const utcMs = Date.now() + new Date().getTimezoneOffset() * 60000;
    const cityMs = utcMs + timezoneOffset * 1000;
    const cityDate = new Date(cityMs);
    return cityDate.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
}

// ── UV INDEX → DESCRIZIONE
function getUVLabel(uv) {
    if (uv <= 2) return "Basso";
    if (uv <= 5) return "Moderato";
    if (uv <= 7) return "Alto";
    if (uv <= 10) return "Molto alto";
    return "Estremo";
}

// ── COMPONENTE COLONNA SINISTRA
function LeftPanel({ weather }) {
    if (!weather) return null;

    // Alba e tramonto da OpenWeatherMap (timestamp Unix)
    const sunrise = unixToTime(weather.sys.sunrise, null);
    const sunset  = unixToTime(weather.sys.sunset, null);

    // Pressione atmosferica
    const pressure = weather.main.pressure;

    return (
        <div className="col-left">
            <div className="card side-card">

                {/* Alba */}
                <div className="info-block">
                    <div className="info-icon">🌅</div>
                    <div className="info-label">Alba</div>
                    <div className="info-value">{sunrise}</div>
                    <div className="info-sub">Ora locale UTC</div>
                </div>

                {/* Tramonto */}
                <div className="info-block">
                    <div className="info-icon">🌇</div>
                    <div className="info-label">Tramonto</div>
                    <div className="info-value">{sunset}</div>
                    <div className="info-sub">Ora locale UTC</div>
                </div>

                {/* Pressione */}
                <div className="info-block">
                    <div className="info-icon">🌐</div>
                    <div className="info-label">Pressione</div>
                    <div className="info-value">{pressure} <span style={{fontSize:"1rem"}}>hPa</span></div>
                    <div className="info-sub">
                        {pressure < 1000 ? "Bassa pressione" :
                         pressure < 1020 ? "Pressione normale" : "Alta pressione"}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ── COMPONENTE COLONNA DESTRA
function RightPanel({ weather, forecast }) {
    if (!weather) return null;

    // Ora locale della città
    const localTime = getCityLocalTime(weather.timezone);

    // Fuso orario in ore
    const offsetHours = weather.timezone / 3600;
    const offsetStr = offsetHours >= 0 ? `UTC+${offsetHours}` : `UTC${offsetHours}`;

    // UV Index da Open-Meteo forecast (giorno corrente)
    const uvIndex = forecast?.daily?.uv_index_max?.[0] ?? null;

    return (
        <div className="col-right">
            <div className="card side-card">

                {/* Ora locale */}
                <div className="info-block">
                    <div className="info-icon">🕐</div>
                    <div className="info-label">Ora locale</div>
                    <div className="info-value">{localTime}</div>
                    <div className="info-sub">{offsetStr}</div>
                </div>

                {/* Fuso orario */}
                <div className="info-block">
                    <div className="info-icon">🌍</div>
                    <div className="info-label">Fuso orario</div>
                    <div className="info-value">{offsetStr}</div>
                    <div className="info-sub">
                        {offsetHours >= 0 ? `${offsetHours}h avanti UTC` : `${Math.abs(offsetHours)}h indietro UTC`}
                    </div>
                </div>

                {/* UV Index */}
                <div className="info-block">
                    <div className="info-icon">☀️</div>
                    <div className="info-label">Indice UV</div>
                    <div className="info-value">
                        {uvIndex !== null ? uvIndex.toFixed(1) : "N/D"}
                    </div>
                    <div className="info-sub">
                        {uvIndex !== null ? getUVLabel(uvIndex) : "Dati non disponibili"}
                    </div>
                </div>

            </div>
        </div>
    );
}

// ── COMPONENTE GRAFICO
function TempChart({ hours, temps, dayLabel }) {
    const canvasRef = useRef(null);
    const chartRef  = useRef(null);

    useEffect(() => {
        if (chartRef.current) chartRef.current.destroy();
        const ctx = canvasRef.current.getContext("2d");
        chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: hours,
                datasets: [{
                    label: "Temperatura °C",
                    data: temps,
                    borderColor: "#38bdf8",
                    backgroundColor: "rgba(56,189,248,0.1)",
                    borderWidth: 2,
                    pointBackgroundColor: "#38bdf8",
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: "#f1f5f9", font: { size: 13 } } } },
                scales: {
                    x: { ticks: { color: "#94a3b8", font: { size: 12 } }, grid: { color: "rgba(255,255,255,0.05)" } },
                    y: { ticks: { color: "#94a3b8", font: { size: 12 } }, grid: { color: "rgba(255,255,255,0.05)" } }
                }
            }
        });
    }, [hours, temps]);

    return (
        <div className="chart-container">
            <h3>🌡 Temperatura ora per ora — {dayLabel}</h3>
            <canvas ref={canvasRef}></canvas>
        </div>
    );
}

// ── COMPONENTE PRINCIPALE
function WeatherApp() {
    const [cityInput, setCityInput]     = useState("");
    const [weather, setWeather]         = useState(null);
    const [forecast, setForecast]       = useState(null);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState("");
    const [selectedDay, setSelectedDay] = useState(0);
    const [history, setHistory]         = useState(() => {
        const saved = localStorage.getItem("weatherHistory");
        return saved ? JSON.parse(saved) : [];
    });

    // Cambia sfondo quando cambia il meteo
    useEffect(() => {
        if (weather) {
            const desc = weather.weather[0].description;
            getBackgroundUrl(desc).then(url => {
                document.body.style.backgroundImage = url ? `url('${url}')` : "none";
                if (!url) document.body.style.background = "#0f172a";
            });
        }
    }, [weather]);

    // Salva cronologia in localStorage
    useEffect(() => {
        localStorage.setItem("weatherHistory", JSON.stringify(history));
    }, [history]);

    // Funzione di ricerca
    async function handleSearch(cityName) {
        const city = cityName || cityInput.trim();
        if (!city) { setError("Inserisci il nome di una città."); return; }

        setLoading(true);
        setError("");
        setWeather(null);
        setForecast(null);
        setSelectedDay(0);

        try {
            // 1. Meteo attuale da OpenWeatherMap
            const weatherRes  = await fetch(`/weather-app/api/weather?city=${encodeURIComponent(city)}`);
            const weatherData = await weatherRes.json();
            if (!weatherRes.ok) { setError(weatherData.error || "Città non trovata."); setLoading(false); return; }
            setWeather(weatherData);

            // 2. Coordinate da Open-Meteo Geocoding
            const coordRes  = await fetch(`/weather-app/api/coordinates?city=${encodeURIComponent(city)}`);
            const coordData = await coordRes.json();
            if (!coordRes.ok || !coordData.results?.length) {
                setLoading(false); return;
            }
            const { latitude, longitude } = coordData.results[0];

            // 3. Previsioni 7 giorni + UV Index da Open-Meteo
            const forecastRes  = await fetch(`/weather-app/api/forecast?lat=${latitude}&lon=${longitude}`);
            const forecastData = await forecastRes.json();
            if (!forecastRes.ok) { setLoading(false); return; }
            setForecast(forecastData);

            // 4. Aggiorna cronologia
            setHistory(prev => {
                const filtered = prev.filter(c => c.toLowerCase() !== city.toLowerCase());
                return [city, ...filtered].slice(0, 5);
            });

        } catch (err) {
            setError("Impossibile raggiungere il server. Tomcat è avviato?");
        } finally {
            setLoading(false);
        }
    }

    // Dati grafico per il giorno selezionato
    function getChartData() {
        if (!forecast) return { hours: [], temps: [] };
        const startIndex = selectedDay * 24;
        const hours = forecast.hourly.time
            .slice(startIndex, startIndex + 24)
            .map(t => t.split("T")[1]);
        const temps = forecast.hourly.temperature_2m
            .slice(startIndex, startIndex + 24);
        return { hours, temps };
    }

    const { hours, temps } = getChartData();
    const selectedDayLabel = forecast
        ? `${getDayName(forecast.daily.time[selectedDay])} ${forecast.daily.time[selectedDay]}`
        : "";

    return (
        <div>
            {/* HEADER */}
            <header>
                <h1>☁ Meteo</h1>
                <p>Inserisci una città per vedere le condizioni meteo</p>
            </header>

            {/* RICERCA */}
            <div className="search-box">
                <input
                    type="text"
                    value={cityInput}
                    onChange={e => setCityInput(e.target.value)}
                    onKeyPress={e => e.key === "Enter" && handleSearch()}
                    placeholder="Es. Roma, Milano, Napoli..."
                />
                <button onClick={() => handleSearch()}>Cerca</button>
            </div>

            {/* CRONOLOGIA */}
            {history.length > 0 && (
                <div className="history">
                    {history.map(city => (
                        <span
                            key={city}
                            className="history-item"
                            onClick={() => { setCityInput(city); handleSearch(city); }}
                        >
                            🕐 {city}
                        </span>
                    ))}
                </div>
            )}

            {/* ERRORE */}
            {error && <div className="error">{error}</div>}

            {/* LOADER */}
            {loading && <div className="loader"><div className="spinner"></div></div>}

            {/* LAYOUT 3 COLONNE */}
            {weather && (
                <div className="main-layout">

                    {/* COLONNA SINISTRA */}
                    <LeftPanel weather={weather} />

                    {/* COLONNA CENTRALE */}
                    <div className="col-center">

                        {/* Card meteo attuale */}
                        <div className="card weather-card">
                            <div className="city-name">
                                <h2>{weather.name}</h2>
                                <span>{weather.sys.country}</span>
                            </div>
                            <div className="main-info">
                                <img
                                    src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                                    alt="meteo"
                                />
                                <div className="temperature">{Math.round(weather.main.temp)}°C</div>
                            </div>
                            <p className="description">{weather.weather[0].description}</p>
                            <div className="details">
                                <div className="detail-item"><span>💧 Umidità</span><strong>{weather.main.humidity}%</strong></div>
                                <div className="detail-item"><span>🌬 Vento</span><strong>{Math.round(weather.wind.speed * 3.6)} km/h</strong></div>
                                <div className="detail-item"><span>🌡 Percepita</span><strong>{Math.round(weather.main.feels_like)}°C</strong></div>
                                <div className="detail-item"><span>👁 Visibilità</span><strong>{(weather.visibility / 1000).toFixed(1)} km</strong></div>
                            </div>
                        </div>

                        {/* Previsioni 7 giorni */}
                        {forecast && (
                            <div className="forecast-strip">
                                {forecast.daily.time.map((date, i) => (
                                    <div
                                        key={date}
                                        className={`forecast-day ${selectedDay === i ? "active" : ""}`}
                                        onClick={() => setSelectedDay(i)}
                                    >
                                        <div className="day-name">{getDayName(date)}</div>
                                        <div className="day-temp-max">{Math.round(forecast.daily.temperature_2m_max[i])}°</div>
                                        <div className="day-temp-min">{Math.round(forecast.daily.temperature_2m_min[i])}°</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Grafico ora per ora */}
                        {forecast && hours.length > 0 && (
                            <TempChart hours={hours} temps={temps} dayLabel={selectedDayLabel} />
                        )}

                    </div>

                    {/* COLONNA DESTRA */}
                    <RightPanel weather={weather} forecast={forecast} />

                </div>
            )}
        </div>
    );
}

// Monta l'app
ReactDOM.createRoot(document.getElementById("root")).render(<WeatherApp />);