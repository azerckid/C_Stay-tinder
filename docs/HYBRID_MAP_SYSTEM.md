# 하이브리드 지도 시스템 구현 가이드 (Kakao & Google Maps)

이 문서는 국내 여행지와 해외 여행지를 모두 지원하기 위해 **국내(카카오맵)**와 **해외(구글맵)** 지도를 동적으로 전환하여 제공하는 하이브리드 지도 시스템의 설계 및 구현 방안을 설명합니다.

---

## 1. 아키텍처 개요

사용자가 선택한 목적지의 좌표를 분석하여 자동으로 엔진을 선택하는 추상화 계층(Abstraction Layer)을 구축합니다.

### 시스템 구성도
- **UnifiedMapInterface**: 지도 서비스의 공통 인터페이스 (center, zoom, markers 등)
- **MapProviderSelector**: 좌표 기반 엔진 결정 로직 (South Korea vs Global)
- **KakaoMapEngine**: 국내 전용 렌더링 엔진
- **GoogleMapEngine**: 해외 및 글로벌 렌더링 엔진

---

## 2. 구현 상세

### 2.1 지역 판단 로직
한국 영토의 위경도 범위를 기준으로 엔진을 분기합니다.

```typescript
// app/lib/map-utils.ts
export const isKoreanRegion = (lat: number, lng: number): boolean => {
    // 한국 본토 및 도서 지역 대략적 범위
    return lat >= 33.0 && lat <= 39.0 && lng >= 124.0 && lng <= 132.0;
};
```

### 2.2 하이브리드 컨테이너 설계
기존 `MapContainer`를 래퍼로 사용하여 내부적으로 두 엔진을 교체합니다.

```tsx
// app/components/map/HybridMapContainer.tsx
export function HybridMapContainer({ center, zoom, children }: MapProps) {
    const useKakao = isKoreanRegion(center.lat, center.lng);

    if (useKakao) {
        return <KakaoMapEngine center={center} zoom={zoom}>{children}</KakaoMapEngine>;
    }

    return <GoogleMapEngine center={center} zoom={zoom}>{children}</GoogleMapEngine>;
}
```

**주의사항:**
- 여러 장소가 혼합된 경우, 모든 장소를 분석하여 엔진을 결정해야 함
- 단일 `center` 좌표만으로는 부정확할 수 있음

---

## 3. 핵심 차이점 및 대응 전략

| 항목 | 카카오맵 (Kakao Maps) | 구글맵 (Google Maps) | 대응 전략 |
| :--- | :--- | :--- | :--- |
| **SDK 로딩** | `script` 태그 수동 주입 | `APIProvider` 컴포넌트 방식 | Root에서 동적 로딩 처리 |
| **다크 모드** | 기본 지원 안 함 | JSON 스타일로 지원 | 카카오맵은 CSS Filter(Invert) 적용 고려 |
| **마커 관리** | Imperative (객체 생성) | Declarative (컴포넌트) | `CustomMarker` 컴포넌트로 추상화 |
| **경로(Polyline) 렌더링** | `kakao.maps.Polyline` 클래스, 좌표 배열 | `google.maps.Polyline` 클래스, `LatLngLiteral[]` | 통합 `UnifiedPolyline` 컴포넌트로 추상화 |
| **Directions API** | `apis-navi.kakao.com/v1/directions`, 국내 도로망 최적화 | `routes.googleapis.com/directions/v2`, 글로벌 지원 | 통합 `DirectionsService` 인터페이스로 추상화 |
| **국내 도로 데이터** | 정확한 도로망 데이터 제공 | 제한적 (안보법 영향) | 국내 여행지는 카카오맵 사용 권장 |

---

## 4. 실행 계획 (Action Plan)

### Phase 1: 기본 하이브리드 지도 렌더링 (✅ 완료)
1.  **환경 변수 설정**: `.env`에 `VITE_KAKAO_MAP_APP_KEY` 추가
2.  **SDK 주입**: `app/root.tsx`에 카카오맵 SDK 스크립트 추가
3.  **엔진 라이브러리 설치**: `app/types/kakao.maps.d.ts` 수동 작성 및 지속 업데이트
4.  **지역 판단 로직**: `app/lib/map-utils.ts` 생성 (`isKoreanRegion`, `determineMapEngine`)
5.  **컴포넌트 구현**: 
    - `KakaoMapContainer.tsx`, `HybridMapContainer.tsx` 구현
    - `MapContext.tsx`를 통한 엔진 상태 및 지도 인스턴스 공유
    - `UnifiedMarker.tsx`로 마커 추상화 완료
