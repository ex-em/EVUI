# EvChart(Line) API 문서 검증 태스크

> 이 문서는 **다른 에이전트(또는 작업자)에게 그대로 전달하는 자기완결형 지시서**입니다.
> 실제 소스 코드를 분석해 대화형 API 문서(JSON)에 누락되거나 잘못된 정보가 없는지 검증하고 보고하는 것이 목표입니다.

## 목표

`docs/views/apiDocs/data/lineChart.json`(대화형 API 문서의 SSOT)이 **실제 구현 코드**와 일치하는지 검증한다.
불일치·누락을 발견하면 심각도와 함께 보고하고, 지시가 있으면 JSON을 직접 수정한다.

## 비교 대상 3자

| 구분 | 경로 | 역할 |
| --- | --- | --- |
| 문서(JSON) | `docs/views/apiDocs/data/lineChart.json` | 검증 대상. /api-docs 페이지가 렌더링하는 데이터 |
| 문서(md) | `docs/views/lineChart/api/lineChart.md` | 수동 작성된 기존 문서. JSON은 이 문서 기준으로 작성됨 |
| 구현 코드 | `src/components/chart/**` | **최종 기준(ground truth)** |

우선순위: **코드 > md > JSON**. md와 코드가 다르면 코드가 맞다고 가정하되, 의도적 문서 생략일 수 있으므로 보고서에 별도 표기한다.

## 소스 코드 분석 지점

| 확인 항목 | 위치 |
| --- | --- |
| 컴포넌트 props 정의 (`data`, `options`, `resizeTimeout` 등) | `src/components/chart/Chart.vue` (props: 35행 부근) |
| **옵션 기본값 전체** (`DEFAULT_OPTIONS`) | `src/components/chart/uses.js` 16행 부근. `defaultsDeep(options, DEFAULT_OPTIONS)`로 병합됨 |
| emit 이벤트 전체 | `src/components/chart/uses.js`에서 `grep "emit("` — click, dbl-click, mouse-move, drag-select, click-legend, axes-scale-change, axes-data-max-change, update:selectedItem/selectedLabel/selectedSeries/legendData 등 |
| 시리즈 옵션 기본값 (lineWidth, point, pointSize 등) | `src/components/chart/model/` (시리즈 생성/기본값), `src/components/chart/element/` (line/point 렌더러) |
| 축 옵션 (axesX/axesY, labelStyle, plotLines/plotBands) | `src/components/chart/scale/`, `src/components/chart/plugins/` |
| 툴팁 옵션 | `src/components/chart/plugins/` (tooltip 관련), `Chart.tooltip.spec.js` 참고 |
| 범례(legend) 옵션 | `src/components/chart/plugins/` (legend 관련) |
| selectItem/selectLabel/selectSeries/dragSelection | `src/components/chart/chart.selection.js`, `plugins.interaction.*` |
| shallowDataWatch/shallowOptionsWatch | `Chart.vue` watch 설정부, `Chart.shallowDataWatch.spec.js` |
| 슬롯 | `Chart.vue` 템플릿의 `<slot>` |

주의: 이 저장소의 EvChart는 line 외 여러 타입(bar/pie/scatter/heatMap)을 공유한다. **line 차트에 유효한 옵션만** 문서 대상이다. zoom/brush 관련 옵션(`chartZoom.core.js`, EvChartGroup/EvChartBrush 연동)은 **의도적으로 이 문서에서 제외**되어 있으니 누락으로 보고하지 말 것 (EvChart(Zoom)/EvChart(Brush) 문서로 분리 예정).

## JSON 스키마 (수정 시 준수)

```jsonc
{
  "component": "EvChart (Line)",
  "sections": [
    { "kind": "props|events|slots", "label": "...", "items": [ /* node[] */ ] }
  ]
}
// node
{
  "name": "position",
  "type": "String",                  // md/코드 표기 그대로
  "default": "'right'",              // 문자열로. 없으면 필드 생략
  "required": true,                   // 필수일 때만
  "values": ["'top'", "'right'"],   // 명확한 enum일 때만
  "description": "한 문장 설명",
  "tryIt": { "data": "...", "options": "..." },  // 있는 노드는 건드리지 말 것
  "children": []                      // 무한 중첩
}
```

- `tryIt` 필드가 이미 있는 노드는 **수정 금지**(플레이그라운드 데모용).
- `version` 필드는 사용하지 않는다.

## 검증 체크리스트

각 항목을 코드와 대조해 ✅/❌/⚠️로 판정:

1. **Props 누락**: `DEFAULT_OPTIONS`와 `Chart.vue` props에 있는데 JSON에 없는 옵션이 있는가?
2. **유령 항목**: JSON에는 있는데 코드에서 찾을 수 없는 옵션이 있는가? (오타·삭제된 옵션)
3. **기본값 불일치**: JSON의 `default`가 `DEFAULT_OPTIONS`(및 각 플러그인의 개별 기본값)와 일치하는가?
   - 특히 주의: `tooltip.use`, `series.point`, `legend.show`, `indicator.use`, `maxTip.use`의 기본값은 문서·코드 간 어긋나기 쉬운 이력이 있음
4. **타입 불일치**: 코드가 허용하는 타입(예: `Boolean | Object`)과 JSON `type` 표기가 일치하는가?
5. **enum(values) 정확성**: 코드의 분기/상수와 JSON `values`가 일치하는가? (예: `pointStyle` 도형 목록, `legend.position`, `interpolation`)
6. **이벤트 완전성**: `emit(` 전수 조사 결과와 events 섹션이 일치하는가? v-model 계열(`update:*`)은 props의 `v-model:*` 항목으로 문서화되어 있는지 확인.
7. **이벤트 payload**: 각 emit이 넘기는 인자 구조가 문서 설명과 일치하는가?
8. **슬롯 완전성**: `Chart.vue`의 슬롯 전부가 slots 섹션에 있는가?
9. **deprecated 표기**: "(3.4부터 제거 예정)" 표기가 코드 상태와 맞는가? (이미 제거된 것은 문서에서도 빼야 함)

## 산출물 형식

아래 표 형식의 보고서를 작성한다 (파일로 저장 요청이 있으면 `docs/views/apiDocs/data/lineChart.audit-report.md`):

```markdown
## 검증 결과 요약
- 검사 항목 수 / 불일치 수 / 누락 수

## 상세
| # | 구분 | 경로(JSON path) | 문서 내용 | 코드 근거(파일:라인) | 실제 값 | 심각도(high/mid/low) | 제안 |
```

- **심각도 기준**: high = 사용자가 문서대로 쓰면 동작이 다름(기본값/타입 오류), mid = 옵션 누락, low = 설명 뉘앙스/표기.
- 확신이 없는 항목은 추측으로 단정하지 말고 ⚠️(확인 필요)로 표기하고 근거 코드 위치를 남길 것.
- 보고만 하고 JSON 수정은 별도 지시가 있을 때만 수행.
