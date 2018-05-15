import BaseChart from './chart.base';
// import Util from '../core/core.util';

export default class BarChart extends BaseChart {
  constructor(target, data, options) {
    // this.setConvertedData(data);
    super(target, data, options);
    this.seriesList = this.dataSet.getSeriesList();
  }

  createChart() {
    if (this.options.title.show) {
      this.createTitle();
    }
    this.setLabelOffset();
    this.createAxis();
    this.createBar();
  }

  createBar() {
    for (let ix = 0, ixLen = this.seriesList.length; ix < ixLen; ix++) {
      this.drawSeries(ix);
    }
  }

  drawSeries(seriesIndex) {
    // 해당 series 정보 및 ctx 등 확인
    const series = this.seriesList[seriesIndex];
    const category = this.data.category;
    const ctx = this.bufferCtx;
    // series에 특정한 color 값이 없다면, options의 colors 참조
    const color = series.color || this.options.colors[seriesIndex];
    // series의 data를 순회하며 계산된 X,Y좌표를 담는 배열
    const xPoint = [];
    const yPoint = [];

    const tickness = this.options.tickness || 1;
    // bar 차트는 category가 중심이 되며 X축의 넓이를 category의 수로 나눠 각 cateogory의 넓이를 구함.
    const categoryWidth = this.drawingXArea() / category.length;
    // category간 padding값 (left, right)
    const categoryPadding = 2;
    let barArea;

    if (series.stack) {
      barArea = (categoryWidth - (categoryPadding * 2));
    } else {
      // column chart일 때를 의미.
      // series가 많을수록 막대 하나의 넓이가 줄어든다.
      barArea = (categoryWidth - (categoryPadding * 2)) / this.seriesList.length;
    }

    // barArea내에서 Bar의 두께를 지정. 0~1.0
    const barWidth = barArea * tickness;
    // barArea내에서 barWidth로 빠진 부분을 계산.
    const barPadding = (barArea - barWidth) / 2;

    const barSeriesX = series.stack ? 1 : seriesIndex + 1;
    const x1 = this.xAxes[series.axisIndex.x].axisPosInfo.x1;
    let y2 = this.xAxes[series.axisIndex.x].axisPosInfo.y2;

    let y = null;
    let categoryX = null;
    let barX = null;
    let data;

    ctx.beginPath();
    ctx.fillStyle = color || '#fff';

    for (let ix = 0, ixLen = series.data.length; ix < ixLen; ix++) {
      data = series.data[ix];
      if (category[ix]) {
        // category의 시작 위치
        categoryX = x1 + (categoryWidth * ix) + categoryPadding;
        // category의 시작 위치로부터 bar의 위치를 지정.
        barX = categoryX + ((barArea * barSeriesX) - (barWidth + barPadding));
        // stack일 경우
        // data.y가 accumulate value이므로 data.b를 제한다.
        // dataStore단계에서는 line chart와 물려있어서 chart.bar에서 처리.
        if (data.b) {
          y = this.calculateY(data.y - data.b, series.axisIndex.y, true);
          y2 = this.calculateY(data.b, series.axisIndex.y);
        } else {
          y = this.calculateY(data.y, series.axisIndex.y, true);
        }

        xPoint.push(barX);
        yPoint.push(y);

        ctx.fillRect(barX, y2, barWidth, y);
      }
    }
  }
}