6.  **통합**: `routes/route.tsx` 및 `routes/trips.$tripId.tsx` 적용 완료

### Phase 2: 경로(Polyline) 및 Directions API 통합 (✅ 완료)
7.  **Polyline 컴포넌트 확장**:
    - `KakaoPolyline.tsx`, `UnifiedPolyline.tsx` 구현
    - 두 엔진 모두에서 통일된 경로 렌더링 인터페이스 제공
8.  **Directions API 하이브리드화**:
    - `app/lib/directions/kakao-directions.ts` 구현 (카카오 REST API 연동)
    - `app/routes/api/directions.ts` 수정 (지역별 API 분기 로직 적용)
9.  **DirectionsOptimizer 고도화**:
    - `DirectionsOptimizer.tsx` 수정 (엔진별 최적 경로 호출 및 `setBounds` 자동화)

### Phase 3: 고급 기능 및 최적화 (✅ 완료)
10. **디자인 폴리싱 (Dark Mode)**:
    - 카카오맵에 CSS Filter (`invert`, `hue-rotate`)를 적용하여 다크 테마와 조화롭게 구성
    - `CustomOverlay`를 사용하여 카카오맵 마커를 구글 'Pin' 디자인과 동일하게 구현 (Tailwind 활용)
11. **에러 핸들링 및 폴백**:
    - `HybridMapContainer`에 지능형 폴백 로직 추가 (카카오 로드 실패 시 구글로 자동 전환)
    - SDK 로딩 타임아웃 처리 및 사용자 알림 UI 추가
12. **성능 최적화**:
    - `root.tsx`에서 SDK를 `async/defer`로 로드하여 초기 렌더링 성능 확보
13. **여러 장소 혼합 시나리오 처리**:
    - `determineMapEngine` 유틸리티를 통한 자동 엔진 선택 전략 수립

### Phase 4: 최종 테스트 및 안정화 (진행 예정)
14. **교차 검증**: 국내(서울/제주), 해외(도쿄/파리), 혼합 시나리오별 경로 및 마커 확인
15. **비용 분석**: 구글 맵 API 호출량 감소 확인
16. **문서화 마무리**: 개발자 가이드 최종 업데이트

---

## 5. 경로(Polyline) 렌더링 통합 ⚠️ **현재 문제 해결 핵심**

### 5.1 문제 상황
현재 Google Maps만 사용 중이며, 한국 내 도로 데이터가 제한적이어서 경로가 도로를 따라 표시되지 않는 문제가 발생하고 있습니다.

### 5.2 카카오맵 Polyline API
```typescript
// 카카오맵 Polyline 사용 예시
const polyline = new kakao.maps.Polyline({
    path: [
        new kakao.maps.LatLng(37.5665, 126.9780),
        new kakao.maps.LatLng(35.1587, 129.1604),
    ],
    strokeWeight: 4,
    strokeColor: '#25aff4',
    strokeOpacity: 1,
    strokeStyle: 'dashed', // 점선 스타일
});
polyline.setMap(map);
```

### 5.3 구글맵 Polyline API
```typescript
// 구글맵 Polyline 사용 예시 (현재 구현)
const polyline = new google.maps.Polyline({
    path: [
        { lat: 37.5665, lng: 126.9780 },
        { lat: 35.1587, lng: 129.1604 },
    ],
    strokeColor: '#25aff4',
    strokeWeight: 4,
    icons: [{
        icon: { path: google.maps.SymbolPath.CIRCLE, scale: 4 },
        repeat: '20px'
    }],
});
polyline.setMap(map);
```

### 5.4 통합 Polyline 컴포넌트 설계
```typescript
// app/components/map/UnifiedPolyline.tsx
interface UnifiedPolylineProps {
    path: { lat: number; lng: number }[];
    strokeColor?: string;
    strokeWeight?: number;
    strokePattern?: 'solid' | 'dashed';
    engine?: 'auto' | 'kakao' | 'google'; // 'auto'는 path 분석하여 결정
}

export function UnifiedPolyline({ path, engine = 'auto', ...props }: UnifiedPolylineProps) {
    const selectedEngine = engine === 'auto' 
        ? determineEngine(path) 
        : engine;
    
    if (selectedEngine === 'kakao') {
        return <KakaoPolyline path={path} {...props} />;
    }
    
    return <GooglePolyline path={path} {...props} />;
}
```

