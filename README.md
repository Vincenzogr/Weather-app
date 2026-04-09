# ☁ Weather App

Applicazione meteo full stack sviluppata come progetto finale del bootcamp.

## Tecnologie utilizzate

**Backend**
- Java 25
- Apache Tomcat 11
- Jakarta Servlet API
- Apache Ant (build tool)

**Frontend**
- React 18 (via CDN)
- Chart.js (grafici)
- CSS Grid (layout responsive)

**API esterne**
- OpenWeatherMap — meteo attuale
- Open-Meteo — previsioni 7 giorni e geocoding
- Pexels — immagini di sfondo dinamiche

## Funzionalità

- Meteo attuale per qualsiasi città del mondo
- Previsioni per i prossimi 7 giorni
- Grafico temperatura ora per ora
- Sfondo dinamico che cambia in base al meteo
- Cronologia delle ultime 5 città cercate (salvata nel browser)
- Layout responsive a 3 colonne (desktop) / 1 colonna (mobile)
- Informazioni aggiuntive: alba, tramonto, pressione, UV index, ora locale

## Struttura del progetto
weather-app/
├── src/
│   ├── main/java/com/weatherapp/
│   │   ├── WeatherServlet.java      # Servlet principale (3 endpoint REST)
│   │   ├── WeatherService.java      # Logica chiamate API esterne
│   │   ├── WeatherException.java    # Eccezione personalizzata
│   │   └── ApiException.java        # Eccezione per errori API
│   └── test/java/com/weatherapp/
│       └── WeatherServiceTest.java  # 5 test unitari JUnit 5
├── WebContent/
│   ├── index.html                   # Pagina principale
│   ├── css/style.css                # Stili e layout responsive
│   ├── js/app.js                    # Frontend React
│   └── WEB-INF/
│       ├── web.xml                  # Configurazione Tomcat
│       └── config.properties        # API keys (NON su GitHub)
├── lib/
│   ├── junit-platform-console-standalone-1.10.2.jar
│   └── mockito-core-5.11.0.jar
├── build.xml                        # Script Ant
├── build.properties                 # Percorsi Tomcat
└── README.md                        # Questo file

## Requisiti

- Java 17 o superiore
- Apache Tomcat 11
- Apache Ant 1.10+
- Account OpenWeatherMap (API key gratuita)
- Account Pexels (API key gratuita)

## Installazione e avvio

### 1. Clona il repository

```bash
git clone https://github.com/Vincenzogr/weather-app.git
cd weather-app
```

### 2. Configura le API key

Crea il file `WebContent/WEB-INF/config.properties`:

```properties
openweathermap.api.key=LA_TUA_API_KEY_QUI
pexels.api.key=LA_TUA_API_KEY_QUI
```

Ottieni le chiavi gratuitamente su:
- OpenWeatherMap: https://openweathermap.org/api
- Pexels: https://www.pexels.com/api/

### 3. Configura build.properties

Apri `build.properties` e imposta il percorso di Tomcat:

```properties
tomcat.home=C:/apache-tomcat-11.0.20
servlet.jar=${tomcat.home}/lib/servlet-api.jar
deploy.dir=${tomcat.home}/webapps
```

### 4. Esegui i test

```bash
ant test
```

Output atteso: `5 tests successful`

### 5. Build e deploy

```bash
ant deploy
```

### 6. Avvia Tomcat

```bash
# Windows
C:\apache-tomcat-11.0.20\bin\startup.bat

# Linux/Mac
./catalina.sh start
```

### 7. Apri nel browser
http://localhost:8080/weather-app/

## Esecuzione dei test

```bash
ant test        # solo test
ant all         # test + build + deploy
```

## Sicurezza

- Le API key sono in `config.properties` che è escluso da Git tramite `.gitignore`
- Il file `config.properties` non viene mai committato
- La cartella `WEB-INF` è protetta da Tomcat — non accessibile dal browser
- Tutti gli input utente sono validati lato backend prima di essere usati

## Licenza

MIT License — vedi file LICENSE

## Uso responsabile dell'AI

Parti di questo progetto sono state sviluppate con il supporto di strumenti AI (Claude di Anthropic).
Il codice generato è stato:
- Compreso e analizzato prima di essere integrato
- Testato manualmente e con test unitari
- Modificato e adattato alle esigenze specifiche del progetto
- Documentato con commenti propri

L'AI è stata usata come strumento di supporto all'apprendimento,
non come sostituto della comprensione del codice.

## Autore

Granata Vincenzo — Training for Software Developer - Italian - 2026