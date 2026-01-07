/**
 * Traveling Salesman Problem (TSP) Optimizer for Trip Planning
 */

interface Point {
    lat: number;
    lng: number;
}

interface Place extends Point {
    id: string;
}

/**
 * Calculates the Haversine distance between two points (in meters)
 * as a fallback if road distance is not available.
 */
function getHaversineDistance(p1: Point, p2: Point): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (p1.lat * Math.PI) / 180;
    const phi2 = (p2.lat * Math.PI) / 180;
    const deltaPhi = ((p2.lat - p1.lat) * Math.PI) / 180;
    const deltaLambda = ((p2.lng - p1.lng) * Math.PI) / 180;

    const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

/**
 * Solves TSP using a simple Nearest Neighbor heuristic.
 * This is efficient and works well for small to medium sets of points.
 */
export function optimizeRoute(places: Place[]): Place[] {
    if (places.length <= 2) return places;

    const unvisited = [...places];
    const optimized: Place[] = [];

    // Start with the first place (current location or first liked)
    let current = unvisited.shift()!;
    optimized.push(current);

    while (unvisited.length > 0) {
        let nearestIndex = 0;
        let minDistance = Infinity;

        for (let i = 0; i < unvisited.length; i++) {
            const dist = getHaversineDistance(current, unvisited[i]);
            if (dist < minDistance) {
                minDistance = dist;
                nearestIndex = i;
            }
        }

        current = unvisited.splice(nearestIndex, 1)[0];
        optimized.push(current);
    }

    return optimized;
}

/**
 * Future Improvement: 
 * Implement bitmask DP for optimal solution when N <= 15.
 * Or integration with Kakao/Google distance matrix API.
 */
