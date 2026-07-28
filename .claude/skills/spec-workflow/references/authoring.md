# SPEC / DECISIONS 작성

SPEC/DECISIONS 본문을 쓰거나 고칠 때 따른다 — 신규 생성과 기존 갱신 공통. 새 파일은 `assets/SPEC.template.md`·`assets/DECISIONS.template.md` 로 두 개를 함께 만든다.

## SPEC.md 섹션 구성

아래 9개 섹션을 모두 포함한다. 도메인 특성상 해당 없는 섹션은 한 줄 요약이나 "해당 없음"으로 대체 가능:

- **Purpose**: 도메인이 해결하는 문제, 존재 이유. 공식 API 문서가 있으면 `> **공식 API**: [경로](경로)` 포인터를 바로 아래에 둔다
- **Features**: 제공하는 기능들
- **Business Rules**: 도메인 규칙·제약사항 (성능·보안·접근성·가용성 등 비기능 요구사항 포함)
- **Acceptance Criteria**: 완료 판정용 관찰 가능 조건. 각 항목 끝에 검증 수단을 괄호로 명시한다 — `*.spec.js` 파일명 또는 `docs/views/**` 예제 경로. `src/components/chart/SPEC.md` 가 이 형태다
- **Architecture**: 컴포넌트 구성도, 설계 구조 (ASCII 다이어그램 권장)
- **File Structure**: 파일별 역할 테이블
- **Dependencies**: 의존하는 다른 도메인/외부 시스템
- **Glossary**: 도메인 용어 정의
- **Data Flow**: 데이터/상태 흐름 (주요 시나리오별 ASCII 흐름도)

## 코드 대조 검증 (초안 작성 후 필수)

초안을 쓴 뒤 Business Rules·Acceptance Criteria **각 항목마다** 근거 코드 위치(`파일:라인` 또는 함수명)를 확인한다. 코드에서 확인되지 않는 항목은 삭제하거나 `[NEEDS CLARIFICATION: <질문>]` 마커로 강등한다.

그럴듯한 추측을 서술문으로 남기지 않는다 — 모호하면 서술 대신 질문으로 바꿔 마커에 박고 이후 작업/리뷰에서 사람이 해소하게 한다. "내가 모른다고 자각한 것만 마커"가 아니라 **코드로 확인되지 않으면 자각 여부와 무관하게 마커**다.

## 크기와 분할

SPEC 이 긴 것 자체는 위반이 아니다. 판정 기준은 줄 수가 아니라 구조다:

- 그 디렉토리에 **자체 관심사를 가진 하위 디렉토리**가 있고 SPEC 이 그것까지 흡수하고 있으면 → 하위 SPEC 으로 분할하고 루트에는 위임 링크만 남긴다. `src/components/chart/SPEC.md` → `plugins/`·`element/`·`scale/`·`model/`·`annotation/` 이 이미 이 형태다.
- 하위 디렉토리가 없는 리프 도메인이면 길어도 그대로 둔다 — 쪼갤 경계가 없다.

## DECISIONS.md

**왜**(어떤 대안을 왜 버렸는가)만 담는다. **무엇을** 바꿨는지는 커밋과 코드가 이미 담고 있다. 새 결정은 표 맨 아래에 추가한다.

기존 SPEC.md 에 Decisions 섹션이 인라인으로 있는 경우에도 정상 동작한다. 점진적으로 DECISIONS.md 로 이관을 권장한다.

## 참고: 탐색 우선순위 예시

```
요청: "chart 의 tooltip 플러그인 수정해줘"

영향 범위 분석:
- src/components/chart/plugins/   <- 직접 수정
- src/components/chart/           <- chart 도메인
- src/components/                 <- 라이브러리 공통 규약

참고할 SPEC.md (하위 우선):
- src/components/chart/plugins/SPEC.md   <- 1순위
- src/components/chart/SPEC.md            <- 2순위 (chart 루트)
- src/components/SPEC.md                  <- 3순위 (공통)
```
