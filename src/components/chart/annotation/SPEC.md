# Chart Annotation/Badge (chart/annotation)

## Purpose

`options.annotations` 선언만으로 차트 위에 텍스트·뱃지·말풍선(callout)·강조 원(circle)을 얹는 모듈. 좌표는 pixel/axis/series 세 방식으로 지정하며, series 추적 어노테이션은 줌·실시간 갱신에 따라 매 프레임 좌표를 재해석해 데이터 포인트를 따라간다. 정규화→해석→레이아웃→렌더가 모두 순수 함수라 캔버스/차트 인스턴스 의존은 draw 진입점(`drawAnnotations`)과 chart.core 통합부에만 둔다. 렌더는 series 버퍼가 아닌 **전용 오버레이 캔버스**에 그린다.

## Features

- **4가지 타입**: `text`(배경 없는 라벨), `badge`(배경+테두리 pill), `callout`(꼬리로 데이터 포인트를 가리키는 말풍선), `circle`(강조용 순수 원).
- **3가지 위치 지정**(`position.type`): `pixel`(캔버스 좌상단 0,0 기준 절대 좌표), `axis`(축 값 `xValue`/`yValue` — step/time/linear/log 인지), `series`(시리즈 데이터 추적).
- **series 위치 추적**(`location`): `start`/`end`(데이터가 있는 non-null 첫/마지막 포인트) 또는 정수 인덱스(`[0,len-1]` clamp). 기준점은 타입별로 — bar는 값 끝 가장자리 중심(isHorizontal 판별), pie는 조각 바깥 원둘레의 중간각, line/scatter는 점 좌표, 그 외 박스형(heatMap)은 셀 중심.
- **content 토큰/콜백**: 문자열 `{xValue}`/`{yValue}`/`{seriesId}`/`{seriesName}`/`{dataIndex}` 치환 또는 `(ctx) => string` 콜백. `\n` 멀티라인 지원. circle은 content 무시.
- **connector(연결선)**: 기본 비활성. `straight`/`elbow`. 데이터 포인트 → 박스 최근접 변을 잇는다. callout은 꼬리가 connector 역할이라 정규화 단계에서 강제 비활성.
- **type별 Default Config**: `type`/`content`/`position`만 넘겨도 `defaultsDeep` 병합으로 완성도 있는 외형이 나온다.
- **선언형 갱신(v1)**: `options.annotations` 배열을 통째로 교체하면 전체 재정규화. 참조 동일성 캐시(`_annotationSource`)로 배열이 안 바뀌면 normalize를 건너뛰고 매 프레임 좌표만 재해석한다.

## Business Rules

- **정규화는 순수 함수**: `normalizeAnnotations`는 캔버스/차트 인스턴스 의존이 없다. 잘못된 입력은 throw 대신 `warnings[]`에 누적하고 안전한 기본값으로 폴백한다(unknown `type`→text, unknown `position.type`→pixel, invalid `location`→end, invalid callout `anchor`→auto, invalid connector `type`→straight).
- **padding 정규화**: 항상 `[top, right, bottom, left]` 4-튜플로 변환(CSS shorthand 규칙). 음수는 0으로 클램프. `defaultsDeep`의 배열 인덱스 단위 병합이 짧은 사용자 배열을 오염시키므로(예: 사용자 `[5]` + 기본 `[6,10]` → `[5,10]`), 병합 결과 대신 사용자 원본을 다시 정규화한다.
- **가시성(hide 정책)**: 기준점이 현재 viewport(축 범위) 밖이면 그리지 않는다. `pixel`은 절대 좌표라 항상 표시. `series`에서 `series.show === false`(범례 토글·옵션)면 숨김, 줌으로 선택 포인트가 화면 밖(`xp`/`yp` null)이면 숨김, `axis`에서 `xValue`/`yValue`가 범위 밖(null 반환)이면 숨김.
- **`axis` 필수 필드**: 점 어노테이션은 선 타입이 없어 `xValue`·`yValue` 둘 다 있어야 좌표가 정해진다. 하나만 주면 조용히 숨겨지므로 정규화에서 경고한다.
- **항목별 격리**: 어노테이션 하나가 draw 중 throw해도 나머지·차트 렌더는 정상 진행한다(`drawAnnotations` try/catch + `Console.warn`). 렌더 헬퍼는 `save`/`restore`를 try/finally로 짝지어 격리 catch가 캔버스 상태 스택을 불균형하게 남기지 않게 한다.
- **z-order**: 입력 배열 순서가 곧 z-order(뒤 항목이 위). 겹침 충돌 회피는 v1 범위 밖.
- **텍스트 측정 캐시**: 텍스트 크기는 `(content, fontStyle)`에만 의존하므로 정규화 객체(`_measure`)에 캐시한다. 좌표는 매 프레임 재계산하므로 live/realtime 추적은 유지된다. 옵션 배열이 교체되면 새 객체와 함께 캐시가 폐기된다.
- **circle 방어**: `radius` 음수는 0으로 클램프한다(`ctx.arc`가 음수 반지름에 IndexSizeError를 던짐).
- **전용 캔버스 레이어**: chart.core가 `annotation-canvas`(z-index 3, `pointer-events:none`)를 `options.annotations`가 실제로 있을 때만 지연 생성(`ensureAnnotationCanvas`)한다 — 미사용 차트는 캔버스 메모리/합성 비용이 0. 어노테이션이 있다가 없어지면 레이어를 clear한다.

## Acceptance Criteria

