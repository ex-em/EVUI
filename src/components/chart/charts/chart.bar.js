import BaseChart from './chart.base';

export default class BarChart extends BaseChart {
  drawChart() {
    if (!this.chartRect.width || !this.chartRect.height ||
      this.chartRect.width < 1 || this.chartRect.height < 1) {
      return;
    }

    this.setLabelOffset();
    this.createAxis();
    this.createBar();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createBar() {
    const groups = this.data.groups;
    const graphData = this.graphData;
    const skey = Object.keys(graphData);

    this.seriesCount = this.getShowSeriesCount();

    let series;
    if (groups.length) {
      for (let ix = 0, ixLen = groups.length; ix < ixLen; ix++) {
        const group = groups[ix];
        for (let jx = 0, jxLen = group.length; jx < jxLen; jx++) {
          series = this.seriesList[group[jx]];

          if (series.show) {
            this.drawSeries(group[jx], graphData[group[jx]]);
          }
        }
      }
    } else {
      for (let ix = 0, showIdx = 0, ixLen = skey.length; ix < ixLen; ix++) {
        series = this.seriesList[skey[ix]];

        if (!series.isExistGrp && series.show) {
          this.drawSeries(skey[ix], graphData[skey[ix]], showIdx);
          showIdx++;
        }
      }
    }
  }

  drawSeries(seriesId, data, sIndex) {
    const series = this.seriesList[seriesId];
    const axisType = series.axisType;
    const aIndex = axisType === 'x' ? series.xAxisIndex : series.yAxisIndex;

    const axisList = this.axisList;
    const category = axisList[axisType][aIndex];

    const thickness = this.options.thickness || 1;

    const ctx = this.bufferCtx;
    const color = series.color;

    const isHorizontal = !!(this.options.horizontal);

    const isStack = !!(series.groupIndex !== null);
    const dArea = isHorizontal ? this.drawingYArea() : this.drawingXArea();
    const cArea = dArea / (category.length || 1);
    const cPad = 2;

    let bArea;
    if (isStack) {
      bArea = (cArea - (cPad * 2));
    } else {
      bArea = (cArea - (cPad * 2)) / this.seriesCount;
    }
    let w = isHorizontal ? null : Math.round(bArea * thickness);
    let h = isHorizontal ? Math.round(bArea * thickness) : null;

    // barArea내에서 barWidth로 빠진 부분을 계산.
    const bPad = isHorizontal ? (bArea - h) / 2 : (bArea - w) / 2;
    // series index에 따라 시작 X값 보정을 위한 변수.
    const barSeriesX = isStack ? 1 : sIndex + 1;


    // axis start point
    let sx;
    let sy;
    if (isHorizontal) {
      sx = this.yAxes[series.yAxisIndex].axisPosInfo.x1;
      sy = this.yAxes[series.yAxisIndex].axisPosInfo.y2;
    } else {
      sx = this.xAxes[series.xAxisIndex].axisPosInfo.x1;
      sy = this.xAxes[series.xAxisIndex].axisPosInfo.y2;
    }

    let categoryPoint = null;
    let x = null;
    let y = null;
    let gdata;

    ctx.beginPath();
    ctx.fillStyle = color;

    for (let ix = 0, ixLen = data.length; ix < ixLen; ix++) {
      gdata = data[ix];
      if (category[ix]) {
        // category의 시작 위치
        if (isHorizontal) {
          categoryPoint = sy - (cArea * ix) - cPad;
        } else {
          categoryPoint = sx + (cArea * ix) + cPad;
        }

        // category의 시작 위치로부터 bar의 위치를 지정.
        if (isHorizontal) {
          x = sx;
          y = Math.round(categoryPoint - ((bArea * barSeriesX) - (h + bPad)));
        } else {
          x = Math.round(categoryPoint + ((bArea * barSeriesX) - (w + bPad)));
          y = sy;
        }
        // stack일 경우
        // data.y가 accumulate value이므로 data.b를 제한다.
        // dataStore단계에서는 line chart와 물려있어서 chart.bar에서 처리.
        if (isHorizontal) {
          if (gdata.b) {
            w = this.calculateX(gdata.x - gdata.b, series.xAxisIndex, false);
            x = this.calculateX(gdata.b, series.xAxisIndex, false) + sx;
          } else {
            w = this.calculateX(gdata.x, series.xAxisIndex, false);
          }
        } else if (gdata.b) { // vertical stack bar chart
            h = this.calculateY(gdata.y - gdata.b, series.yAxisIndex, true);
            y = this.calculateY(gdata.b, series.yAxisIndex);
        } else { // vertical bar chart
          h = this.calculateY(gdata.y, series.yAxisIndex, true);
        }

        ctx.fillRect(x, y, w, isHorizontal ? -h : h);

        gdata.xp = x;
        gdata.yp = y;
        gdata.w = w;
        gdata.h = isHorizontal ? -h : h;
      }
    }
  }

  seriesHighlight(seriesId) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesId];
    const graphData = this.store.getGraphData();
    const gdata = graphData[seriesId];

