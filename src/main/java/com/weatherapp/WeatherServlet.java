package com.weatherapp;

import jakarta.servlet.http.*;
import jakarta.servlet.*;
import java.io.*;

/**
 * WeatherServlet — espone tre endpoint REST:
 *
 *   GET /api/weather?city=Roma        → meteo attuale (OpenWeatherMap)
 *   GET /api/coordinates?city=Roma    → coordinate città (Open-Meteo)
 *   GET /api/forecast?lat=XX&lon=YY   → previsioni 7 giorni (Open-Meteo)
 *
 * Tutti gli endpoint ritornano JSON.
 * Gli errori sono gestiti con WeatherException e ApiException.
 */
public class WeatherServlet extends HttpServlet {

    private WeatherService weatherService;

    /**
     * Inizializzazione: carica la configurazione da WEB-INF/config.properties.
     * Viene chiamato una volta sola da Tomcat all'avvio.
     */
    @Override
    public void init() throws ServletException {
        try {
            String configPath = getServletContext()
                .getRealPath("/WEB-INF/config.properties");
            weatherService = new WeatherService(configPath);
        } catch (WeatherException e) {
            throw new ServletException("Errore inizializzazione WeatherService: "
                + e.getMessage(), e);
        }
    }

    /**
     * Gestisce tutte le richieste HTTP GET.
     * Smista la richiesta all'endpoint corretto in base al path.
     */
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        // Imposta headers comuni a tutte le risposte
        res.setContentType("application/json");
        res.setCharacterEncoding("UTF-8");
        res.setHeader("Access-Control-Allow-Origin", "*");

        // Determina quale endpoint è stato chiamato
        String pathInfo = req.getServletPath()
            + (req.getPathInfo() != null ? req.getPathInfo() : "");

        try {
            switch (pathInfo) {

                case "/api/weather": {
                    String city = req.getParameter("city");
                    if (city == null || city.trim().isEmpty()) {
                        sendError(res, 400, "Parametro 'city' obbligatorio");
                        return;
                    }
                    res.getWriter().write(weatherService.getWeather(city));
                    break;
                }

                case "/api/coordinates": {
                    String city = req.getParameter("city");
                    if (city == null || city.trim().isEmpty()) {
                        sendError(res, 400, "Parametro 'city' obbligatorio");
                        return;
                    }
                    // Rimuove il codice paese se presente (es. "Rome, IT" → "Rome")
                    String cityOnly = city.split(",")[0].trim();
                    res.getWriter().write(weatherService.getCoordinates(cityOnly));
                    break;
                }

                case "/api/forecast": {
                    String lat = req.getParameter("lat");
                    String lon = req.getParameter("lon");
                    if (lat == null || lon == null) {
                        sendError(res, 400, "Parametri 'lat' e 'lon' obbligatori");
                        return;
                    }
                    res.getWriter().write(weatherService.getForecast(lat, lon));
                    break;
                }

                default:
                    sendError(res, 404, "Endpoint non trovato: " + pathInfo);
            }

        } catch (ApiException e) {
            // Errore specifico di una API esterna
            sendError(res, e.getStatusCode(),
                e.getApiName() + ": " + e.getMessage());

        } catch (WeatherException e) {
            // Errore generico dell'applicazione
            sendError(res, e.getStatusCode(), e.getMessage());
        }
    }

    /**
     * Metodo helper: scrive una risposta JSON di errore standardizzata.
     * Tutti gli errori hanno il formato: {"error": "messaggio"}
     */
    private void sendError(HttpServletResponse res, int status, String message)
            throws IOException {
        res.setStatus(status);
        // Escaping delle virgolette nel messaggio per JSON valido
        String safeMessage = message.replace("\"", "'");
        res.getWriter().write("{\"error\": \"" + safeMessage + "\"}");
    }
}