# MessageBox (EvMessageBox) — Decisions

<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 프로그램적 호출 + 동적 마운트/unmount 방식 | confirm/alert 는 명령형 흐름(await 결과)이 자연스러워 선언적 템플릿 배치보다 호출 API 가 적합 | 항상 템플릿에 배치 + v-model(호출부 장황) |
| - | message/notification 과 독립 구현 | 모달 확인 다이얼로그와 토스트/인라인 메시지는 UX·생명주기가 달라 분리 | 공용화(요구 상이로 결합 비용) |
| - | useHTML 을 opt-in 으로 분리 | 기본 텍스트 렌더로 XSS 위험 차단, 신뢰된 HTML 만 명시적 허용 | 항상 HTML 렌더(XSS 위험) |
