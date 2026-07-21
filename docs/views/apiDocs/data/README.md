# 대화형 API 문서(JSON) 작성 가이드

`/api-docs` 페이지가 렌더링하는 컴포넌트 문서의 SSOT입니다.
이 폴더의 `*.json`을 수정/추가한 뒤 반드시 `npm run docs:validate`를 통과시켜야 합니다.

## 파일 구조

```jsonc
{
  "component": "EvChart (Line)",     // 페이지 제목·피커 라벨
  "route": "/lineChart",             // 관련 페이지 경로 (pages.js와 일치)
  "since": "3.0.0",
  "description": "한 문장 요약",
  "examples": [                      // Examples 탭에 펼칠 관련 페이지 목록
    { "label": "기본 라인 차트", "route": "/lineChart" }
  ],
  "playground": {                    // Try It 패널의 기반 예제 (생략 시 Try It 미지원 안내)
    "route": "/lineChart",
    "example": "Fill",               // 해당 페이지 props.js의 components 키
    "tag": "ev-chart"                // 패널이 직접 렌더링할 태그 (생략 시 ev-chart)
  },
  "sections": [
    { "kind": "props",  "label": "Props",  "items": [ /* node[] */ ] },
    { "kind": "events", "label": "Events", "items": [ /* node[] */ ] }
    // slots 섹션은 실제 슬롯이 있을 때만
  ]
}
```

## 노드(node) 필드

```jsonc
{
  "name": "position",
  "type": "String",                        // md/코드 표기 그대로
  "default": "'right'",                    // 문자열로. 없으면 필드 생략
  "required": true,                        // 필수일 때만. false 표기 금지
  "values": ["'top'", "'right'"],          // 명확한 enum일 때만
  "description": "범례 위치입니다.",
  "tryIt": { "options": "{ legend: { position: 'bottom' } }" },
  "children": [ /* 하위 속성. 무한 중첩 */ ]
}
```

- `version` 필드는 사용하지 않습니다.
- 형제 노드 간 `name` 중복 금지.
- 렌더링 규칙: 최상위 노드와 depth-1 객체 그룹이 카드(단락)가 되고,
  더 깊은 중첩은 카드 안의 들여쓰기 행으로 합쳐집니다.

## tryIt — Try It 버튼 제어

노드의 `tryIt` 필드는 세 가지 상태를 가집니다:

| 값 | 카드 헤더 버튼 | 행(leaf) 버튼 | 에디터에 보이는 코드 |
| --- | --- | --- | --- |
| (생략) | 표시 | 없음 | 현재 차트 상태 전체 + 해당 키로 커서 포커스 |
| `{ "data"?, "options"? }` | 표시 | **표시** | 현재 상태 위에 스니펫을 **깊은 병합**한 코드 |
| `false` | **숨김** | 없음 | — |

- **스니펫**은 JS 리터럴 문자열입니다. 함수·`dayjs(...)` 표현식 사용 가능하며,
  Apply 시 평가되어 라이브 차트에 반영됩니다. 문법 오류는 validate가 잡습니다.
  ```jsonc
  "tryIt": { "options": "{ tooltip: { use: true, formatter: { value: ({ y }) => `${y}%` } } }" }
  ```
- **`false`는 Try It으로 실험이 무의미하거나 차트가 반응하지 않는 옵션에 지정**합니다.
  (예: `v-model:*` 바인딩, `resizeTimeout`, mount 시 1회만 평가되는 옵션,
  Apply에 반응하지 않는 버그가 확인된 옵션)
- 병합은 객체만 깊게 합치고 **배열은 통째로 교체**되므로, `axesX: [...]`처럼
  배열을 포함한 스니펫은 축 설정 전체를 스니펫에 담아야 합니다.

## 예제 노출 범위 (대외용 / 개발자용)

예제 정의(`docs/views/<component>/props.js`의 `components` 항목)에 `devOnly: true`를
지정하면 **개발자용 예제**가 됩니다:

```js
PerfStressSingle: {
  description: '성능 stress 예제 ...',
  component: PerfStressSingle,
  parsedData: parse(PerfStressSingleRaw).descriptor,
  devOnly: true, // 대외용 문서에서 숨김
},
```

| 실행 명령 | 모드 | devOnly 예제 |
| --- | --- | --- |
| `npm run docs` / `npm run build:docs` | **대외용** | 숨김 (딥링크 접근도 차단) |
| `npm run dev_docs` | 개발자용 | 표시 (`dev` 배지 부착) |

**배포 환경에서 임시로 dev 예제 보기**: URL에 `?dev`를 붙이면(예:
`https://.../api-docs/lineChart?dev`) 대외용 빌드에서도 개발자용 모드로
전환됩니다. 모드는 진입 시 1회 평가되어 세션 동안 유지되고(네비게이션 시 URL에
파라미터 보존), 끄려면 파라미터 없이 다시 진입하면 됩니다.

## playground 기반 예제의 조건

`playground.example`이 가리키는 예제 컴포넌트는 setup에서 다음을 노출해야 합니다:

```js
const chartData = ref({ ... });
const chartOptions = ref({ ... });
const onApply = ({ chartData: d, chartOptions: o }) => {
  if (d) chartData.value = d;
  if (o) chartOptions.value = o;
};
return { chartData, chartOptions, onApply };
```

(예: `docs/views/lineChart/example/Fill.vue`, `docs/views/barChart/example/Column.vue`)

## 검증·품질

- 스키마 게이트: `npm run docs:validate`
- 코드 대조 검증(신규 문서 작성 시 권장): `lineChart.audit.md` 지시서 참고 —
  코드에 존재하는 공개 옵션·이벤트는 예외 없이 문서화하는 것이 원칙입니다.
  결과 보고서는 `<component>.audit-report.md`로 남깁니다.