---

## 6. Directions API 통합 ⚠️ **현재 문제 해결 핵심**

### 6.1 문제 상황
현재 Google Routes API v2를 사용 중이지만, 한국 내 도로망 데이터 부족으로 인해 정확한 경로를 제공하지 못하고 있습니다.

### 6.2 카카오맵 Directions API
```typescript
// 카카오맵 Directions API 사용 예시
const response = await fetch('https://apis-navi.kakao.com/v1/directions', {
    method: 'POST',
    headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        origin: { x: 126.9780, y: 37.5665 },
        destination: { x: 129.1604, y: 35.1587 },
        waypoints: [
            { x: 129.1189, y: 35.1531 }
        ],
    }),
});

// 응답: 경로 좌표 배열
const route = await response.json();
const path = route.routes[0].sections[0].roads.map(road => ({
    lat: road.y,
    lng: road.x,
}));
```

### 6.3 구글맵 Directions API (현재 사용 중)
```typescript
// 구글맵 Routes API v2 사용 예시 (현재 구현)
const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
    method: 'POST',
    headers: {
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        origin: { location: { latLng: { latitude: 37.5665, longitude: 126.9780 } } },
        destination: { location: { latLng: { latitude: 35.1587, longitude: 129.1604 } } },
        travelMode: 'DRIVE',
    }),
});

// 응답: encodedPolyline
const data = await response.json();
const encodedPolyline = data.routes[0].polyline.encodedPolyline;
const path = decodePolyline(encodedPolyline);
```

### 6.4 통합 Directions 서비스 설계
```typescript
// app/lib/directions/unified-directions.ts
interface DirectionsRequest {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    waypoints?: { lat: number; lng: number }[];
}

interface DirectionsResponse {
    path: { lat: number; lng: number }[];
    distance: number; // 미터
    duration: number; // 초
}

interface DirectionsService {
    calculateRoute(request: DirectionsRequest): Promise<DirectionsResponse>;
}

// 카카오맵 구현
class KakaoDirectionsService implements DirectionsService {
    async calculateRoute(request: DirectionsRequest): Promise<DirectionsResponse> {
        // 카카오 Directions API 호출
        // 응답을 통일된 형식으로 변환
    }
}

// 구글맵 구현
class GoogleDirectionsService implements DirectionsService {
    async calculateRoute(request: DirectionsRequest): Promise<DirectionsResponse> {
        // 구글 Directions API 호출
        // 응답을 통일된 형식으로 변환
    }
}

// 팩토리 함수
export function createDirectionsService(region: 'korea' | 'global'): DirectionsService {
    return region === 'korea' 
        ? new KakaoDirectionsService()
        : new GoogleDirectionsService();
}
```

### 6.5 API 라우트 수정 방안
```typescript
// app/routes/api/directions.ts 수정 예시
export async function action({ request }: ActionFunctionArgs) {
    const { places } = await request.json();
    
    // 모든 장소가 국내인지 확인
    const allKorean = places.every(p => isKoreanRegion(p.lat, p.lng));
    
    if (allKorean) {
        // 카카오맵 Directions API 사용
        return await fetchKakaoDirections(places);
    } else {
        // 구글맵 Directions API 사용
        return await fetchGoogleDirections(places);
    }
}
```

---

## 7. 여러 장소 혼합 시나리오 처리

### 7.1 장소 목록 분석
여러 장소가 있을 때, 모든 장소를 분석하여 적절한 엔진을 선택해야 합니다.

```typescript
// app/lib/map-utils.ts
export function determineMapEngine(places: { lat: number; lng: number }[]): 'kakao' | 'google' {
    if (places.length === 0) return 'google'; // 기본값
    
    const koreanPlaces = places.filter(p => isKoreanRegion(p.lat, p.lng));
    const koreanRatio = koreanPlaces.length / places.length;
    
    // 대부분이 국내인 경우(≥70%) 카카오맵 사용
    if (koreanRatio >= 0.7) {
        return 'kakao';
    }
    
    // 해외가 많으면 구글맵 사용
    return 'google';
}
```