- `annotation.normalize/resolver/layout/renderer/axis.spec.js` 5종 단위 테스트가 통과한다.
- 잘못된 `type`/`position`/`location`을 넘겨도 throw 없이 경고+폴백으로 렌더가 계속된다.
- series 추적 어노테이션이 줌/실시간 갱신 시 데이터 포인트를 따라 이동하고, 포인트가 화면 밖이거나 시리즈가 숨김이면 사라진다.
- `pixel` 어노테이션은 축 범위와 무관하게 항상 지정 좌표에 그려진다.

## Architecture

```
normalizeAnnotations(options.annotations)        // 옵션 변경 시 1회 (순수)
        │  → [정규화 annotation]  (+ warnings)
        ▼  (매 프레임, drawAnnotations — 항목별 try/catch)
  resolveAnchor ─→ buildContentContext ─→ resolveContent
   (pixel/axis/series          (series/axis 값)   ({token}/콜백)
    → hide 판정)
        │                                   │
        ▼                                   ▼
  computeLayout(anchor, contentStr) ─→ renderAnnotation(ctx)
   (박스 크기·callout 꼬리)          (connector→box/callout/circle→text)
```

`axis` 좌표 변환은 `annotation.axis.js`가 담당: step은 슬롯 중심 인덱스 매핑, time/linear/log는 값 정규화 후 `Canvas.calculateX/Y` 재사용(시리즈 기하와 동일한 반올림·null 의미).

## File Structure

| 파일 | 역할 |
|------|------|
| index.js | 공개 API 배럴(모듈 외부 진입점) — normalize/draw/resolve/layout/axis/constant 재노출 |
| annotation.constant.js | `ANNOTATION_TYPES`/`POSITION_TYPES`/`CONNECTOR_TYPES`/`CALLOUT_ANCHORS`/`SERIES_LOCATIONS`, type별 `ANNOTATION_DEFAULT`, `POSITION_DEFAULT`, `CONNECTOR_DEFAULT` |
| annotation.normalize.js | raw 입력 → 내부 표준 모델 정규화(순수), `normalizePadding`, 경고 누적, id 중복 검사 |
| annotation.axis.js | 축 값 → 픽셀(`axisValueToPixel`/`normalizeAxisValue`/`stepValueToPixel`/`resolveStepIndex`). step/time/linear/log 인지 |
| annotation.resolver.js | anchor 좌표 해석(`resolveAnchor`: pixel/axis/series+pie), `resolveLocationIndex`, content 컨텍스트(`buildContentContext`)·토큰 치환(`resolveContent`) |
| annotation.layout.js | 폰트 shorthand·멀티라인 측정(`measureContent`, 캐시), 박스 크기(`computeBoxSize`), callout 꼬리 기하(`resolveCalloutSide`/`computeTail`), 최종 레이아웃(`computeLayout`) |
| annotation.renderer.js | 캔버스 드로잉 — `drawBox`/`drawCallout`/`drawCircle`/`drawText`/`drawConnector`/`nearestBoxPoint`, `renderAnnotation` |
| annotation.draw.js | `drawAnnotations` — 프레임당 resolve→layout→render 조립 + 항목별 격리 |
| annotation.*.spec.js | normalize/resolver/layout/renderer/axis 각 순수 모듈 단위 테스트 |

## Dependencies

| 대상 | 용도 |
|------|------|
| ../helpers/helpers.canvas (Canvas) | `calculateX`/`calculateY`(축 값→px), `roundedRect` |
| ../helpers/helpers.util (Util) | `calcTextSizeCanvas`(텍스트 측정 기본 구현) |
| @/common/utils (Console) | 어노테이션 렌더 실패 경고 |
| lodash-es | `cloneDeep`/`defaultsDeep`/`isFunction`(정규화 병합·content 판정) |
| dayjs | `time` 축 값(문자열/Date)→timestamp 변환 |
| chart.core.js | 소비자 — 전용 `annotation-canvas` 레이어에서 `normalizeAnnotations`/`drawAnnotations` 호출, `buildAnnotationViewport`로 viewport 계약 공급 |

## Glossary

| 용어 | 정의 |
|------|------|
| anchor | offset이 더해진 최종 기준 픽셀 좌표. `anchorX`/`anchorY`는 offset 적용 전 원래 기준점(connector·callout 꼬리 시작점) |
| location | `series` 위치의 데이터 인덱스 지정 — `start`/`end`(non-null 첫/마지막) 또는 정수 |
| callout | 꼬리(tail)로 데이터 포인트를 가리키는 말풍선. 꼬리가 connector를 겸하므로 connector는 비활성 |
| connector | 어노테이션 박스와 데이터 포인트를 잇는 선(`straight`/`elbow`), 박스 최근접 변에 종착 |
| viewportCtx | draw에 넘기는 뷰포트 계약 — `{ chartRect, labelOffset, axes\|axesSteps, seriesList }` |
| Default Config | type별로 미리 정의한 "그럴듯한" 외형 기본값(`ANNOTATION_DEFAULT`) |

## Data Flow

```
options.annotations 변경(참조 바뀜)
   │
   ▼
normalizeAnnotations → _normalizedAnnotations 캐시 (chart.core: _annotationSource 참조 비교)
   │
   ▼ (매 렌더 프레임 — drawAnnotationLayer)
buildAnnotationViewport() → { chartRect, labelOffset, axes|axesSteps, seriesList }
   │
   ▼
drawAnnotations: 항목별 resolveAnchor(hide 판정) → content 해석 → computeLayout → renderAnnotation
   │
   ▼
annotation-canvas (전용 오버레이 레이어, z-index 3, pointer-events:none)
```
