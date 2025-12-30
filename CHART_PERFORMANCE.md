# EVUI Chart 성능 개선 분석 및 구현 계획

## 목표
- Critical 이슈 4개 해결
- 10만개 이상 대용량 데이터 지원

---

# Part 1: 성능 문제점 분석

## Critical (즉시 개선 필요)

### 1. requestAnimationFrame 미사용
- **위치**: `src/components/chart/chart.core.js`
- **문제**: `drawChart()`, `render()`, `update()` 모두 동기적 실행
- **영향**: 브라우저 렌더링 사이클과 비동기화, 불필요한 중간 프레임 렌더링
- **예외**: `chartZoom.core.js`의 애니메이션에서만 RAF 사용

### 2. drawChart() 중복 계산
- **위치**: `chart.core.js:262-285`
- **문제**:
  ```
  getAxesRange() → getLabelOffset() → calculateSteps() → adjustXAndYAxisWidth()
  └── adjustXAndYAxisWidth() 내부에서 위 계산 모두 다시 수행
  ```
- **영향**: 모든 렌더링마다 2배의 계산 비용

### 3. Deep Watch 과다 사용 (10개)
- **위치**: `src/components/chart/Chart.vue:162-320`
- **문제**:
  - `props.options` deep watch + `cloneDeep()` 매번 실행
  - `props.data` deep watch + `cloneDeep()` 매번 실행
  - `isEqual()` 비교 후 다시 `cloneDeep()` → 이중 탐색
- **영향**: 대용량 데이터에서 심각한 GC 부하

### 4. 전체 재렌더링만 가능
- **위치**: `chart.core.js:update()`
- **문제**: 단일 시리즈 변경에도 모든 시리즈 재계산 및 재렌더
- **영향**: 부분 업데이트 불가능으로 불필요한 렌더링

---

## Medium (개선 권장)

### 5. Stack 차트 O(n*m) 복잡도
- **위치**: `model.store.js:400-471` (`addSeriesStackDS`)
- **문제**: `getBaseDataPosition()`에서 매 포인트마다 스택 깊이만큼 순회
- **영향**: 데이터 1만개 + 스택 10개 = 10만 번 반복
- **개선안**: 사전 계산된 누적값 캐싱

### 6. 마우스 이벤트 Throttle 기본 비활성화
- **위치**: `plugins.interaction.js:524, 908-1008`
- **문제**: 매 mousemove마다 모든 시리즈 순회하며 `findGraphData()` 호출
- **영향**: 60fps 마우스 이동 시 초당 60회 전체 탐색
- **개선안**: throttle 기본 활성화 (16ms 권장)

### 7. 라벨 형식화/측정 반복
- **위치**: `scale/scale.js:256-466`
- **문제**:
  - `getLabelFormat()` 동일 값에 여러 번 호출
  - `measureText()` 캐싱 없이 반복 호출
- **영향**: Canvas API 호출 오버헤드
- **개선안**: Map 기반 결과 캐싱

### 8. Provide/Inject Reactive 전파
- **위치**: `ChartGroup.vue:58-66`, `Chart.vue:305-320`
- **문제**: ChartGroup 내 N개 차트가 동일 reactive 객체 참조
- **영향**: 하나의 hover 이벤트가 N번 watch 트리거
- **개선안**: readonly() 래퍼 또는 이벤트 기반 통신

### 9. Min/Max 매번 재계산
- **위치**: `model.store.js:600-654`
- **문제**: 데이터 변경 없어도 매 업데이트마다 전체 순회
- **영향**: O(n) 불필요한 계산
- **개선안**: 변경 플래그 기반 조건부 재계산

---

## Minor (선택적 개선)

### 10. Double Buffering 메모리
- **위치**: `chart.core.js:57-80`
- **현상**: 3개 캔버스 (display, buffer, overlay) = 메모리 3배
- **비고**: 필수 기능이지만 대형 차트에서 메모리 부담

### 11. Event Handler nextTick 남용
- **위치**: `uses.js:315-363`
- **문제**: 5개 이벤트 핸들러 모두 `await nextTick()` 사용
- **개선안**: 실제 필요한 곳만 사용

### 12. 불필요한 Computed 래핑
- **위치**: `Chart.vue:106-107`
- **문제**: `selectedLabel`, `selectedItem`을 computed로 단순 래핑
- **개선안**: `toRef()` 사용 또는 직접 props 참조

### 13. 클로저 메모리 누수 위험
- **위치**: `plugins.interaction.js:543-679`
- **문제**: `dragMove`, `dragEnd` 함수가 chart 인스턴스 캡처
- **비고**: 컴포넌트 destroy 전 드래그 중단 시 누수 가능

### 14. 메모리 정리 불완전
- **위치**: `chart.core.js:994-1004` (`resetProps`)
- **문제**: `seriesList`, `dataSet` 등 일부 속성 미정리
- **개선안**: destroy() 시 모든 참조 null 처리

---

## 핵심 파일 목록

| 파일 | 주요 역할 | 성능 이슈 개수 |
|------|----------|---------------|
| `src/components/chart/chart.core.js` | 렌더링 코어 | 4개 |
| `src/components/chart/Chart.vue` | Vue 컴포넌트 | 3개 |
| `src/components/chart/model/model.store.js` | 데이터 처리 | 3개 |
| `src/components/chart/plugins/plugins.interaction.js` | 마우스 이벤트 | 2개 |
| `src/components/chart/scale/scale.js` | 축/라벨 계산 | 1개 |
| `src/components/chart/uses.js` | Composables | 2개 |

