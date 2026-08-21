# Chart (EvChart) — Decisions

<!-- 주요 설계 결정과 이유. 새 결정은 테이블 맨 아래에 추가. -->
<!-- 날짜 `-` = SPEC 아키텍처 관찰 기반 초기 결정(정확한 커밋 미추적). YYYY-MM-DD = git 이력으로 근거 확인된 결정. -->
<!-- 범위: 차트 루트 + plugins/element/scale/model 하위 전체. -->

| 날짜 | 결정 | 이유 | 대안 |
|------|------|------|------|
| - | Canvas 2D 기반 렌더링 채택 (line/bar/pie/scatter/heatMap) | 수천~수만 데이터 포인트를 요소당 DOM 노드 없이 그려 렌더/메모리 비용을 억제 | SVG(요소 수 폭증), DOM/HTML 차트 |
| - | 3장 canvas 더블 버퍼 구조 (buffer 래스터 → display blit present, overlay 즉답 레이어) | present 시점 atomic blit 으로 깜빡임 제거, hover/crosshair 는 overlay 로 시리즈 재래스터 없이 즉답 | 단일 canvas 직접 렌더(부분 갱신마다 전체 재그림·깜빡임) |
| - | 부가 계층(plugins/model/element.tip)을 클래스가 아닌 메서드 모음 객체로 `Object.assign(this, Module)` flat mixin | EvChart 인스턴스 상태(options/data/seriesList/ctx…)를 `this` 로 직접 공유하며 파일별로 관심사 분리, own-property 라 프로토타입 메서드보다 우선 | 상속 계층, 별도 인스턴스 필드(컴포지션)로 상태 전달 |
| - | element 시리즈 렌더러를 타입별 클래스 + duck-typed 인터페이스(draw/computeGeometry/findGraphData/findItems/itemHighlight)로 구성 | 타입별 렌더/히트 로직을 독립 캡슐화하고 코어는 공통 계약으로만 호출 | 코어 내부 타입 분기 스위치, 단일 거대 렌더 함수 |
| - | 축 스케일을 Scale 베이스 + 5개 구현(Linear/Logarithmic/Time/TimeCategory/Step) 인스턴스로 분리하고 `createAxes` 팩토리가 axis type/categoryMode 로 선택 | tick 계산·라벨·plot 렌더가 축 종류마다 크게 달라 다형 인스턴스로 격리, 축별 상태를 인스턴스에 보존 | 축 타입별 if/switch 분기 함수, 단일 스케일에 옵션 플래그 |
| - | brush 차트(`options.brush`)는 tooltip/legend/interaction/tip/pie/title/scrollbar mixin 과 overlay canvas 를 아예 미장착 | EvChartBrush 미니 차트는 렌더 전용이라 인터랙션·DOM 계층이 불필요 — 생성 비용·DOM 누수 원천 제거 | 전 mixin 장착 후 런타임 플래그로 비활성 |
| - | 데이터/옵션 정규화를 props 와 분리된 새 객체로 생성(`defaultsDeep`/`defaults` 로 누락 키만 병합) | 소비자 props 참조와 내부 상태를 분리해 오염 방지 | 원본 props 에 in-place 병합 |
| 2026-05-13 | scatter 좌표 dedupe 를 `coordinateDedupe` opt-out + O(1) Set 으로 정리 (기본 on) | cross-series 동일 좌표 overdraw 제거하되 #2011 "모든 중복 표시" 요구를 opt-out 으로 수용, 버킷별 Set 으로 push 시점 O(1) 판정 | 항상 dedupe(중복 표시 불가), 렌더 단계 O(n) 좌표 비교 |
| 2026-05-28 | 커스텀 HTML 툴팁(formatter.html)에 가상 스크롤 도입 (spacer/viewport 재구성, row 탐지) | 시리즈 수백 개 툴팁에서 전체 DOM 부착 비용·프레임 드랍 제거 | 전체 행 DOM 부착, 툴팁 행 수 상한 |
| 2026-06-01 | TimeCategoryScale 에 index window(minIndex/maxIndex, sentinel {0,-1}) 산출(`calculateScaleRange`) 추가 | axis range 로 일부만 보일 때 그릴 인덱스 범위를 스케일이 확정해 소비자 재계산·오설정을 차단 | 소비자마다 라벨 배열 재탐색, undefined=전체 관례(빈 윈도우와 모호) |
| 2026-06-04 | 스크롤바 range 에 `anchorEdge`(start/end/null) 도입 — 가장자리 부착 의도 보존 | 리사이즈/데이터 갱신 시 사용자가 붙여둔 가장자리를 유지, minMax 미확정(null) 시 range 불변으로 `+null` 오염 방지 | 매번 옵션 range 로 리셋(사용자 위치 상실) |
| 2026-06-10 | realtime scatter blit fast-path 도입 — 이전 점 라스터를 drawImage 로 좌측 시프트 + 신규 strip 만 재래스터 | 슬라이딩 윈도우 실시간 scatter 에서 틱당 전체 재래스터 비용 제거 | 매 틱 full redraw |
| 2026-07-20 | 어노테이션/뱃지 모듈(annotation/) 추가 — `options.annotations` 선언형 API + 순수 함수 파이프라인(normalize→resolve→layout→render) + 전용 `annotation-canvas` 지연 생성 레이어 | 차트 위 라벨/뱃지/말풍선/강조를 선언형으로 얹되, 순수 함수로 테스트 용이성을 확보하고 전용 레이어로 series 재래스터와 분리(격리·미사용 시 비용 0) | series 버퍼에 직접 그리기(재래스터 결합·격리 불가), DOM 오버레이 컴포넌트(좌표 동기화 비용) |
| 2026-07-20 | series 추적 어노테이션 `location` 의 `start`/`end` 를 데이터 있는(non-null) 첫/마지막 포인트로 정의 | 앞뒤 null 구간이 있는 시계열에서 빈 영역이 아니라 실제 데이터 경계에 어노테이션을 붙이기 위함 | 배열 물리 첫/마지막(0/length-1) 고정(null 구간에 표시됨) |
| 2026-06-11 | 데이터 파이프라인에서 cloneDeep/반응성 제거 (`toRaw` unwrap + normalize 비-변형) | 매 틱 깊은 복제·proxy trap 비용 제거, 원본 불변 유지 | 매 갱신 cloneDeep, reactive 값 직접 소비 |
| 2026-06-11 | 점 마커를 색상/그룹별 배치 렌더(`drawPointBatch`)로 전환, path-per-point 제거 | 다수 시리즈×다수 포인트에서 rasterizer flush 를 상수 회로 억제 | 포인트마다 beginPath/fill/stroke |
| 2026-06-11 | blit fast-path 를 `chart.blit.js` 프로토타입 모듈로 추출 | 코어에서 fast-path 를 격리해 유지보수성 확보, 테스트가 `Object.create(prototype)` 로 호출 가능 | chart.core.js 인라인 유지 |
| 2026-06-11 | 렌더 파이프라인을 RenderCore(DOM-free, ctx 주입) / ChartShell(main 전용 DOM·listener) 로 분리 | RenderCore 를 worker 재사용 가능하게 만들고 DOM 의존을 Shell 에 국한 | 단일 drawChart 에 DOM·렌더 혼재 |
| 2026-06-11 | worker(OffscreenCanvas) series 래스터 오프로드를 opt-in(`workerRender`, 기본 off)으로 추가 | 대량 시리즈 래스터를 메인 스레드에서 분리, 미지원·실패 시 main full redraw 무회귀 폴백 | 항상 main 렌더, worker 강제(호환성 리스크) |
| 2026-06-11 | props.data deep-watch opt-out(`shallowDataWatch`, 기본 off) | 초대형 데이터에서 deep watch 순회 비용 제거(소비자가 top-level 참조 교체 계약 수용 시) | 항상 deep watch |
| 2026-06-12 | options deep-watch opt-out(`shallowOptionsWatch`, 기본 off) | 큰 옵션 객체 deep watch 비용 제거 | 항상 deep watch |
| 2026-06-12 | line/bar geometry 메모이즈 — `(dataEpoch, scaleVersion[, showIndex, showSeriesCount])` + data 참조 키로 재계산 skip | hover/재렌더 프레임에서 불변 기하 재계산 제거(키는 숫자 비교로 문자열 할당 회피) | 매 프레임 computeGeometry 재실행 |
| 2026-06-15 | updateSeries 시 series 인스턴스 증분 재조정(`reconcileSeriesSet`) — reconcile key+opt 동일 시 재사용, index 판정 제외 | 실시간 series churn 프레임에서 점객체 풀·geometry 메모를 보존(full-recreate 대비 목표 5.5×), 색 팔레트가 이웃 churn 에 흔들리지 않게 | 매 갱신 seriesList 전체 재생성 |
| 2026-06-18 | selectSeries 선택 라인을 full redraw 직후 최상위로 한 번 더 덧그림(line-safe 게이트 한정) | dimmed 시리즈 위로 선택 라인이 묻히는 z-order 문제 해소 | 선택 라인 별도 처리 없음(묻힘), 전 시리즈 재정렬 |
| 2026-06-25 | 어노테이션/뱃지 모듈 추가 | 시리즈 위 주석·뱃지 표식을 별도 모듈로 제공 | 기존 plot/tip 계층에 혼재 |
| 2026-06-30 | plotLine/plotBand z-order 옵션(`plot.aboveSeries`) 추가 | plot 오버레이를 시리즈 위/아래 중 선택 가능하게 | 항상 시리즈 위(또는 아래) 고정 |
| 2026-06-30 | realTimeScatter 만료 series 즉시 자동 제거((a) 가시 윈도우 밖 + (b) 신규 점 없음, grace 없음) | pod 소멸 등으로 데이터가 끊긴 series 를 축 freeze 없이 정리, 부활 가드(`prunedRealTimeScatterSeries`)로 재추가 방지 | "series 키 부재"로 판정(실시간 배치와 불일치), grace 기간 유지 |
| 2026-06-30 | blit 경로를 full redraw 와 픽셀 동등(blit≡full)하게 확정 — 반투명(per-point `drawn` 플래그)·분수 DPR(q배수 시프트로 device px 정수화)·cross-series dedupe 복원 | fast-path 가 알파 누적·sub-pixel drift·overdraw 로 full 과 달라지는 회귀를 제거, 조건 미달 시 full 폴백 유지 | 불투명·정수 DPR 로 fast-path 적용 범위 제한 |
| 2026-07-24 | plot 라벨 `valueFormatter` 의 폴백을 null/undefined 반환에만 적용하고, 그 외 반환값은 `String()` 변환 | return 누락 등으로 null/undefined 가 오면 라벨에 리터럴 "null"/"undefined" 가 그려지므로 막아야 한다. 반면 숫자 반환은 사용자가 계산한 결과이므로 폴백하면 의도가 사라진다 — 축 `formatter`(문자열 아닌 모든 반환값을 폴백)와 규칙이 다른 이유 | 축 formatter 와 동일하게 문자열 외 전부 폴백(계산 결과 유실), 무조건 `String()`(리터럴 "null" 노출) |
| 2026-07-31 | realTimeScatter 만료 판정 (a) 의 좌단을 렌더 좌단(`fromTime + 1000` = `globalToTime - (range-1)*1000`) 에 맞춤 | 기존 `globalToTime - range*1000` 은 링이 보유·렌더하는 가장 오래된 버킷보다 1버킷 왼쪽이라, 점이 이미 안 보이는 틱에 제거되지 않고 1버킷 뒤에 제거됐다(지연은 틱 레이트와 무관한 상수 1버킷). SPEC·JSDoc 의 "(a)와 정확히 등가" 서술과도 어긋났다 | grace 틱 도입(지연이 더 커짐), **(b) 를 "값 있는 점(finite y)" 기준으로 바꿔 `y=null` 축 패딩을 비활성으로 취급**(→ 철회: JSDoc·본 표 2026-06-30 행이 "뭐라도 보낸 series 는 활성"을 규약으로 못 박았고, `y=null` 은 값 없음 마커이지 소멸 신호가 아니다. 만료가 필요한 target 에 패딩을 계속 보내는 것은 소비자 결함) |
| 2026-08-21 | drag-select 진입 타입에 수직 bar 추가 — 범위는 기존 `getSelectionRange`(graphMin..graphMax 선형 보간)를 그대로 쓰고 `horizontal: true` 는 제외 | 소비처가 필요한 건 x 구간 range 뿐이고, 가로 막대는 x축이 값 축이라 x 드래그가 범주·시간 범위를 뜻하지 않는다. categoryMode bar 의 인덱스 슬롯 배치(`cArea = xArea / totalCount`)와 선형 보간이 어긋나 최대 약 1 막대 폭 오차가 남지만, 실측 전에 공용 범위 계산을 분기하면 zoom(`zoom.getRangeInfo`) 경로까지 회귀 범위가 커진다 | `getSelectionRange` 에 bar 슬롯 역산 분기(공용 경로 회귀 범위 ↑), 소비처에서 슬롯 역산(라이브러리 배치 기하를 소비처가 복제), bar 를 계속 미지원 |
| 2026-08-21 | 누적(stacked) 막대를 drag-select 대상으로 확정 — 게이트·범위 계산 코드 변경 없이 테스트·SPEC·문서로만 고정 | 누적은 차트 타입이 아니라 `data.groups` 로 표현되고 진입 게이트는 `options.type`·`options.horizontal` 만 읽으므로 이미 통과한다. 코드로 표현되지 않은 지원 범위는 게이트에 `groups` 조건을 끼워 넣는 변경으로 조용히 깨질 수 있어, 테스트로 고정하고 누적 시 y range 가 스택 총합 공간이라는 사실을 문서에 남긴다 | 게이트에 누적 분기 명시 추가(동작 동일한 죽은 조건), `Bar.findItems` 를 함께 구현해 `data` 페이로드까지 채우기(요구사항 아님 — 소비 경로는 `range` 만 읽는다), 문서만 갱신하고 테스트 생략(회귀 감지 불가) |
| 2026-08-21 | `Bar.findItems` 추가 — 드래그 구간에 x 구간이 **걸치기만 한** 막대도 담고(부분 겹침 허용), 누적이든 아니든 Line 과 같은 포인트 객체를 그대로 반환 | 막대는 점이 아니라 폭을 가지므로 완전 포함을 요구하면 드래그로 반쯤 덮은 막대가 조용히 빠져 사용자 직관과 어긋난다. 반환값을 Line 과 같게 두면 누적 차트에서 `.y`(누적 합)·`.o`(자기 값)가 둘 다 실려 소비처가 필요한 쪽을 고를 수 있고, 이미 누적 line 이 같은 계약으로 동작한다. 부수 효과로 bar + `zoom.use` + time 축 드래그가 살아난다 — 기존에는 `data` 가 비어 `chartZoom.core.js` 의 `zoomInfoData[0].items` 가 TypeError 였다 | 완전 포함만 담기(HeatMap 선례 — 반쯤 덮은 막대 누락), `.o` 만 담아 누적 합을 숨기기(Line 과 계약이 갈리고 축 range 와도 어긋남), bar 미지원 유지(소비처가 range 만 쓸 수 있음) |
