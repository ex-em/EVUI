import Util from '../helpers/helpers.util';

/**
 * 커스텀 툴팁(html formatter) 가상 스크롤 모듈.
 *
 * 동작 개요:
 *  1) `tooltip.formatter.html(items)`로 사용자가 반환한 HTML을 파싱한다.
 *  2) 파싱된 트리에서 row를 찾는다 (우선순위 순):
 *     a. `[data-evui-tooltip-row]` 속성이 있는 element들 — **권장**.
 *        - 사용자는 시리즈당 wrapper element 하나에 이 속성만 추가하면 된다.
 *     b. 휴리스틱: BFS로 자식 수가 `items.length`와 일치하는 가장 얕은 element.
 *        - row가 단순한 한 단계의 자식들로 구성된 경우에만 동작.
 *  3) 둘 다 실패하면 가상 스크롤 비활성, 기존 경로로 fallback (경고 1회).
 *  4) 사용자의 wrapper 구조는 그대로 두고, row만 분리하여 가상 스크롤 viewport를 통해
 *     가시 범위 행만 라이브 DOM에 부착한다.
 *  5) 가시 행은 부착 직후 측정하여 prefix sum 갱신, 앵커 보정으로 스크롤 점프 방지.
 *  6) ResizeObserver로 컨테이너 폭 변화 시 측정 무효화 후 재렌더.
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
   * 파싱된 트리에서 row 배열과 그 공통 부모(rowContainer)를 찾는다.
   *
   * @param {Element} root
   * @param {number} itemsCount
   * @returns {{rows: Element[], rowContainer: Element}|null}
   */
  _findCustomTooltipRows(root, itemsCount) {
    if (!root || !root.querySelectorAll) return null;

    // 1) 명시적 마커
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
        return { rows: Array.from(marked), rowContainer: firstParent };
      }
    }

    // 2) BFS 휴리스틱 — 자식 수가 itemsCount와 일치하는 가장 얕은 element
    const queue = [root];
    while (queue.length) {
      const node = queue.shift();
      if (node.children && node.children.length === itemsCount) {
        return { rows: Array.from(node.children), rowContainer: node };
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
   * 가시 범위 행만 viewport에 부착한다. 다른 행은 detach 상태(this.vsState.rows 배열에 보존).
   * 새 range가 직전 range와 동일하면 viewport 재구성을 건너뛰고 spacer만 갱신한다.
   */
  _renderVisibleCustomTooltipRows() {
    const s = this.vsState;
    if (!s || !s.rows.length) return;

    const range = this._computeCustomTooltipVisibleRange();
    const same = s.range.start === range.start && s.range.end === range.end;

    if (!same) {
      // viewport 비우고 새 범위 부착
      while (s.viewport.firstChild) {
        s.viewport.removeChild(s.viewport.firstChild);
      }
      const frag = document.createDocumentFragment();
      for (let i = range.start; i <= range.end; i++) {
        const row = s.rows[i];
        if (row) frag.appendChild(row);
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
   * viewport 자식들의 실제 높이를 측정해 캐시 업데이트.
   * 첫 측정 시 미측정 row들도 학습된 평균으로 보정해 totalHeight 점프를 흡수한다.
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
    let sum = 0;
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
      sum += h;
    }

    // 학습된 평균을 누적 (다음 세션 estimated)
    const avg = sum / count;
    s.learnedAverageHeight = avg;

    // 미측정 row들에 평균을 적용해 totalHeight 추정을 보정 (초기 점프 제거)
    if (avg > 0 && Math.abs(avg - s.estimatedRowHeight) > 0.5) {
      s.estimatedRowHeight = avg;
      for (let i = 0; i < s.heights.length; i++) {
        if (!s.measured[i] && s.heights[i] !== avg) {
          s.heights[i] = avg;
          changed = true;
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

    const found = this._findCustomTooltipRows(parsed, seriesList.length);
    if (!found) {
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

    const { rows, rowContainer } = found;

    // 가상 스크롤 trio를 끼워넣을 위치 결정:
    //  - 첫 행의 다음 형제부터 따라가며 "행 집합에 속하지 않는" 첫 노드를 anchor로 잡는다.
    //    못 찾으면 null (= rowContainer 끝에 append).
    //  - 이렇게 해야 비-row 형제(header/footer 등)는 그대로 보존되면서, 동시에 anchor가
    //    이후 detach로 부모를 잃는 일이 없다.
    const rowSet = new Set(rows);
    const firstRow = rows[0];
    let anchorBefore = firstRow ? firstRow.nextSibling : null;
    while (anchorBefore && rowSet.has(anchorBefore)) {
      anchorBefore = anchorBefore.nextSibling;
    }

    // 행 분리 (보존)
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.parentNode) row.parentNode.removeChild(row);
    }

    // trio 생성·삽입. insertBefore(node, null)은 spec상 appendChild와 동치.
    const { topSpacer, viewport, bottomSpacer } = this._createVirtualScrollAnatomy();
    rowContainer.insertBefore(topSpacer, anchorBefore);
    rowContainer.insertBefore(viewport, anchorBefore);
    rowContainer.insertBefore(bottomSpacer, anchorBefore);

    // row 컨테이너를 스크롤 가능하게 설정 (사용자 CSS를 inline으로 덮어씀)
    const maxHeight = opt.maxHeight || DEFAULT_MAX_HEIGHT;
    rowContainer.style.maxHeight = `${maxHeight}px`;
    rowContainer.style.overflowY = 'auto';
    rowContainer.style.overflowX = 'hidden';
    // 가상 스크롤에서 spacer 높이가 바뀔 때마다 브라우저의 scroll anchoring이
    // scrollTop을 자동 보정해 휠 플릭 시 스크롤이 끝까지 튕겨가는 현상이 발생한다.
    // 우리가 prefix sum + 앵커 인덱스로 직접 위치를 관리하므로 브라우저 보정을 끈다.
    rowContainer.style.overflowAnchor = 'none';

    // 기존 정리 (이전 세션 리스너/옵저버 해제)
    this._teardownCustomTooltipVirtualScroll();

    const vs = opt.virtualScroll || {};
    const learned = this._vsLearnedAverageHeight;
    // 이전 세션에서 실측한 평균(learned)이 정적 추정값보다 정확하므로 최우선 사용한다.
    // (DEFAULT_OPTIONS가 estimatedRowHeight를 항상 채우므로, learned를 뒤에 두면 도달 불가)
    const estimated =
      learned ?? vs.estimatedRowHeight ?? DEFAULT_ESTIMATED_ROW_HEIGHT;

    this.vsState = {
      scrollEl: rowContainer,
      topSpacer,
      viewport,
      bottomSpacer,
      rows,
      heights: new Array(rows.length).fill(estimated),
      measured: new Array(rows.length).fill(false),
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
    rowContainer.addEventListener('scroll', onScroll, { passive: true });
    this.vsState.onScroll = onScroll;

    // ResizeObserver: 폭 변화 시 측정 무효화
    if (typeof ResizeObserver !== 'undefined') {
      let lastWidth = rowContainer.clientWidth;
      const ro = new ResizeObserver(() => {
        if (!this.vsState) return;
        const w = rowContainer.clientWidth;
        if (w !== lastWidth) {
          lastWidth = w;
          this.vsState.measured.fill(false);
          this.vsState.heights.fill(this.vsState.estimatedRowHeight);
          this._recomputeCustomTooltipPrefixSums();
          this._renderVisibleCustomTooltipRows();
        }
      });
      ro.observe(rowContainer);
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

    // 첫 렌더 (이때 maxHeight 적용된 rowContainer는 clientHeight를 가지므로 가시 범위 계산 가능)
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
