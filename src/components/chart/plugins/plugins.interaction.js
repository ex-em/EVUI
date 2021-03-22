import { numberWithComma } from '@/common/utils';

const modules = {
  /**
   * Hide legend components by manipulating css
   *
   * @returns {undefined}
   */
  createEventFunctions() {
    /**
     * To show tooltip and item highlighting, add event listener on mousemove
     *
     * @returns {undefined}
     */
    this.onMouseMove = (e) => {
      const offset = this.getMousePosition(e);
      const hitInfo = this.findHitItem(offset);
      const ctx = this.overlayCtx;
      const { indicator, tooltip, type } = this.options;

      this.overlayClear();

      if (Object.keys(hitInfo.items).length) {
        this.drawItemsHighlight(hitInfo, ctx);

        if (tooltip.use) {
          this.setTooltipLayoutPosition(hitInfo, e);
          this.drawTooltip(hitInfo, this.tooltipCtx);
        }
      } else if (tooltip.use) {
        this.hideTooltipDOM();
      }

      if (type === 'scatter' && this.dragInfo) {
        this.dragMove(e);
      }

      if (indicator.use && type !== 'pie') {
        this.drawIndicator(offset, indicator.color);
      }
    };

    /**
     * To clear tooltip and item highlighting, add event listener on mouseleave
     *
     * @returns {undefined}
     */
    this.onMouseLeave = () => {
      const { tooltip, dragSelection } = this.options;

      if (tooltip.throttledMove) {
        this.onMouseMove.cancel();
      }

      if (!dragSelection.use || !dragSelection.keepDisplay) {
        this.overlayClear();
      }

      if (tooltip.use) {
        this.tooltipClear();
      }
    };

    /**
     * Dealing with graph item select and invoking user custom dblclick event
     *
     * @returns {undefined}
     */
    this.onDblClick = (e) => {
      const selectItem = this.options.selectItem;
      const args = {};

      if (selectItem.use) {
        const offset = this.getMousePosition(e);
        const hitInfo = this.findClickedData(offset, selectItem.useApproximateValue);


        if (hitInfo.label !== null) {
          this.render(hitInfo);
        }

        ({ label: args.label, value: args.value, sId: args.seriesId } = hitInfo);
      }

      if (typeof this.listeners['dbl-click'] === 'function') {
        this.listeners['dbl-click'](args);
      }
    };

    /**
     * Dealing with graph item select and invoking user custom click event
     *
     * @returns {undefined}
     */
    this.onClick = (e) => {
      const args = {};

      if (this.options.selectItem.use) {
        const offset = this.getMousePosition(e);
        const hitInfo = this.findClickedData(offset);

        if (hitInfo.label !== null) {
          this.render(hitInfo);
        }

        ({ label: args.label, value: args.value, sId: args.seriesId } = hitInfo);
      }
    };

    /**
     * Start drag-select when dragSelection use option is True and graph type is 'scatter'
     *
     * @returns {undefined}
     */
    this.onMouseDown = (e) => {
      const { dragSelection, type } = this.options;

      if (dragSelection.use && type === 'scatter') {
        this.dragStart(e);
      }
    };

    if (this.options?.tooltip?.scrollbar?.use) {
      this.overlayCanvas.addEventListener('wheel', (e) => {
        const isTooltipVisible = this.tooltipDOM.style.display === 'block';

        if (isTooltipVisible) {
          e.preventDefault();
          this.tooltipBodyDOM.scrollTop += e.deltaY;
        }
      });
    }

    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseLeave);
    this.overlayCanvas.addEventListener('dblclick', this.onDblClick);
    this.overlayCanvas.addEventListener('click', this.onClick);
    this.overlayCanvas.addEventListener('mousedown', this.onMouseDown);
  },

  /**
   * Start drag-move when the mouse pointer is in the graph
   *
   * @returns {undefined}
   */
  dragStart(evt) {
    const [offsetX, offsetY] = this.getMousePosition(evt);
    const chartRect = this.chartRect;
    const labelOffset = this.labelOffset;
    const range = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    // check graph range
    if (offsetX < range.x1 || offsetX > range.x2
        || offsetY < range.y1 || offsetY > range.y2
    ) {
      return;
    }

    this.dragInfo = {
      xcp: offsetX,
      ycp: offsetY,
      range,
    };

    /**
     * invoking user custom click event width items and range in drag-section
     *
     * @returns {undefined}
     */
    const dragEnd = (e) => {
      e.preventDefault();
      const dragInfo = this.dragInfo;

      if (dragInfo?.isMove) {
        if (!this.options.dragSelection.keepDisplay) {
          this.overlayClear();
        }

        const args = {
          data: this.findSelectedItems(dragInfo),
          range: this.getSelectionRage(dragInfo),
        };

        if (typeof this.listeners['drag-select'] === 'function') {
          this.listeners['drag-select'](args);
        }
      }

      this.dragInfo = null;

      window.removeEventListener('mouseup', dragEnd);
    };

    window.addEventListener('mouseup', dragEnd);
  },

  /**
   * Calculate drag-section position and size, and drawing drag-section
   *
   * @returns {undefined}
   */
  dragMove(e) {
    const [offsetX, offsetY] = this.getMousePosition(e);
    const dragInfo = this.dragInfo;
    const { xcp, ycp, range } = dragInfo;

    let xep;
    let yep;

    dragInfo.isMove = true;

    if (offsetX < range.x1) {
      xep = range.x1;
    } else if (offsetX > range.x2) {
      xep = range.x2;
    } else {
      xep = offsetX;
    }

    if (offsetY < range.y1) {
      yep = range.y1;
    } else if (offsetY > range.y2) {
      yep = range.y2;
    } else {
      yep = offsetY;
    }

    dragInfo.xsp = Math.min(xcp, xep);
    dragInfo.ysp = Math.min(ycp, yep);
    dragInfo.width = Math.ceil(Math.abs(xep - xcp));
    dragInfo.height = Math.ceil(Math.abs(yep - ycp));

    this.overlayClear();
    this.drawSelectionArea(dragInfo);
  },


