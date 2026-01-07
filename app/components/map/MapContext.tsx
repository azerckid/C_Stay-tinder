import { createContext, useContext } from "react";

// Context to track which map provider is currently active
export type MapProviderType = "google" | "kakao";

interface MapProviderContextType {
    provider: MapProviderType;
}

export const MapProviderContext = createContext<MapProviderContextType | null>(null);

export const useMapProvider = () => {
    const context = useContext(MapProviderContext);
    if (!context) {
        throw new Error("useMapProvider must be used within a MapProvider");
    }
    return context;
};

// Context to share the Kakao map instance with its children
interface KakaoMapContextType {
    map: kakao.maps.Map | null;
}

export const KakaoMapContext = createContext<KakaoMapContextType | null>(null);

export const useKakaoMap = () => {
    const context = useContext(KakaoMapContext);
    if (!context) {
        // We don't throw here because this might be used in a Google-only context
        return null;
    }
    return context;
};
