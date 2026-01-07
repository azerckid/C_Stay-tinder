/**
 * Checks if a given latitude and longitude is within the South Korean region.
 * Coordinates are based on a bounding box covering the mainland and major islands (Jeju, Ulleungdo, Dokdo).
 */
export const isKoreanRegion = (lat: number, lng: number): boolean => {
    return lat >= 33.0 && lat <= 39.0 && lng >= 124.0 && lng <= 132.0;
};

/**
 * Determines which map engine to use based on a list of places.
 * If 70% or more places are in Korea, it returns 'kakao'.
 */
export function determineMapEngine(places: { lat: number; lng: number }[]): 'kakao' | 'google' {
    if (places.length === 0) return 'google';

    const koreanPlaces = places.filter((p) => isKoreanRegion(p.lat, p.lng));
    const koreanRatio = koreanPlaces.length / places.length;

    return koreanRatio >= 0.7 ? 'kakao' : 'google';
}
