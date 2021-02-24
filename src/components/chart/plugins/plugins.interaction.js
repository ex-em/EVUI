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
      const { indicator, tooltip } = this.options;

      this.overlayClear();

      if (Object.keys(hitInfo.items).length) {
        this.drawItemsHighlight(hitInfo, ctx);

        if (tooltip.use) {
          this.tooltipClear();
          this.drawTooltip(hitInfo, this.tooltipCtx, this.setTooltipLayout(hitInfo, e, offset));
          this.tooltipDOM.style.display = 'block';
        }
      } else if (tooltip.use) {
        this.hideTooltipDOM();
      }

      if (indicator.use) {
        this.drawIndicator(offset, indicator.color);
      }
    };

    /**
     * To clear tooltip and item highlighting, add event listener on mouseleave
     *
     * @returns {undefined}
     */
    this.onMouseLeave = () => {
      if (this.options.tooltip.throttledMove) {
        this.onMouseMove.cancel();
      }
      this.overlayClear();

      if (this.options.tooltip.use) {
        this.tooltipClear();
        this.tooltipDOM.style.display = 'none';
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

      if (typeof this.listeners.click === 'function') {
        this.listeners.click(args);
      }
    };

    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseLeave);
    this.overlayCanvas.addEventListener('dblclick', this.onDblClick);
    this.overlayCanvas.addEventListener('click', this.onClick);
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
};

export default modules;
