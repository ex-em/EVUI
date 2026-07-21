# Message (EvMessage) — Decisions

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | notification 과 별개의 단순 메시지로 유지 | 위치 스택·클릭 콜백이 없는 경량 메시지 용도 | notification 공용화(불필요 기능 포함) |
| - | useHTML opt-in | 기본 텍스트로 XSS 차단 | 항상 HTML(XSS 위험) |
