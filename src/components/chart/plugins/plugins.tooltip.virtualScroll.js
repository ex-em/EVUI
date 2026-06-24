import Util from '../helpers/helpers.util';

/**
 * 커스텀 툴팁(html formatter) 가상 스크롤 모듈.
 *
 * 동작 개요:
 *  1) `tooltip.formatter.html(items)`로 사용자가 반환한 HTML을 파싱한다.
 *  2) 파싱된 트리에서 가상화 대상 "컨테이너"를 찾는다 (행 탐지 기준, 우선순위 순):
 *     a. `[data-evui-tooltip-row]` 속성 행의 개수가 series 수와 일치하고 부모가 동일 → 그 부모.
 *        - 사용자는 시리즈당 wrapper element 하나에 이 속성만 추가하면 된다.
 *     b. 휴리스틱: BFS로 자식 수가 `items.length`와 일치하는 가장 얕은 element.
 *        - row가 단순한 한 단계의 자식들로 구성된 경우에만 동작.
 *  3) 둘 다 실패하면 가상 스크롤 비활성, 기존 경로로 fallback (경고 1회).
 *  4) **컨테이너의 직속 자식 전체**를 순서 보존 "아이템"으로 가상화한다.
 *     - 행 = `[data-evui-tooltip-row]` 보유 / 비-row = 그 외 모든 직속 자식(그룹 헤더·구분선·marker 등).
 *       분류 기준은 오직 `data-evui-tooltip-row` 속성 유무이며, 소비처 클래스명은 보지 않는다.
 *     - 비-row는 자기 위치(자기 그룹 행 위/사이)를 보존한 채 행과 함께 스크롤되어 들어오고 나간다.
 *  5) 가시 범위(행+비-row 통합 좌표계)의 아이템만 viewport에 부착하고 상/하 spacer로 나머지 높이 보전.
 *  6) 가시 아이템은 부착 직후 측정하여 prefix sum 갱신, 앵커 보정으로 스크롤 점프 방지.
 *     - 학습 평균/추정 높이는 **행 아이템만** 대상으로 계산해 키가 다른 비-row가 행 추정을 오염시키지 않게 한다.
 *  7) ResizeObserver로 컨테이너 폭 변화 시 측정 무효화 후 재렌더.
 */

const DEFAULT_MAX_HEIGHT = 480;
const DEFAULT_ESTIMATED_ROW_HEIGHT = 28;
const DEFAULT_OVERSCAN = 5;
const DEFAULT_THRESHOLD = 50;