---

# Part 2: 구현 계획 (Critical 이슈)

## 구현 순서

### Phase 1: 기반 인프라 (신규 파일 생성)

#### 1.1 RenderScheduler 생성
- **파일**: `src/components/chart/helpers/helpers.scheduler.js` (신규)
- **내용**: requestAnimationFrame 기반 렌더링 스케줄러
```javascript
class RenderScheduler {
  schedule(renderFn)  // rAF로 렌더링 예약
  cancel()            // 예약 취소
  flush()             // 즉시 실행 (resize 등)
}
```

#### 1.2 DirtyTracker 생성
- **파일**: `src/components/chart/helpers/helpers.dirty.js` (신규)
- **내용**: 변경된 시리즈/데이터 추적
```javascript
class DirtyTracker {
  markDirty(type, id)   // 변경 표시
  isDirty(type, id)     // 변경 여부 확인
  getDirtySeries()      // 변경된 시리즈 목록
  clear()               // 초기화
}
```

#### 1.3 ViewportManager 생성
- **파일**: `src/components/chart/helpers/helpers.viewport.js` (신규)
- **내용**: 뷰포트 기반 데이터 필터링 (10만개 데이터용)
```javascript
class ViewportManager {
  isInViewport(xp, yp)           // 뷰포트 내 여부
  getVisibleRange(data)          // 이진 탐색으로 범위 찾기
}
```

---

### Phase 2: Core 최적화

#### 2.1 requestAnimationFrame 적용
- **파일**: `src/components/chart/chart.core.js`
- **수정 위치**:
  - `constructor`: scheduler 인스턴스 생성
  - `render()`: scheduler.schedule() 사용
  - `resize()`: scheduler.cancel() 후 즉시 실행
  - `destroy()`: scheduler.cancel() 호출

#### 2.2 중복 계산 제거
- **파일**: `src/components/chart/chart.core.js`
- **수정 위치**: `drawChart()` (라인 262-285)
- **변경**: `adjustXAndYAxisWidth()` 내부에서 이미 계산된 `axesSteps` 재사용

#### 2.3 부분 업데이트 메커니즘
- **파일**: `src/components/chart/chart.core.js`
- **수정 위치**: `update()` (라인 853-987)
- **변경**:
```javascript
update(updateInfo) {
  if (updateSeries) {
    this.fullUpdate();      // 시리즈 구조 변경 시
  } else if (updateData) {
    this.partialUpdate();   // 데이터만 변경 시 (변경된 시리즈만)
  } else {
    this.renderUpdate();    // 렌더링만
  }
}
```

---

### Phase 3: Vue Watch 최적화

#### 3.1 Deep Watch 제거
- **파일**: `src/components/chart/Chart.vue`
- **수정 위치**: 라인 162-212
- **변경**:
```javascript
// Before: deep: true + cloneDeep 매번
watch(() => props.options, ..., { deep: true })

// After: shallow watch + 부분 복사
watch(
  [() => props.options.legend, () => props.options.tooltip, ...],
  ([newLegend, newTooltip, ...]) => {
    // 변경된 부분만 복사
  }
)
```

#### 3.2 변경 감지 유틸리티
- **파일**: `src/components/chart/uses.js`
- **추가**:
```javascript
function detectOptionChanges(newOpt, oldOpt)  // 변경된 옵션 키 반환
function applyOptionChanges(changes)          // 변경분만 적용
```

---

### Phase 4: 대용량 데이터 최적화

#### 4.1 Line 시리즈 뷰포트 컬링
- **파일**: `src/components/chart/element/element.line.js`
- **수정 위치**: `draw()` 메소드
- **변경**: 뷰포트 내 데이터만 렌더링 + 포인트 샘플링

#### 4.2 Scatter 시리즈 최적화
- **파일**: `src/components/chart/element/element.scatter.js`
- **변경**: 공간 인덱싱 또는 뷰포트 컬링 적용

---

## 수정 파일 목록

| 파일 | 작업 | 우선순위 |
|------|------|----------|
| `helpers/helpers.scheduler.js` | 신규 생성 | P1 |
| `helpers/helpers.dirty.js` | 신규 생성 | P1 |
| `helpers/helpers.viewport.js` | 신규 생성 | P1 |
| `chart.core.js` | rAF, 중복계산, 부분업데이트 | P1 |
| `Chart.vue` | deep watch 제거 | P2 |
| `uses.js` | 변경감지 유틸리티 | P2 |
| `element/element.line.js` | 뷰포트 컬링 | P3 |
| `element/element.scatter.js` | 대용량 최적화 | P3 |

---

## 예상 효과

| 개선 항목 | 예상 성능 향상 |
|----------|---------------|
| rAF + 중복계산 제거 | 렌더링 20-30% |
| Deep watch 제거 | 업데이트 30-50% |
| 부분 업데이트 | 데이터 변경 시 50%+ |
| 뷰포트 컬링 | 10만개 데이터 렌더링 가능 |

---

## API 호환성
- 모든 외부 API 유지 (render, update, resize, destroy)
- props.options, props.data 인터페이스 변경 없음
- 이벤트 리스너 동일
