import { convertToPercent } from '../../../common/utils';

const MAX_HANDLE_SIZE = 28;

const MIN_BOX_SIZE = {
  width: 70,
  height: 60,
};

const modules = {
  /**
   * Create legend DOM
   *
   * @returns {undefined}
   */
  createLegendLayout() {
    this.legendDOM = document.createElement('div');
    this.legendDOM.className = 'ev-chart-legend';
    this.legendBoxDOM = document.createElement('div');
    this.legendBoxDOM.className = 'ev-chart-legend-box';
    this.containerDOM = document.createElement('div');
    this.containerDOM.className = 'ev-chart-legend-container';

    this.legendBoxDOM.appendChild(this.containerDOM);
    this.legendDOM.appendChild(this.legendBoxDOM);
    this.wrapperDOM.appendChild(this.legendDOM);
  },

  /**
   * Initialize legend
   * If there was no initialization, create DOM and set default layout.
   * It not, there will already be set layout, so add a legend for each series with group
   *
   * @returns {undefined}
   */
  initLegend() {
    if (!this.isInitLegend) {
      this.createLegendLayout();
      this.createLegend();
    }

    Object.values(this.seriesList).forEach((series) => {
      this.setLegendStyle(series);
    });
    this.initEvent();

    this.isInitLegend = true;
    this.legendDragInfo = {
      dragging: false,
      isStart: true,
    };
  },

  /**
   * Initialize legend event
   *
   * @returns {undefined}
   */
  initEvent() {
    if (this.isInitLegend) {
      return;
    }

    this.onLegendMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const type = e.target.dataset.type;

      let targetDOM;
      if (type === 'handle') {
        targetDOM = e.target;
      } else if (type === 'handle-btn') {
        targetDOM = e.target.parentElement;
      } else if (type === 'handle-btn-color') {
        targetDOM = e.target.parentElement.parentElement;
      } else {
        return;
      }

      const seriesList = Object.values(this.seriesList);
      if (!seriesList.length) {
        return;
      }

      const { colorState } = seriesList[0];
      const { start, end } = colorState[0];

      colorState[0].selectedValue = null;
      this.clearOverlay();

      this.legendDragInfo.dragging = true;
      this.legendDragInfo.isStart =
        start !== end
          ? targetDOM.className.includes('start')
          : this.legendDragInfo.isStart;
      targetDOM.classList.add('dragging');
      this.legendBoxDOM.addEventListener(
        'mousemove',
        this.onLegendMouseMove,
        false
      );
      this.legendBoxDOM.addEventListener(
        'mouseup',
        this.onLegendMouseUp,
        false
      );
    };

    this.onLegendMouseMove = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const { dragging, isStart } = this.legendDragInfo;

      if (dragging) {
        let value = this.getSelectedValue(e);
        value = this.isSide ? 100 - value : value;
        const dir = isStart ? 'start' : 'end';

        const seriesList = Object.values(this.seriesList);
        if (!seriesList.length) {
          return;
        }

        const { colorState } = seriesList[0];
        const { start, end } = colorState[0];
        if ((isStart && value > end) || (!isStart && value < start)) {
          return;
        }
        colorState[0][dir] = value;

        this.update({
          updateSeries: false,
          updateSelTip: { update: false, keepDomain: false },
        });
      }
    };

    this.onLegendMouseUp = () => {
      this.legendDragInfo.dragging = false;

      const targetDOM = this.containerDOM.getElementsByClassName(
        'ev-chart-legend-handle dragging'
      )[0];
      targetDOM?.classList.remove('dragging');
      this.legendBoxDOM.removeEventListener(
        'mouseup',
        this.onLegendMouseUp,
        false
      );
    };

    /**
     * callback for legendBoxDOM hovering
     *
     * @returns {undefined}
     */
    this.onLegendBoxOver = (e) => {
      const type = e.target.dataset.type;

      const seriesList = Object.values(this.seriesList);
      if (!seriesList.length) {
        return;
      }

      const { colorState, valueOpt } = seriesList[0];
      const state = colorState[0];

      let value = this.getSelectedValue(e);
      value = this.isSide ? 100 - value : value;
      if (
        ['line', 'thumb', 'layer', 'overlay', 'overlay-item'].includes(type)
      ) {
        if (state.start <= value && value <= state.end) {
          state.selectedValue = value;
          this.createLegendOverlay(value, valueOpt);
        } else {
          return;
        }
      } else if (['handle', 'handle-btn', 'handle-btn-color'].includes(type)) {
        const isStart = e.target.className.includes('start');
        state.selectedValue = isStart ? state.start : state.end;
        this.clearOverlay();
      } else {
        return;
      }

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
      });
    };

    /**
     * callback for mouseleave event on legendBoxDOM
     *
     * @returns {undefined}
     */
    this.onLegendBoxLeave = () => {
      this.legendDragInfo.dragging = false;

      this.clearOverlay();

      const seriesList = Object.values(this.seriesList);
      if (!seriesList.length) {
        return;
      }

      const { colorState } = seriesList[0];
      colorState[0].selectedValue = null;

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
      });
    };

    this.legendBoxDOM.addEventListener('mousedown', this.onLegendMouseDown);
    this.legendBoxDOM.addEventListener('mouseover', this.onLegendBoxOver);
    this.legendBoxDOM.addEventListener('mouseleave', this.onLegendBoxLeave);
  },

  getSelectedValue(evt) {
    const { x, y, width, height } = this.containerDOM.getBoundingClientRect();
    const isTop = !this.isSide;

    const sp = isTop ? x : y;
    const size = isTop ? width : height;
    let movePoint = isTop ? evt.clientX : evt.clientY;
    if (movePoint < sp) {
      movePoint = sp;
    } else if (movePoint > sp + size) {
      movePoint = sp + size;
    }

    const move = movePoint - sp;
    return +convertToPercent(move, size);
  },

  /**
   * To update legend, reset all process.
   *
   * @returns {undefined}
   */
  updateLegend() {
    this.resetLegend();
    this.createLegend();

    Object.values(this.seriesList).forEach((series) => {
      this.setLegendStyle(series);
    });
  },

  /**
   * To update legend, remove all of legendBoxDOM's children
   *
   * @returns {undefined}
   */
  resetLegend() {
    const containerDOM = this.containerDOM;

    if (!containerDOM) {
      return;
    }

    while (containerDOM.hasChildNodes()) {
      containerDOM.removeChild(containerDOM.firstChild);
    }
  },

  clearOverlay() {
    const targetDOM = this.containerDOM.getElementsByClassName(
      'ev-chart-legend-line'
    )[0];
    const overlayDOM = targetDOM?.getElementsByClassName(
      'ev-chart-legend-overlay'
    )[0];
    if (overlayDOM) {
      targetDOM.removeChild(overlayDOM);

      const thumbDOM = targetDOM.getElementsByClassName(
        'ev-chart-legend-thumb'
      )[0];
      const labels = thumbDOM.children;
      labels.forEach((labelDOM) => {
        labelDOM.style.opacity = 1;
      });
    }
  },

  createLegendOverlay(value, opt) {
    this.clearOverlay();
    const handleSize = this.legendHandleSize;
    const { min, max } = opt;
    if (min === undefined || max === undefined) {
      return;
    }

    const targetDOM = this.containerDOM.getElementsByClassName(
      'ev-chart-legend-line'
    )[0];

    const overlayDOM = document.createElement('div');
    overlayDOM.className = 'ev-chart-legend-overlay';
    overlayDOM.dataset.type = 'overlay';

    const tooltipDOM = document.createElement('div');
    tooltipDOM.className = 'ev-chart-legend-overlay-tooltip';
    tooltipDOM.innerText = Math.floor(min + (max - min) * (value / 100));

    const itemDOM = document.createElement('span');
    itemDOM.className = 'ev-chart-legend-overlay-item';
    itemDOM.dataset.type = 'overlay-item';

    let itemStyle;
    let tooltipStyle;
    const position = Math.floor(handleSize / 2) + 14;
    if (this.isSide) {
      tooltipStyle = `top:${100 - value}%;left:${position}px;transform:translateY(-50%);`;
      itemStyle = `top:${100 - value}%;transform:translateY(-50%);`;
    } else {
      tooltipStyle = `top:-${position}px;left:${value}%;transform:translateX(-50%);`;
      itemStyle = `left:${value}%;transform:translateX(-50%);`;
    }
    itemStyle += `width:${handleSize - 10}px;height:${handleSize - 10}px;`;

    tooltipDOM.style.cssText = tooltipStyle;
    itemDOM.style.cssText = itemStyle;

    overlayDOM.appendChild(tooltipDOM);
    overlayDOM.appendChild(itemDOM);
    targetDOM?.appendChild(overlayDOM);

    const thumbDOM = targetDOM?.getElementsByClassName(
      'ev-chart-legend-thumb'
    )[0];
    if (thumbDOM) {
      const labels = thumbDOM.children;
      labels.forEach((labelDOM) => {
        labelDOM.style.opacity = 0.2;
      });
    }
  },

  createLegendHandle(type) {
    const colorBtnDOM = document.createElement('span');
    colorBtnDOM.className = `ev-chart-legend-handle-btn-color ${type}`;
    colorBtnDOM.dataset.type = 'handle-btn-color';

    const btnDOM = document.createElement('div');
    btnDOM.className = `ev-chart-legend-handle-btn ${type}`;
    btnDOM.dataset.type = 'handle-btn';

    btnDOM.appendChild(colorBtnDOM);

    const handleDOM = document.createElement('div');
    handleDOM.className = `ev-chart-legend-handle ${type}`;
    handleDOM.dataset.type = 'handle';

    handleDOM.appendChild(btnDOM);

    return handleDOM;
  },

  createLegendLabel() {
    const textDOM = document.createElement('span');
    textDOM.className = 'ev-chart-legend-label-text';

    const labelDOM = document.createElement('div');
    labelDOM.className = 'ev-chart-legend-label';

    return labelDOM;
  },

  /**
   * Create legend DOM
   *
   * @returns {undefined}
   */
  createLegend() {
    if (!Object.values(this.seriesList).length) {
      return;
    }

    const opt = this.options.legend;
    this.isSide = !['top', 'bottom'].includes(opt.position);
    const legendSize = this.isSide ? opt.width : opt.height;
    this.legendHandleSize =
      legendSize > MAX_HANDLE_SIZE ? MAX_HANDLE_SIZE : legendSize;
    const handleSize = this.legendHandleSize;

    const startHandleDOM = this.createLegendHandle(
      this.isSide ? 'end' : 'start',
      handleSize
    );
    const endHandleDOM = this.createLegendHandle(
      this.isSide ? 'start' : 'end',
      handleSize
    );

    const lineLayerDOM = document.createElement('div');
    lineLayerDOM.className = 'ev-chart-legend-line-layer';
    lineLayerDOM.dataset.type = 'line-layer';
    const thumbDOM = document.createElement('div');
    thumbDOM.className = 'ev-chart-legend-thumb';
    thumbDOM.dataset.type = 'thumb';

    thumbDOM.appendChild(this.createLegendLabel());
    thumbDOM.appendChild(this.createLegendLabel());

    const lineDOM = document.createElement('div');
    lineDOM.className = 'ev-chart-legend-line';
    lineDOM.dataset.type = 'line';

    lineDOM.appendChild(lineLayerDOM);
    lineDOM.appendChild(thumbDOM);

    this.containerDOM.appendChild(lineDOM);
    this.containerDOM.appendChild(startHandleDOM);
    this.containerDOM.appendChild(endHandleDOM);
  },

  setLegendStyle(series) {
    const dir = this.isSide ? 'top' : 'right';
    const handleSize = this.legendHandleSize;

    const { valueOpt, colorState } = series;

    const { min, max, decimalPoint } = valueOpt;

    const { start, end } = colorState[0];
    const startColor = series.getColorForGradient(start);
    const endColor = series.getColorForGradient(end);
    let gradient = `linear-gradient(to ${dir}, `;
    gradient += `${startColor}, ${endColor})`;

    const labelPosition = Math.floor(handleSize / 2) + 14;
    let defaultHandleStyle = `width:${handleSize}px;height:${handleSize}px;`;
    let labelStyle;
    let startStyle;
    let endStyle;
    let thumbStyle = `background:${gradient};`;

    if (this.isSide) {
      defaultHandleStyle += `margin-top:-${handleSize / 2}px;`;
      labelStyle = `left:${labelPosition}px;transform:translateY(-50%);top:`;
      startStyle = `top:${100 - end}%;`;
      endStyle = `top:${100 - start}%;`;
      thumbStyle += `top:${100 - end}%;height:${end - start}%;`;
    } else {
      defaultHandleStyle += `margin-left:-${handleSize / 2}px;`;
      labelStyle = `top:-${labelPosition}px;transform:translateX(-50%);left:`;
      startStyle = `left:${start}%;`;
      endStyle = `left:${end}%;`;
      thumbStyle += `left:${start}%;width:${end - start}%;`;
    }

    const minText = (min + (max - min) * (start / 100)).toFixed(decimalPoint);
    const maxText = (min + (max - min) * (end / 100)).toFixed(decimalPoint);

    const thumbDOM = this.containerDOM.getElementsByClassName(
      'ev-chart-legend-thumb'
    )[0];
    thumbDOM.style.cssText = thumbStyle;

    const labelDOM = thumbDOM.getElementsByClassName('ev-chart-legend-label');
    labelDOM[0].style.cssText = `${labelStyle}0%;`;
    labelDOM[1].style.cssText = `${labelStyle}100%;`;
    if (min !== undefined && max !== undefined) {
      labelDOM[0].innerText = this.isSide ? maxText : minText;
      labelDOM[1].innerText = this.isSide ? minText : maxText;
    }

    const handleDOM = this.containerDOM.getElementsByClassName(
      'ev-chart-legend-handle'
    );
    handleDOM[0].style.cssText = defaultHandleStyle + startStyle;
    handleDOM[1].style.cssText = defaultHandleStyle + endStyle;

    const btnDOM = this.containerDOM.getElementsByClassName(
      'ev-chart-legend-handle-btn-color'
    );
    btnDOM[0].style.backgroundColor = this.isSide ? endColor : startColor;
    btnDOM[1].style.backgroundColor = this.isSide ? startColor : endColor;
  },

  /**
   * Set legend components position by option
   *
   * @returns {undefined}
   */
  setLegendPosition() {
    const opt = this.options;
    const position = opt?.legend?.position;
    const { width: minWidth, height: minHeight } = MIN_BOX_SIZE;
    const handleSize = this.legendHandleSize;

    const title = opt?.title?.show ? opt?.title?.height : 0;
    const positionTop = title + minHeight;
    const {
      top = 0,
      bottom = 0,
      left = 0,
      right = 0,
    } = opt?.legend?.padding ?? {};
    const wrapperStyle = this.wrapperDOM.style;

    if (!wrapperStyle) {
      return;
    }

    let legendStyle;
    let boxStyle;
    let containerStyle;
    let chartRect;

    switch (position) {
      case 'top':
        wrapperStyle.padding = `${positionTop}px 0 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle = `padding:${handleSize + 7}px ${right}px ${bottom}px ${left}px;`;
        boxStyle += 'width:100%';
        boxStyle += `height${minHeight}px;`;

        legendStyle = `width:${chartRect.width}px;`;
        legendStyle += `height:${minHeight}px;`;
        legendStyle += `top:${title}px;`;
        break;
      case 'right':
        wrapperStyle.padding = `${title}px ${minWidth}px 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle = `padding:${top}px ${right}px ${bottom}px ${left}px;`;
        boxStyle += `width:${minWidth}px;`;
        boxStyle += 'height:100%;';
        boxStyle += `max-height:${chartRect.height}px;`;

        legendStyle = `width:${minWidth}px;`;
        legendStyle += `height:${chartRect.height}px;`;
        legendStyle += `top:${title}px;right:0px;`;
        break;
      case 'bottom':
        wrapperStyle.padding = `${title}px 0 ${minHeight}px 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle = `padding:${handleSize + 7}px ${right}px ${bottom}px ${left}px;`;
        boxStyle += 'width:100%;';
        boxStyle += `height:${minHeight}px;`;

        legendStyle = `width:${chartRect.width}px;`;
        legendStyle += `height:${minHeight}px;`;

        legendStyle += 'bottom:0px;left:0px;';
        break;
      case 'left':
        wrapperStyle.padding = `${title}px 0 0 ${minWidth}px`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle = `padding:${top}px ${right}px ${bottom}px ${left}px;`;
        boxStyle += 'display:absolute;';
        boxStyle += 'bottom:0px;';
        boxStyle += `width:${minWidth}px;`;
        boxStyle += 'height:100%;';
        boxStyle += `maxHeight:${chartRect.height}px;`;

        legendStyle = `width:${minWidth}px;`;
        legendStyle += `height:${chartRect.height}px;`;
        legendStyle += `top:${title}px;left:0px`;
        break;
      default:
        break;
    }
    if (['top', 'bottom'].includes(position)) {
      const containerSize = chartRect.width / 2;

      containerStyle = `left:${chartRect.width / 2 - containerSize / 2}px;`;
      containerStyle += `width:${containerSize}px;`;
      containerStyle += `height:${handleSize}px;`;
      containerStyle += 'padding:4px 0;';
      containerStyle += 'margin:0 4px;';
    } else {
      const containerSize = chartRect.height / 2;

      containerStyle = `top:${chartRect.height / 2 - containerSize / 2}px;`;
      containerStyle += 'left:5px;';
      containerStyle += `width:${handleSize}px;`;
      containerStyle += `height:${containerSize}px;`;
      containerStyle += 'padding:0 4px;';
      containerStyle += 'margin:4px 0;';
    }

    this.containerDOM.style.cssText = containerStyle;
    this.legendBoxDOM.style.cssText = boxStyle;
    this.legendDOM.style.cssText = legendStyle;
  },

  /**
   * Update legend components size
   *
   * @returns {undefined}
   */
  updateLegendContainerSize() {
    Object.values(this.seriesList).forEach((series) => {
      this.setLegendStyle(series);
    });
  },

  /**
   * Show legend components by manipulating css
   *
   * @returns {undefined}
   */
  showLegend() {
    if (this.resizeDOM) {
      this.resizeDOM.style.display = 'block';
    }

    if (this.legendDOM) {
      this.legendDOM.style.display = 'block';
    }
  },

  /**
   * Hide legend components by manipulating css
   *
   * @returns {undefined}
   */
  hideLegend() {
    const opt = this.options;
    const wrapperStyle = this.wrapperDOM?.style;
    const legendStyle = this.legendDOM?.style;
    const title = opt?.title?.show ? opt?.title?.height : 0;

    if (!legendStyle || !wrapperStyle) {
      return;
    }

    legendStyle.display = 'none';
    legendStyle.width = '0';
    legendStyle.height = '0';
    wrapperStyle.padding = `${title}px 0 0 0`;
  },
};

export default modules;