    const color = series.color;

    let x = null;
    let y = null;
    let bw = null;
    let bh = null;

    ctx.beginPath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.fillStyle = color;

    for (let ix = 0, ixLen = gdata.length; ix < ixLen; ix++) {
      x = gdata[ix].xp;
      y = gdata[ix].yp;
      bw = gdata[ix].w;
      bh = gdata[ix].h;

      ctx.fillRect(x, y, bw, bh);
    }
  }

  itemHighlight(item) {
    if (item.index === null || item.sId === null) {
      return;
    }

    const graphData = this.graphData;
    const skey = Object.keys(graphData);
    const ctx = this.overlayCtx;
    const series = this.seriesList[item.sId];

    let gdata;
    let color;
    let x;
    let y;
    let w;
    let h;

    if (series.groupIndex === null) {
      color = series.color;
      gdata = graphData[item.sId];

      x = gdata[item.index].xp;
      y = gdata[item.index].yp;
      w = gdata[item.index].w;
      h = gdata[item.index].h;

      ctx.fillStyle = color;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 8;
      ctx.shadowColor = color;

      ctx.fillRect(x, y, w, h);
    } else {
      for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
        color = this.seriesList[skey[ix]].color;
        gdata = graphData[skey[ix]];


        x = gdata[item.index].xp;
        y = gdata[item.index].yp;
        w = gdata[item.index].w;
        h = gdata[item.index].h;

        ctx.fillStyle = color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;

        ctx.fillRect(x, y, w, h);
      }
    }
  }

  findHitItem(offset, graphData) {
    const skey = Object.keys(graphData);
    const isHorizontal = !!this.options.horizontal;

    const mouse = isHorizontal ? offset[1] : offset[0];
    // const mouseInv = isHorizontal ? offset[0] : offset[1];

    let index;
    let sId = null;
    let gdata;

    if (!isHorizontal) {
      index = this.findHitAxisX(mouse, graphData);
    } else {
      index = this.findHitAxisY(mouse, graphData);
    }

    if (index !== null && index > -1) {
      let xp;
      let yp;
      let w;
      let h;
      let xMax;
      let yMax;

      for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
        gdata = graphData[skey[ix]];

        xp = gdata[index].xp;
        yp = gdata[index].yp;
        w = gdata[index].w;
        h = gdata[index].h;

        xMax = xp + w;
        yMax = yp + h;

        if ((offset[0] >= xp) && (offset[0] <= xMax) &&
          (offset[1] <= yp) && (offset[1] >= yMax)) {
          sId = skey[ix];
          break;
        }
      }
    }

    return { index, sId };
  }

  findHitAxisX(mouseX) {
    const x1 = this.chartRect.x1 + this.labelOffset.left;
    const x2 = this.chartRect.x2 - this.labelOffset.right;

    const width = x2 - x1;
    const category = this.axisList.x[0] || [];

    let index = null;

    if (mouseX >= (x1 - 10) && mouseX <= (x2 + 10)) {
      index = Math.floor((category.length / width) * (mouseX - x1));

      if (index >= category.length) {
        index = null;
      }
    }

    return index;
  }

  findHitAxisY(mouseY) {
    const y1 = this.chartRect.y1 + this.labelOffset.top;
    const y2 = this.chartRect.y2 - this.labelOffset.bottom;

    const height = y2 - y1;
    const category = this.axisList.y[0] || [];

    let index = null;

    if (mouseY >= (y1 - 10) && mouseY <= (y2 + 10)) {
      index = Math.floor((category.length / height) * (y2 - mouseY));

      if (index >= category.length) {
        index = null;
      }
    }

    return index;
  }

  getShowSeriesCount() {
    const skey = Object.keys(this.seriesList);

    let count = 0;
    let series;
    for (let ix = 0, ixLen = skey.length; ix < ixLen; ix++) {
      series = this.seriesList[skey[ix]];

      if (series.show) {
        count += 1;
      }
    }

    return count;
  }
}
