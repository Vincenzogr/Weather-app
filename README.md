# 🌦️ Weather App

> Applicazione meteo **full-stack professionale** sviluppata da Granata Vincenzo.
> Backend Spring Boot · Frontend React + Vite · Design glassmorphism premium

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=spring-boot)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Java](https://img.shields.io/badge/Java-17-ED8B00?style=flat-square&logo=openjdk)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ Funzionalità

| Funzionalità | Dettaglio |
|---|---|
| 🔍 **Ricerca città** | Autocomplete in tempo reale con Open-Meteo Geocoding |
| 📍 **Geolocalizzazione** | Rilevamento automatico città all'avvio |
| 🌡️ **Meteo attuale** | Temperatura, percepita, vento, umidità, visibilità |
| 📅 **Previsioni 7 giorni** | Striscia drag-to-scroll con emoji meteo, max/min e probabilità pioggia |
| 📊 **Grafico orario** | Temperatura, pioggia o vento ora per ora con tooltip personalizzati |
| 🗺️ **Radar interattivo** | Mappa Leaflet con layer selezionabili (Pioggia / Temp / Vento / Nuvole) |
| 🔁 **Toggle °C / °F** | Conversione al volo di tutte le temperature e velocità |
| 🌙 **Tema chiaro/scuro** | Modalità dark (default) e light con transizioni fluide |
| 🖼️ **Sfondo dinamico** | Immagini Pexels cambiate in base alle condizioni meteo |
| 🕐 **Ora locale** | Ora corrente nella città cercata |
| ☀️ **Indice UV** | Barra colorata con etichetta (Basso → Estremo) |
| 📌 **Città recenti** | Ultime 5 città salvate nel localStorage |
| 💀 **Skeleton loading** | Placeholder animati durante il caricamento |

---

## 🛠️ Stack Tecnologico

### Backend
| Tecnologia | Versione | Utilizzo |
|---|---|---|
| Java | 17 | Runtime |
| Spring Boot | 3.2.5 | Framework REST |
| Spring Web (RestClient) | 3.2.5 | Chiamate HTTP verso API esterne |
| Spring Cache | 3.2.5 | Cache in-memory delle risposte API |

### Frontend
| Tecnologia | Versione | Utilizzo |
|---|---|---|
| React | 19 | UI framework |
| Vite | 5 | Build tool & dev server |
| Framer Motion | 12 | Animazioni e transizioni |
| Chart.js + react-chartjs-2 | 4 / 5 | Grafico orario |
| React Leaflet + Leaflet | 5 / 1.9 | Mappa radar |
| Lucide React | 1.16 | Icone UI |
| Axios | 1.x | HTTP client |

### API Esterne
| API | Piano | Utilizzo |
|---|---|---|
| [OpenWeatherMap](https://openweathermap.org/api) | Gratuito | Meteo attuale, geolocalizzazione inversa, tile mappa |
| [Open-Meteo](https://open-meteo.com) | Gratuito | Previsioni 7 giorni + dati orari + geocoding |
| [Pexels](https://www.pexels.com/api/) | Gratuito | Immagini di sfondo dinamiche |

---

## 📁 Struttura del Progetto

```
weather-app/
├── frontend/                          # App React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── WeatherCard.jsx        # Card meteo attuale + icone SVG animate
│   │   │   ├── ForecastStrip.jsx      # Striscia previsioni 7 giorni
│   │   │   ├── HourlyChart.jsx        # Grafico orario interattivo
│   │   │   ├── GeoPanel.jsx           # Alba, tramonto, pressione, UV
│   │   │   ├── LocalPanel.jsx         # Ora locale + mappa radar
│   │   │   ├── SearchBar.jsx          # Ricerca con autocomplete
│   │   │   ├── RecentCities.jsx       # Chip città recenti
│   │   │   ├── WeatherIcon.jsx        # Icone SVG animate per condizione meteo
│   │   │   └── SkeletonLoader.jsx     # Skeleton loading 3 colonne
│   │   ├── hooks/
│   │   │   └── useWeatherData.js      # Custom hook per fetch dati
│   │   ├── utils/
│   │   │   └── weatherHelpers.js      # Helper: temp, vento, UV, date
│   │   ├── App.jsx                    # Orchestratore (stato globale)
│   │   ├── index.css                  # Design system completo
│   │   └── main.jsx                   # Entry point
│   ├── vite.config.js                 # Config Vite + proxy → backend
│   └── package.json
│
├── src/main/java/com/weatherapp/      # Backend Spring Boot
│   ├── WeatherApplication.java        # Entry point Spring Boot
│   ├── WeatherController.java         # REST endpoints (/api/*)
│   ├── WeatherService.java            # Logica chiamate API esterne + cache
│   ├── WeatherException.java          # Eccezione custom HTTP
│   ├── ApiException.java              # Eccezione per errori API esterne
│   └── GlobalExceptionHandler.java    # @ControllerAdvice per errori HTTP
│
├── src/main/resources/
│   └── application.properties         # API keys e configurazione (NON in Git)
│
├── src/test/java/com/weatherapp/
│   └── WeatherServiceTest.java        # Test JUnit 5
│
├── pom.xml                            # Maven + frontend-maven-plugin
└── README.md
```

---

## 🚀 Installazione e Avvio

### Prerequisiti
- **Java 17+**
- **Maven 3.8+**
- **Node.js 20+** (solo per sviluppo frontend separato)

### 1. Clona il repository

```bash
git clone https://github.com/Vincenzogr/Weather-app.git
cd Weather-app
```

### 2. Configura le API Key

Crea/modifica il file `src/main/resources/application.properties`:

```properties
# OpenWeatherMap — https://openweathermap.org/api
openweathermap.api.key=LA_TUA_KEY_QUI

# Pexels — https://www.pexels.com/api/
pexels.api.key=LA_TUA_KEY_QUI
```

> ⚠️ **Non committare mai le API key.** Il file è già in `.gitignore`.

### 3a. Avvio completo (Build + Backend)

```bash
mvn spring-boot:run
```

Il plugin Maven scarica Node.js, esegue `npm install` e `npm run build` automaticamente,
poi avvia il backend su `http://localhost:8080`.

### 3b. Sviluppo Frontend separato

In un terminale, avvia il backend:

```bash
mvn spring-boot:run -Pskip-frontend
# oppure avvialo dall'IDE
```

In un altro terminale, avvia Vite (hot-reload):

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173 (proxy → http://localhost:8080)
```

---

## 🧪 Test

```bash
mvn test
```

Output atteso: tutti i test JUnit 5 in `WeatherServiceTest.java` passano.

---

## 🔒 Sicurezza

- Le API key risiedono solo in `application.properties` (escluso da `.gitignore`)
- Backend valida tutti i parametri prima di chiamare le API esterne
- Nessuna chiave è mai esposta al frontend direttamente
- Spring Cache evita chiamate ridondanti alle API esterne

---

## 🎨 Design

- **Dark mode** (default) e **Light mode** con transizione fluida
- **Glassmorphism** con `backdrop-filter` e bordi semitrasparenti
- **Font**: Inter (UI) + Outfit (numeri/display) da Google Fonts
- **Icone meteo SVG** animate con CSS keyframes (sole rotante, pioggia, neve, fulmine...)
- **Skeleton loading** durante il fetch dati
- **Responsive**: layout 3 colonne → 2 colonne → 1 colonna

---

## 🤖 Uso responsabile dell'AI

Parti di questo progetto sono state sviluppate con il supporto di strumenti AI (Claude di Anthropic e Antigravity IDE).
Il codice generato è stato compreso, testato, modificato e documentato dallo sviluppatore.
L'AI è stata usata come strumento di supporto all'apprendimento, non come sostituto della comprensione del codice.

---

## 👤 Autore

**Granata Vincenzo** — Training for Software Developer · Italian · 2026

[![GitHub](https://img.shields.io/badge/GitHub-Vincenzogr-181717?style=flat-square&logo=github)](https://github.com/Vincenzogr)