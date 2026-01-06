# INTERACTION_GUIDE.md

## 1. 개요
사용자의 몰입감을 높이기 위한 애니메이션 및 인터랙션 사양을 정의합니다. 모든 인터랙션은 `framer-motion` 라이브러리를 기반으로 설계되었습니다.

## 2. Tinder Swipe 인터랙션 (Main Interface)

### 2.1 Drag & Physics
- **Rotation**: 스와이프 중심점으로부터의 거리에 비례하여 최대 15도 회전.
- **Velocity**: 사용자의 스와이프 속도를 감지하여 일정 수준 이상일 때 카드 날리기 트리거.
- **Restoration**: 스와이프 거리가 짧으면 제자리로 돌아오는 탄성(`spring`) 효과.

### 2.2 Visual Feedback (Overlays)
- **Swipe Right**: 'LIKE' 텍스트/아이콘이 녹색/분홍색으로 서서히 나타남.
- **Swipe Left**: 'NOPE' 텍스트/아이콘이 흰색/빨간색으로 서서히 나타남.
- **Background Transition**: 선택 시 배경색이 해당 장소의 메인 컬러로 미세하게 변함.

## 3. 화면 전환 (Transitions)

### 3.1 Card to Detail View
- **Shared Element Transition**: 카드의 이미지가 상세 페이지의 헤더 이미지로 부드럽게 확장됨.
- **Spring**: `stiffness: 300`, `damping: 30` 설정으로 자연스러운 움직임.

### 3.2 Discovery to Itinerary (동선 생성)
- **Map Focus**: 스와이프 완료 후 지도로 전환될 때, 선택된 모든 마커를 포함하는 영역으로 `fitBounds` 애니메이션.
- **Path Drawing**: 지도 위에 경로가 실시간으로 그려지는 `dash-offset` 애니메이션.

## 4. 정보 계층 애니메이션 (Stagger)
- 리스트나 타임라인이 나타날 때, 항목들이 위에서 아래로 순차적으로 나타나는 효과 (`staggerChildren: 0.1`).

## 5. 입력 및 피드백
- **Haptic (모바일 전용)**: 스와이프 완료 시 강도 낮은 진동 피드백.
- **Loading State**: 스켈레톤(Skeleton) 인터페이스 및 부드러운 펄스(Pulse) 효과.

## 6. 구현 전략 및 가드레일 (Strategy & Guard Rails)

### 6.1 컴포넌트 재사용 및 격리 (Polymorphism & Isolation)
- **공통 컴포넌트 활용**: `SwipeCard`, `SwipeStack` 등 핵심 컴포넌트는 전용 화면뿐만 아니라 일반 채팅 내 장소 추천 등에서도 재사용 가능하도록 설계합니다.
- **영향 범위 관리(Impact Scope)**: 공유 로직을 수정할 때는 기존 기능(예: 일반 채팅)에 영향이 가지 않도록 조건문(Guard Check) 등을 통해 로직을 명확히 격리합니다.
- **확장성**: `onSuccess`, `onSkip` 등의 콜백을 통해 각 상황에 맞는 비즈니스 로직을 주입받아 처리합니다.

### 6.2 데이터 정합성 (Data Integrity)
- **백업 우선**: 모든 데이터베이스 마이그레이션이나 구조 변경 전에는 반드시 데이터 백업(Dump)을 수행합니다.
- **표준 준수**: 단순한 'patch' 성격의 수정보다는 공식적이고 표준적인 아키텍처를 지향합니다.
