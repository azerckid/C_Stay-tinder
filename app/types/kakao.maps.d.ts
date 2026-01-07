declare namespace kakao.maps {
    class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
    }

    class Map {
        constructor(container: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng): void;
        setLevel(level: number): void;
    }

    interface MapOptions {
        center: LatLng;
        level: number;
    }

    class Marker {
        constructor(options: MarkerOptions);
        setMap(map: Map | null): void;
    }

    interface MarkerOptions {
        position: LatLng;
        map?: Map;
        title?: string;
    }

    class Polyline {
        constructor(options: PolylineOptions);
        setMap(map: Map | null): void;
    }

    interface PolylineOptions {
        path: LatLng[];
        strokeWeight?: number;
        strokeColor?: string;
        strokeOpacity?: number;
        strokeStyle?: string;
    }

    function load(callback: () => void): void;
}

interface Window {
    kakao: typeof kakao;
}
