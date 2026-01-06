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

- [ ] **화면 2: 선택 여행지 상세 정보 화면**
  - Hero 이미지 섹션 (고정 높이, 그라데이션 오버레이)
  - 상단 네비게이션 오버레이 (뒤로가기, 즐겨찾기, 공유)
  - 상세 정보 레이아웃 (소개, 태그, 주요 관광지 캐러셀, 리뷰 요약)
  - 하단 고정 CTA 버튼 ("동선 보기")

- [ ] **화면 3: 선택 여행지 추천 동선 화면**
  - 지도 영역 (Mock 이미지 또는 실제 지도 API)
  - 상단 네비게이션 오버레이 (뒤로가기, 편집, 즐겨찾기)
  - 하단 시트 (Bottom Sheet) 레이아웃
  - 여행 요약 헤더 (장소 수, 총 시간, 거리)
  - 타임라인 리스트 (각 장소별 카드, 이동 수단 연결선)
  - 하단 액션 바 ("동선 따라 시작하기" 버튼)

#### 1.4 화면 간 전환 및 네비게이션
- [ ] React Router v7 라우팅 설정
  - `/` - 스와이프 선택 화면
  - `/destination/:id` - 상세 정보 화면
  - `/route` - 동선 화면
- [ ] 라우트 간 네비게이션 연결
- [ ] Shared Element Transition (선택적, framer-motion)

### Phase 2: 데이터베이스 및 인프라 구축
- [ ] Drizzle ORM 설치 및 설정
- [ ] DB 스키마 설계 및 마이그레이션
  - `places` 테이블 (여행지 정보)
  - `trips` 테이블 (사용자 여행 계획)
  - `selections` 테이블 (스와이프 선택 결과)
  - `users` 테이블 (사용자 정보)
- [ ] Turso (libSQL) 데이터베이스 연결
- [ ] Better Auth 인증 연동 (Google, Kakao 로그인)
- [ ] 환경 변수 설정 (.env 파일)

### Phase 3: 핵심 비즈니스 로직
- [ ] 여행지 데이터 구축
  - Mock 데이터 생성 (초기 개발용)
  - 또는 실제 여행지 API 연동 (선택적)
- [ ] 스와이프 결과 관리
  - 세션 기반 임시 저장 (선택한 여행지 목록)
  - DB 저장 (사용자별 선택 히스토리)
- [ ] 최적 경로 계산 알고리즘
  - 선택된 여행지들의 위도/경도 기반
  - TSP (Traveling Salesman Problem) 근사 알고리즘 적용
  - 또는 Google Maps Directions API 활용

### Phase 4: 지도 서비스 통합 및 고도화
- [ ] 지도 API 통합
  - Google Maps API 또는 Mapbox 선택
  - 다크 모드 테마 적용
  - 경로(Polyline) 그리기
  - 마커 표시 및 커스텀 스타일링
- [ ] 실시간 동선 안내 기능
  - 현재 위치 추적
  - 다음 장소로의 네비게이션 시작
  - 경로 이탈 알림 (선택적)
- [ ] Capacitor를 활용한 모바일 패키징
  - iOS 네이티브 앱 빌드
  - Android 네이티브 앱 빌드
  - 네이티브 기능 연동 (위치 서비스, 푸시 알림 등)
- [ ] PWA 지원
  - Service Worker 설정
  - 오프라인 기능 (선택적)
  - 홈 화면 추가 기능

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
