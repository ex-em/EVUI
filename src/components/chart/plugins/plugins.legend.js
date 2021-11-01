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
    this.resizeDOM = document.createElement('div');
    this.resizeDOM.className = 'ev-chart-resize-bar';
    this.ghostDOM = document.createElement('div');
    this.ghostDOM.className = 'ev-chart-resize-ghost';

    this.wrapperDOM.appendChild(this.resizeDOM);
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
      this.initEvent();
    }

    this.addLegendList();
    this.isInitLegend = true;
    this.isLegendMove = false;
  },

  /**
   * Add legend with group information to align each series properly.
   * Especially if a chart is stacked,
   * legends have to align with series ordering as we can see in chart.
   *
   * @returns {undefined}
   */
  addLegendList() {
    const groups = this.data.groups;
    const seriesList = this.seriesList;

    groups.forEach((group) => {
      group.slice().reverse().forEach((sId) => {
        if (seriesList[sId] && seriesList[sId].showLegend) {
          this.addLegend(seriesList[sId]);
        }
      });
    });

    Object.values(seriesList).forEach((series) => {
      if (!series.isExistGrp && series.showLegend) {
        this.addLegend(series);
      }
    });
  },

  /**
   * Initialize legend event
   *
   * @returns {undefined}
   */
  initEvent() {
    /**
     * callback for legendBoxDOM to show/hide clicked series
     *
     * @returns {undefined}
     */
    this.onLegendBoxClick = (e) => {
      const opt = this.options.legend;
      const type = e.target.dataset.type;

      let targetDOM;
      if (type === 'container') {
        targetDOM = e.target;
      } else if (type === 'name' || type === 'color') {
        targetDOM = e.target.parentElement;
      } else {
        return;
      }

      const colorDOM = targetDOM?.getElementsByClassName('ev-chart-legend-color')[0];
      const nameDOM = targetDOM?.getElementsByClassName('ev-chart-legend-name')[0];
      const isActive = !colorDOM?.className.includes('inactive');
      const series = nameDOM?.series;

      if (isActive && this.seriesInfo.count === 1) {
        return;
      }

      if (!colorDOM || !nameDOM) {
        return;
      }

      if (isActive) {
        this.seriesInfo.count--;
        colorDOM.style.backgroundColor = opt.inactive;
        nameDOM.style.color = opt.inactive;
      } else {
        this.seriesInfo.count++;
        if (typeof series.color !== 'string') {
          colorDOM.style.backgroundColor = series.color[series.color.length - 1][1];
        } else {
          colorDOM.style.backgroundColor = series.color;
        }

        nameDOM.style.color = opt.color;
      }

      series.show = !series.show;
      colorDOM.classList.toggle('inactive');
      nameDOM.classList.toggle('inactive');

      this.update({
        updateSeries: false,
        updateSelTip: { update: true, keepDomain: true },
      });
    };

    /**
     * callback for resizeDOM click event
     * 1. hide resizeDOM
     * 2. show ghost DOM on same position with hidden resizeDOM
     *
     * @returns {undefined}
     */
    this.onResizeMouseDown = (e) => {
      e.stopPropagation();
      e.preventDefault();

      const opt = this.options;
      const pos = opt.legend.position;
      const title = opt.title.show ? opt.title.height : 0;

      const ghostDOM = this.ghostDOM;
      this.resizeDOM.style.display = 'none';
      this.wrapperDOM.appendChild(ghostDOM);

      // mouse down 시, resizeDOM의 위치를 기반으로 ghostDOM의 위치를 세팅
      if (pos === 'left' || pos === 'right') {
        ghostDOM.style.top = `${title}px`;
        ghostDOM.style.left = this.resizeDOM.style.left;
        ghostDOM.style.right = this.resizeDOM.style.right;
        ghostDOM.style.height = this.resizeDOM.style.height;
      } else {
        ghostDOM.classList.add('horizontal');

        if (pos === 'top') {
          ghostDOM.style.top = this.resizeDOM.style.top;
        } else if (pos === 'bottom') {
          ghostDOM.style.bottom = this.resizeDOM.style.bottom;
        }
      }

      this.wrapperDOM.addEventListener('mousemove', this.mouseMove, false);
      this.wrapperDOM.addEventListener('mouseup', this.mouseUp, false);
    };

    /**
     * callback for legendBoxDOM hovering
     *
     * @returns {undefined}
     */
    this.onLegendBoxOver = (e) => {
      const type = e.target.dataset.type;

      let targetDOM;
      if (type === 'container') {
        targetDOM = e.target;
      } else if (type === 'name' || type === 'color') {
        targetDOM = e.target.parentElement;
      } else {
        return;
      }
      const nameDOM = targetDOM.getElementsByClassName('ev-chart-legend-name')[0];
      const targetId = nameDOM.series.sId;

      Object.values(this.seriesList).forEach((series) => {
        series.state = series.sId === targetId ? 'highlight' : 'downplay';
      });

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
      Object.values(this.seriesList).forEach((series) => {
        series.state = 'normal';
      });

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
      });
    };

    this.legendBoxDOM.addEventListener('click', this.onLegendBoxClick);
    this.legendBoxDOM.addEventListener('mouseover', this.onLegendBoxOver);
    this.legendBoxDOM.addEventListener('mouseleave', this.onLegendBoxLeave);
    this.resizeDOM.addEventListener('mousedown', this.onResizeMouseDown);

    this.mouseMove = this.onMouseMove.bind(this); // resizing function
    this.mouseUp = this.onMouseUp.bind(this); // resizing function
  },

  /**
   * To update legend, reset all process.
   *
   * @returns {undefined}
   */
  updateLegend() {
    this.resetLegend();
    this.addLegendList();
  },

  /**
   * To update legend, remove all of legendBoxDOM's children
   *
   * @returns {undefined}
   */
  resetLegend() {
    const legendDOM = this.legendBoxDOM;

    if (!legendDOM) {
      return;
    }

    while (legendDOM.hasChildNodes()) {
      legendDOM.removeChild(legendDOM.firstChild);
    }
  },

  /**
   * Create DOM for each series
   *
   * @returns {undefined}
   */
  addLegend(series) {
    const opt = this.options.legend;
    const containerDOM = document.createElement('div');
    const colorDOM = document.createElement('span');
    const nameDOM = document.createElement('div');

    containerDOM.className = 'ev-chart-legend-container';
    colorDOM.className = 'ev-chart-legend-color';

    if (series.type === 'line' && series.point) {
      colorDOM.className += ' ev-chart-legend-color--point-line';
    }

    nameDOM.className = 'ev-chart-legend-name';

    nameDOM.series = series;

    if (typeof series.color !== 'string') {
      colorDOM.style.backgroundColor = series.color[series.color.length - 1][1];
    } else {
      colorDOM.style.backgroundColor = series.color;
    }

    colorDOM.dataset.type = 'color';
    nameDOM.style.color = opt.color;
    nameDOM.textContent = series.name;
    nameDOM.setAttribute('title', series.name);
    nameDOM.dataset.type = 'name';

    this.legendDOM.style.padding = '5px 0 0 0';

    containerDOM.appendChild(colorDOM);
    containerDOM.appendChild(nameDOM);

    if (opt.position === 'top' || opt.position === 'bottom') {
      containerDOM.style.width = `${opt.width - 8}px`;
      containerDOM.style.margin = '0 4px';
    } else {
      containerDOM.style.width = '100%';
    }
    containerDOM.style.height = '18px';
    containerDOM.style.display = 'inline-block';
    containerDOM.dataset.type = 'container';

    this.legendBoxDOM.appendChild(containerDOM);
    this.seriesInfo.count++;
  },

  /**
   * Set legend components position by option
   *
   * @returns {undefined}
   */
  setLegendPosition() {
    const opt = this.options;
    const position = opt?.legend?.position;
    const wrapperStyle = this.wrapperDOM?.style;
    const legendStyle = this.legendDOM?.style;
    const boxStyle = this.legendBoxDOM?.style;
    const resizeStyle = this.resizeDOM?.style;

    let chartRect;
    const title = opt?.title?.show ? opt?.title?.height : 0;
    const positionTop = title + opt?.legend?.height;
    const { top = 0, bottom = 0, left = 0, right = 0 } = opt?.legend?.padding ?? {};

    if (!wrapperStyle || !legendStyle) {
      return;
    }

    boxStyle.padding = `${top}px ${right}px ${bottom}px ${left}px`;

    switch (position) {
      case 'top':
        wrapperStyle.padding = `${positionTop}px 0 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height}px`;

        legendStyle.top = `${title}px`;
        legendStyle.right = '';
        legendStyle.bottom = '';
        legendStyle.left = '';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + 4}px`; // 4 resize bar size

        resizeStyle.top = `${positionTop}px`;
        resizeStyle.right = '';
        resizeStyle.bottom = '';
        resizeStyle.left = '';

        resizeStyle.width = `${chartRect.width}px`;
        resizeStyle.height = '4px';
        resizeStyle.cursor = 'row-resize';
        break;
      case 'right':
        wrapperStyle.padding = `${title}px ${opt.legend.width}px 0 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = `${opt.legend.width - 10}px`; // legendDOM left padding
        boxStyle.maxHeight = `${chartRect.height}px`;

        legendStyle.paddingLeft = '10px';
        legendStyle.top = `${title}px`;
        legendStyle.right = '0px';
        legendStyle.bottom = '';
        legendStyle.left = '';

        legendStyle.width = `${opt.legend.width}px`;
        legendStyle.height = `${chartRect.height}px`;

        resizeStyle.top = `${title}px`;
        resizeStyle.right = `${opt.legend.width}px`;
        resizeStyle.bottom = '';
        resizeStyle.left = '';

        resizeStyle.width = '4px';
        resizeStyle.height = `${chartRect.height}px`;
        resizeStyle.cursor = 'col-resize';
        break;
      case 'bottom':
        wrapperStyle.padding = `${title}px 0 ${opt.legend.height}px 0`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height}px`;

        legendStyle.top = '';
        legendStyle.right = '';
        legendStyle.bottom = '0px';
        legendStyle.left = '0px';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + 4}px`; // 4 resize bar size

        resizeStyle.top = '';
        resizeStyle.right = '';
        resizeStyle.bottom = `${opt.legend.height}px`;
        resizeStyle.left = '';

        resizeStyle.width = `${chartRect.width}px`;
        resizeStyle.height = '4px';
        resizeStyle.cursor = 'row-resize';
        break;
      case 'left':
        wrapperStyle.padding = `${title}px 0 0 ${opt.legend.width}px`;
        chartRect = this.chartDOM.getBoundingClientRect();

        boxStyle.width = `${opt.legend.width}px`;
        boxStyle.maxHeight = `${chartRect.height}px`;
        boxStyle.display = 'absolute';
        boxStyle.bottom = '0px';

        legendStyle.top = `${title}px`;
        legendStyle.right = '';
        legendStyle.bottom = '';
        legendStyle.left = '0px';

        legendStyle.width = `${opt.legend.width}px`;
        legendStyle.height = `${chartRect.height}px`;

        resizeStyle.top = `${title}px`;
        resizeStyle.right = '';
        resizeStyle.bottom = '';
        resizeStyle.left = `${opt.legend.width}px`;

        resizeStyle.width = '4px';
        resizeStyle.height = `${chartRect.height}px`;
        resizeStyle.cursor = 'col-resize';
        break;
      default:
        break;
    }
  },

  /**
   * Update legend components size
   *
   * @returns {undefined}
   */
  updateLegendContainerSize() {
    if (!this.options || !this.legendBoxDOM) {
      return;
    }

    const opt = this.options?.legend;
    const container = this.legendBoxDOM.getElementsByClassName('ev-chart-legend-container');

    if (!container) {
      return;
    }

    for (let ix = 0; ix < container.length; ix++) {
      if (opt.position === 'top' || opt.position === 'bottom') {
        container[ix].style.width = `${opt.width - 8}px`;
        container[ix].style.margin = '0 4px';
      } else {
        container[ix].style.width = '100%';
      }
    }
  },

  /**
   * When user moves resizeDOM, this function will change css
   *
   * @returns {undefined}
   */
  onMouseMove(e) {
    e.stopPropagation();
    e.preventDefault();

    const offset = this.wrapperDOM.getBoundingClientRect();
    const offsetWidth = this.wrapperDOM.offsetWidth;
    const offsetHeight = this.wrapperDOM.offsetHeight;

    const titleHeight = this.options.title.show ? this.options.title.height : 0;
    const position = this.options.legend.position;

    const chartMinWidth = 150;
    const chartMinHeight = 70;

    const legendMinWidth = 120;
    const legendMinHeight = 20;

    let move;

    switch (position) {
      case 'left':
        move = e.clientX - offset.left;
        if (move < legendMinWidth) {
          move = legendMinWidth;
        } else if (move > offsetWidth - chartMinWidth) {
          move = offsetWidth - chartMinWidth;
        }
        this.ghostDOM.style.left = `${move}px`;
        break;
      case 'right':
        move = e.clientX - offset.left;
        if (move < chartMinWidth) {
          move = chartMinWidth;
        } else if (move > offsetWidth - legendMinWidth) {
          move = offsetWidth - legendMinWidth;
        }
        this.ghostDOM.style.left = `${move}px`;
        break;
      case 'top':
        move = e.clientY - offset.top;
        if (move < legendMinHeight + titleHeight) {
          move = legendMinHeight + titleHeight;
        } else if (move > offsetHeight - chartMinHeight) {
          move = offsetHeight - chartMinHeight;
        }
        this.ghostDOM.style.top = `${move}px`;
        break;
      case 'bottom':
        move = e.clientY - offset.top;
        if (move < chartMinHeight + titleHeight) {
          move = chartMinHeight + titleHeight;
        } else if (move > offsetHeight - legendMinHeight) {
          move = offsetHeight - legendMinHeight;
        }
        this.ghostDOM.style.bottom = `${this.wrapperDOM.offsetHeight - move}px`;
        break;
      default:
        break;
    }

    this.isLegendMove = true;
  },

  /**
   * callback for mouseup on ghostDOM, this function will change legend and chart size.
   *
   * @returns {undefined}
   */
  onMouseUp(e) {
    e.stopPropagation();
    e.preventDefault();

    this.wrapperDOM.removeEventListener('mousemove', this.mouseMove, false);
    this.wrapperDOM.removeEventListener('mouseup', this.mouseUp, false);

    const opt = this.options;
    const pos = opt.legend.position;
    const resizeDOMStyle = this.resizeDOM.style;
    const legendDOMStyle = this.legendDOM.style;
    const boxDOMStyle = this.legendBoxDOM.style;
    const ghostDOMStyle = this.ghostDOM.style;
    const wrapperDOMStyle = this.wrapperDOM.style;

    const title = opt.title.show ? opt.title.height : 0;
    const padding = +this.legendDOM.style.paddingLeft.replace('px', '');
    let move;
    if (this.isLegendMove) {
      switch (pos) {
        case 'top':
          resizeDOMStyle.top = ghostDOMStyle.top;
          move = +ghostDOMStyle.top.replace('px', '');
          legendDOMStyle.height = `${move - title}px`;
          boxDOMStyle.height = `${move - title - 4}px`;
          opt.legend.height = move - title - 4;
          wrapperDOMStyle.padding = `${move}px 0 0 0`;
          break;
        case 'right':
          resizeDOMStyle.left = ghostDOMStyle.left;
          move = +ghostDOMStyle.left.replace('px', '');
          legendDOMStyle.width = `${(this.wrapperDOM.offsetWidth - move - 4)}px`;
          boxDOMStyle.width = `${(this.wrapperDOM.offsetWidth - move - 4 - padding)}px`;
          opt.legend.width = this.wrapperDOM.offsetWidth - move - 4;
          wrapperDOMStyle.padding = `${title}px ${this.wrapperDOM.offsetWidth - move}px 0 0`;
          break;
        case 'bottom':
          resizeDOMStyle.bottom = ghostDOMStyle.bottom;
          move = this.wrapperDOM.offsetHeight - (+ghostDOMStyle.bottom.replace('px', ''));
          legendDOMStyle.height = `${this.wrapperDOM.offsetHeight - move}px`;
          boxDOMStyle.height = `${move - title - 4}px`;
          opt.legend.height = this.wrapperDOM.offsetHeight - move;
          wrapperDOMStyle.padding = `${title}px 0 ${this.wrapperDOM.offsetHeight - move}px 0`;
          break;
        case 'left':
          resizeDOMStyle.left = ghostDOMStyle.left;
          move = +ghostDOMStyle.left.replace('px', '');
          legendDOMStyle.width = `${move}px`;
          boxDOMStyle.width = `${move}px`;
          opt.legend.width = move;
          wrapperDOMStyle.padding = `${title}px 0 0 ${move - 4}px`;
          break;
        default:
          break;
      }
    }

    resizeDOMStyle.display = 'block';
    this.ghostDOM.remove();

    if (this.isLegendMove) {
      this.render();
      this.isLegendMove = false;
    }
  },

  /**
   * Show legend components by manipulating css
   *
   * @returns {undefined}
   */
  showLegend() {
    if (!this.resizeDOM || !this.legendDOM) {
      return;
    }

    this.resizeDOM.style.display = 'block';
    this.legendDOM.style.display = 'block';
  },

  /**
   * Hide legend components by manipulating css
   *
   * @returns {undefined}
   */
  hideLegend() {
    const opt = this.options;
    const wrapperStyle = this.wrapperDOM?.style;
    const resizeStyle = this.resizeDOM?.style;
    const legendStyle = this.legendDOM?.style;
    const title = opt?.title?.show ? opt?.title?.height : 0;

    if (!resizeStyle || !legendStyle || !wrapperStyle) {
      return;
    }

    resizeStyle.display = 'none';
    legendStyle.display = 'none';

    legendStyle.width = '0';
    legendStyle.height = '0';
    wrapperStyle.padding = `${title}px 0 0 0`;
  },
};

export default modules;
