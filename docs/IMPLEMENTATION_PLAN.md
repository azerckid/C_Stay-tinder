# IMPLEMENTATION_PLAN.md

## 1. 프로젝트 개요
사용자가 Tinder 스타일로 여행지를 선택하고, 선택된 장소들을 최적의 경로로 연결하여 보여주는 서비스.
컨텐츠 공급자가 미리 만들어진 여행경로를 제공하는것이 아니라 사용자가 여행 경로를 직접 선택하여 최적의 경로를 찾아가는 서비스입니다.
사용자들이 만든 여행경로를 공유하여 다른 사용자들이 참고할 수 있도록 하는 서비스입니다.
https://stitch.withgoogle.com/projects/16646836401658870756

## 2. 기술 스택
- **Framework**: React Router v7
- **Styling**: Tailwind CSS v4, shadcn/ui (Nova Preset)
- **Database**: Turso (libSQL) + Drizzle ORM
- **Auth**: Better Auth
- **Animation**: Framer Motion
- **Maps**: Google Maps API / Mapbox

## 3. 작업 전략 및 우선순위

### UI/UX 우선 작업 전략
본 프로젝트는 **UI/UX 프로토타입을 먼저 완성**하여 전체적인 사용자 흐름을 확인한 후, 본격적인 백엔드 및 비즈니스 로직 구현을 진행합니다.

**이유:**
1. 사용자 경험 검증: 스와이프 인터랙션과 화면 전환의 자연스러움을 조기에 확인
2. 디자인 시스템 확립: stitch HTML 디자인을 React 컴포넌트로 변환하며 일관된 디자인 시스템 구축
3. 개발 효율성: UI가 확정된 후 API 및 데이터 구조 설계 시 더 명확한 요구사항 파악 가능
4. 빠른 피드백: 실제 동작하는 프로토타입으로 초기 피드백 수집 가능

**작업 순서:**
1. Phase 1 완료 (UI 프로토타입) → 전체 흐름 확인
2. Phase 2 시작 (인프라 구축) → 데이터베이스 및 인증
3. Phase 3 시작 (비즈니스 로직) → 실제 데이터 연동
4. Phase 4 시작 (고도화) → 지도 통합 및 모바일 패키징

## 4. 세부 단계 계획

### Phase 1: 디자인 시스템 및 UI 프로토타입 (현재 단계)

#### 1.1 프로젝트 초기화 및 기본 설정
- [x] React Router v7 프로젝트 초기화 (Vite)
- [x] Tailwind CSS v4 설정 및 컬러 팔레트 구성 (stitch 기준)
- [x] shadcn/ui 설치 및 Nova 프리셋 적용
- [x] 폰트 설정 (Plus Jakarta Sans, Noto Sans KR)
- [ ] Material Symbols 아이콘 설정 (현재 Lucide-react로 대체됨)

#### 1.2 디자인 토큰 및 공통 컴포넌트
- [x] Tailwind 컬러 확장 설정 (`primary`, `background-dark`, `surface-dark` 등)
- [x] 공통 버튼 컴포넌트 (shadcn/ui 기반)
- [x] 공통 카드 컴포넌트 (`SwipeCard`)
- [x] 하단 네비게이션 바 컴포넌트 (`home.tsx` 내 구현)
- [x] 상단 앱 바 컴포넌트 (`home.tsx` 내 구현)

#### 1.3 핵심 화면 구현 (순서대로)

- [x] **화면 1: 여행지 스와이프 선택 화면**
  - [x] Tinder 스타일 카드 컴포넌트 (`SwipeCard`)
  - [x] framer-motion 스와이프 인터랙션 구현
  - [x] 카드 스택 효과 (배경 카드들)
  - [x] 하단 액션 버튼 (Pass, Like)
  - [x] 하단 네비게이션 바
  - [x] 상단 앱 바 (로고, 설정 버튼)
  - [x] 실시간 모션 연동 (배경 카드 Scale, Blur, Opacity)
  - [x] 무한 스와이프 루프 구현

- [x] **화면 2: 선택 여행지 상세 정보 화면**
  - [x] Hero 이미지 섹션 (그라데이션 오버레이 포함)
  - [x] 상단 네비게이션 오버레이 (뒤로가기, 즐겨찾기, 공유)
  - [x] 상세 정보 레이아웃 (소개, 태그, 리뷰 요약)
  - [x] 위치 확인 및 지도 미리보기 (Mock 이미지 연동)
  - [x] 하단 고정 CTA 버튼 ("동선 보기")
  - [x] 스와이프 스택(SwipeStack)과의 인터랙션 연동

- [x] **화면 3: 선택 여행지 추천 동선 화면**
  - [x] 지도 영역 (Mock 이미지 사용)
  - [x] 상단 네비게이션 오버레이 (뒤로가기, 편집, 즐겨찾기)
  - [x] 하단 시트 (Bottom Sheet) 레이아웃
  - [x] 여행 요약 헤더 (장소 수, 총 시간, 거리)
  - [x] 타임라인 리스트 (각 장소별 카드, 이동 수단 연결선)
  - [x] 하단 액션 바 ("동선 따라 시작하기" 버튼)
  - [x] 하단 네비게이션 바 추가

#### 1.4 화면 간 전환 및 네비게이션
- [x] React Router v7 라우팅 설정
  - [x] `/` - 스와이프 선택 화면
  - [x] `/destination/:id` - 상세 정보 화면 (UX 개선을 위해 모달 오버레이 방식으로 변경됨)
  - [x] `/route` - 동선 화면
- [x] 라우트 간 네비게이션 연결
  - [x] 하단 네비게이션 바 링크 연결
  - [x] 상세 화면의 "동선 보기" 버튼 연결
  - [x] SwipeStack의 상세 화면 이동 로직 구현
