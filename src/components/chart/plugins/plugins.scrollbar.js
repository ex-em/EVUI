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

    if (!scrollbarOpt.isInit) {
      const merged = defaultsDeep({}, axisOpt?.[0]?.scrollbar, AXIS_OPTION.scrollbar);
      Object.keys(merged).forEach((key) => {
        scrollbarOpt[key] = merged[key];
      });

      scrollbarOpt.type = axisOpt?.[0]?.type;
      scrollbarOpt.range = axisOpt?.[0]?.range || null;
      scrollbarOpt.interval = null;

      this.createScrollbarLayout(dir);
      this.createScrollbar(dir);
      this.createScrollEvent(dir);
      scrollbarOpt.isInit = true;
    }
  },

  /**
   * update scrollbar information
   */
  updateScrollbar() {
    this.updateScrollbarInfo('x');
    this.updateScrollbarInfo('y');
  },

  /**
   * Updated scrollbar information with updated axis information
   * @param dir axis direction (x | y)
   */
  updateScrollbarInfo(dir) {
    const { axesX, axesY } = this.options;
    const newOpt = dir === 'x' ? axesX : axesY;
    if (!this.scrollbar[dir].isInit && newOpt?.[0]?.range) {
      this.initScrollbarInfo(newOpt, dir);
      return;
    } else if (!newOpt?.[0].scrollbar?.use || checkNullAndUndefined(newOpt?.[0]?.range)) {
      this.destroyScrollbar(dir);
      return;
    }

    const axisOpt = dir === 'x' ? this.axesX : this.axesY;
    const isUpdateAxesRange = !isEqual(newOpt?.[0]?.range, axisOpt?.[0]?.range);
    if (isUpdateAxesRange) {
      this.scrollbar[dir].range = newOpt?.[0]?.range || null;
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
   * set scrollbar position
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
    const fullSize = isXScroll ? (aPos.x2 - aPos.x1) : (aPos.y2 - aPos.y1);
    const buttonSize = scrollbarOpt.showButton ? scrollHeight : 0;
    const trackSize = fullSize - (buttonSize * 2);
    const thumbSize = this.getScrollbarThumbSize(dir, trackSize);

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
      const upBtnOpacity = Math.floor(thumbSize.position) === endPosition ? 0.5 : 1;
      upBtnDOM[0].style.cssText = `background-color: ${scrollbarOpt.background};${upBtnStyle}`;
      upBtnDOM[0].style.opacity = upBtnOpacity;
      upBtnDOM[0].children[0].style.display = 'block';
      const downBtnDOM = scrollbarDOM.getElementsByClassName('ev-chart-scrollbar-button-down');
      downBtnDOM[0].style.cssText = `background-color: ${scrollbarOpt.background};${downBtnStyle}`;
      downBtnDOM[0].style.opacity = Math.floor(thumbSize.position) === 0 ? 0.5 : 1;
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
      const range = (max - min) + 1;
      steps = labels.length;

      const intervalSize = trackSize / steps;
      thumbSize = intervalSize * range;
      thumbPosition = intervalSize * min;
    } else {
      const minMax = this.minMax[dir];
      const graphRange = (+minMax[0].max) - (+minMax[0].min);
      const range = (+max) - (+min);
      interval = this.axesX?.[0]?.getInterval({
        min: minMax[0].min,
        max: minMax[0].max,
        maxSteps: this.labelRange[dir].max,
      });
      steps = Math.ceil(graphRange / interval) + 1;
      startValue = +minMax[0].min;

      const intervalSize = trackSize / steps;
      const count = (range / interval) + 1;
      const point = (+min - startValue);
      thumbSize = intervalSize * count;
      thumbPosition = intervalSize * (point / interval);
    }

    scrollbarOpt.startValue = startValue;
    scrollbarOpt.steps = steps;
    scrollbarOpt.interval = interval;

    return {
      size: thumbSize,
      position: thumbPosition,
      background: scrollbarOpt.background,
      radius: scrollbarOpt.radius,
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
    const endValue = startValue + (interval * steps);
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

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
      });
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
        isUp = (clickPoint > thumbPosition);
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
      e.preventDefault();

      this.updateScrollbarRange('y', e.deltaY < 0);
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
      this.overlayCanvas?.addEventListener('wheel', this.onScrollbarWheel);
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

    const {
      steps, range, pointInThumb,
      startValue, interval,
    } = this.scrollbar[dir];

    const trackDOM = containerDOM.getElementsByClassName('ev-chart-scrollbar-track');
    const { x, y, width, height } = trackDOM[0].getBoundingClientRect();

    const isXScroll = dir === 'x';
    const sp = isXScroll ? x : y;
    const trackSize = isXScroll ? width : height;
    const intervalSize = trackSize / steps;
    const endValue = (startValue + ((steps - 1) * interval));

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
      move = (sp + trackSize) - movePoint - pointInThumb;
    }

    if (move <= 0) {
      return;
    }

    let movedMin;
    let movedMax;
    const currValue = (Math.round(Math.abs(move) / intervalSize) * interval);
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
    this.update({
      updateSeries: false,
      updateSelTip: { update: false, keepDomain: false },
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
    const scrollbarXDOM = this.scrollbar[dir].dom;

    if (scrollbarXDOM) {
      scrollbarXDOM.remove();
      this.scrollbar[dir] = { isInit: false };
      this.overlayCanvas?.removeEventListener('wheel', this.onScrollbarWheel, false);
    }
  },
};

export default module;
