import { numberWithComma } from '@/common/utils';

const modules = {
  createEventFunctions() {
    this.onMouseMove = (e) => {
      const offset = this.getMousePosition(e);
      const hitInfo = this.findHitItem(offset);
      const ctx = this.overlayCtx;
      const { indicator, tooltip } = this.options;

      this.overlayClear();

      if (indicator.use) {
        this.drawIndicator(offset, indicator.color);
      }

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
    };

    this.onMouseLeave = () => {
      if (this.options.tooltip.throttledMove) {
        this.onMouseMove.cancel();
      }
      this.overlayClear();
      this.tooltipClear();
      this.tooltipDOM.style.display = 'none';
    };

    this.onDblClick = (e) => {
      const fixedIndicator = this.options.fixedIndicator;
      const offset = this.getMousePosition(e);
      const hitInfo = this.findClickedData(offset, fixedIndicator.useApproximateValue);
      const args = {};
      if (hitInfo) {
        this.redraw(hitInfo);
      }

      ({ label: args.label, value: args.value, sId: args.seriesId } = hitInfo);
      if (typeof this.listeners.dblclick === 'function') {
        this.listeners.dblclick(args);
      }
    };

    this.onClick = (e) => {
      const offset = this.getMousePosition(e);
      const hitInfo = this.findClickedData(offset);

      const args = {};
      if (hitInfo) {
        this.redraw(hitInfo);
      }

      ({ label: args.label, value: args.value, sId: args.seriesId } = hitInfo);
      if (typeof this.listeners.click === 'function') {
        this.listeners.click(args);
      }
    };

    this.overlayCanvas.addEventListener('mousemove', this.onMouseMove);
    this.overlayCanvas.addEventListener('mouseleave', this.onMouseLeave);
    this.overlayCanvas.addEventListener('dblclick', this.onDblClick);
    this.overlayCanvas.addEventListener('click', this.onClick);
  },
  getMousePosition(evt) {
    const e = evt.originalEvent || evt;
    const rect = this.overlayCanvas.getBoundingClientRect();
    return [e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height];
  },
  findHitItem(offset) {
    const sIds = Object.keys(this.seriesList);
    const items = {};
    const isHorizontal = !!this.options.horizontal;

    let hitId = null;
    let maxs = '';
    let maxv = '';
    let maxg = null;
    let maxSID = null;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];

      if (series.findGraphData) {
        const item = series.findGraphData(offset, isHorizontal);

        if (item.data) {
          const gdata = isHorizontal ? (item.data.b || item.data.x) : (item.data.b || item.data.y);

          if (gdata !== null && gdata !== undefined) {
            const sName = `${series.name}`;

            item.name = sName;
            item.axis = { x: series.xAxisIndex, y: series.yAxisIndex };
            items[sId] = item;

            const g = item.data.b || item.data.y || 0;
            const cg = numberWithComma(g);

            if (maxs.length < sName.length) {
              maxs = sName;
            }

            if (maxv.length <= `${cg}`.length) {
              maxv = `${cg}`;
            }

            if (maxg === null || maxg <= g) {
              maxg = g;
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
  findClickedData(offset, useApproxiate) {
    const sIds = Object.keys(this.seriesList);
    const isHorizontal = !!this.options.horizontal;

    let maxl = null;
    let maxp = null;
    let maxg = null;
    let maxSID = '';
    let acc = 0;
    let useStack = false;

    for (let ix = 0; ix < sIds.length; ix++) {
      const sId = sIds[ix];
      const series = this.seriesList[sId];
      const findFn = useApproxiate ?
        series.findApproximateData : series.findGraphData;

      if (findFn) {
        const data = findFn.call(series, offset, isHorizontal).data;

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
            }
          }
        }
      }
    }

    return { label: maxl, pos: maxp, value: maxg, sId: maxSID, acc, useStack };
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
