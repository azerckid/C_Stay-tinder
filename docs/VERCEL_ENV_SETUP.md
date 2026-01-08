# Vercel 배포 환경 변수 설정 가이드

## 문제 상황

Vercel 배포 환경에서 경로가 그려지지 않는 주요 원인:
1. **카카오맵 SDK 로드 실패**: 클라이언트 사이드 환경 변수 누락
2. **Directions API 실패**: 서버 사이드 환경 변수 접근 문제

## 환경 변수 설정

Vercel에서는 **서버 사이드**와 **클라이언트 사이드** 환경 변수를 구분해야 합니다.

### Vercel 대시보드 설정 방법

1. Vercel 프로젝트 → **Settings** → **Environment Variables** 이동
2. 다음 환경 변수들을 추가:

#### 클라이언트 사이드 (VITE_ 접두사 필수)
- `VITE_KAKAO_MAP_APP_KEY`: 카카오맵 JavaScript SDK용 앱 키
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps JavaScript API 키 (선택사항, 클라이언트에서 직접 사용하는 경우)

#### 서버 사이드 (VITE_ 접두사 없음)
- `KAKAO_MAP_REST_API_KEY`: 카카오 Directions API용 REST API 키
- `GOOGLE_MAPS_API_KEY`: Google Routes API v2용 API 키

### 환경별 설정

각 환경 변수에 대해 다음 환경을 선택:
- ✅ **Production**
- ✅ **Preview**  
- ✅ **Development**

### 환경 변수 이름 규칙

| 용도 | 클라이언트 사이드 | 서버 사이드 |
|------|------------------|------------|
| 카카오맵 SDK | `VITE_KAKAO_MAP_APP_KEY` | - |
| 카카오 Directions API | - | `KAKAO_MAP_REST_API_KEY` |
| 구글맵 SDK | `VITE_GOOGLE_MAPS_API_KEY` | - |
| 구글 Directions API | - | `GOOGLE_MAPS_API_KEY` |

### 코드에서의 사용

#### 클라이언트 사이드 (브라우저)
```typescript
// root.tsx, 컴포넌트 등
const kakaoKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY;
```

#### 서버 사이드 (API 라우트)
```typescript
// app/routes/api/directions.ts 등
const kakaoKey = process.env.KAKAO_MAP_REST_API_KEY || process.env.VITE_KAKAO_MAP_REST_API_KEY;
```

## 설정 확인 방법

### 1. 배포 후 확인
배포 완료 후 브라우저 콘솔에서 확인:
- ✅ 카카오맵 SDK 로드 성공 메시지
- ❌ "SDK Load Timeout" 에러가 없어야 함

### 2. API 응답 확인
브라우저 개발자 도구 → Network 탭:
- `/api/directions` 요청이 성공적으로 응답하는지 확인
- 응답 상태 코드가 200인지 확인

### 3. Vercel 로그 확인
Vercel 대시보드 → **Deployments** → 최신 배포 → **Functions** 탭:
- 서버 사이드 로그에서 환경 변수 관련 에러 확인
- `[Direction API]` 로그 메시지 확인

## 문제 해결

### 카카오맵 SDK가 로드되지 않는 경우

1. **환경 변수 확인**:
   - Vercel 대시보드에서 `VITE_KAKAO_MAP_APP_KEY`가 설정되어 있는지 확인
   - 값이 올바른지 확인 (앱 키 형식 확인)

2. **재배포**:
   - 환경 변수 변경 후 자동 재배포가 되지 않으면 수동으로 재배포

3. **브라우저 캐시 클리어**:
   - 하드 리프레시 (Ctrl+Shift+R 또는 Cmd+Shift+R)

### Directions API가 실패하는 경우

1. **서버 사이드 환경 변수 확인**:
   - `KAKAO_MAP_REST_API_KEY` 또는 `GOOGLE_MAPS_API_KEY` 설정 확인
   - Vercel Functions 로그에서 에러 메시지 확인

2. **API 키 권한 확인**:
   - 카카오 REST API 키가 Directions API 권한을 가지고 있는지 확인
   - Google Maps API 키가 Routes API 권한을 가지고 있는지 확인

3. **도메인 제한 확인**:
   - API 키의 도메인 제한이 Vercel 도메인을 포함하는지 확인

## 로컬 개발 환경

로컬 개발 시 `.env` 파일에 다음을 추가:

```env
# 클라이언트 사이드
VITE_KAKAO_MAP_APP_KEY=your_kakao_app_key
VITE_GOOGLE_MAPS_API_KEY=your_google_api_key

# 서버 사이드 (로컬에서는 VITE_ 접두사 있어도 작동)
KAKAO_MAP_REST_API_KEY=your_kakao_rest_api_key
VITE_KAKAO_MAP_REST_API_KEY=your_kakao_rest_api_key  # 호환성
GOOGLE_MAPS_API_KEY=your_google_api_key
VITE_GOOGLE_MAPS_API_KEY=your_google_api_key  # 호환성
```

## 참고 사항

- Vercel은 빌드 타임에 `VITE_*` 환경 변수를 클라이언트 번들에 주입합니다
- 서버 사이드 런타임에서는 `VITE_*` 접두사가 있는 환경 변수에 접근할 수 없습니다
- 코드는 두 가지 형식을 모두 지원하도록 작성되어 있습니다 (호환성)
