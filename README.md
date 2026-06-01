# CluePot

> AI가 모두에게 공정한 모임 장소를 찾아주는 조율 플랫폼

<br/>

## 1. 프로젝트 소개

여럿이 모일 때 "어디서 만날까요?"는 항상 어렵습니다. 누군가는 멀고, 누군가는 가깝고, 취향도 다 다릅니다.

**CluePot**은 참가자 각자의 출발지·교통수단·분위기 선호를 수집해, 이동 부담이 균등하고 모두가 만족할 수 있는 장소를 AI가 추천해주는 서비스입니다.

- 다수결 방식이 아닌 **이동 시간 균형**을 기준으로 중간 지점을 계산해요
- 카카오맵 실존 장소 + 네이버 블로그 **실방문 후기**를 기반으로 추천해요
- 광고성 후기를 필터링해 **신뢰할 수 있는 정보**만 사용해요

<br/>

## 2. 스크린샷

| 랜딩 페이지 | 참가자 선호 입력 |
|:-----------:|:---------------:|
| ![랜딩](docs/screenshots/landing.png) | ![선호 입력](docs/screenshots/preference.png) |

| PINI 장소 추천 결과 | 일정 확정 화면 |
|:-------------------:|:--------------:|
| ![추천 결과](docs/screenshots/pini-result.png) | ![일정 확정](docs/screenshots/schedule.png) |

<br/>

## 3. 주요 기능

| 기능 | 설명 |
|------|------|
| 모임 방 생성 | 카테고리(카페·음식점·술집 등) 선택 후 고유 코드로 방 생성 |
| 코드로 참가 | 6자리 초대 코드만으로 로그인 없이도 방 참가 가능 |
| 선호 정보 입력 | 출발 지역, 교통수단(도보·자전거·대중교통·자가용), 이동 거리 선호, 분위기 선호 수집 |
| PINI 모드 | 모든 참가자가 준비되면 호스트가 AI 장소 추천 실행 |
| 이동 시간 균등화 | Haversine + 속도 역가중 중심점으로 모두의 이동 부담을 공평하게 배분 |
| 리뷰 신뢰 검증 | 네이버 블로그 후기에서 광고·협찬 필터링 후 Gemini AI가 분석 |
| 일정 확정 | 장소 선택 후 날짜·시간 입력으로 일정 확정, 카카오맵 연동 |
| 캘린더 | 내가 참여한 확정 일정 목록 조회 |
| 초대 링크 관리 | 링크 4시간 유효, 호스트가 연장 가능 |

<br/>

## 4. 기술 스택

### Frontend
| 분류 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| 전역 상태 관리 | Zustand v5 |
| 지도 | Kakao Maps JS SDK |

### Backend
| 분류 | 기술 |
|------|------|
| API | Next.js Server Actions, API Routes |
| 인증 | Supabase Auth (SSR 쿠키 기반) |
| ORM | Prisma v7 |
| DB | PostgreSQL (Supabase) |

### AI / 외부 API
| 분류 | 기술 |
|------|------|
| AI 추론 | Google Gemini 2.0 Flash Lite (ThinkingLevel.MEDIUM) |
| 장소 검색 | Kakao Local API |
| 지오코딩 | Kakao Geocoding API |
| 리뷰 수집 | Naver Blog Search API |

### 인프라
| 분류 | 기술 |
|------|------|
| 배포 | Vercel |
| DB 호스팅 | Supabase |

<br/>

## 5. 아키텍처

```
┌─────────────────────────────────────────────────┐
│                  Next.js App Router              │
│                                                  │
│  ┌────────────────┐     ┌──────────────────────┐ │
│  │ Server Actions │     │   API Route /api/pini │ │
│  │  (auth, rooms, │     │                      │ │
│  │   schedule)    │     │  1. 지오코딩          │ │
│  └───────┬────────┘     │  2. 가중 중심점 계산  │ │
│          │              │  3. 카카오 장소 검색  │ │
│  ┌───────▼────────┐     │  4. 네이버 리뷰 수집  │ │
│  │  Prisma ORM    │     │  5. Gemini 분석       │ │
│  └───────┬────────┘     │  6. 이동시간 계산     │ │
│          │              └──────────┬───────────┘ │
└──────────┼───────────────────────┼──────────────┘
           │                       │
   ┌───────▼───────┐     ┌─────────▼──────────────┐
   │  Supabase DB  │     │     External APIs       │
   │  (PostgreSQL) │     │  Kakao / Naver / Gemini │
   └───────────────┘     └────────────────────────┘

Client: React 19 + Zustand (지도·추천결과·일정 전역 상태)
```

**주요 흐름**