const modules = {
  /**
   * 가상 스크롤이 활성화되어야 하는지 판단한다.
   * @param {number} itemsCount  시리즈 수
   * @returns {boolean}
   */
  _shouldVirtualizeCustomTooltip(itemsCount) {
    // 직전에 row 탐지에 실패했으면(현재 마크업 구조로는 가상 스크롤 불가) 매 mousemove마다
    // formatter 실행·파싱을 반복하지 않도록 단락한다. 플래그는 데이터/옵션 변경으로 마크업이
    // 달라질 수 있는 render() 시점에 리셋된다.
    if (this._vsDetectFailed) return false;
    const opt = this.options?.tooltip;
    if (!opt?.formatter?.html) return false;
    const vs = opt.virtualScroll;
    if (!vs || vs.use === false) return false;
    if (vs.use === true) return itemsCount > 0;
    // 'auto'
    return itemsCount >= (vs.threshold ?? DEFAULT_THRESHOLD);
  },

  /**
   * 파싱된 트리에서 가상화 대상 컨테이너를 찾는다.
   * 컨테이너의 직속 자식 전체(행 + 비-row 데코레이션)가 가상화 아이템이 된다.
   *
   * @param {Element} root
   * @param {number} itemsCount  series 수
   * @returns {Element|null}
   */
  _findCustomTooltipContainer(root, itemsCount) {
    if (!root || !root.querySelectorAll) return null;

    // 1) 명시적 마커 — 행 개수가 series 수와 일치하고 부모가 동일하면 그 부모가 컨테이너.
    //    부모에 비-row 형제(그룹 헤더·구분선·marker 등)가 섞여 있어도 컨테이너로 인정한다.
    const marked = root.querySelectorAll('[data-evui-tooltip-row]');
    if (marked.length === itemsCount && marked.length > 0) {
      const firstParent = marked[0].parentElement;
      let sameParent = !!firstParent;
      for (let i = 1; i < marked.length; i++) {
        if (marked[i].parentElement !== firstParent) {
          sameParent = false;
          break;
        }
      }
      if (sameParent) {
        return firstParent;
      }
    }

    // 2) BFS 휴리스틱 — 자식 수가 itemsCount와 일치하는 가장 얕은 element
    //    (이 경로의 컨테이너 자식들은 전부 행이므로 비-row가 없는 기존 동작과 동일)
    const queue = [root];
    while (queue.length) {
      const node = queue.shift();
      if (node.children && node.children.length === itemsCount) {
        return node;
      }
      if (node.children) {
        for (let i = 0; i < node.children.length; i++) {
          queue.push(node.children[i]);
        }
      }
    }
    return null;
  },

  /**
   * spacer/viewport DOM은 매 draw마다 새로 생성한다. 사용자 wrapper마다 row 컨테이너가
   * 다를 수 있으므로 컨테이너를 외부에서 받는다.
   */
  _createVirtualScrollAnatomy() {
    const topSpacer = document.createElement('div');
    topSpacer.className = 'ev-chart-tooltip-virtual__spacer';
    topSpacer.setAttribute('aria-hidden', 'true');

    const viewport = document.createElement('div');
    viewport.className = 'ev-chart-tooltip-virtual__viewport';

    const bottomSpacer = document.createElement('div');
    bottomSpacer.className = 'ev-chart-tooltip-virtual__spacer';
    bottomSpacer.setAttribute('aria-hidden', 'true');

    return { topSpacer, viewport, bottomSpacer };
  },

  /**
   * heights → prefixSums, totalHeight 갱신
   */
  _recomputeCustomTooltipPrefixSums() {
    const s = this.vsState;
    const n = s.heights.length;
    if (s.prefixSums.length !== n + 1) {
      s.prefixSums = new Array(n + 1);
    }
    let acc = 0;
    s.prefixSums[0] = 0;
    for (let i = 0; i < n; i++) {
      acc += s.heights[i];
      s.prefixSums[i + 1] = acc;
    }
    s.totalHeight = acc;
  },

  /**
   * 스크롤 위치 기반 가시 범위 계산 (overscan 포함)
   */
  _computeCustomTooltipVisibleRange() {
    const s = this.vsState;
    const n = s.heights.length;
    if (!n) return { start: 0, end: -1 };

    const containerHeight = s.scrollEl.clientHeight || s.maxHeight;
    const scrollTop = s.scrollEl.scrollTop;

    // start: prefixSums[i+1] > scrollTop인 최소 i
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (s.prefixSums[mid + 1] > scrollTop) hi = mid;
      else lo = mid + 1;
    }
    const startIndex = Math.max(0, lo - s.overscan);

    // end: prefixSums[i] >= scrollBottom인 최소 i
    const scrollBottom = scrollTop + containerHeight;
    lo = startIndex;
    hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (s.prefixSums[mid] >= scrollBottom) hi = mid;
      else lo = mid + 1;
    }
    const endIndex = Math.min(n - 1, lo + s.overscan);

    return { start: startIndex, end: endIndex };
  },

  /**
   * spacer 높이를 동기화 (값이 같으면 DOM write 생략)
   */
  _syncCustomTooltipSpacers() {
    const s = this.vsState;
    const topH = s.prefixSums[s.range.start] || 0;
    const bottomH = Math.max(
      0,
      s.totalHeight - (s.prefixSums[s.range.end + 1] || s.totalHeight),
    );
    const topPx = `${topH}px`;
    const bottomPx = `${bottomH}px`;
    if (s.topSpacer.style.height !== topPx) s.topSpacer.style.height = topPx;
    if (s.bottomSpacer.style.height !== bottomPx) s.bottomSpacer.style.height = bottomPx;
  },

  /**
   * 가시 범위 아이템만 viewport에 부착한다(행/비-row 무관, 원래 순서 보존).
   * 다른 아이템은 detach 상태(this.vsState.items 배열에 보존).
   * 새 range가 직전 range와 동일하면 viewport 재구성을 건너뛰고 spacer만 갱신한다.
   */
  _renderVisibleCustomTooltipRows() {
    const s = this.vsState;
    if (!s || !s.items.length) return;

    const range = this._computeCustomTooltipVisibleRange();
    const same = s.range.start === range.start && s.range.end === range.end;

    if (!same) {
      // viewport 비우고 새 범위 부착
      while (s.viewport.firstChild) {
        s.viewport.removeChild(s.viewport.firstChild);
      }
      const frag = document.createDocumentFragment();
      for (let i = range.start; i <= range.end; i++) {
        const item = s.items[i];
        if (item) frag.appendChild(item);
      }
      s.viewport.appendChild(frag);
      s.range = range;
    } else {
      s.range = range;
    }

    this._syncCustomTooltipSpacers();

    // 미측정 행이 있으면 동기적으로 측정·보정을 마쳐 사용자 입력(휠 등) 전에 안정 상태를 만든다.
    // rAF 비동기로 미루면 휠 플릭 중간에 calibration이 끼어들어 scrollTop이 크게 점프함.
    // 무한 재귀 방지: 한 사이클에서 최대 2회까지만.
    let hasUnmeasured = false;
    for (let i = range.start; i <= range.end; i++) {
      if (!s.measured[i]) {
        hasUnmeasured = true;
        break;
      }
    }
    if (hasUnmeasured) {
      const depth = s.measureDepth || 0;
      if (depth < 2) {
        s.measureDepth = depth + 1;
        try {
          this._measureVisibleCustomTooltipRows();
        } finally {
          s.measureDepth = depth;
        }
      }
    }
  },

  /**
   * viewport 자식들의 실제 높이를 측정해 캐시 업데이트(행/비-row 모두 실측).
   * 학습 평균은 **행 아이템만** 대상으로 계산해 키가 다른 비-row가 행 추정을 오염시키지 않게 하고,
   * 미측정 '행'에만 평균을 적용해 totalHeight 점프를 흡수한다. (미측정 비-row는 실측 전까지 추정 유지)
   * 추정과 다르면 prefix sum 재계산 + 앵커 보정 후 다시 렌더.
   */
  _measureVisibleCustomTooltipRows() {
    const s = this.vsState;
    if (!s || !s.viewport) return;

    const children = s.viewport.children;
    const count = children.length;
    if (!count) return;

    const anchorIdx = s.range.start;
    const oldAnchorOffset = s.prefixSums[anchorIdx] || 0;

    let changed = false;
    let rowSum = 0;
    let rowCount = 0;
    for (let k = 0; k < count; k++) {
      const idx = s.range.start + k;
      const h = children[k].offsetHeight;
      // display:none 상태(첫 draw가 setCustomTooltipLayoutPosition 이전에 호출됨)에서는
      // offsetHeight가 0이다. 이때 measured로 표기하면 추정 높이가 실측으로 굳어져
      // 이후 휠 입력 시 점프가 발생하므로, 실제로 측정된(h>0) 경우에만 measured 처리한다.
      if (h > 0) {
        if (h !== s.heights[idx]) {
          s.heights[idx] = h;
          changed = true;
        }
        s.measured[idx] = true;
      }
      // 학습 평균은 행 아이템만 대상으로 (키 큰 헤더 등 비-row가 행 추정을 오염시키지 않게)
      if (s.isRow[idx] && h > 0) {
        rowSum += h;
        rowCount += 1;
      }
    }

    // 학습된 행 평균을 누적 (다음 세션 estimated 부트스트랩)
    if (rowCount > 0) {
      const avg = rowSum / rowCount;
      s.learnedAverageHeight = avg;

      // 미측정 '행'에만 평균을 적용해 totalHeight 추정을 보정 (초기 점프 제거)
      if (avg > 0 && Math.abs(avg - s.estimatedRowHeight) > 0.5) {
        s.estimatedRowHeight = avg;
        for (let i = 0; i < s.heights.length; i++) {
          if (s.isRow[i] && !s.measured[i] && s.heights[i] !== avg) {
            s.heights[i] = avg;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      this._recomputeCustomTooltipPrefixSums();

      // 앵커 보정: 같은 인덱스의 행이 새 prefix sum에서도 같은 viewport 위치에 오도록
      const newAnchorOffset = s.prefixSums[anchorIdx] || 0;
      const delta = newAnchorOffset - oldAnchorOffset;
      if (delta !== 0) {
        // 프로그램적 scrollTop 변경은 onScroll → rAF 렌더를 다시 트리거하므로 잠시 차단
        s.suppressScroll = true;
        s.scrollEl.scrollTop += delta;
        // scroll 이벤트는 다음 microtask~rAF 사이에 발화. 두 프레임 후 해제로 충분.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (this.vsState) this.vsState.suppressScroll = false;
          });
        });
      }

      // totalHeight 변동으로 가시 범위가 바뀔 수 있으므로 한 번 더 렌더
      // (이번엔 가시 범위 모두 measured이므로 무한 측정 루프 없음)
      this._renderVisibleCustomTooltipRows();
    } else {
      this._syncCustomTooltipSpacers();
    }
  },

  /**
   * 진입점: drawCustomTooltip에서 가상 스크롤 경로로 분기될 때 호출.
   * 성공 시 true, 휴리스틱 실패 등으로 fallback이 필요하면 false.
   *
   * @param {object} hitInfoItems  hitInfo.items
   * @returns {boolean}
   */
  drawCustomTooltipVirtual(hitInfoItems) {
    const opt = this.options?.tooltip;
    if (!opt?.formatter?.html) return false;

    const seriesList = [];
    Object.keys(hitInfoItems).forEach((sId) => {
      seriesList.push({
        sId,
        data: hitInfoItems[sId].data,
        color: hitInfoItems[sId].color,
        name: hitInfoItems[sId].name,
        dataId: hitInfoItems[sId].id,
        index: hitInfoItems[sId].index,
      });
    });

    let htmlString;
    try {
      htmlString = opt.formatter.html(seriesList);
    } catch (err) {
      // 사용자 코드의 예외는 가상 스크롤에서 가둬두지 않고 fallback 신호로만 사용
      console.warn('[evui] tooltip.formatter.html threw, falling back:', err);
      return false;
    }
    const parsed = Util.htmlToElement(htmlString);
    if (!parsed || !parsed.children) return false;

    const container = this._findCustomTooltipContainer(parsed, seriesList.length);
    if (!container) {
      // 동일 마크업이 유지되는 동안 재시도(formatter+파싱 2회/move)를 막는다. render()에서 리셋.
      this._vsDetectFailed = true;
      if (!this._vsWarnedFallback) {
        this._vsWarnedFallback = true;
        // eslint-disable-next-line no-console
        console.warn(
          '[evui] tooltip.virtualScroll: formatter.html 반환 구조에서 row를 식별하지 못해 ' +
            '가상 스크롤을 건너뜁니다. 시리즈당 wrapper element에 ' +
            '`data-evui-tooltip-row` 속성을 추가하거나, ' +
            'row 컨테이너 직속 자식이 시리즈 수와 일치하도록 마크업을 정리하세요.',
        );
      }
      return false;
    }

    // 컨테이너 직속 자식 전체를 순서 보존 "아이템"으로 수집한다(행 + 비-row 데코레이션).
    //  - 행 = `[data-evui-tooltip-row]` 보유 / 비-row = 그 외 모든 직속 자식.
    //  - 분류 기준은 오직 속성 유무. 소비처 클래스명은 보지 않는다.
    //  - 단, 마크된 행이 하나도 없으면(휴리스틱 BFS로 탐지된 균일-행 본문) 전부 '행'으로 간주해
    //    학습 평균 보정 등 기존 동작을 보존한다.
    const items = Array.from(container.children);
    if (!items.length) return false;
    const hasMark = (el) => !!(el.hasAttribute && el.hasAttribute('data-evui-tooltip-row'));
    const markedExists = items.some(hasMark);
    const isRow = items.map((el) => (markedExists ? hasMark(el) : true));

    // 모든 아이템 detach(배열에 보존) 후 컨테이너를 비우고 trio를 그 자리에 삽입한다.
    // 비-row도 아이템으로 함께 가상화하므로 더 이상 제자리 보존(anchorBefore) 로직이 필요 없다.
    for (let i = 0; i < items.length; i++) {
      const el = items[i];
      if (el.parentNode) el.parentNode.removeChild(el);
    }
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    const { topSpacer, viewport, bottomSpacer } = this._createVirtualScrollAnatomy();
    container.appendChild(topSpacer);
    container.appendChild(viewport);
    container.appendChild(bottomSpacer);

    // 컨테이너를 스크롤 가능하게 설정 (사용자 CSS를 inline으로 덮어씀)
    const maxHeight = opt.maxHeight || DEFAULT_MAX_HEIGHT;
    container.style.maxHeight = `${maxHeight}px`;
    container.style.overflowY = 'auto';
    container.style.overflowX = 'hidden';
    // 가상 스크롤에서 spacer 높이가 바뀔 때마다 브라우저의 scroll anchoring이
    // scrollTop을 자동 보정해 휠 플릭 시 스크롤이 끝까지 튕겨가는 현상이 발생한다.
    // 우리가 prefix sum + 앵커 인덱스로 직접 위치를 관리하므로 브라우저 보정을 끈다.
    container.style.overflowAnchor = 'none';

    // 기존 정리 (이전 세션 리스너/옵저버 해제)
    this._teardownCustomTooltipVirtualScroll();

    const vs = opt.virtualScroll || {};
    const learned = this._vsLearnedAverageHeight;
    // 이전 세션에서 실측한 평균(learned)이 정적 추정값보다 정확하므로 최우선 사용한다.
    // (DEFAULT_OPTIONS가 estimatedRowHeight를 항상 채우므로, learned를 뒤에 두면 도달 불가)
    const estimated =
      learned ?? vs.estimatedRowHeight ?? DEFAULT_ESTIMATED_ROW_HEIGHT;

    this.vsState = {
      scrollEl: container,
      topSpacer,
      viewport,
      bottomSpacer,
      items,
      isRow,
      heights: new Array(items.length).fill(estimated),
      measured: new Array(items.length).fill(false),
      prefixSums: [],
      totalHeight: 0,
      range: { start: 0, end: -1 },
      estimatedRowHeight: estimated,
      overscan: vs.overscan ?? DEFAULT_OVERSCAN,
      maxHeight,
      rafPending: false,
      suppressScroll: false,
      learnedAverageHeight: learned,
      resizeObserver: null,
      onScroll: null,
    };

    this._recomputeCustomTooltipPrefixSums();

    // scroll 핸들러 (rAF throttled, 프로그램적 보정 중에는 무시)
    const onScroll = () => {
      if (!this.vsState) return;
      if (this.vsState.suppressScroll) return;
      if (this.vsState.rafPending) return;
      this.vsState.rafPending = true;
      requestAnimationFrame(() => {
        if (!this.vsState) return;
        this.vsState.rafPending = false;
        this._renderVisibleCustomTooltipRows();
      });
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    this.vsState.onScroll = onScroll;

    // ResizeObserver: 폭 변화 시 측정 무효화
    if (typeof ResizeObserver !== 'undefined') {
      let lastWidth = container.clientWidth;
      const ro = new ResizeObserver(() => {
        if (!this.vsState) return;
        const w = container.clientWidth;
        if (w !== lastWidth) {
          lastWidth = w;
          this.vsState.measured.fill(false);
          this.vsState.heights.fill(this.vsState.estimatedRowHeight);
          this._recomputeCustomTooltipPrefixSums();
          this._renderVisibleCustomTooltipRows();
        }
      });
      ro.observe(container);
      this.vsState.resizeObserver = ro;
    }

    // tooltipDOM 정리 후 wrapper 부착
    while (this.tooltipDOM.firstChild) {
      this.tooltipDOM.removeChild(this.tooltipDOM.firstChild);
    }
    this.tooltipDOM.appendChild(parsed);

    // tooltipDOM 스타일 (drawCustomTooltip이 하던 것 유지)
    this.tooltipDOM.style.overflowY = 'hidden';
    this.tooltipDOM.style.backgroundColor = opt.backgroundColor;
    this.tooltipDOM.style.border = `1px solid ${opt.borderColor}`;
    this.tooltipDOM.style.color = opt.fontColor?.title ?? opt.fontColor;

    // 첫 렌더 (이때 maxHeight 적용된 container는 clientHeight를 가지므로 가시 범위 계산 가능)
    this._renderVisibleCustomTooltipRows();

    // 학습된 평균을 인스턴스 레벨에 보존 (다음 세션 estimated 부트스트랩)
    return true;
  },

  /**
   * 직전 가상 스크롤 세션의 이벤트/옵저버를 해제한다.
   */
  _teardownCustomTooltipVirtualScroll() {
    const s = this.vsState;
    if (!s) return;
    if (s.scrollEl && s.onScroll) {
      s.scrollEl.removeEventListener('scroll', s.onScroll);
    }
    if (s.resizeObserver) {
      s.resizeObserver.disconnect();
    }
    if (s.learnedAverageHeight) {
      this._vsLearnedAverageHeight = s.learnedAverageHeight;
    }
    this.vsState = null;
  },
};

export default modules;