- [x] 선택된 여행지 상태 관리 (Context API 사용)
- [ ] Shared Element Transition (선택적, framer-motion) - 향후 개선 사항

### Phase 2: 데이터베이스 및 인프라 구축 (완료)
- [x] Drizzle ORM 설치 및 설정
- [x] DB 스키마 설계 및 마이그레이션
  - `places` 테이블 (여행지 정보)
  - `trips` 테이블 (사용자 여행 계획)
  - `selections` 테이블 (스와이프 선택 결과 - userSwipes)
  - `user`, `session`, `account` 테이블 (Better Auth)
- [x] Turso (libSQL) 데이터베이스 연결
- [x] Better Auth 인증 연동 (Google 로그인)
- [x] 환경 변수 설정 (.env 파일)

### Phase 3: 핵심 비즈니스 로직 (완료)
- [x] 여행지 데이터 구축
  - [x] Mock 데이터 생성 및 DB Seeding
  - [x] Home 라우트 Loader를 통한 실제 데이터 조회
- [x] 스와이프 결과 관리
  - [x] 스와이프 액션(API) 구현 및 UserSwipes 테이블 저장
  - [x] 스와이프 UI와 API 연동 (낙관적 업데이트)
- [x] 여행 계획 생성 로직
  - [x] 'Like'한 장소 기반 여행 생성(Trip/TripItems) API 구현
  - [x] 동선 화면(Itinerary)에서 생성 API 호출 및 Toast 알림 적용

### Phase 4: 지도 서비스 통합 및 고도화 (진행 완료)
- [x] 지도 API 통합 (Google Maps)
  - [x] `@vis.gl/react-google-maps` 라이브러리 설치 및 설정
  - [x] 지도 뷰 컴포넌트 구현 (동선 화면 배경 지도 및 마이 여행 상세 지도)
  - [x] 여행지 마커(Marker) 커스텀 구현
  - [x] **정밀 경로(Polyline) 구현**
    - [x] Google Places API 연동: 명칭 기반 `Place ID` 추출로 도로 진입점 정밀 타격
    - [x] Google Directions API 전략: 한국 내 `DRIVING` 모드 한계를 극복하기 위해 `TRANSIT` 모드 및 상세 `legs/steps` 경로 파싱 적용
    - [x] 도로 연결 불가 시(예: 섬) 직선 Fallback 로직 구현
- [x] 여행 계획 상세 및 관리 (My Trips)
  - [x] 내 여행 목록 페이지 (`/trips`) 구현 (목록 조회 및 삭제 기능 포함)
  - [x] 여행 상세 페이지 (`/trips/:tripId`) 구현 (저장된 동선 지도 확인 가능)
  - [x] 동선 생성 전 장소 개별 삭제(`X` 버튼) 기능 추가 (동선 최적화 편집)

### Phase 5: 향후 고도화 및 서비스 전환 (예정)
- [ ] **지도 서비스 이원화 정책 (Dual Map Strategy)**
    - **국내 (South Korea)**: **네이버(Naver) 또는 카카오(Kakao) 지도** 도입
        - 사유: 국내 안보법에 따른 구글 맵의 정밀 도로/도보 데이터 부족 해결 및 국내 특화 기능 제공
    - **국외 (International)**: **구글 맵(Google Maps)** 유지
        - 사유: 글로벌 표준 지도 서비스로서 전 세계 어디에서나 안정적인 데이터 제공 및 확장성 보장
- [ ] **지도 엔진 전환 연구**
    - 현재의 `DirectionsOptimizer` 인터페이스를 유지하면서, 사용자 장소의 국가 정보에 따라 엔진을 동적으로 전환하는 로직 설계
- [ ] **모바일 패키징 (Capacitor)**
  - [ ] iOS/Android 빌드 환경 구성
  - [ ] 모바일 네이티브 기능 테스트

## 5. 구현 시 참고 사항

### 디자인 파일 참조
- 모든 UI 구현은 `docs/stitch/` 폴더의 HTML 파일을 기준으로 합니다.
- stitch HTML의 실제 컬러, 폰트, 레이아웃 값을 그대로 사용합니다.
- 디자인 시스템 상세 사항은 `docs/UI_DESIGN_SYSTEM.md`를 참조하세요.
- 인터랙션 및 애니메이션 사양은 `docs/INTERACTION_GUIDE.md`를 참조하세요.

### 컴포넌트 구조 제안
```
app/
├── components/
│   ├── ui/              # shadcn/ui 기반 공통 컴포넌트
│   ├── swipe/           # 스와이프 관련 컴포넌트
│   │   ├── SwipeCard.tsx
│   │   └── SwipeStack.tsx
│   ├── destination/     # 여행지 상세 관련 컴포넌트
│   │   ├── HeroSection.tsx
│   │   └── AttractionCarousel.tsx
│   ├── route/           # 동선 관련 컴포넌트
│   │   ├── RouteMap.tsx
│   │   └── TimelineItem.tsx
│   └── layout/          # 레이아웃 컴포넌트
│       ├── AppBar.tsx
│       └── BottomNav.tsx
├── routes/              # React Router v7 라우트
│   ├── _index.tsx       # 스와이프 선택 화면
│   ├── destination.$id.tsx  # 상세 정보 화면
│   └── route.tsx        # 동선 화면
└── lib/
    ├── constants.ts     # 상수 (컬러, 폰트 등)
    └── utils.ts         # 유틸리티 함수
```

### Mock 데이터 구조 (Phase 1용)
```typescript
interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}
```

## 6. 안전 및 규칙 준수
- 모든 DB 변경 전 백업 필수.
- 이모지 사용 금지 등 전문적 소통 유지.
- `Side-Effect Isolation` 원칙에 따른 로직 격리.
