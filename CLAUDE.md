# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EVUI is a Vue 3 component library developed by EXEM. It provides UI components including form elements, data visualization (charts), data tables (grid/tree grid), and utility components.

## Common Commands

```bash
# Run documentation dev server (port 9999)
npm run docs

# Build the library for production
npm run build:lib

# Lint and fix code
npm run lint

# Build documentation for deployment
npm run build:docs

# Preview built documentation
npm run preview
```

## Architecture

### Library Structure

- **Entry Point**: `src/main.js` - Exports all components and the EVUI plugin installer
- **Components**: `src/components/` - Each component has its own directory with:
  - `index.js` - Component registration with Vue plugin pattern
  - `*.vue` - Vue single-file component(s)
  - `uses.js` - Composable functions (Vue Composition API)
  - `style/*.scss` - Component-specific styles

### Component Registration Pattern

Each component follows the Vue plugin pattern:

```js
Component.install = (app) => {
  app.component(Component.name, Component);
  // Additional plugins if needed (e.g., VueResizeObserver)
};
```

### Key Components

- **EvChart** (`src/components/chart/`): Canvas-based charting with multiple chart types (line, bar, pie, scatter, heatmap). Core rendering in `chart.core.js`, with separate element renderers in `element/` and scale implementations in `scale/`.

- **EvGrid** (`src/components/grid/`): Virtual-scrolling data grid with sorting, filtering, pagination, column resizing, and row selection. Uses extensive composables in `uses.js` for event handling.

- **EvChartGroup/EvChartBrush**: Chart grouping with synchronized zooming/brushing using Vue's provide/inject pattern.

### Documentation Site

- Located in `docs/` directory
- Uses Vue Router with Vuex for state management
- Component examples in `docs/views/[componentName]/example/`
- API documentation in `docs/views/[componentName]/api/*.md`

### Build Configuration

- **Vite** for both library build (`vite.config.lib.js`) and docs (`vite.config.js`)
- Library outputs ESM and UMD formats
- Path aliases: `@` -> `src/`, `docs` -> `docs/`
- SCSS with modern API configuration

### Code Style

- ESLint with `eslint-config-exem` and Vue 3 rules
- Single quotes, trailing commas, semicolons required
- Max line length: 100 characters
- Use Composition API with `setup()` function
- Prefer `lodash-es` for utilities

## Performance Guard

EVUI는 차트(시리즈 1000+ 가능)와 그리드(행 10000+ 가능) 같은 **대용량 데이터 처리** 컴포넌트가 핵심이다. 새 코드를 작성하거나 기존 코드를 수정할 때, **N이 커질 수 있는 경로**에서는 아래 안티패턴을 의식적으로 피한다. 깊은 분석이 필요하면 `frontend-perf-audit` 스킬을 사용한다.

### Hot path에서 피해야 할 패턴

루프 안 / 매 frame / 매 row·series 단위로 호출되는 코드에 적용. N<100이고 자주 호출되지 않으면 가독성 우선.

1. **루프 내부의 hidden iterator**
   - `Object.keys/values/entries(obj)` — 매번 N개 배열 alloc → 루프 밖으로 hoist
   - `Array.find/filter/indexOf/includes` — O(N) lookup → `Set`/`Map`으로 O(1)
   ```js
   // ❌ rows.forEach(row => checked.includes(row)) — O(N×M)
   // ✅ const checkedSet = new Set(checked); rows.forEach(row => checkedSet.has(row))
   ```

2. **Invariant 호이스팅 누락**
   - `this.options.x`, `arr.length`, `new RegExp(...)`, `searchWord.toLowerCase()` 등 루프 내에서 변하지 않는 값은 루프 밖으로

3. **Hot path 안의 spread는 default로 의심**
   - 작은 객체도 1 alloc/iter씩 누적 → GC 압박
   ```js
   // ❌ series.draw({ ...opt, legendHitInfo })  // 1100 series × 매 frame
   // ✅ opt를 1회 만들고 mutate, 또는 positional arg
   ```

4. **`JSON.parse(JSON.stringify(x))` deep clone**
   - 큰 객체에 쓰면 매우 느리고 GC 폭주 → 정말 필요한지 재검토, 또는 `structuredClone()` / 얕은 복사

5. **Caller-side O(N²) 함정**
   - 함수 자체는 O(N)이어도 호출자가 루프 안에서 N번 부르면 O(N²)
   - 새 헬퍼 함수 만들 때 호출처가 어디인지 확인. 가능하면 caller가 1회만 호출하도록 시그니처 설계

6. **불필요한 방어 코드**
   - `p.x?.value || p.x` 같은 옵셔널 체이닝 — 데이터가 primitive로 보장된다면 그냥 `p.x`
   - 데이터 흐름 추적으로 타입을 확인하고 결정

### 자료구조 선택

- O(1) lookup 필요: `Map`/`Set`
- 순서 + O(1) lookup: `Map` (Object 대신, 키가 동적이면)
- 큰 raw 데이터에 Vue reactivity 불필요: `markRaw`/`shallowRef`/`Object.freeze`
- 매 update마다 같은 모양 객체 수만 개 생성: **객체 풀링** 검토

### Vue/Reactive 주의

- `watch(rows, { deep: true })`는 셀 하나만 바뀌어도 전체 핸들러 재실행 → 큰 데이터는 shallow watch + 명시적 refresh API
- 같은 틱에서 여러 watch가 같은 함수 호출 → `setTimeout(0)`/microtask로 단일 호출로 묶기
- 매 render에 새 클로저 생성 → `computed`로 안정화 (자식 memo 무력화 방지)

### 측정 우선

수정 전후 측정 없이 perf 변경 commit 금지. Chrome Performance 또는 `performance.mark`로 long task 길이를 확인하고, 추정값이 아닌 실제 측정값으로 효과 검증한다.
