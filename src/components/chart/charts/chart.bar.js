import BaseChart from './chart.base';

export default class BarChart extends BaseChart {
  constructor(target, data, options) {
    // this.setConvertedData(data);
    super(target, data, options);
    this.seriesList = this.dataStore.getSeriesList();
  }

  drawChart() {
    this.setLabelOffset();
    this.createAxis();
    this.createBar();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createBar() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].show) {
        this.drawSeries(ix);
      }
    }

    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      if (this.seriesList[ix].highlight.show) {
        this.seriesHighlight(ix);
        break;
      }
    }
  }

  drawSeries(seriesIndex) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesIndex];
    const category = this.data.category || [];
    const ctx = this.bufferCtx;
    const isStack = this.options.stack;
    // series에 특정한 color 값이 없다면, options의 colors 참조

    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = series.drawInfo.xPoint;
    const yPoint = series.drawInfo.yPoint;
    const width = series.drawInfo.width;
    const height = series.drawInfo.height;

    const color = series.color;
    const tickness = this.options.tickness || 1;
    const isHorizontal = this.options.horizontal;

    // bar 차트는 category가 중심이 되며 축의 넓이를 category의 수로 나눠 각 cateogory의 넓이를 구함.
    const drawingArea = this.options.horizontal ? this.drawingYArea() : this.drawingXArea();
    const categoryArea = drawingArea / (category.length || 1);
    // category간 padding값 (left, right)
    const categoryPadding = 2;
    let barArea;

    // column chart일 때를 의미.
    // series가 많을수록 막대 하나의 넓이가 줄어든다.
    // stack의 경우 막대 넓이가 줄어들 필요가 없음.
    if (isStack) {
      barArea = (categoryArea - (categoryPadding * 2));
    } else {
      barArea = (categoryArea - (categoryPadding * 2)) / this.seriesList.length;
    }

    let barWidth = isHorizontal ? null : Math.round(barArea * tickness);
    let barHeight = isHorizontal ? Math.round(barArea * tickness) : null;

    // barArea내에서 barWidth로 빠진 부분을 계산.
    const barPadding = isHorizontal ? (barArea - barHeight) / 2 : (barArea - barWidth) / 2;
    // series index에 따라 시작 X값 보정을 위한 변수.
    const barSeriesX = isStack ? 1 : seriesIndex + 1;

    // axis start point
    let startX;
    let startY;
    if (isHorizontal) {
      startX = this.yAxes[series.axisIndex.y].axisPosInfo.x1;
      startY = this.yAxes[series.axisIndex.y].axisPosInfo.y2;
    } else {
      startX = this.xAxes[series.axisIndex.x].axisPosInfo.x1;
      startY = this.xAxes[series.axisIndex.x].axisPosInfo.y2;
    }

    let categoryPoint = null;
    let barX = null;
    let barY = null;
    let data;

    ctx.beginPath();
    ctx.fillStyle = color;

    for (let ix = 0, ixLen = series.cData.length; ix < ixLen; ix++) {
      data = series.cData[ix];
      if (category[ix]) {
        // category의 시작 위치
        if (isHorizontal) {
          categoryPoint = startY - (categoryArea * ix) - categoryPadding;
        } else {
          categoryPoint = startX + (categoryArea * ix) + categoryPadding;
        }

        // category의 시작 위치로부터 bar의 위치를 지정.
        if (isHorizontal) {
          barX = startX;
          barY = Math.round(categoryPoint - ((barArea * barSeriesX) - (barHeight + barPadding)));
        } else {
          barX = Math.round(categoryPoint + ((barArea * barSeriesX) - (barWidth + barPadding)));
          barY = startY;
        }
        // stack일 경우
        // data.y가 accumulate value이므로 data.b를 제한다.
        // dataStore단계에서는 line chart와 물려있어서 chart.bar에서 처리.
        if (isHorizontal) {
          if (data.b) {
            barWidth = this.calculateX(data.x - data.b, series.axisIndex.x) - startX;
            barX = this.calculateX(data.b, series.axisIndex.x);
          } else {
            barWidth = this.calculateX(data.x, series.axisIndex.x) - startX;
          }
        } else if (data.b) { // vertical stack bar chart
            barHeight = this.calculateY(data.y - data.b, series.axisIndex.y, true);
            barY = this.calculateY(data.b, series.axisIndex.y);
        } else { // vertical bar chart
          barHeight = this.calculateY(data.y, series.axisIndex.y, true);
        }

        ctx.fillRect(barX, barY, barWidth, isHorizontal ? -barHeight : barHeight);

        xPoint.push(barX);
        yPoint.push(barY);
        width.push(barWidth);
        height.push(isHorizontal ? -barHeight : barHeight);
      }
    }
  }

  seriesHighlight(seriesIndex) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesIndex];
    const color = series.color;

    const xPoint = series.drawInfo.xPoint;
    const yPoint = series.drawInfo.yPoint;
    const width = series.drawInfo.width;
    const height = series.drawInfo.height;

    let x = null;
    let y = null;
    let bw = null;
    let bh = null;

    ctx.beginPath();
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 4;
    ctx.shadowColor = color;
    ctx.fillStyle = color;

    for (let ix = 0, ixLen = xPoint.length; ix < ixLen; ix++) {
      x = xPoint[ix];
      y = yPoint[ix];
      bw = width[ix];
      bh = height[ix];

      ctx.fillRect(x, y, bw, bh);
    }
  }

  itemHighlight(item) {
    if (item.dataIndex === null || item.seriesIndex === null) {
      return;
    }
    const ctx = this.overlayCtx;
    const isStack = this.options.stack;

    let series;
    let color;
    let x;
    let y;
    let width;
    let height;

    if (!isStack) {
      series = this.seriesList[item.seriesIndex];
      color = series.color;

      x = series.drawInfo.xPoint[item.dataIndex];
      y = series.drawInfo.yPoint[item.dataIndex];
      width = series.drawInfo.width[item.dataIndex];
      height = series.drawInfo.height[item.dataIndex];

      ctx.fillStyle = color;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowBlur = 4;
      ctx.shadowColor = color;

      ctx.fillRect(x, y, width, height);
    } else {
      for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
        series = this.seriesList[ix];
        color = series.color;

        x = series.drawInfo.xPoint[item.dataIndex];
        y = series.drawInfo.yPoint[item.dataIndex];
        width = series.drawInfo.width[item.dataIndex];
        height = series.drawInfo.height[item.dataIndex];

        ctx.fillStyle = series.color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 4;
        ctx.shadowColor = color;

        ctx.fillRect(x, y, width, height);
      }
    }
  }

  findHitItem(offset) {
    const mouse = !this.options.horizontal ? offset[0] : offset[1];

    let dataIndex;
    let seriesIndex = null;

    if (!this.options.horizontal) {
      dataIndex = this.findHitAxisX(mouse);
    } else {
      dataIndex = this.findHitAxisY(mouse);
    }

    if (dataIndex !== null && dataIndex > -1) {
      for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
        const series = this.seriesList[ix];
        let point;
        let size;
        let min;
        let max;

        if (!this.options.horizontal) {
          point = series.drawInfo.xPoint[dataIndex];
          size = series.drawInfo.width[dataIndex];
          min = point;
          max = point + size;
        } else {
          point = series.drawInfo.yPoint[dataIndex];
          size = series.drawInfo.height[dataIndex];
          min = point + size;
          max = point;
        }

        if ((mouse >= min) && (mouse <= max)) {
          seriesIndex = ix;
          break;
        }
      }
    }

    return {
      dataIndex,
      seriesIndex,
    };
  }

  findHitAxisX(mouseX) {
    const x1 = this.chartRect.x1 + this.labelOffset.left;
    const x2 = this.chartRect.x2 - this.labelOffset.right;

    const width = x2 - x1;
    const category = this.data.category || [];

    let dataIndex = null;

    if (mouseX >= (x1 - 10) && mouseX <= (x2 + 10)) {
      dataIndex = Math.floor((category.length / width) * (mouseX - x1));

      if (dataIndex >= category.length) {
        dataIndex = null;
      }
    }

    return dataIndex;
  }

  findHitAxisY(mouseY) {
    const y1 = this.chartRect.y1 + this.labelOffset.top;
    const y2 = this.chartRect.y2 - this.labelOffset.bottom;

    const height = y2 - y1;
    const category = this.data.category || [];

    let dataIndex = null;

    if (mouseY >= (y1 - 10) && mouseY <= (y2 + 10)) {
      dataIndex = Math.floor((category.length / height) * (y2 - mouseY));

      if (dataIndex >= category.length) {
        dataIndex = null;
      }
    }

    return dataIndex;
  }
}