1. 모임 생성 → 고유 코드 발급 (nanoid)
2. 참가자 코드 입력 → 방 참가 & 선호 정보 입력
3. 모든 참가자 준비 완료 → 호스트가 PINI 실행
4. PINI: 지오코딩 → 가중 중심점 → 장소 검색 → 리뷰 분석 → 장소 추천
5. 호스트 장소 선택 → 날짜·시간 입력 → 일정 확정

<br/>

## 6. ERD

<img width="500" height="700" alt="ERD" src="https://github.com/user-attachments/assets/3e1567b2-71d9-4825-8435-a12bc41b00b6" />

<br/>

## 7. 주요 구현 내용

### PINI 엔진 — 공정한 중간지점 계산

단순 좌표 평균이 아닌 **속도 역가중 중심점**을 사용합니다.

```
weight = 1 / 해당_교통수단_속도(km/h)
centroid = Σ(coord × weight) / Σ(weight)
```

느린 수단(도보 4.5km/h)을 사용하는 참가자는 가중치가 높아져 중심점이 그 쪽으로 당겨집니다. 결과적으로 도보 이용자는 가깝게, 자가용 이용자는 멀게 → **실제 이동 시간이 균등해집니다**.

### Haversine 거리 계산 + 도로계수 보정

직선거리를 실제 경로 거리로 보정합니다.

| 교통수단 | 도로계수 | 속도 |
|----------|----------|------|
| 도보 | 1.2 | 4.5 km/h |
| 자전거 | 1.2 | 15 km/h |
| 자동차 | 1.3 | 35 km/h |
| 대중교통 | 1.3 + 대기 10분 overhead | 35 km/h |

### Gemini AI 리뷰 분석

- `ThinkingLevel.MEDIUM` 적용으로 단순 요약이 아닌 **리뷰 신뢰도 판단** 수행
- 응답 스키마를 명시해 JSON 구조 보장 (`responseMimeType: "application/json"`)
- 503 과부하 시 **지수 백오프** 재시도 (1s → 2s → 4s, 최대 3회)

### 네이버 블로그 광고 필터링

```ts
const adKeywords = /협찬|광고|제공|소정의 원고료|지원받아/i;
```

제목·본문에 광고 키워드가 포함된 후기를 사전 제거 후 AI 분석 입력.

### 데스크탑 2-패널 그리드 전환

PINI 결과 수신 시 CSS `grid-template-columns`를 애니메이션으로 전환합니다.

```
결과 전: grid-cols-[1fr_360px]  →  결과 후: grid-cols-[360px_1fr]
```

expo-out 커브(`cubic-bezier(0.16, 1, 0.3, 1)`)로 패널이 자연스럽게 자리를 잡습니다. 모달 없이 페이지가 공간을 직접 소유하는 방식으로, 좁은 오버레이 문제를 해결했습니다.

### Supabase SSR 인증

클라이언트·서버 모두 쿠키 기반으로 세션을 유지합니다. `middleware.ts`에서 모든 요청마다 세션을 갱신해 토큰 만료를 방지합니다.

<br/>

## 8. 트러블슈팅

### 1. PINI 결과에 현재 유저의 선호가 반영되지 않음

**문제:** 참가자가 선호를 저장한 직후 PINI를 실행하면 본인의 선호가 반영되지 않은 결과가 나옴.

**원인:** PINI 실행 시 `participants` 배열을 DB에서 가져온 값 그대로 사용했는데, `savePreference` 이후 `participants`를 재조회하지 않아 현재 유저의 데이터가 이전 값(빈 값)이었음.

**해결:** PINI 요청 페이로드 구성 시 현재 유저는 DB 값 대신 로컬 상태(`myLocation`, `myTransports` 등)를 사용하도록 분기 처리.

```ts
participants.map(p => {
  if (isMe(p)) {
    return { ...localState }; // DB 재조회 없이 정확한 값 사용
  }
  return { ...p }; // 다른 참가자는 DB 값
})
```

---

### 2. 참가자 재참가 시 leftAt 초기화 누락

**문제:** 한 번 방을 나간 사람이 다시 초대 링크로 들어오면 참가자 목록에 표시되지 않고, PINI 실행 시 해당 인원이 제외됨.

**원인:** `upsert` 시 `update` 절이 비어 있어 `leftAt` 필드가 초기화되지 않았음.

**해결:** `update` 절에 `leftAt: null` 추가.

```ts
update: { leftAt: null }, // 재참가 시 퇴장 기록 초기화
```

---

### 3. 초대 코드 만료 후 기존 참가자도 방 접속 차단

**문제:** 초대 링크가 만료된 후 이미 참가 중인 멤버가 새로고침하면 방에서 튕겨나가는 현상 발생.

**원인:** `linkExpiresAt` 유효성 검사를 신규 입장과 기존 멤버 접속에 동일하게 적용했음.

