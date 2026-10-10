package com.weatherapp.model;

import com.weatherapp.exception.ErrorCode;
import com.weatherapp.exception.WeatherException;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class GeoPointTest {

    @Test
    void arrotondaATreDecimali() {
        GeoPoint point = new GeoPoint(41.893216, -12.482771);
        assertEquals(41.893, point.lat());
        assertEquals(-12.483, point.lon());
        assertEquals(new GeoPoint(41.8932, -12.4828), point);
    }

    @Test
    void rifiutaCoordinateFuoriRange() {
        assertEquals(ErrorCode.INVALID_PARAMETER,
                assertThrows(WeatherException.class, () -> new GeoPoint(91, 0)).getCode());
        assertThrows(WeatherException.class, () -> new GeoPoint(0, -181));
        assertThrows(WeatherException.class, () -> new GeoPoint(Double.NaN, 0));
        assertThrows(WeatherException.class, () -> GeoPoint.of(null, 10.0));
    }

    @Test
    void skyConditionAccettaFormatiDiversi() {
        assertEquals(SkyCondition.FEW_CLOUDS, SkyCondition.parse("few-clouds"));
        assertEquals(SkyCondition.RAIN, SkyCondition.parse(" RAIN "));
        assertEquals(SkyCondition.CLEAR, SkyCondition.parse("tornado"));
        assertEquals(SkyCondition.CLEAR, SkyCondition.parse(null));
    }
}
