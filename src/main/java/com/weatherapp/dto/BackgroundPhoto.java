package com.weatherapp.dto;

/**
 * Foto di sfondo ridotta ai soli campi usati dal frontend,
 * inclusi quelli necessari per l'attribuzione richiesta da Pexels.
 */
public record BackgroundPhoto(
        String src,
        String alt,
        String avgColor,
        String photographer,
        String photographerUrl,
        String pageUrl
) {
}