/**
   * Draw selection-area
   *
   * @returns {undefined}
   */
  drawSelectionArea({ xsp, ysp, width, height }) {
    const ctx = this.overlayCtx;
    const { fillColor, opacity } = this.options.dragSelection;

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = opacity;
    ctx.fillRect(xsp, ysp, width, height);
    ctx.globalAlpha = 1;
  },

  /**
   * Computing mouse position on canvas
   *
   * @returns {array} mouse pointer position
   */
  getMousePosition(evt) {
    const e = evt.originalEvent || evt;
    const rect = this.overlayCanvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height];
  },

  /**
   * Find graph item on mouse position
   * @param {array} offset    return value from getMousePosition()
   *
   * @returns {object} hit item information
   */
  findHitItem(offset) {
    const sIds = Object.keys(this.seriesList);
    const items = {};
    const isHorizontal = !!this.options.horizontal;
    const ctx = this.tooltipCtx;

    let hitId = null;
    let maxs = '';
    let maxsw = 0;
    let maxv = '';
    let maxg = null;
    let maxSID = null;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series.findGraphData) {
        const item = series.findGraphData(offset, isHorizontal);

        if (item.data) {
          let gdata;

          if (item.data.o === null) {
            gdata = isHorizontal ? item.data.x : item.data.y;
          } else if (!isNaN(item.data.o)) {
            gdata = isHorizontal ? item.data.x : item.data.y;
          }

          if (gdata !== null && gdata !== undefined) {
            const sName = `${series.name}`;
            const sw = ctx ? ctx.measureText(sName).width : 1;

            item.name = sName;
            item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
            items[sId] = item;

            const cg = numberWithComma(gdata);

            if (maxsw < sw) {
              maxs = sName;
              maxsw = sw;
            }

            if (maxv.length <= `${cg}`.length) {
              maxv = `${cg}`;
            }

            if (maxg === null || maxg <= gdata) {
              maxg = gdata;
              maxSID = sId;
            }

            if (item.hit) {
              hitId = sId;
            }
          }
        }
      }
    }

    hitId = hitId === null ? Object.keys(items)[0] : hitId;
    const maxHighlight = maxg !== null ? [maxSID, maxg] : null;

    return { items, hitId, maxTip: [maxs, maxv], maxHighlight };
  },

  /**
   * Find clicked graph item on mouse position
   * @param {array}   offset          return value from getMousePosition()
   * @param {boolean} useApproximate  if it's true. it'll look for closed item on mouse position
   *
   * @returns {object} clicked item information
   */
  findClickedData(offset, useApproximate) {
    const sIds = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxl = null;
    let maxp = null;
    let maxg = null;
    let maxSID = '';
    let acc = 0;
    let useStack = false;
    let maxIndex = null;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];
      const findFn = useApproximate ? series.findApproximateData : series.findGraphData;

      if (findFn) {
        const item = findFn.call(series, offset, isHorizontal);
        const data = item.data;
        const index = item.index;

        if (data) {
          const ldata = isHorizontal ? data.y : data.x;
          const lp = isHorizontal ? data.yp : data.xp;

          if (ldata !== null && ldata !== undefined) {
            const g = isHorizontal ? data.o || data.x : data.o || data.y;

            if (series.stackIndex) {
              acc += !isNaN(data.o) ? data.o : 0;
              useStack = true;
            } else {
              acc += data.y;
            }

            if (maxg === null || maxg <= g) {
              maxg = g;
              maxSID = sId;
              maxl = ldata;
              maxp = lp;
              maxIndex = index;
            }
          }
        }
      }
    }

    return {
      label: maxl,
      pos: maxp,
      value: maxg === null ? 0 : maxg,
      sId: maxSID,
      acc,
      useStack,
      maxIndex,
    };
  },

  /**
   * Find graph item by label entered from user
   * @param {any} label   label value
   *
   * @returns {boolean} if it wasn't able to find it, return false. if not, return true and render.
   */
  selectItemByLabel(label) {
    const findInfo = this.getItemByLabel(label);

    if (findInfo) {
      this.render(findInfo);
    } else {
      return false;
    }

    return true;
  },
  findHitItem2(offset) {
    const mouseX = offset[0];
    const mouseY = offset[1];

    const width = this.chartRect.chartWidth;
    const height = this.chartRect.chartHeight;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    let angle;
    angle = ((Math.atan2(-dy, -dx) * 180) / Math.PI) - 90;
    angle = angle < 0 ? 360 + angle : angle;
    const rad = ((angle * Math.PI) / 180) + (1.5 * Math.PI);
    const distance = Math.round(Math.sqrt((dx ** 2) + (dy ** 2)));

    const graphData = this.graphData;
    let gdata;
    let dsIndex = null;
    let sId = null;

    for (let ix = 0, ixLen = graphData.length; ix < ixLen; ix++) {
      gdata = graphData[ix];
      if (distance > gdata.ir && distance < gdata.or) {
        dsIndex = ix;
      }
    }

    if (graphData[dsIndex]) {
      for (let ix = 0, ixLen = graphData[dsIndex].data.length; ix < ixLen; ix++) {
        gdata = graphData[dsIndex].data[ix];

        if (rad > gdata.sa && rad < gdata.ea) {
          sId = gdata.id;
        }
      }
    }

    return { dsIndex, sId };
  },

  /**
   * Find items by series within a range
   * @param {object} param  object for find series items
   *
   * @returns {object}
   */
  findSelectedItems(range) {
    const items = [];
    const sIds = Object.keys(this.seriesList);
    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];
      const findFn = series.findItems;
      if (findFn) {
        const item = findFn.call(series, range);
        if (item && item.length) {
          items.push({
            seriesName: series.name,
            seriesId: sId,
            items: item,
          });
        }
      }
    }

    return items;
  },

  /**
   * Returns the data-based range value for a selection
   * @param {object} object for calculating data-based range
   *                 object.range: coordinate-based range in graph
   * @returns {object}
   */
  getSelectionRage({ xsp, ysp, width, height, range }) {
    const dataRangeX = this.axesSteps.x.length ? this.axesSteps.x[0] : null;
    const dataRangeY = this.axesSteps.y.length ? this.axesSteps.y[0] : null;

    if (!dataRangeX || !dataRangeY) {
      return null;
    }

    const xep = xsp + width;
    const yep = ysp + height;
    const graphWidth = dataRangeX.graphMax - dataRangeX.graphMin;
    const graphHeight = dataRangeY.graphMax - dataRangeY.graphMin;

    const xMinRatio = this.getRatioInRange(range.x1, range.x2, xsp);
    const xMaxRatio = this.getRatioInRange(range.x1, range.x2, xep);
    const yMinRatio = this.getRatioInRange(range.y1, range.y2, yep);
    const yMaxRatio = this.getRatioInRange(range.y1, range.y2, ysp);

    const xMin = dataRangeX.graphMin + graphWidth * xMinRatio;
    const xMax = dataRangeX.graphMin + graphWidth * xMaxRatio;
    const yMin = dataRangeY.graphMin + graphHeight * (1 - yMinRatio);
    const yMax = dataRangeY.graphMin + graphHeight * (1 - yMaxRatio);

    return {
      xMin: +parseFloat(xMin).toFixed(3),
      xMax: +parseFloat(xMax).toFixed(3),
      yMin: +parseFloat(yMin).toFixed(3),
      yMax: +parseFloat(yMax).toFixed(3),
    };
  },

  /**
   * Returns the position ratio of 'value' between 'min' and 'max'
   * @param {number} min    min value
   * @param {number} max    max value
   * @param {number} value  value is between min and max
   *
   * @returns {number}
   */
  getRatioInRange(min, max, value) {
    const total = max - min;
    const targetValue = value - min;

    return targetValue / total;
  },
};

export default modules;
