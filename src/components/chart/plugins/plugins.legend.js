import Util from '../helpers/helpers.util';

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

    if (this.options?.legend?.allowResize) {
      this.resizeDOM = document.createElement('div');
      this.resizeDOM.className = 'ev-chart-resize-bar';
      this.ghostDOM = document.createElement('div');
      this.ghostDOM.className = 'ev-chart-resize-ghost';
      this.wrapperDOM.appendChild(this.resizeDOM);
    }

    if (this.useTable) {
      this.legendTableDOM = document.createElement('table');
      this.legendTableDOM.className = 'ev-chart-legend--table';
      this.setLegendColumnHeader();
      this.legendBoxDOM.appendChild(this.legendTableDOM);
      this.legendDOM.style.overflow = 'auto';
    } else {
      this.legendBoxDOM.style.overflowX = 'hidden';
      this.legendBoxDOM.style.overflowY = 'auto';
    }

    this.legendDOM.appendChild(this.legendBoxDOM);
    this.wrapperDOM.appendChild(this.legendDOM);
  },

  /**
   * Create and append Table Header DOM
   * Only chartOption > legend > table > use : true
   *
   * @returns {undefined}
   */
  setLegendColumnHeader() {
    const tableOpt = this.options.legend?.table;
    const columns = tableOpt.columns;
    const columnKeyList = ['color', ...Object.keys(columns)];

    columnKeyList.forEach((key) => {
      const columnNameDOM = document.createElement('th');
      columnNameDOM.className = 'ev-chart-legend--table__column-name';

      if (columns[key]?.use || key === 'color' || key === 'name') {
        const columnOpt = columns[key];
        const keyText = columnOpt?.title ?? '';

        columnNameDOM.textContent = keyText;
        columnNameDOM.setAttribute('title', keyText);
        columnNameDOM.dataset.type = keyText;

        Util.setDOMStyle(columnNameDOM, tableOpt?.style?.header);

        this.legendTableDOM.append(columnNameDOM);
      }
    });
  },

  /**
   * Initialize legend
   * If there was no initialization, create DOM and set default layout.
   * It not, there will already be set layout, so add a legend for each series with group
   *
   * @returns {undefined}
   */
  initLegend() {
    this.isHeatMapType = this.options.type === 'heatMap';
    this.useTable = !!this.options.legend?.table?.use && this.options.type !== 'heatmap' && this.options.type !== 'scatter';

    if (!this.isInitLegend) {
      this.createLegendLayout();
    }

    if (this.isHeatMapType) {
      this.initEventForColorLegend();
      this.addColorLegendList();
    } else {
      this.initEvent();
      this.addLegendList();
    }

    this.initResizeEvent();

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
        const series = seriesList[sId];

        if (series && series.showLegend) {
          if (this.useTable) {
            this.addLegendWithValues(series);
          } else {
            this.addLegend(series);
          }
        }
      });
    });

    Object.values(seriesList).forEach((series) => {
      if (series.isExistGrp || !series.showLegend) {
        return;
      }

      if (this.useTable) {
        this.addLegendWithValues(series);
      } else {
        this.addLegend(series);
      }
    });
  },

  /**
   * Add Legend with Color Information
   * Only Heatmap chart
   *
   * @returns {undefined}
   */
  addColorLegendList() {
    const seriesList = this.seriesList;

    Object.values(seriesList).forEach((series) => {
      if (!series.isExistGrp && series.showLegend) {
        const { colorState, valueOpt } = series;
        const { min, max, interval, existError, decimalPoint } = valueOpt;
        const length = colorState.length;
        const endIndex = existError ? length - 2 : length - 1;
        for (let index = 0; index < length; index++) {
          const colorItem = colorState[index];
          const minValue = min + (interval * index);
          let maxValue = minValue + interval;
          if (index < endIndex) {
            maxValue -= (0.1 ** decimalPoint);
          } else {
            maxValue = max + (0.1 ** decimalPoint);
          }

          let name = `${minValue.toFixed(decimalPoint)} - ${maxValue.toFixed(decimalPoint)}`;
          if (min === undefined || max === undefined) {
            if (index === 0) {
              name = '0';
            } else {
              break;
            }
          } else if (existError && index === endIndex + 1) {
            name = 'error';
          } else if (minValue > max) {
            break;
          } else if (interval <= 1 && decimalPoint === 0) {
            name = minValue;
          }

          this.addLegend({
            cId: colorItem.id,
            color: colorItem.color,
            name,
          });
        }
      }
    });
  },

  /**
   * Get Container DOM by Event Object
   * @param e Event
   *
   * @returns {Element}
   */
  getContainerDOM(e) {
    let targetDOM = null;
    const type = e.target.dataset.type;

    const childTypes = ['name', 'color', 'min', 'max', 'avg', 'total', 'last'];

    if (type === 'container') {
      targetDOM = e.target;
    } else if (childTypes.includes(type)) {
      targetDOM = e.target.parentElement;

      if (!targetDOM?.series) {
        targetDOM = targetDOM.parentElement;
      }
    }

    return targetDOM;
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

    const classList = {
      container: `ev-chart-legend${this.useTable ? '--table__container' : '-container'}`,
      color: `ev-chart-legend${this.useTable ? '--table__color' : '-color'}`,
      name: `ev-chart-legend${this.useTable ? '--table__name' : '-name'}`,
      value: `ev-chart-legend${this.useTable ? '--table__value' : '-value'}`,
    };

    /**
     * callback for legendBoxDOM to show/hide clicked series
     *
     * @returns {undefined}
     */
    this.onLegendBoxClick = (e) => {
      const opt = this.options.legend;

      const targetDOM = this.getContainerDOM(e);
      if (!targetDOM) {
        return;
      }

      const series = targetDOM?.series;

      const colorDOM = targetDOM?.getElementsByClassName(classList.color)[0];
      const nameDOM = targetDOM?.getElementsByClassName(classList.name)[0];
      const valueDOMList = targetDOM?.getElementsByClassName(classList.value);

      const isActive = !targetDOM?.className.includes('inactive');
      if (isActive && this.seriesInfo.count === 1) {
        return;
      }

      if (!colorDOM || !nameDOM) {
        return;
      }

      if (isActive) {
        this.seriesInfo.count--;

        const inactiveColor = opt.inactive;
        colorDOM.style.backgroundColor = inactiveColor;
        colorDOM.style.borderColor = inactiveColor;
        nameDOM.style.color = inactiveColor;
        valueDOMList?.forEach((dom) => {
          dom.style.color = inactiveColor;
        });
      } else {
        this.seriesInfo.count++;

        let seriesColor;
        if (typeof series.color !== 'string') {
          seriesColor = series.color[series.color.length - 1][1];
        } else {
          seriesColor = series.color;
        }

        if (series.type === 'line' && series.fill) {
          colorDOM.style.height = '8px';
          colorDOM.style.backgroundColor = `${seriesColor}80`;
          colorDOM.style.border = `1px solid ${seriesColor}`;
        } else {
          colorDOM.style.backgroundColor = seriesColor;
        }

        nameDOM.style.color = opt.color;
        valueDOMList?.forEach((dom) => {
          const style = opt.table?.columns[dom.dataset.type]?.style;
          dom.style.color = style?.color ? style.color : opt.color;
        });
      }

      series.show = !series.show;
      targetDOM.classList.toggle('inactive');

      this.update({
        updateSeries: false,
        updateSelTip: { update: true, keepDomain: true },
      });
    };

    /**
     * callback for legendBoxDOM hovering
     *
     * @returns {undefined}
     */
    this.onLegendBoxOver = (e) => {
      const targetDOM = this.getContainerDOM(e);
      if (!targetDOM) {
        return;
      }

      const targetId = targetDOM?.series?.sId;
      const legendHitInfo = { sId: targetId, type: this.options.type };

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
        hitInfo: {
          legend: legendHitInfo,
        },
      });
    };

    /**
     * callback for mouseleave event on legendBoxDOM
     *
     * @returns {undefined}
     */
    this.onLegendBoxLeave = () => {
      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
        hitInfo: {
          legend: null,
        },
      });
    };

    this.legendBoxDOM.addEventListener('click', this.onLegendBoxClick);
    this.legendBoxDOM.addEventListener('mouseover', this.onLegendBoxOver);
    this.legendBoxDOM.addEventListener('mouseleave', this.onLegendBoxLeave);

    this.initResizeEvent();
  },

  /**
   * Init Event on Color Legend
   * Only Heatmap
   */
  initEventForColorLegend() {
    if (this.isInitLegend) {
      return;
    }

    /**
     * callback for legendBoxDOM to show/hide clicked series
     *
     * @returns {undefined}
     */
    this.onLegendBoxClick = (e) => {
      const opt = this.options.legend;
      const series = Object.values(this.seriesList)[0];

      const targetDOM = this.getContainerDOM(e);
      if (!targetDOM) {
        return;
      }

      const colorDOM = targetDOM?.getElementsByClassName('ev-chart-legend-color')[0];
      const nameDOM = targetDOM?.getElementsByClassName('ev-chart-legend-name')[0];
      const targetId = targetDOM?.series?.cId;
      const isActive = !colorDOM?.className.includes('inactive');
      const activeCount = series.colorState.filter(colorItem => colorItem.show).length;

      if (isActive && activeCount === 1) {
        return;
      }

      if (!colorDOM || !nameDOM) {
        return;
      }

      if (isActive) {
        colorDOM.style.backgroundColor = opt.inactive;
        colorDOM.style.borderColor = opt.inactive;
        nameDOM.style.color = opt.inactive;
      } else {
        colorDOM.style.backgroundColor = targetDOM?.series?.color;
        nameDOM.style.color = opt.color;
      }

      const targetIndex = series.colorState.findIndex(colorItem => colorItem.id === targetId);
      if (targetIndex > -1) {
        series.colorState[targetIndex].show = !isActive;
      }

      colorDOM.classList.toggle('inactive');
      nameDOM.classList.toggle('inactive');

      this.update({
        updateSeries: false,
        updateSelTip: { update: true, keepDomain: true },
      });
    };

    /**
     * callback for legendBoxDOM hovering
     *
     * @returns {undefined}
     */
    this.onLegendBoxOver = (e) => {
      const series = Object.values(this.seriesList)?.[0];

      const targetDOM = this.getContainerDOM(e);
      if (!targetDOM) {
        return;
      }

      const targetId = targetDOM?.series?.cId;

      series.colorState.forEach((colorItem) => {
        colorItem.state = colorItem.id === targetId ? 'highlight' : 'downplay';
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
      const series = Object.values(this.seriesList)[0];
      series.colorState.forEach((item) => {
        item.state = 'normal';
      });

      this.update({
        updateSeries: false,
        updateSelTip: { update: false, keepDomain: false },
      });
    };

    this.legendBoxDOM.addEventListener('click', this.onLegendBoxClick);
    this.legendBoxDOM.addEventListener('mouseover', this.onLegendBoxOver);
    this.legendBoxDOM.addEventListener('mouseleave', this.onLegendBoxLeave);

    this.initResizeEvent();
  },

  initResizeEvent() {
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

    if (this.resizeDOM) {
      this.resizeDOM.addEventListener('mousedown', this.onResizeMouseDown);
      this.mouseMove = this.onMouseMove.bind(this); // resizing function
      this.mouseUp = this.onMouseUp.bind(this); // resizing function
    }
  },

  /**
   * To update legend, reset all process.
   *
   * @returns {undefined}
   */
  updateLegend() {
    this.resetLegend();

    if (this.isHeatMapType) {
      this.addColorLegendList();
    } else {
      this.addLegendList();
    }
  },

  /**
   * To update value text on legend table
   * Only chartOption > legend > table > use : true
   *
   * @returns {undefined}
   */
  updateLegendTableValues() {
    const columns = this.options?.legend?.table?.columns;
    const aggregations = this.getAggregations();
    const rowDOMList = this.legendBoxDOM?.getElementsByClassName('ev-chart-legend--table__row');

    rowDOMList.forEach((row) => {
      const valueDOMList = row?.getElementsByClassName('ev-chart-legend--table__value');

      valueDOMList.forEach((dom) => {
        const key = dom.dataset.type;
        if (key === 'name') {
          return;
        }

        const seriesId = row.series.sId;
        const value = aggregations?.[seriesId]?.[key];
        dom.textContent = this.getFormattedValue(columns[key], value);
      });
    });
  },

  /**
   * Force Update Legend. Remove and Create
   *
   * @returns {undefined}
   */
  forceUpdateLegend() {
    this.destroyLegend();
    this.initLegend();
  },

  /**
   * To update legend, remove all of legendBoxDOM's children
   *
   * @returns {undefined}
   */
  resetLegend() {
    const legendBoxDOM = this.legendBoxDOM;

    if (!legendBoxDOM) {
      return;
    }

    while (legendBoxDOM.hasChildNodes()) {
      legendBoxDOM.removeChild(legendBoxDOM.firstChild);
    }

    this.seriesInfo.count = 0;
  },

  /**
   * To update legend, remove all of legendBoxDOM's children
   *
   * @returns {undefined}
   */
  destroyLegend() {
    const legendDOM = this.legendDOM;

    if (!legendDOM) {
      return;
    }

    legendDOM.remove();

    this.legendDOM = null;
    this.legendBoxDOM = null;
    this.resizeDOM = null;
    this.isInitLegend = false;
    this.seriesInfo.count = 0;
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

    containerDOM.className = `ev-chart-legend-container ${!series.show ? ' inactive' : ''}`;
    containerDOM.series = series;

    colorDOM.className = 'ev-chart-legend-color';

    if (series.type === 'line' && series.point && !series.fill) {
      colorDOM.className += ' ev-chart-legend-color--point-line';
    }

    nameDOM.className = 'ev-chart-legend-name';

    // set series color
    let seriesColor;
    if (!series.show) {
      seriesColor = opt.inactive;
    } else if (typeof series.color !== 'string') {
      seriesColor = series.color[series.color.length - 1][1];
    } else {
      seriesColor = series.color;
    }

    if (series.type === 'line' && series.fill) {
      colorDOM.style.height = '8px';
      colorDOM.style.backgroundColor = series.show ? `${seriesColor}80` : opt.inactive;
      colorDOM.style.border = `1px solid ${seriesColor}`;
    } else {
      colorDOM.style.backgroundColor = seriesColor;
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
    containerDOM.style.overflow = 'hidden';
    containerDOM.dataset.type = 'container';

    this.legendBoxDOM.appendChild(containerDOM);
    if (series.show) {
      this.seriesInfo.count++;
    }
  },

  /**
   * Add Legend Items With aggregation Values
   * Only chartOption > legend > table > use : true
   * @param series
   */
  addLegendWithValues(series) {
    const opt = this.options.legend;
    const columns = opt?.table?.columns;

    const aggregations = this.getAggregations()?.[series?.sId];
    if (!aggregations || !columns) {
      return;
    }

    // create row
    const rowDOM = document.createElement('tr');
    rowDOM.className = `ev-chart-legend--table__row ${!series.show ? ' inactive' : ''}`;
    Util.setDOMStyle(rowDOM, opt.table?.style?.row);
    rowDOM.series = series;
    rowDOM.dataset.type = 'container';

    // create td - color
    const colorWrapperDOM = document.createElement('td');
    colorWrapperDOM.className = 'ev-chart-legend--table__color-wrapper';
    colorWrapperDOM.dataset.type = 'color';

    const colorDOM = document.createElement('div');
    colorDOM.className = 'ev-chart-legend--table__color';
    colorDOM.dataset.type = 'color';

    // set series color
    let seriesColor;
    if (!series.show) {
      seriesColor = opt.inactive;
    } else if (typeof series.color !== 'string') {
      seriesColor = series.color[series.color.length - 1][1];
    } else {
      seriesColor = series.color;
    }

    switch (series.type) {
      case 'line': {
        if (series.fill) {
          colorDOM.style.backgroundColor = `${seriesColor}80`;
          colorDOM.style.border = `1px solid ${seriesColor}`;
        } else {
          if (series.point) {
            colorDOM.className += ' ev-chart-legend--table__color--point-line';
          }

          colorDOM.className += ' ev-chart-legend--table__color--line';
          colorDOM.style.backgroundColor = seriesColor;
        }
        break;
      }

      case 'bar':
      case 'pie':
      default: {
        colorDOM.style.height = '10px';
        colorDOM.style.backgroundColor = seriesColor;
        break;
      }
    }

    if (series.type === 'line' && series.fill) {
      colorDOM.style.height = '8px';
      colorDOM.style.backgroundColor = series.show ? `${seriesColor}80` : opt.inactive;
      colorDOM.style.border = `1px solid ${seriesColor}`;
    } else {
      colorDOM.style.backgroundColor = seriesColor;
    }

    colorWrapperDOM.appendChild(colorDOM);
    rowDOM.appendChild(colorWrapperDOM);

    // create td - name
    const nameDOM = document.createElement('td');
    nameDOM.className = 'ev-chart-legend--table__name';
    nameDOM.style.color = series.show ? opt.color : opt.inactive;
    nameDOM.textContent = series.name;
    nameDOM.setAttribute('title', series.name);
    nameDOM.dataset.type = 'name';
    Util.setDOMStyle(nameDOM, columns?.name?.style);

    if (!series.show) {
      nameDOM.style.color = opt.inactive;
    }

    rowDOM.appendChild(nameDOM);

    // create td - values
    const columnKeyList = Object.keys(columns);
    columnKeyList?.forEach((key) => {
      if (key === 'name') {
        return;
      }

      if (columns[key].use) {
        const formattedTxt = this.getFormattedValue(columns[key], aggregations[key]);
        const valueDOM = document.createElement('td');
        valueDOM.className = 'ev-chart-legend--table__value';
        valueDOM.style.color = series.show ? opt.color : opt.inactive;
        valueDOM.textContent = formattedTxt;
        valueDOM.dataset.type = key.toString();
        Util.setDOMStyle(valueDOM, columns[key]?.style);

        if (!series.show) {
          valueDOM.style.color = opt.inactive;
        }

        rowDOM.appendChild(valueDOM);
      }
    });

    this.legendTableDOM.appendChild(rowDOM);
    if (series.show) {
      this.seriesInfo.count++;
    }
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
    let legendPad;
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
        legendPad = parseInt(legendStyle.paddingTop) + parseInt(legendStyle.paddingBottom);

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height - legendPad}px`;

        legendStyle.top = `${title}px`;
        legendStyle.right = '';
        legendStyle.bottom = '';
        legendStyle.left = '';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + (resizeStyle ? 4 : 0)}px`; // 4 resize bar size

        if (resizeStyle) {
          resizeStyle.top = `${positionTop}px`;
          resizeStyle.right = '';
          resizeStyle.bottom = '';
          resizeStyle.left = '';

          resizeStyle.width = `${chartRect.width}px`;
          resizeStyle.height = '4px';
          resizeStyle.cursor = 'row-resize';
        }
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

        if (resizeStyle) {
          resizeStyle.top = `${title}px`;
          resizeStyle.right = `${opt.legend.width}px`;
          resizeStyle.bottom = '';
          resizeStyle.left = '';

          resizeStyle.width = '4px';
          resizeStyle.height = `${chartRect.height}px`;
          resizeStyle.cursor = 'col-resize';
        }
        break;
      case 'bottom':
        wrapperStyle.padding = `${title}px 0 ${opt.legend.height}px 0`;
        chartRect = this.chartDOM.getBoundingClientRect();
        legendPad = parseInt(legendStyle.paddingTop) + parseInt(legendStyle.paddingBottom);

        boxStyle.width = '100%';
        boxStyle.height = `${opt.legend.height - legendPad}px`;

        legendStyle.top = '';
        legendStyle.right = '';
        legendStyle.bottom = '0px';
        legendStyle.left = '0px';

        legendStyle.width = `${chartRect.width}px`;
        legendStyle.height = `${opt.legend.height + (resizeStyle ? 4 : 0)}px`; // 4 resize bar size

        if (resizeStyle) {
          resizeStyle.top = '';
          resizeStyle.right = '';
          resizeStyle.bottom = `${opt.legend.height}px`;
          resizeStyle.left = '';

          resizeStyle.width = `${chartRect.width}px`;
          resizeStyle.height = '4px';
          resizeStyle.cursor = 'row-resize';
        }
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

        if (resizeStyle) {
          resizeStyle.top = `${title}px`;
          resizeStyle.right = '';
          resizeStyle.bottom = '';
          resizeStyle.left = `${opt.legend.width}px`;

          resizeStyle.width = '4px';
          resizeStyle.height = `${chartRect.height}px`;
          resizeStyle.cursor = 'col-resize';
        }
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
    const resizeStyle = this.resizeDOM?.style;
    const legendStyle = this.legendDOM?.style;
    const title = opt?.title?.show ? opt?.title?.height : 0;

    if (!legendStyle || !wrapperStyle) {
      return;
    }

    if (resizeStyle) {
      resizeStyle.display = 'none';
    }

    legendStyle.display = 'none';
    legendStyle.width = '0';
    legendStyle.height = '0';
    wrapperStyle.padding = `${title}px 0 0 0`;
  },

  /**
   * Get formatted value by formatter function
   * Only chartOption > legend > table > use : true
   * @param formatter
   * @param decimalPoint
   * @param value
   * @returns {string}
   */
  getFormattedValue({ formatter, decimalPoint }, value) {
    if (value === undefined || value === null) {
      return 'Null';
    }

    let formattedTxt;
    if (formatter) {
      formattedTxt = formatter(+value);
    }

    if (!formatter || typeof formattedTxt !== 'string') {
      formattedTxt = Util.labelSignFormat(+value, decimalPoint);
    }

    return formattedTxt;
  },

};

export default modules;