### 7.2 엔진 선택 전략
- **모든 장소가 국내(100%)**: 카카오맵 사용
- **대부분이 국내(≥70%)**: 카카오맵 사용
- **혼합(30%~70%)**: 기본값 설정 필요 (사용자 선택 옵션 제공 고려)
- **대부분이 해외(≥70%)**: 구글맵 사용
- **모든 장소가 해외(100%)**: 구글맵 사용

---

## 8. 에러 핸들링 및 폴백 전략

### 8.1 SDK 로드 실패 처리
```typescript
// HybridMapContainer에서 에러 처리
export function HybridMapContainer({ center, zoom, children }: MapProps) {
    const [engine, setEngine] = useState<'kakao' | 'google' | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const useKakao = isKoreanRegion(center.lat, center.lng);
        
        if (useKakao) {
            // 카카오맵 로드 시도
            loadKakaoMap().catch(() => {
                // 실패 시 구글맵으로 폴백
                setEngine('google');
                setError('카카오맵 로드 실패, 구글맵으로 전환');
            });
        } else {
            setEngine('google');
        }
    }, [center]);
    
    // 에러 상태 UI 표시
    if (error) {
        // Toast 또는 에러 메시지 표시
    }
    
    // 엔진에 따라 렌더링
}
```

### 8.2 API 호출 실패 처리
- Directions API 실패 시 직선 연결 폴백
- 에러 로깅 및 사용자 피드백 제공

---

## 9. 성능 최적화

### 9.1 동적 로딩 전략
- 필요한 SDK만 로드 (코드 스플리팅)
- 지연 로딩(Lazy Loading) 적용
- 두 SDK를 동시에 번들에 포함하지 않음

### 9.2 번들 크기 최적화
- 런타임에 필요한 SDK만 로드
- 카카오맵 SDK: 약 200KB
- 구글맵 SDK: 약 300KB
- 동적 로딩으로 초기 번들 크기 절감

---

## 10. 보안 및 비용 최적화
- **API Key**: 두 서비스 모두 도메인 제한(Referrer Restriction)을 반드시 설정하십시오.
- **할당량**: 구글맵은 해외 전용으로만 사용하여 API 호출 비용을 절감하고, 국내 데이터는 카카오맵의 무료 쿼리 범위를 활용합니다.
- **비용 절감 효과**: 국내 여행지의 경우 카카오맵 사용으로 Google Maps API 호출 비용 절감 가능

---

## 11. 현재 프로젝트 상태 및 마이그레이션 경로

### 현재 구현 상태
- ✅ `MapContainer.tsx`: Google Maps만 사용 중
- ✅ `Polyline.tsx`: Google Maps Polyline만 지원
- ✅ `app/routes/api/directions.ts`: Google Routes API v2 사용
- ✅ `DirectionsOptimizer.tsx`: Google Directions Service 사용
- ❌ 하이브리드 시스템: 미구현

### 마이그레이션 경로
1. **기존 코드 유지**: `MapContainer.tsx`는 `GoogleMapEngine`으로 리팩토링
2. **새 컴포넌트 추가**: `KakaoMapContainer.tsx`, `HybridMapContainer.tsx` 생성
3. **점진적 교체**: 기존 사용처를 하나씩 `HybridMapContainer`로 교체
4. **테스트**: 각 단계마다 테스트 수행

---

## 12. 현재 경로 표시 문제와의 연관성

### 문제 원인 분석
현재 경로가 도로를 따라 표시되지 않는 주요 원인:
1. **Google Maps의 한국 내 도로 데이터 제한**: 안보법에 따른 정밀 도로 데이터 부족
2. **Google Routes API v2의 한계**: 한국 내 `DRIVE` 모드가 제대로 작동하지 않을 수 있음
3. **응답 데이터 파싱 문제**: API 응답 구조가 예상과 다를 수 있음

### 하이브리드 시스템의 해결 효과
1. **국내 여행지**: 카카오맵 Directions API 사용으로 정확한 도로 경로 제공
2. **해외 여행지**: 구글맵 Directions API 사용으로 글로벌 경로 제공
3. **정확도 향상**: 각 지역에 최적화된 지도 서비스 사용

### 권장 해결 순서
1. **단기 (즉시)**: Google Directions API 응답 구조 확인 및 수정
2. **중기**: 하이브리드 시스템 Phase 2 (경로 통합) 구현
3. **장기**: 하이브리드 시스템 Phase 3 (Directions API 통합) 구현