**해결:** 신규 입장용 `validateRoom`(초대코드 만료 검사)과 기존 멤버용 `checkRoomExists`(방 존재 여부만 확인)를 분리.

```ts
// 기존 멤버 — 초대 코드 만료와 무관하게 방이 존재하면 접속 허용
export async function checkRoomExists(roomCode: string) {
  const room = await prisma.room.findUnique({ where: { roomCode } });
  return { exists: Boolean(room) };
}
```

---

### 4. Zustand 전역 상태 새로고침 시 초기화로 확정 상태 소실

**문제:** 이미 일정이 확정된 방에서 새로고침하면 `scheduleInfo`가 null로 초기화돼 확정 화면이 아닌 대기 화면이 렌더링됨.

**원인:** Zustand는 메모리 상태라 새로고침 시 초기화되는데, 확정 여부를 전적으로 클라이언트 상태에만 의존했음.

**해결:** 페이지 마운트 시 `getScheduleByRoomCode`로 DB를 조회해 확정된 일정이 있으면 Zustand에 복원.

```ts
const existing = await getScheduleByRoomCode(roomCode);
if (existing) {
  useScheduleStore.getState().setSchedule({ ... });
}
```

---

### 5. 약속 시간 KST/UTC 불일치

**문제:** 일정 확정 시 "오후 3시"로 저장했는데, 캘린더에서 "오전 6시"로 표시됨.

**원인:** `<input type="datetime-local">`의 값은 로컬 시간이지만 DB 저장 시 UTC로 변환되었고, 조회 시에도 UTC 기준으로 표시됨.

**해결:** 저장 시 KST(+09:00) 오프셋을 명시적으로 붙여 ISO 문자열 생성.

```ts
const kst = value.replace("T", " ") + ":00+09:00";
```

---

### 6. PINI 교통수단 배열 오류

**문제:** 참가자 선호 저장 시 `transports`가 단일 문자열로 저장되어 PINI 실행 시 배열 처리에서 오류 발생.

**원인:** Server Action에서 배열 래핑 누락.

**해결:** 저장 시 항상 배열로 감싸도록 통일하고, PINI 엔진에서도 방어적으로 처리.

---

### 7. Gemini 503 과부하

**문제:** 사용자가 몰릴 때 Gemini API가 503을 반환하며 추천이 중단됨.

**원인:** Gemini 서버 일시적 과부하.

**해결:** 지수 백오프 재시도 로직 추가. 1초 → 2초 → 4초 간격으로 최대 3회 재시도 후 사용자에게 안내 메시지 표시.

---

### 8. iOS Safari 모바일 그리드 레이아웃

**문제:** iOS Safari에서 암묵적 CSS Grid 트랙이 생성되어 좌측에 ~15px 빈 컬럼이 생김.

**원인:** `lg:grid`가 모바일 환경에서도 Grid 컨텍스트를 생성하면서 암묵적 트랙 생성.

**해결:** 모바일에서는 `flex flex-col`을 기본으로 사용하고, `lg:grid`는 데스크탑에서만 적용.

---

### 9. 비로그인 CTA 클릭 후 로그인 시 원래 경로 미복원

**문제:** 비로그인 상태에서 "새 모임 만들기"를 클릭하면 로그인 페이지로 이동하고, 로그인 완료 후 홈으로만 이동해 사용자가 다시 버튼을 눌러야 함.

**해결:** CTA 링크에 `?redirect=` 쿼리 파라미터를 추가해 로그인 완료 후 원래 경로로 리다이렉트.

---

### 10. 좌표 획득 실패 시 AI Fallback

**문제:** 카카오 지오코딩 API가 일부 지역명("홍대 근처" 등 구어체)을 처리하지 못해 중심점 계산 불가.

**해결:** 유효 좌표를 하나도 얻지 못한 경우 Gemini에게 "서울 내 공정한 중간 지점 구/동명"을 추론하도록 fallback 처리 추가.

<br/>

## 9. 실행 방법

### 사전 요구사항

- Node.js 20+
- Supabase 프로젝트
- Kakao Developers 앱 (REST API 키)
- Naver Developers 앱 (검색 API)
- Google AI Studio (Gemini API 키)

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/your-username/cluepot.git
cd cluepot

# 패키지 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 파일에 아래 값들을 채워주세요

# DB 마이그레이션
npx prisma migrate deploy

# 개발 서버 실행
npm run dev
```

### 환경변수

`.env.local` 

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Database (Prisma)
DIRECT_URL=

# Google Gemini AI
GEMINI_API_KEY=

# Kakao Maps
KAKAO_REST_API_KEY=

# Naver Blog Search
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```

<br/>

## 10. 배포 주소

**https://cluepot.vercel.app**
