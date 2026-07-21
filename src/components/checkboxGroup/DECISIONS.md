# CheckboxGroup (EvCheckboxGroup) — Decisions

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | 그룹 값/변경 핸들러를 provide, 자식이 inject | 그룹-자식 결합을 느슨하게, 자식 배치를 slot 으로 자유롭게 | props 로 자식에 일일이 전달(드릴링) |
