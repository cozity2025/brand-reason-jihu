# 브랜드의 이유

사입 생활용품 셀러를 위한 **브랜드 차별화 가이드 판매 사이트**입니다. 과제용 데모이며 실제 결제는 이루어지지 않습니다.

- 운영 주소: https://brand-reason-jihu.vercel.app

## 페이지

| 경로 | 설명 |
| --- | --- |
| `/` | 브랜드 차별화 가이드 판매 페이지 |
| `/membership` | 상세페이지 첨삭 멤버십 (월 구독: 라이트·스탠다드·프로) |
| `/admin/backups` | 관리자 데이터 백업 페이지 (검색 노출 차단, 캐시 비활성화) |

## 파일 구조

| 파일 | 설명 |
| --- | --- |
| `index.html` | 메인 페이지 (가이드 판매) |
| `membership.html` | 첨삭 멤버십 페이지 |
| `admin/backups.html` | 관리자 데이터 백업 페이지 |
| `api/admin/backup.js` | 백업 API (Vercel 서버 함수) |
| `api/_lib/db.js` | 사이트 데이터 저장소 모듈 (상품·멤버십·커리큘럼·페이지·관리자 등) |
| `vercel.json` | Vercel 설정 (cleanUrls, `/admin/*` 보안·캐시 헤더) |
| `favicon.ico`, `favicon.svg`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | 파비콘 및 앱 아이콘 |
| `site.webmanifest` | 웹 앱 매니페스트 |
| `sitemap.xml` | 검색엔진용 사이트맵 (`/`, `/membership`) |
| `robots.txt` | 크롤러 규칙 (`/admin/`, `/api/` 차단) |
| `.gitignore` | Git 제외 목록 (`.vercel`) |

## 백업 API

- `GET /api/admin/backup?format=json` — 전체 데이터를 JSON으로 백업
- `GET /api/admin/backup?format=csv&table=<표>` — 표 하나를 CSV로 백업 (`table`: `products`, `memberships`, `curriculum`, `pages`, `admins`)

**민감 필드 제외 규칙:** 키 이름에 `password`, `passwd`, `pwd`, `secret`, `token`, `apiKey`(api_key), `privateKey`, `credential`, `card`, `cvc`, `cvv`, `accountNumber`, `ssn`이 들어가면(대소문자 무시) 값과 상관없이 백업에서 제외됩니다. JSON 백업의 `meta.excludedFields`에 제외된 필드 경로가 기록됩니다.

## 연동

- **Vercel**: 배포
- **Google Analytics 4**: 측정 ID `G-3798RLX8KF`
- **UptimeRobot**: 5분 간격 모니터링
- **Google Search Console**: 사이트 소유권 확인 태그 적용

## 버전

- **v1.0.0** — 기본 사이트 (가이드 판매, GA4, 관리자 백업, 파비콘)
- **v1.1.0** — 상세페이지 첨삭 멤버십 추가. `feature/membership` 브랜치를 워크트리에서 개발한 뒤 `main`에 merge

---

이 README는 Claude Code 클라우드 세션에서 작성되었습니다 (2026-11-09)

## 데이터베이스 (Supabase)
- 프로젝트: `brand-reason` (서울 리전) — https://supabase.com/dashboard/project/okbkxulmoychqpoyqbkc
- 표: `products`, `memberships`, `curriculum`, `pages` (RLS 켜짐, 공개 읽기만 허용)
- 연결 코드: `api/_lib/supabase.js` → `/api/admin/backup`이 Supabase에서 읽고, 실패하면 `api/_lib/db.js` 로컬 데이터로 대신해요. 응답의 `meta.source`로 확인(`supabase` / `local-fallback`).
- 관리자·결제 연동 같은 민감 데이터는 DB에 올리지 않았어요.
