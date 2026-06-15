import { defaultsDeep, isEqual, throttle } from 'lodash-es';
import { truthyNumber } from '@/common/utils';
import { AXIS_OPTION } from '../helpers/helpers.constant';
import { checkNullAndUndefined } from '../../../common/utils';

const module = {
  /**
   * init scrollbar information
   */
  initScrollbar() {
    if (this.options.axesX?.[0]?.scrollbar?.use) {
      this.initScrollbarInfo(this.options.axesX, 'x');
    }

    if (this.options.axesY?.[0]?.scrollbar?.use) {
      this.initScrollbarInfo(this.options.axesY, 'y');
    }
  },

  /**
   * init scrollbar information with axis information
   * @param axisOpt axis option
   * @param dir axis direction (x | y)
   */
  initScrollbarInfo(axisOpt, dir) {
    const scrollbarOpt = this.scrollbar[dir];
    const merged = defaultsDeep({}, axisOpt?.[0]?.scrollbar, AXIS_OPTION.scrollbar);
    Object.keys(merged).forEach((key) => {
      scrollbarOpt[key] = merged[key];
    });

    if (scrollbarOpt.resetPosition) {
      scrollbarOpt.range = axisOpt?.[0]?.range?.length ? [...axisOpt[0].range] : null;
      // range 변경 후엔 anchor 재계산(불변식). isInit 상태로 재진입(resize 등)할 때
      // 아래 !isInit 블록을 타지 않아 anchorEdge 가 stale 해지는 것을 방지한다.
      this.updateScrollbarAnchorEdge(dir);
    }

    if (!scrollbarOpt.isInit) {
      scrollbarOpt.type = axisOpt?.[0]?.type;
      scrollbarOpt.range = axisOpt?.[0]?.range?.length ? [...axisOpt[0].range] : null;

      this.initScrollbarRange(dir);
      this.updateScrollbarAnchorEdge(dir);
      this.createScrollbarLayout(dir);
      this.createScrollbar(dir);
      this.createScrollEvent(dir);
      scrollbarOpt.isInit = true;
    }
  },

  initScrollbarRange(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    const labels = this.options.type === 'heatMap' ? this.data.labels[dir] : this.data.labels;

    if (scrollbarOpt.range?.length && labels.length) {
      const [min, max] = scrollbarOpt.range;

      if (truthyNumber(min) && truthyNumber(max)) {
        const limits = this.getScrollbarLimits(dir);
        if (!limits) {
          return;
        }
        const { limitMin, limitMax } = limits;

        const originalWidth = max - min;
        const availableWidth = limitMax - limitMin;

        if (originalWidth >= availableWidth) {
          scrollbarOpt.range[0] = limitMin;
          scrollbarOpt.range[1] = limitMax;
        } else {
          // 윈도우(폭 originalWidth)를 한계 [limitMin, limitMax] 안으로 이동시킨다.
          // 라이브 데이터로 윈도우가 한계 밖으로 완전히 밀렸을 때 range 가 역전
          // (range[0] > range[1])/붕괴되지 않도록 항상 폭을 유지한 채 가장자리에 정렬한다.
          let lo = +min < limitMin ? limitMin : +min;
          let hi = lo + originalWidth;

          if (hi > limitMax) {
            hi = limitMax;
            lo = hi - originalWidth;

            if (lo < limitMin) {
              lo = limitMin;
            }
          }

          scrollbarOpt.range[0] = lo;
          scrollbarOpt.range[1] = hi;
        }
      }
    }
  },

  /**
   * Updated scrollbar information with updated axis information
   * @param dir axis direction (x | y)
   * @param updateData is update data
   */
  updateScrollbarInfo(dir, updateData) {
    const { axesX, axesY } = this.options;
    const newOpt = dir === 'x' ? axesX : axesY;
    if (!this.scrollbar[dir].isInit && newOpt?.[0]?.scrollbar?.use && newOpt?.[0]?.range) {
      this.initScrollbarInfo(newOpt, dir);
      return;
    } else if (!newOpt?.[0].scrollbar?.use || checkNullAndUndefined(newOpt?.[0]?.range)) {
      this.destroyScrollbar(dir);
      return;
    }

    const axisOpt = dir === 'x' ? this.axesX : this.axesY;
    const isUpdateAxesRange = !isEqual(newOpt?.[0]?.range, axisOpt?.[0]?.range);
    if (isUpdateAxesRange || updateData) {
      const isResetPosition = dir === 'x'
        ? this.options.axesX?.[0]?.scrollbar?.resetPosition
        : this.options.axesY?.[0]?.scrollbar?.resetPosition;
      if (isUpdateAxesRange) {
        const newOptRange = newOpt?.[0]?.range;
        const currentRange = this.scrollbar[dir].range;
        if (!isResetPosition && newOptRange?.length && currentRange?.length) {
          // 리사이즈 등으로 size 만 바뀌었을 때: anchorEdge 가 있으면 그 가장자리에 붙여
          // 새 range 를 계산하고, 없으면 현재 시작점을 유지한다.
          const newSize = newOptRange[1] - newOptRange[0];
          const anchorEdge = this.scrollbar[dir].anchorEdge;
          const limits = anchorEdge ? this.getScrollbarLimits(dir) : null;
          if (anchorEdge === 'start' && limits) {
            this.scrollbar[dir].range = [limits.limitMin, limits.limitMin + newSize];
          } else if (anchorEdge === 'end' && limits) {
            this.scrollbar[dir].range = [limits.limitMax - newSize, limits.limitMax];
          } else {
            this.scrollbar[dir].range = [currentRange[0], currentRange[0] + newSize];
          }
        } else {
          this.scrollbar[dir].range = newOptRange?.length ? [...newOptRange] : null;
        }
      }

      this.initScrollbarRange(dir);
      // anchorEdge 는 윈도우가 실제로 이동한 경우(range 옵션 변경=리사이즈/범위 지정 등)에만
      // 재계산한다. 데이터만 업데이트된 경우 윈도우 위치는 그대로인데, 라이브 데이터로
      // minMax(=한계)가 변하면 clip 으로 윈도우가 우연히 한계에 닿을 수 있다. 이때 anchorEdge
      // 를 새로 만들면 자유 위치(중앙)에 둔 윈도우가 다음 리사이즈에 가장자리로 스냅되는
      // 오탐이 생기므로(리뷰 #2), 데이터 업데이트 경로에서는 기존 anchorEdge 를 보존한다.
      if (isUpdateAxesRange) {
        this.updateScrollbarAnchorEdge(dir);
      }
    }
    this.scrollbar[dir].use = !!newOpt?.[0].scrollbar?.use;
  },

  /**
   * update scrollbar position
   */
  updateScrollbarPosition() {
    if (this.scrollbar.x?.use && this.scrollbar.x?.isInit) {
      this.setScrollbarPosition('x');
    }

    if (this.scrollbar.y?.use && this.scrollbar.y?.isInit) {
      this.setScrollbarPosition('y');
    }
  },

  /**
   * create scrollbar layout
   * @param dir axis direction ('x' | 'y')
   */
  createScrollbarLayout(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    scrollbarOpt.dom = document.createElement('div');
    scrollbarOpt.dom.className = 'ev-chart-scrollbar';
    scrollbarOpt.dom.dataset.type = 'scrollbar';

    const containerDOM = document.createElement('div');
    containerDOM.className = 'ev-chart-scrollbar-container';
    containerDOM.dataset.type = dir;

    scrollbarOpt.dom.appendChild(containerDOM);
    this.wrapperDOM.appendChild(scrollbarOpt.dom);
  },

  /**
   * create scrollbar
   * @param dir axis direction ('x' | 'y')
   */
  createScrollbar(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    const containerDOM = scrollbarOpt.dom.children[0];
    this.createScrollbarTrack(containerDOM);
    this.createScrollbarThumb(containerDOM);

    if (scrollbarOpt.showButton) {
      this.createScrollbarButton(containerDOM);
    }
  },

  /**
   * create scrollbar track
   * @param containerDOM
   */
  createScrollbarTrack(containerDOM) {
    const trackDOM = document.createElement('div');
    trackDOM.className = 'ev-chart-scrollbar-track';
    trackDOM.dataset.type = 'track';
    containerDOM.appendChild(trackDOM);
  },

  /**
   * create scrollbar thumb
   * @param containerDOM
   */
  createScrollbarThumb(containerDOM) {
    const thumbDOM = document.createElement('div');
    thumbDOM.className = 'ev-chart-scrollbar-thumb';
    thumbDOM.dataset.type = 'thumb';
    containerDOM.appendChild(thumbDOM);
  },

  /**
   * create scrollbar up, down button
   * @param containerDOM
   */
  createScrollbarButton(containerDOM) {
    const upBtnDOM = document.createElement('div');
    upBtnDOM.className = 'ev-chart-scrollbar-button ev-chart-scrollbar-button-up';
    upBtnDOM.dataset.type = 'button';
    const iconUpBtn = document.createElement('i');
    iconUpBtn.className = 'ev-icon ev-icon-triangle-up ev-chart-scrollbar-button-icon';
    iconUpBtn.dataset.type = 'button-icon';
    upBtnDOM.appendChild(iconUpBtn);

    const downBtnDOM = document.createElement('div');
    downBtnDOM.className = 'ev-chart-scrollbar-button ev-chart-scrollbar-button-down';
    downBtnDOM.dataset.type = 'button';
    const iconDownBtn = document.createElement('i');
    iconDownBtn.className = 'ev-icon ev-icon-triangle-down ev-chart-scrollbar-button-icon';
    iconDownBtn.dataset.type = 'button-icon';
    downBtnDOM.appendChild(iconDownBtn);

    containerDOM.appendChild(upBtnDOM);
    containerDOM.appendChild(downBtnDOM);
  },

  /**
   * set scrollbar position. thumb 위치는 scrollbar.range 에서 파생되며,
   * 부동소수점 누적 오차가 가장자리를 살짝 넘지 않도록 [0, maxPosition] 으로 보정한다.
   * @param dir axis direction ('x' | 'y')
   */
  setScrollbarPosition(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    if (!scrollbarOpt.use || !scrollbarOpt.range) {
      return;
    }

    const scrollbarDOM = scrollbarOpt.dom;
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const aPos = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const titleHeight = this.options.title?.show ? this.options.title?.height : 0;
    const isXScroll = dir === 'x';
    const scrollHeight = isXScroll ? scrollbarOpt.height : scrollbarOpt.width;
    const fullSize = isXScroll ? aPos.x2 - aPos.x1 : aPos.y2 - aPos.y1;
    const buttonSize = scrollbarOpt.showButton ? scrollHeight : 0;
    const trackSize = fullSize - (buttonSize * 2);

    const thumbSize = this.getScrollbarThumbSize(dir, trackSize);
    const maxPosition = Math.max(0, trackSize - thumbSize.size);
    thumbSize.position = Math.min(Math.max(thumbSize.position, 0), maxPosition);

    let scrollbarStyle = 'display: block;';
    let scrollbarTrackStyle;
    let scrollbarThumbStyle;
    let upBtnStyle;
    let downBtnStyle;
    let commonBtnStyle = `width:${buttonSize}px;height:${buttonSize}px;`;
    if (isXScroll) {
      scrollbarStyle = `top: ${chartRect.y2 + titleHeight + labelOffset.top}px;`;
      scrollbarStyle += `left: ${aPos.x1}px;`;
      scrollbarStyle += `width: ${fullSize}px;`;
      scrollbarStyle += ` height: ${scrollHeight}px;`;

      scrollbarTrackStyle = 'top: 0;';
      scrollbarTrackStyle += `left: ${buttonSize}px;`;
      scrollbarTrackStyle += `width: ${trackSize}px;`;
      scrollbarTrackStyle += 'height: 100%;';

      scrollbarThumbStyle = `width: ${thumbSize.size}px;`;
      scrollbarThumbStyle += 'height: 100%;';
      scrollbarThumbStyle += `left: ${thumbSize.position + buttonSize}px`;

      commonBtnStyle += 'transform:rotate(90deg);top: 0;';

      upBtnStyle = `${commonBtnStyle}right:0;`;
      downBtnStyle = `${commonBtnStyle}left:0;`;
    } else {
      scrollbarStyle = `top: ${aPos.y1 + titleHeight}px;`;
      scrollbarStyle += `left: ${aPos.x2 + 10}px;`;
      scrollbarStyle += `width: ${scrollHeight}px;`;
      scrollbarStyle += `height: ${fullSize}px;`;

      scrollbarTrackStyle = `top: ${buttonSize}px;`;
      scrollbarTrackStyle += 'left: 0;';
      scrollbarTrackStyle += 'width: 100%;';
      scrollbarTrackStyle += `height: ${trackSize}px;`;

      scrollbarThumbStyle = 'width: 100%;';
      scrollbarThumbStyle += `height: ${thumbSize.size}px;`;
      scrollbarThumbStyle += `bottom: ${thumbSize.position + buttonSize}px`;

      commonBtnStyle += 'left:0;';
      upBtnStyle = `${commonBtnStyle}top: 0;`;
      downBtnStyle = `${commonBtnStyle}bottom: 0;`;
    }
    scrollbarDOM.style.cssText = scrollbarStyle;

    const scrollbarTrackDOM = scrollbarDOM.getElementsByClassName('ev-chart-scrollbar-track');
    scrollbarTrackDOM[0].style.cssText = scrollbarTrackStyle;
    scrollbarTrackDOM[0].style.backgroundColor = scrollbarOpt.background;

    const scrollbarThumbDOM = scrollbarDOM.getElementsByClassName('ev-chart-scrollbar-thumb');
    scrollbarThumbDOM[0].style.cssText = scrollbarThumbStyle;
    scrollbarThumbDOM[0].style.backgroundColor = scrollbarOpt.thumbStyle.background;
    scrollbarThumbDOM[0].style.borderRadius = `${scrollbarOpt.thumbStyle.radius}px`;

    if (scrollbarOpt.showButton) {
      const upBtnDOM = scrollbarDOM.getElementsByClassName('ev-chart-scrollbar-button-up');
      const endPosition = Math.floor(trackSize - thumbSize.size);
      const upBtnOpacity = Math.floor(thumbSize.position) > endPosition ? 0.5 : 1;
      upBtnDOM[0].style.cssText = `background-color: ${scrollbarOpt.background};${upBtnStyle}`;
      upBtnDOM[0].style.opacity = upBtnOpacity;
      upBtnDOM[0].children[0].style.display = 'block';
      const downBtnDOM = scrollbarDOM.getElementsByClassName('ev-chart-scrollbar-button-down');
      downBtnDOM[0].style.cssText = `background-color: ${scrollbarOpt.background};${downBtnStyle}`;
      downBtnDOM[0].style.opacity = Math.floor(thumbSize.position) < 0 ? 0.5 : 1;
      downBtnDOM[0].children[0].style.display = 'block';
    }
  },

  /**
   * get scrollbar thumb size
   * @param dir axis direction ('x' | 'y')
   * @param trackSize scrollbar track size
   */
  getScrollbarThumbSize(dir, trackSize) {
    const scrollbarOpt = this.scrollbar[dir];
    const [min, max] = scrollbarOpt.range;
    const axesType = scrollbarOpt.type;

    let thumbSize;
    let steps;
    let interval = 1;
    let startValue = 0;
    let thumbPosition = 0;
    if (axesType === 'step') {
      const labels = this.options.type === 'heatMap' ? this.data.labels[dir] : this.data.labels;
      const range = max - min + 1;
      steps = labels.length;

      const intervalSize = trackSize / steps;
      thumbSize = intervalSize * range;
      thumbPosition = intervalSize * min;
    } else {
      const axisOpt = dir === 'x' ? this.axesX : this.axesY;
      const minMax = this.minMax[dir]?.[0];
      const graphRange = +minMax.max - +minMax.min;
      const range = +max - +min;
      if (axesType === 'time') {
        interval = axisOpt?.[0]?.getInterval({
          minValue: minMax.min,
          maxValue: minMax.max,
          maxSteps: this.labelRange[dir]?.[0]?.max,
        });
      }
      steps = Math.ceil(graphRange / interval) + 1;
      startValue = +minMax.min;

      const intervalSize = trackSize / steps;
      const count = range / interval + 1;
      const point = +min - startValue;
      thumbSize = intervalSize * count;
      thumbPosition = intervalSize * (point / interval);
    }

    scrollbarOpt.startValue = startValue;
    scrollbarOpt.steps = steps;
    scrollbarOpt.interval = interval;

    return {
      size: thumbSize,
      position: thumbPosition,
    };
  },

  /**
   * get scrollbar containerDOM
   * @param targetDOM event target dom
   * @returns {HTMLElement|Element|*}
   */
  getScrollbarContainerDOM(targetDOM) {
    const childTypes = ['track', 'thumb', 'button'];

    const type = targetDOM.dataset.type;
    if (childTypes.includes(type)) {
      return targetDOM.parentElement;
    } else if (type === 'button-icon') {
      return targetDOM.parentElement.parentElement;
    } else if (type === 'scrollbar') {
      return targetDOM.getElementsByClassName('ev-chart-scrollbar-container')[0];
    }

    return targetDOM;
  },

  /**
   * update scrollbar option range
   * @param dir axis direction ('x' | 'y')
   * @param isUp
   */
  updateScrollbarRange(dir, isUp) {
    const scrollbarOpt = this.scrollbar[dir];
    const { startValue, range, interval, steps } = scrollbarOpt;
    const endValue = startValue + interval * steps;
    const axisOpt = dir === 'x' ? this.axesX[0] : this.axesY[0];
    const [min, max] = range ?? [];

    if (!truthyNumber(min) || !truthyNumber(max)) {
      scrollbarOpt.range = axisOpt?.range || null;
    }

    let minValue;
    let maxValue;
    let isOutOfRange = false;
    if (isUp) {
      minValue = min + interval;
      maxValue = max + interval;
      isOutOfRange = maxValue >= endValue;
    } else {
      minValue = min - interval;
      maxValue = max - interval;
      isOutOfRange = minValue < startValue;
    }

    if (!isOutOfRange) {
      scrollbarOpt.range = [minValue, maxValue];
      this.updateScrollbarAnchorEdge(dir);

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
        lightUpdate: minValue > 1,
        updateByScrollbar: true,
      });
    }
  },

  /**
   * 축의 인덱스/값 한계 반환. step 은 labels 길이 기준, 그 외는 minMax 기준.
   * @param dir axis direction ('x' | 'y')
   * @returns {{limitMin: number, limitMax: number} | null}
   */
  getScrollbarLimits(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    if (scrollbarOpt?.type === 'step') {
      const labels = this.options.type === 'heatMap' ? this.data.labels[dir] : this.data.labels;
      if (!labels?.length) {
        return null;
      }
      return { limitMin: 0, limitMax: labels.length - 1 };
    }
    const minMax = this.minMax?.[dir]?.[0];
    // 데이터 min/max 가 아직 확정되지 않은 경우(첫 데이터 로드 직전의 stale minMax 등)
    // null 을 +로 0 으로 강제하면(+null === 0) time/linear 축 range 가 [0,0] 으로
    // 오염된다. 한계를 알 수 없을 때는 null 을 반환해 호출부가 range 를 건드리지 않게 한다.
    if (minMax?.min == null || minMax?.max == null) {
      return null;
    }

    const limitMin = +minMax.min;
    const limitMax = +minMax.max;
    if (!Number.isFinite(limitMin) || !Number.isFinite(limitMax)) {
      return null;
    }
    return { limitMin, limitMax };
  },

  /**
   * 현재 scrollbar.range 가 축 한계의 어느 쪽에 닿아있는지로 anchorEdge 를 갱신.
   * 사용자의 "끝/시작에 붙여둔 상태" 의도를 보존해 사이즈 변경 시 재계산에 사용.
   * @param dir axis direction ('x' | 'y')
   */
  updateScrollbarAnchorEdge(dir) {
    const scrollbarOpt = this.scrollbar[dir];
    if (!scrollbarOpt) return;

    const range = scrollbarOpt.range;
    const limits = this.getScrollbarLimits(dir);
    if (!Array.isArray(range) || range.length !== 2 || !limits) {
      scrollbarOpt.anchorEdge = null;
      return;
    }
    if (range[0] <= limits.limitMin) {
      scrollbarOpt.anchorEdge = 'start';
    } else if (range[1] >= limits.limitMax) {
      scrollbarOpt.anchorEdge = 'end';
    } else {
      scrollbarOpt.anchorEdge = null;
    }
  },

  /**
   * create scroll event
   */
  createScrollEvent() {
    this.onScrollbarClick = (e) => {
      e.preventDefault();

      const type = e.target.dataset.type;
      const containerDOM = this.getScrollbarContainerDOM(e.target);
      const buttonTypes = ['button', 'button-icon'];
      const dir = containerDOM.dataset.type;

      let isUp;
      if (buttonTypes.includes(type)) {
        let buttonDOM;
        if (type === 'button') {
          buttonDOM = e.target;
        } else if (type === 'button-icon') {
          buttonDOM = e.target.parentElement;
        }
        isUp = buttonDOM.className.includes('up');
      } else if (type === 'track') {
        const thumbDOM = containerDOM.getElementsByClassName('ev-chart-scrollbar-thumb');
        const { x, y } = thumbDOM[0].getBoundingClientRect();
        const isXScroll = dir === 'x';
        const clickPoint = isXScroll ? e.clientX : -e.clientY;
        const thumbPosition = isXScroll ? x : -y;
        isUp = clickPoint > thumbPosition;
      } else {
        return;
      }
      this.updateScrollbarRange(dir, isUp);
    };

    this.onScrollbarDown = (e) => {
      e.preventDefault();

      if (e.target.dataset.type !== 'thumb') {
        return;
      }

      const containerDOM = this.getScrollbarContainerDOM(e.target);
      const dir = containerDOM.dataset.type;
      const thumbDOM = containerDOM.getElementsByClassName('ev-chart-scrollbar-thumb');
      const { x, y, height } = thumbDOM[0].getBoundingClientRect();
      const scrollbarOpt = this.scrollbar[dir];
      scrollbarOpt.scrolling = true;
      if (dir === 'x') {
        scrollbarOpt.pointInThumb = e.clientX - x;
      } else {
        scrollbarOpt.pointInThumb = y + height - e.clientY;
      }

      const scrollbarDOM = scrollbarOpt.dom;
      scrollbarDOM.addEventListener('mousemove', this.onScrollbarMove);
      scrollbarDOM.addEventListener('mouseup', this.onScrollbarUp);
    };

    const onScrollbarMove = (e) => {
      this.scrolling(e);
    };

    this.onScrollbarMove = throttle(onScrollbarMove, 5);

    this.onScrollbarUp = (e) => {
      e.preventDefault();

      this.stopScrolling(e);
    };

    this.onScrollbarLeave = (e) => {
      e.preventDefault();

      this.scrolling(e);
      this.stopScrolling(e);
    };

    this.onScrollbarWheel = (e) => {
      const isTooltipVisible = this.tooltipDOM?.style?.display === 'block';
      const tooltipBodyDOM =
        this.tooltipBodyDOM ||
        this.tooltipDOM?.querySelector(this.options.tooltip.htmlScrollTarget);

      if (isTooltipVisible && tooltipBodyDOM) {
        const { scrollTop, scrollHeight, clientHeight } = tooltipBodyDOM;
        const isAtTop = scrollTop <= 0;
        const isAtBottom = Math.ceil(scrollTop) + clientHeight >= scrollHeight;

        const isScrollingUp = e.deltaY < 0;
        const isScrollingDown = e.deltaY > 0;

        if ((isAtTop && isScrollingUp) || (isAtBottom && isScrollingDown)) {
          // 툴팁의 스크롤이 맨 위나 맨 아래에 닿았는데 스크롤 하면 차트 스크롤 허용
        } else {
          // 툴팁 내부 스크롤만 수행
          return;
        }
      }

      e.preventDefault();

      const threshold = 1; // 최소 스크롤 임계값

      // Shift + 휠: 가로 스크롤 (일반 마우스 휠 지원)
      if (this.scrollbar.x?.use && e.shiftKey && Math.abs(e.deltaY) > threshold) {
        this.updateScrollbarRange('x', e.deltaY > 0);
        return;
      }

      // 대각선 스크롤 처리: 더 큰 방향을 우선으로 처리
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > threshold && absY > threshold) {
        // 두 방향 모두 임계값 이상일 때: 더 큰 방향을 우선 처리
        if (absX > absY && this.scrollbar.x?.use) {
          this.updateScrollbarRange('x', e.deltaX > 0);
        } else if (absY > absX && this.scrollbar.y?.use) {
          this.updateScrollbarRange('y', e.deltaY < 0);
        }
        return;
      }

      // 가로 스크롤 처리 (deltaX - 트랙패드 좌우 스크롤)
      if (this.scrollbar.x?.use && absX > threshold) {
        this.updateScrollbarRange('x', e.deltaX > 0);
        return;
      }

      // 세로 스크롤 처리 (deltaY)
      if (this.scrollbar.y?.use && absY > threshold) {
        this.updateScrollbarRange('y', e.deltaY < 0);
      }
    };

    if (this.scrollbar.x.use && !this.scrollbar.x.isInit) {
      const scrollbarXDOM = this.scrollbar.x.dom;
      scrollbarXDOM.addEventListener('click', this.onScrollbarClick);
      scrollbarXDOM.addEventListener('mousedown', this.onScrollbarDown);
      scrollbarXDOM.addEventListener('mouseleave', this.onScrollbarLeave);
    }

    if (this.scrollbar.y.use && !this.scrollbar.y.isInit) {
      const scrollbarYDOM = this.scrollbar.y.dom;
      scrollbarYDOM.addEventListener('click', this.onScrollbarClick);
      scrollbarYDOM.addEventListener('mousedown', this.onScrollbarDown);
      scrollbarYDOM.addEventListener('mouseleave', this.onScrollbarLeave);
    }

    // 가로 또는 세로 스크롤바가 있으면 휠 이벤트 등록
    if (this.scrollbar.x?.use || this.scrollbar.y?.use) {
      this.overlayCanvas?.addEventListener('wheel', this.onScrollbarWheel, { passive: false });
    }
  },

  /**
   * Update scroll information by move event
   * @param e Event
   */
  scrolling(e) {
    const containerDOM = this.getScrollbarContainerDOM(e.target);
    const dir = containerDOM.dataset.type;
    if (!this.scrollbar[dir].scrolling) {
      return;
    }

    const { steps, range, pointInThumb, startValue, interval } = this.scrollbar[dir];

    const trackDOM = containerDOM.getElementsByClassName('ev-chart-scrollbar-track');
    const { x, y, width, height } = trackDOM[0].getBoundingClientRect();

    const isXScroll = dir === 'x';
    const sp = isXScroll ? x : y;
    const trackSize = isXScroll ? width : height;
    const intervalSize = trackSize / steps;
    const endValue = startValue + (steps - 1) * interval;

    let movePoint = isXScroll ? e.clientX : e.clientY;
    if (movePoint < sp) {
      movePoint = sp;
    } else if (movePoint > sp + trackSize) {
      movePoint = sp + trackSize;
    }

    let move;
    if (isXScroll) {
      move = movePoint - sp - pointInThumb;
    } else {
      move = sp + trackSize - movePoint - pointInThumb;
    }

    if (move <= 0) {
      return;
    }

    let movedMin;
    let movedMax;
    const currValue = Math.round(Math.abs(move) / intervalSize) * interval;
    const [min, max] = range;
    if (move > 0) {
      const incrementValue = startValue + (currValue - +min);
      movedMin = +min + incrementValue;
      movedMax = movedMin + (+max - +min);
    }

    if (movedMin < startValue || movedMax > endValue) {
      return;
    }

    this.scrollbar[dir].range = [movedMin, movedMax];
    this.updateScrollbarAnchorEdge(dir);

    this.update({
      updateSeries: false,
      updateSelTip: { update: false, keepDomain: false },
      lightUpdate: movedMin > 1,
      updateByScrollbar: true,
    });
  },

  /**
   * init scrolling event
   * @param e
   */
  stopScrolling(e) {
    const containerDOM = this.getScrollbarContainerDOM(e.target);
    const dir = containerDOM.dataset.type;
    const scrollbarOpt = this.scrollbar[dir];

    if (scrollbarOpt.scrolling) {
      scrollbarOpt.scrolling = false;

      const scrollbarDOM = scrollbarOpt.dom;
      scrollbarDOM.removeEventListener('mousemove', this.onScrollbarMove, false);
      scrollbarDOM.removeEventListener('mouseup', this.onScrollbarUp, false);
    }
  },

  /**
   * hide scrollbar dom
   * @param dir axis direction ('x' | 'y')
   */
  hideScrollbar(dir) {
    const scrollbarDOM = this.scrollbar[dir].dom;

    if (!scrollbarDOM) {
      return;
    }

    const scrollbarStyle = scrollbarDOM?.style;
    scrollbarStyle.display = 'none';
    scrollbarStyle.width = '0';
    scrollbarStyle.height = '0';
  },

  /**
   * destroy scrollbar dom
   * @param dir axis direction ('x' | 'y')
   */
  destroyScrollbar(dir) {
    const scrollbarDOM = this.scrollbar[dir].dom;

    if (scrollbarDOM) {
      scrollbarDOM.remove();
      this.scrollbar[dir] = { isInit: false };

      // 가로, 세로 스크롤바 모두 없어지면 휠 이벤트 제거
      if (!this.scrollbar.x?.use && !this.scrollbar.y?.use) {
        this.overlayCanvas?.removeEventListener('wheel', this.onScrollbarWheel, { passive: false });
      }
    }
  },
};

export default module;
