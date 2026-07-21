---
name: spec-workflow
description: 'SPEC.md / DECISIONS.md 를 코드 작업의 컨텍스트로 탐색·반영·갱신하는 워크플로우. 직접 트리거 — "스펙 확인해줘", "스펙 업데이트", "이 도메인 SPEC 만들어줘", "SPEC 과 코드 일치하는지 검토" 등 SPEC/DECISIONS 문서를 명시적으로 다루는 요청. SPEC.md 생성/업데이트 요청 시 반드시 사용. 컴포넌트 코드를 수정·추가·리팩토링하기 전 관련 도메인(src/components/<컴포넌트>/)의 SPEC.md 를 탐색해 컨텍스트로 활용하는 데도 쓴다.'
---

# Spec-First Workflow

## Overview

코드와 같은 위치(co-located)에 스펙 문서를 두어, 코드 작업 시 AI가 도메인 컨텍스트를 자동으로 확보하게 하는 워크플로우. EVUI 는 `src/components/<컴포넌트>/SPEC.md` · `DECISIONS.md` 로 컴포넌트 도메인마다 co-located 하고, 공통 규약은 `src/components/SPEC.md`, 공용 유틸은 `src/common/SPEC.md` 에 둔다.

이 스킬은 두 경로로 진입한다:

- **직접**: 사용자가 SPEC/DECISIONS 문서를 명시적으로 다루도록 요청한 경우.
- **서브스텝**: 코드 작업/리뷰의 "작업 전 SPEC 탐색" 단계에서 이 절차를 따르는 경우. 이때는 **탐색을 가볍게** 유지하고 원래 작업 흐름으로 결과를 돌려준다.

> **이 스킬이 EVUI SPEC 워크플로우의 단일 진실의 원천(SSOT)이다** — 탐색 절차·반영·업데이트 트리거·생성 템플릿·위반 심각도까지 전부 여기서 정의한다. 프로젝트 `CLAUDE.md` 의 "Spec Workflow" 섹션은 이 스킬을 가리키는 얇은 포인터이며, SPEC 관련 상세는 그 요약이 아니라 이 스킬을 본다.

## Workflow

### 1. 스펙 탐색 (작업 전)

작업의 영향 범위를 파악하고 참고할 스펙 문서를 결정한다:

```
1. 작업 요청 분석 → 영향받는 파일/폴더 파악
2. 영향 범위 내 SPEC.md 탐색 (하위가 상위보다 우선)
3. DECISIONS.md 탐색 (SPEC.md와 같은 폴더)
4. SPEC.md가 없는 경우 → 생성 제안 (아래 참조)
```

**탐색 방법** — 변경 대상 디렉토리에서 레포 루트 방향으로 ↑ 올라가며 탐색한다 (도메인 컨텍스트는 상위에, 구체적 룰은 하위에 있다):

```
# 변경 대상 폴더부터 부모·조부모 순으로 SPEC.md / DECISIONS.md 존재 확인 (Glob)
Glob: <target-dir>/SPEC.md, <target-dir>/DECISIONS.md
Glob: <target-dir>의 부모 → 조부모 → ... → <repo-root>
```

**토큰 가드** — 매칭된 SPEC.md 가 5개를 초과하면, 변경 파일 디렉토리 기준 가장 가까운 3개만 Read 하고 나머지는 "+N개 SPEC 더 발견됨"으로 보고에 명시한다.

**DECISIONS.md 조건부 읽기:**

- 코드 수정 / 새 기능 추가 / 설계 변경 → SPEC.md + DECISIONS.md **모두** 읽기 (설계 충돌 감지에 필수)
- 단순 구조 파악 / 버그 수정 / 스타일 변경 → SPEC.md만 읽기 (DECISIONS.md는 필요 시)

**예시:**

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

### SPEC.md가 없는 경우

작업 대상 폴더에 SPEC.md가 없으면 항상 사용자에게 생성 여부를 물어본다:

> "이 폴더에 SPEC.md가 없습니다. 생성할까요?"

- **"네"**: 코드 작업 전에 현재 코드를 분석하여 SPEC.md 초안 작성 → 작업 컨텍스트로 활용
- **"아니오"**: SPEC.md 없이 작업 진행

> 다른 작업 흐름의 "작업 전 SPEC 탐색" 단계에서 이 절차를 따르는 경우에는 흐름을 끊지 않도록, 생성 제안만 보고에 남기고 강제로 멈추지 않는다.

### 2. 스펙 반영 (작업 중)

SPEC.md의 각 섹션을 코드 작업에 적극 활용한다:

