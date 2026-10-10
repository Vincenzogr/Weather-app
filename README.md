# 🌦️ Meteo App

> Applicazione meteo **full-stack** sviluppata da Granata Vincenzo.
> Backend Spring Boot · Frontend React + Vite · Design "Cielo vivo"

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?style=flat-square&logo=spring-boot)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)
![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=flat-square&logo=openjdk)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## ✨ L'idea: il cielo della città, ora per ora

La pagina prende il colore del cielo della città cercata **nell'ora mostrata**: il colore
è calcolato dall'altitudine reale del sole (alba, ora dorata, giorno, crepuscolo, notte),
dalla condizione meteo e dalla copertura nuvolosa. Sole e luna sono disegnati lungo i loro
percorsi reali della giornata, con la temperatura appoggiata sull'orizzonte.

Trascinando la **striscia oraria** (o usando le frecce da tastiera) il cielo cambia colore,
il sole e la luna si spostano e tutti i valori mostrano la previsione per quell'ora.

## Funzionalità

| Funzionalità | Dettaglio |
|---|---|
| 🔍 **Ricerca città** | Autocompletamento Open-Meteo, navigabile da tastiera (`/` porta alla ricerca) |
| 📍 **Posizione** | Meteo per coordinate GPS, senza passare dal nome della città |
| 🌅 **Cielo vivo** | Colori calcolati da sole, nuvole e meteo; stelle di notte; fase lunare reale |
| 🕐 **Ora per ora** | Striscia delle 24 ore che ricolora il cielo (mouse, tocco, tastiera) |
| 📅 **7 giorni** | Barre min/max su una **scala comune**, pioggia (% e mm), vento |
| 📊 **Andamento orario** | Temperatura, precipitazioni e vento del giorno scelto (Chart.js) |
| 🗺️ **Radar** | Mappa Leaflet con livelli pioggia / nuvole / temperatura / vento |
| 🌬️ **Qualità dell'aria** | Indice europeo EAQI con PM2.5, PM10, NO₂, O₃ |
| ☀️ **UV, sole e luna** | Scala UV OMS, alba/tramonto nell'ora locale della città, fase e illuminazione lunare |
| 💡 **Da sapere oggi** | Avvisi pratici su UV, aria, pioggia, vento, freddo e caldo |
| ⭐ **Preferiti** | Salvati sul server per l'utente registrato (JWT), sessione ripristinata al refresh |
| 🔁 **Unità** | Metriche (°C, km/h, km, mm) o imperiali (°F, mph, mi, in) |
| 🌗 **Tema** | Automatico (segue il cielo della città), chiaro o scuro |
| 🌍 **6 lingue** | Italiano, English, Français, Deutsch, Español, 日本語 (anche i messaggi d'errore) |
| 🖼️ **Foto Pexels** | Foto legata alla condizione meteo, fusa nel cielo, con attribuzione al fotografo |

## 🛠️ Stack

**Backend** — Java 17+, Spring Boot 3.5 (Web, Validation, Security, Data JPA, Cache),
Caffeine, H2, JJWT 0.12, RestClient.

**Frontend** — React 19, Vite 5, i18next, Chart.js, React Leaflet, Lucide, Archivo (font variabile, ospitato localmente).

**API esterne** — [OpenWeatherMap](https://openweathermap.org/api) (meteo attuale, tile radar),
[Open-Meteo](https://open-meteo.com) (ricerca città, previsioni, qualità dell'aria),
[Pexels](https://www.pexels.com/api/) (foto, facoltativa), [OpenStreetMap](https://www.openstreetmap.org/copyright) (mappa base).

## 🔌 API del backend

| Metodo | Endpoint | Note |
|---|---|---|
| GET | `/api/weather?city=Roma,IT` oppure `?lat=&lon=` | `lang` facoltativo (it, en, fr, de, es, ja) |
| GET | `/api/coordinates?city=` | Suggerimenti per l'autocompletamento |
| GET | `/api/forecast?lat=&lon=` | 7 giorni + orario, fuso orario della città |
| GET | `/api/air-quality?lat=&lon=` | EAQI, UV e inquinanti |
| GET | `/api/reverse-geocode?lat=&lon=` | |
| GET | `/api/background?condition=rain&night=false` | Foto Pexels ridotte ai campi utili |
| GET | `/api/tiles/{layer}/{z}/{x}/{y}.png` | Proxy delle tile radar: la chiave OWM resta sul server |
| POST | `/api/auth/register`, `/api/auth/login` | Rispondono con token JWT e utente |
| GET | `/api/auth/me` | Ripristina la sessione dal token |
| GET/POST/DELETE | `/api/user/favorites` | Max 10 città, richiede il token |

Gli errori hanno sempre la forma `{ "status": 404, "code": "CITY_NOT_FOUND", "error": "..." }`:
il frontend traduce `code` nella lingua dell'utente.

## 🔒 Sicurezza

- Le chiavi API non arrivano mai al browser (anche le tile radar passano dal backend).
- Parametri validati (coordinate, lingua, lunghezze, layer della mappa); URL costruiti senza concatenare input.
- Password con BCrypt, login limitato a 10 tentativi falliti per IP ogni 15 minuti.
- Segreto JWT da variabile d'ambiente; senza, chiave casuale a ogni avvio.
- Risposte `401`/`403` in JSON, nessun dettaglio interno negli errori, header di sicurezza attivi.
- Console H2 disponibile solo con il profilo `dev`.
- Cache con scadenza: meteo 10 min, previsioni e aria 30 min, ricerche 24 h.

## 📁 Struttura

```
weather-app/
├── frontend/src/
│   ├── api/client.js            # axios + token + codici d'errore
│   ├── auth/                    # AuthProvider, useAuth
│   ├── components/
│   │   ├── sky/                 # SkyHero, SkyChart, HourScrubber, MoonDisc, EmptyHero
│   │   ├── panels/              # Settimana, grafico, radar, aria, sole/luna, dettagli, consigli
│   │   ├── top/                 # Ricerca, impostazioni, città salvate
│   │   └── AuthDialog.jsx       # <dialog> nativo per accesso e registrazione
│   ├── hooks/                   # useWeatherData, useFavorites, useBackgroundPhoto, ...
│   ├── utils/
│   │   ├── sky.js               # colore del cielo + contrasto garantito del testo
│   │   ├── astro.js             # posizione di sole e luna, fase lunare
│   │   ├── timeline.js          # ore e giorni nel fuso della città
│   │   └── weather.js           # unità, codici WMO, scale EAQI e UV
│   ├── locales/                 # it, en, fr, de, es, ja
│   └── index.css                # design system "Cielo vivo"
│
└── src/main/java/com/weatherapp/
    ├── config/                  # Security, Cache (Caffeine), Web
    ├── controller/              # Weather, Auth, User
    ├── service/                 # WeatherService, UserService
    ├── security/                # JwtService, JwtAuthFilter, LoginAttemptService
    ├── exception/               # ErrorCode, eccezioni, GlobalExceptionHandler
    ├── model/ · dto/ · repository/
```

## 🚀 Avvio

### Prerequisiti
- Java 17+ e Maven 3.9+ (il repository include un Maven portatile in `.maven/`)
- Node.js 20+ solo per sviluppare il frontend separatamente

### 1. Chiavi API

Imposta le variabili d'ambiente, oppure crea `src/main/resources/application-secret.properties`
(già escluso da Git):

```properties
openweathermap.api.key=LA_TUA_KEY
pexels.api.key=LA_TUA_KEY        # facoltativa
```

Per la produzione imposta anche `JWT_SECRET` (almeno 32 caratteri).

### 2. Avvio completo

```bash
mvn spring-boot:run
```

Maven installa Node, esegue `npm ci` e `npm run build`, poi avvia il server su `http://localhost:8080`.
Utenti e preferiti sono salvati in `./data/` (H2 su file).

### 3. Sviluppo con hot reload

```bash
mvn spring-boot:run -Dskip.npm -Dskip.installnodenpm -Dspring-boot.run.profiles=dev
```

```bash
npm --prefix frontend run dev
```

Il frontend gira su `http://localhost:5173` e inoltra `/api` al backend.

> **Windows con antivirus o proxy che ispeziona l'HTTPS:** se Java risponde
> `PKIX path building failed`, avvia la JVM con l'archivio certificati di Windows:
> `-Djavax.net.ssl.trustStoreType=Windows-ROOT` (anche in `MAVEN_OPTS`).

## 🧪 Qualità

```bash
mvn test
```

```bash
npm --prefix frontend run lint
```

24 test backend (servizio meteo con server HTTP simulato, validazione, autenticazione,
preferiti, formato degli errori, header di sicurezza).

---

## 🤖 Uso responsabile dell'AI

Parti di questo progetto sono state sviluppate con il supporto di strumenti di intelligenza artificiale.
Il codice generato è stato compreso, testato, modificato e documentato dallo sviluppatore.
L'AI è stata usata come strumento di supporto all'apprendimento, non come sostituto della comprensione del codice.

---

## 👤 Autore

**Granata Vincenzo** — Training for Software Developer · Italian · 2026

[![GitHub](https://img.shields.io/badge/GitHub-Vincenzogr-181717?style=flat-square&logo=github)](https://github.com/Vincenzogr)
