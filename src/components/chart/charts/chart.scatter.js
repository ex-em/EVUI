import BaseChart from './chart.base';

export default class ScatterChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);

    this.selectBox = {
      start: { x: -1, y: -1 },
      end: { x: -1, y: -1 },
      show: false,
      active: false,
      isDrawing: false,
    };

    this.selectPos = {
      start: { x: -1, y: -1 },
      end: { x: -1, y: -1 },
    };

    if (this.options.useSelectionData) {
      this.selectionData = null;
    }

    this.options.useSelect = true;
    this.overlayCanvas.onmousedown = this.mouseDownEvent.bind(this);
  }
  drawChart() {
    this.setLabelOffset();
    this.createAxis();
    this.createScatter();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createScatter() {
    const graphData = this.graphData;
    const skey = Object.keys(graphData);
    let series;

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = this.seriesList[skey[ix]];

      if (series.show) {
        this.drawSeries(skey[ix], graphData[skey[ix]]);
      }
    }
  }

  drawSeries(seriesId, data) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesId];
    const ctx = this.bufferCtx;
    const color = series.color;

    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = series.lineWidth;

    ctx.strokeStyle = color;

    let x = null;
    let y = null;
    let gdata;

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      gdata = data[ix];

      x = this.calculateX(gdata.x, series.xAxisIndex, true);
      y = this.calculateY(gdata.y, series.yAxisIndex, false);

      gdata.xp = x;
      gdata.yp = y;
    }

    if (series.point) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.fillStyle = series.pointFill;
      ctx.lineWidth = series.lineWidth;
      for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
        gdata = data[ix];

        if (gdata.xp !== null && gdata.yp !== null) {
          this.drawPoint(ctx, series.pointStyle, series.pointSize, gdata.xp, gdata.yp);
        }
      }
    }
  }


  seriesHighlight(seriesId) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesId];
    const graphData = this.graphData;
    const data = graphData[seriesId];
    const color = series.color;

    if (this.selectBox && this.selectBox.active) {
      return;
    }
    ctx.save();
    ctx.beginPath();
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;

    if (series.point) {
      const pSize = series.highlight.pointSize;
      let gdata;

      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.fillStyle = color;

      for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
        gdata = data[ix];

        if (gdata.xp !== null && gdata.yp !== null) {
          this.drawPoint(ctx, series.pointStyle, pSize, gdata.xp, gdata.yp);
        }
      }
    }

    ctx.restore();
  }

  itemHighlight(item) {
    if (item.index === null || item.sId === null) {
      return;
    }

    if (this.selectBox && this.selectBox.active) {
      return;
    }

    const graphData = this.graphData;
    const gdata = graphData[item.sId];
    const ctx = this.overlayCtx;
    const series = this.seriesList[item.sId];

    if (!series.point) {
      return;
    }

    const color = series.color;
    const x = gdata[item.index].xp;
    const y = gdata[item.index].yp;
    const pSize = series.highlight.pointSize;

    ctx.save();

    ctx.strokeStyle = color;
    ctx.lineWidth = series.lineWidth;
    ctx.fillStyle = series.pointFill;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;

    if (x !== null && y !== null) {
      this.drawPoint(ctx, series.pointStyle, pSize, x, y);
    }
    ctx.restore();
  }


  showCrosshair(offset) {
    const ctx = this.overlayCtx;
    const x = offset[0];
    const y = offset[1];
    const graphPos = this.getChartGraphPos();

    if ((x >= (graphPos.x1 - 1) && x <= (graphPos.x2 + 1))
      && (y >= (graphPos.y1 - 1) && y <= (graphPos.y2 + 1))) {
      ctx.strokeStyle = '#ff5500';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.save();
      ctx.shadowBlur = 0;
      ctx.moveTo(x, graphPos.y1);
      ctx.lineTo(x, graphPos.y2);

      ctx.stroke();
      ctx.restore();
    }
  }

  mouseDownEvent(e) {
    e.preventDefault();

    if (e.which !== 1) {
      return;
    }

    if (!this.selectBox) {
      return;
    }

    this.overlayClear();
    this.setSelectionPos(this.selectBox.start, e);
    this.selectBox.active = true;

    this.mouseUp = this.mouseUpEvent.bind(this);
    this.mouseMoveSelect = this.mouseMoveSelectEvent.bind(this);

    window.addEventListener('mouseup', this.mouseUp, false);
    window.addEventListener('mousemove', this.mouseMoveSelect, false);
  }

  mouseMoveSelectEvent(e) {
    if (this.selectBox && this.selectBox.active) {
      this.overlayCanvas.style.cursor = 'crosshair';
      this.overlayClear();
      this.setSelectionPos(this.selectBox.end, e);

      if (this.drawSelection) {
        this.drawSelection();
      }
    }
  }

  mouseUpEvent(e) {
    e.stopPropagation();
    e.preventDefault();

    window.removeEventListener('mouseup', this.mouseUp, false);
    window.removeEventListener('mousemove', this.mouseMoveSelect, false);

    if (!this.selectBox) {
      return;
    }

    this.setSelectionPos(this.selectBox.end, e);
    this.selectBox.active = false;

    this.overlayCanvas.style.cursor = 'default';
    if (this.selectBox.start.x === this.selectBox.end.x &&
      this.selectBox.start.y === this.selectBox.end.y) {
      this.clearSelection();
    } else {
      this.selectPos.start.x = this.calculateXP(this.selectBox.start.x, 0, true);
      this.selectPos.start.y = this.calculateYP(this.selectBox.start.y, 0, false);
      this.selectPos.end.x = this.calculateXP(this.selectBox.end.x, 0, true);
      this.selectPos.end.y = this.calculateYP(this.selectBox.end.y, 0, false);

      if (this.options.useSelectionData) {
        this.getSelectPosData();
      }
    }
  }

  setSelectionPos(pos, e) {
    const mousePos = pos;
    const chartRect = this.chartRect;
    const x1 = chartRect.x1;
    const x2 = chartRect.x2;
    const y1 = chartRect.y1;
    const y2 = chartRect.y2;

    const mouse = this.getMousePosition(e);
    const mouseX = mouse[0];
    const mouseY = mouse[1];

    if (mouseX < x1) {
      mousePos.x = x1;
    } else if (mouseX > x2) {
      mousePos.x = x2;
    } else {
      mousePos.x = mouseX;
    }

    if (mouseY < y1) {
      mousePos.y = y1;
    } else if (mouseY > y2) {
      mousePos.y = y2;
    } else {
      mousePos.y = mouseY;
    }
  }

  drawSelection() {
    if (this.selectBox.active) {
      const ctx = this.overlayCtx;
      const strokeColor = 'rgba(52,155,231, 0.8)';
      const fillColor = 'rgba(52,155,231, 0.4)';

      ctx.save();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.fillStyle = fillColor;

      const x = Math.min(this.selectBox.start.x, this.selectBox.end.x) + 0.5;
      const y = Math.min(this.selectBox.start.y, this.selectBox.end.y) + 0.5;
      const w = Math.abs(this.selectBox.end.x - this.selectBox.start.x) - 1;
      const h = Math.abs(this.selectBox.end.y - this.selectBox.start.y) - 1;

      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }
  }

  clearSelection() {
    this.overlayClear();
    this.selectBox.active = false;
    this.selectBox.start.x = -1;
    this.selectBox.start.y = -1;
    this.selectBox.end.x = -1;
    this.selectBox.end.y = -1;
  }

  getSelectPosData() {
    const x1 = this.selectBox.start.x;
    const y1 = this.selectBox.start.y;
    const x2 = this.selectBox.end.x;
    const y2 = this.selectBox.end.y;

    const graphData = this.store.getGraphData();
    const skey = Object.keys(graphData);

    let sdata;
    let gdata;
    const selectData = {};

    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      sdata = graphData[skey[ix]];

      for (let jx = 0, jxLen = sdata.length; jx < jxLen; jx++) {
        gdata = sdata[jx];
        if (gdata.xp > x1 && gdata.xp < x2 && gdata.yp > y1 && gdata.yp < y2) {
          if (!selectData[skey[ix]]) {
            selectData[skey[ix]] = [];
          }

          selectData[skey[ix]].push({ x: gdata.x, y: gdata.y });
        }
      }
    }

    return selectData;
  }
}
