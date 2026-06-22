# CluePot Web

Next.js 기반 웹 앱입니다.

프로젝트 전체 소개는 [루트 README](../../README.md)를 참고해주세요.

## 실행 방법

1. 의존성 설치

   ```bash
   cd apps/web
   npm install
   ```

2. 개발 서버 실행

   ```bash
   npm run dev
   ```

## 환경변수

`apps/web/.env.local` 파일을 생성하고 아래 값을 채워주세요.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

# Database (Prisma)
DIRECT_URL=

# Google Gemini AI
GEMINI_API_KEY=

# Kakao Maps
NEXT_PUBLIC_KAKAO_MAP_KEY=
KAKAO_REST_API_KEY=

# Naver Blog Search
NAVER_CLIENT_ID=
NAVER_CLIENT_SECRET=
```
