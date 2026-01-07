declare namespace kakao.maps {
    class LatLng {
        constructor(lat: number, lng: number);
        getLat(): number;
        getLng(): number;
    }

    class LatLngBounds {
        constructor();
        extend(latlng: LatLng): void;
        isEmpty(): boolean;
    }

    class Map {
        constructor(container: HTMLElement, options: MapOptions);
        setCenter(latlng: LatLng): void;
        setLevel(level: number): void;
        setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
        getBounds(): LatLngBounds;
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
        zIndex?: number;
        clickable?: boolean;
        draggable?: boolean;
    }

    class CustomOverlay {
        constructor(options: CustomOverlayOptions);
        setMap(map: Map | null): void;
    }

    interface CustomOverlayOptions {
        position: LatLng;
        content: string | HTMLElement;
        map?: Map;
        xAnchor?: number;
        yAnchor?: number;
        zIndex?: number;
    }

    function load(callback: () => void): void;
}

interface Window {
    kakao: typeof kakao;
}
