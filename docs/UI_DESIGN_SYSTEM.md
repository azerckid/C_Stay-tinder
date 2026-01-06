# UI_DESIGN_SYSTEM.md

## 1. 개요
Stitch 디자인을 기반으로 한 프리미엄 다크 모드 여행지 큐레이션 서비스의 디자인 가이드라인입니다.

- https://stitch.withgoogle.com/projects/16646836401658870756
- docs/stitch/

## 2. 컬러 팔레트 (Color Palette)
Stitch HTML 디자인 파일에서 추출한 실제 컬러 값:

- **Primary**: `#25aff4` (Blue - 주요 액션 버튼, 활성 상태, 경로 표시)
- **Background Dark**: `#101c22` (메인 다크 배경)
- **Background Light**: `#f5f7f8` (라이트 모드 배경)
- **Surface Dark**: `#182b34` 또는 `#182830` (카드/컨테이너 배경)
- **Surface Light**: `#ffffff` (라이트 모드 카드 배경)
- **Action - Like**: `#25aff4` (Primary와 동일) 또는 Green (`#10b981`)
- **Action - Pass**: Red (`#ef4444` 또는 `#f87171`)
- **Text - High Emphasis**: `#FFFFFF` (다크 모드 헤딩)
- **Text - Medium Emphasis**: `#B0B0B0` 또는 `#90b7cb` (다크 모드 본문)
- **Text Secondary**: `#90b7cb` (보조 텍스트)

## 3. 타이포그래피 (Typography)
Stitch HTML에서 사용된 실제 폰트:

- **Font Family**: 
  - **Display**: `Plus Jakarta Sans` (영문 메인 폰트)
  - **Body**: `Noto Sans KR` (한국어 지원, 일부 화면에서 사용)
  - **Fallback**: `sans-serif`
- **Material Symbols**: Google Material Symbols Outlined (아이콘)
- **Font Sizes**:
  - **Heading 1**: `text-4xl` (36px), `font-extrabold` (장소 이름)
  - **Heading 2**: `text-xl` (20px), `font-bold` (섹션 타이틀)
  - **Heading 3**: `text-lg` (18px), `font-bold` (서브 섹션)
  - **Body**: `text-base` (16px), `font-medium` 또는 `font-regular` (상세 설명)
  - **Label**: `text-xs` (12px), `font-semibold` 또는 `font-medium` (카테고리 태그, 시간, 거리)
  - **Small Text**: `text-[10px]` (10px), `font-medium` (하단 네비게이션 라벨)

## 4. 핵심 UI 컴포넌트

### 4.1 Tinder Swipe Card
Stitch 디자인 기준:

- **Size**: 
  - 너비: `w-full` (뷰포트 기준), 최대 `max-w-md` (모바일 중심)
  - 높이: `max-h-[600px]` ~ `max-h-[700px]` (화면에 따라 조정)
  - 카드 스택 효과: 배경 카드는 `scale-[0.85]` ~ `scale-[0.98]`, `opacity-40` ~ `opacity-70`
- **Border Radius**: `rounded-3xl` (24px)
- **Image**: 
  - `absolute inset-0`로 전체 영역 차지
  - `bg-cover bg-center`로 이미지 배치
  - `group-hover:scale-105` 호버 효과
- **Gradient Overlay**: 
  - `bg-gradient-to-b from-black/10 via-transparent to-black/90` (상단 투명, 하단 어두움)
  - 텍스트 가독성을 위한 추가 그라데이션: `bg-gradient-to-t from-background-dark/95 via-background-dark/30 to-transparent`
- **Information Overlay**: 
  - 하단 `absolute bottom-0` 위치
  - `p-6` 패딩
  - 그라데이션 위에 텍스트 배치
- **Interaction**:
  - `Drag`: framer-motion을 사용한 드래그 인터랙션 (INTERACTION_GUIDE.md 참조)
  - `Overlay Feedback`: 스와이프 방향에 따라 'LIKE' (green) 또는 'NOPE' (red) 배지 표시
  - 회전: 스와이프 중심점으로부터의 거리에 비례하여 최대 15도 회전

### 4.2 Route Map (동선 지도)
Stitch 디자인 기준:

- **Map Container**: 
  - 높이: `h-[45vh]` (뷰포트 높이의 45%)
  - 배경: `bg-gray-800` (다크 모드)
  - 오버레이 그라데이션: `bg-gradient-to-b from-black/40 via-transparent to-background-dark`
- **Path Style**: 
  - 컬러: Primary (`#25aff4`)
  - 스타일: `stroke-dasharray="8 4"` (점선 효과)
  - 두께: `stroke-width="4"`
  - 곡선: `Q` (Quadratic Bezier) 및 `T` (Smooth Quadratic) 커맨드 사용
- **Markers**: 
  - 출발지: Primary 컬러 배경, "출발: [장소명]" 텍스트
  - 경유지: Surface Dark 배경, 장소명만 표시
  - 마커 아이콘: `size-4` 원형, 흰색 배경에 컬러 테두리
- **Current Location Effect**: 
  - 펄싱 애니메이션: `animate` 태그로 `r`과 `opacity` 변화
  - Primary 컬러 원형 마커

### 4.3 Itinerary Timeline
Stitch 디자인 기준:

- **Layout**: 
  - 좌측 수직 선: `border-l-2 border-dashed border-gray-300 dark:border-gray-800`
  - 우측 장소 정보: `pl-4`로 좌측 여백 확보
  - 항목 간격: `space-y-8`
- **Timeline Dot**: 
  - 현재 위치: Primary 컬러 (`bg-primary`), `size-5`, `border-4 border-white dark:border-background-dark`
  - 경유지: Gray (`bg-gray-400 dark:bg-gray-600`), 동일한 크기와 테두리
  - 위치: `absolute -left-[25px] top-0`
- **Transport Connector**: 
  - 이동 수단 아이콘과 시간 표시
  - `rounded-full` 배경, `bg-gray-100 dark:bg-gray-800`
  - 아이콘: Material Symbols (`directions_car`, `directions_walk` 등)
- **Card Content**: 
  - 각 장소별 카드: `bg-white dark:bg-surface-dark`, `rounded-xl`
  - 이미지: `size-16`, `rounded-lg`
  - 텍스트: `line-clamp-2`로 2줄 제한

## 5. 디자인 원칙
- **Visual WOW**: 
  - 고해상도 이미지를 전면에 배치 (`bg-cover bg-center`)
  - 미세한 그라데이션 오버레이로 텍스트 가독성 확보
  - 카드 스택 효과로 깊이감 표현
- **Micro-interactions**: 
  - 버튼 탭 시: `active:scale-[0.98]` 또는 `active:scale-95`
  - 호버 시: `hover:scale-110`, `hover:bg-primary/90` 등
  - 그룹 호버: `group-hover:` 유틸리티 활용
  - 트랜지션: `transition-all duration-300`
- **Consistency**: 
  - shadcn/ui Nova 프리셋의 정제된 컴포넌트 스타일 유지
  - Material Symbols 아이콘 일관성 유지
  - Tailwind CSS 유틸리티 클래스 활용
- **Mobile-First**: 
  - 최대 너비 `max-w-md`로 모바일 중심 설계
  - Safe area padding (`pb-safe`) 적용
  - 터치 친화적인 버튼 크기 (`size-14` ~ `size-16`)
