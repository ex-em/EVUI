import { numberWithComma } from '@/common/utils';

const modules = {
  onMouseMoveEvent(e) {
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
  },
  onMouseLeaveEvent() {
    if (this.options.tooltip.throttledMove) {
      this.onMouseMoveEvent.cancel();
    }
    this.overlayClear();
    this.tooltipClear();
    this.tooltipDOM.style.display = 'none';
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
