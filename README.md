# JR 게이토스 (JR Gators) 농구팀 관리 앱

카카오톡 연동 농구팀 관리 웹 애플리케이션

## 주요 기능

- **카카오 로그인** - 카카오 OAuth 2.0 인증
- **출석 관리** - 셀프 체크인 + 관리자 확인 시스템
- **회비 관리** - 월별 납부 현황, 계좌 정보 표시
- **팀 소개** - 팀 정보, 회원 명단, 운동 일정
- **신입부원 모집** - 가입 신청 및 관리자 승인
- **관리자 대시보드** - 회원/회비/팀 정보 관리

## 기술 스택

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3)
- **Auth**: Kakao OAuth 2.0 + JWT

## 시작하기

### 1. 의존성 설치
```bash
npm run install:all
```

### 2. 환경변수 설정
```bash
cp .env.example server/.env
# server/.env 파일을 수정하세요
```

### 3. 개발 서버 실행
```bash
npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3001

### 4. 카카오 개발자 앱 설정

1. [developers.kakao.com](https://developers.kakao.com)에서 앱 생성
2. REST API 키와 JavaScript 키를 `.env`에 입력
3. Redirect URI 등록: `http://localhost:5173/auth/kakao/callback`

> 카카오 앱 등록 전에도 **개발용 로그인**으로 앱을 테스트할 수 있습니다.

## 팀 정보

- **팀명**: 제이알 게이토스 (JR Gators)
- **회장**: 김현석
- 
