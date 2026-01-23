---
description: "변경 내용을 분석하여 Conventional Commit 메시지 자동 생성"
---

현재 작업 내용을 기반으로 커밋을 생성해주세요.

## 커밋 메시지 형식

`<type>(<scope>): <subject>`

## 단계

1. 현재 git 상태 확인
2. staged/unstaged 변경 내용 확인
3. 최근 커밋 스타일 참고

## 타입 선택 기준

- **feat**: 새로운 기능 추가
- **fix**: 버그 수정
- **refactor**: 코드 리팩토링 (기능 변경 없음)
- **perf**: 성능 개선
- **style**: 코드 포맷팅, 세미콜론 누락 등
- **docs**: 문서 변경
- **test**: 테스트 추가/수정
- **build**: 빌드 시스템, 외부 의존성 변경
- **ci**: CI 설정 변경
- **chore**: 기타 변경

## scope (선택)

변경된 모듈/컴포넌트 영역 (예: api, ui, auth, config)

## subject 규칙

- 명령형 현재 시제 (add, fix, change)
- 첫 글자 소문자
- 끝에 마침표 없음
- 50자 이내

## Breaking Changes

API 변경 등이 있으면 타입 뒤에 ! 추가: `feat(api)!: change response format`