- **Business Rules**: 규칙/제약이 코드에 정확히 반영됐는지 확인. 예: "비로그인 사용자는 비공개 항목을 볼 수 없다" → 해당 가드가 코드에 있는지 검증
- **Dependencies**: import/호출 관계가 SPEC.md에 명시된 의존성과 일치하는지 확인. 새 의존성 추가 시 SPEC.md 업데이트 대상으로 메모
- **Architecture / File Structure**: 새 파일/컴포넌트 추가 시 기존 구조 패턴을 따름. 예: 패널 하위 컴포넌트는 SPEC에 정의된 폴더 규칙에 맞춰 배치
- **Glossary**: 도메인 용어를 코드(변수명·함수명)에 일관되게 사용
- **DECISIONS.md**: 설계 결정의 이유를 이해하고, 그에 반하는 변경을 하려면 사용자와 먼저 논의. 날짜를 통해 오래된 결정이 현재 상황에 맞는지 재검토를 고려한다.

### 3. 스펙 업데이트 (작업 후)

#### 트리거

**자동**: 코드 작업 완료 후 아래 "반드시 업데이트" 조건 체크. 해당 시 사용자에게 업데이트 제안.

```
"기능이 변경되었어요. SPEC.md 업데이트할까요?"
```

**수동**: "스펙 업데이트 확인해줘" 요청 시 현재 코드와 SPEC.md를 비교 분석.

#### 반드시 업데이트

- 기능(Feature) 추가/삭제/변경
- 비즈니스 규칙 변경
- 도메인 용어 추가/변경
- 데이터 흐름 변경
- 주요 설계 결정 변경

#### DECISIONS.md 업데이트

위 "반드시 업데이트" 조건에 해당하는 변경이 발생하면, SPEC.md의 다른 섹션 업데이트와 함께 DECISIONS.md에도 행을 추가한다:

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| YYYY-MM-DD | 변경 내용 요약 | 왜 이렇게 결정했는지 | 검토했지만 채택하지 않은 방안 |

#### 업데이트 권장

- 기존 기능의 동작 방식 세부 변경
- 새로운 제약사항 추가
- 외부 도메인과의 의존성 변경
- 설계 결정의 이유/대안 보완

#### 업데이트 불필요

- 내부 구현 리팩토링
- 버그 수정 (명세 변경 없음)
- UI/스타일 변경
- 성능 최적화

## 준수 및 위반 심각도

코드 작성·리뷰 시 SPEC 위반 심각도 분류 (코드 작업·코드 리뷰 공통 기준):

| 상황 | 심각도 |
|------|--------|
| SPEC에 정의된 인터페이스를 변경했으나 SPEC 미갱신 | **CRITICAL** |
| SPEC의 동작 사양과 다르게 구현 | **CRITICAL** |
| SPEC에 없는 새 기능 추가 (SPEC 갱신 없이) | **HIGH** |
| SPEC 문서 형식 불일치 | **LOW** |

코드 리뷰 체크리스트 추가 항목:

- [ ] SPEC 문서가 존재하면, 변경 사항이 SPEC과 일치하는가?
- [ ] SPEC 변경이 필요한 경우, SPEC도 함께 업데이트했는가?
- [ ] 새 모듈인 경우, SPEC.md가 작성되었는가?

## SPEC.md + DECISIONS.md 생성

새 SPEC.md 요청 시 `assets/SPEC.template.md`와 `assets/DECISIONS.template.md`를 사용하여 두 파일을 함께 생성한다.

### SPEC.md 섹션 구성

SPEC.md는 아래 9개 섹션을 모두 포함한다. 단, 도메인 특성상 해당 없는 섹션은 한 줄 요약이나 "해당 없음"으로 대체 가능:

- **Purpose**: 도메인이 해결하는 문제, 존재 이유
- **Features**: 제공하는 기능들
- **Business Rules**: 도메인 규칙·제약사항 (성능·보안·접근성·가용성 등 비기능 요구사항 포함)
- **Acceptance Criteria**: 완료 판정용 관찰 가능 조건 — 테스트(*.spec.js)·수동 QA(docs 예제) 중 하나로 확인 가능해야 한다
- **Architecture**: 컴포넌트 구성도, 설계 구조 (ASCII 다이어그램 권장)
- **File Structure**: 파일별 역할 테이블
- **Dependencies**: 의존하는 다른 도메인/외부 시스템
- **Glossary**: 도메인 용어 정의
- **Data Flow**: 데이터/상태 흐름 (주요 시나리오별 ASCII 흐름도)

> 아직 결정되지 않은 사항은 추측으로 채우지 말고 `[NEEDS CLARIFICATION: <질문>]` 마커로 남긴다 — 이후 작업/리뷰에서 사람이 해소한다.

### DECISIONS.md

설계 결정 이력은 같은 폴더의 `DECISIONS.md`에 별도 관리한다. `assets/DECISIONS.template.md` 사용.

> 기존 SPEC.md에 Decisions 섹션이 인라인으로 있는 경우에도 정상 동작한다. 점진적으로 DECISIONS.md로 이관을 권장한다.
