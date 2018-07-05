import BaseChart from './chart.base';

export default class BarChart extends BaseChart {
  constructor(target, data, options) {
    // this.setConvertedData(data);
    super(target, data, options);
    this.seriesList = this.dataSet.getSeriesList();
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
  }

  drawSeries(seriesIndex) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesIndex];
    const category = this.data.category || [];
    const ctx = this.bufferCtx;
    // series에 특정한 color 값이 없다면, options의 colors 참조

    const color = series.color || this.options.colors[seriesIndex];
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
    if (series.stack) {
      barArea = (categoryArea - (categoryPadding * 2));
    } else {
      barArea = (categoryArea - (categoryPadding * 2)) / this.seriesList.length;
    }

    let barWidth = isHorizontal ? null : barArea * tickness;
    let barHeight = isHorizontal ? barArea * tickness : null;

    // barArea내에서 barWidth로 빠진 부분을 계산.
    const barPadding = isHorizontal ? (barArea - barHeight) / 2 : (barArea - barWidth) / 2;
    // series index에 따라 시작 X값 보정을 위한 변수.
    const barSeriesX = series.stack ? 1 : seriesIndex + 1;

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
    ctx.fillStyle = color || '#fff';

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];
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
          barY = categoryPoint - ((barArea * barSeriesX) - (barHeight + barPadding));
        } else {
          barX = categoryPoint + ((barArea * barSeriesX) - (barWidth + barPadding));
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
      }
    }
  }
}
