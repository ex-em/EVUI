import BaseChart from './chart.base';
import PieDataStore from '../core/data/data.pie';

export default class PieChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);
    this.seriesList = this.dataStore.getSeriesList();
    this.seriesGroupList = this.dataStore.getSeriesGroupList();
  }

  createDataStore() {
    this.dataStore = new PieDataStore({
      chartData: this.data,
      chartOptions: this.options,
      horizontal: this.options.horizontal,
      seriesList: this.seriesList,
      seriesGroupList: this.seriesGroupList,
      structType: 'array',
      axisType: 'axisless',
      bufferSize: this.options.bufferSize,
    });
  }

  drawChart() {
    this.createPie();
    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createPie() {
    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) {
      this.dataStore.sortingDescGroupData(ix);
      this.drawPieGroup(ix);
    }

    if (this.options.doughnutHoleSize > 0) {
      this.drawDoughnutHole();
    }
  }

  drawPieGroup(groupIndex) {
    let group;
    let val;
    let sliceAngle;
    let color;
    let startAngle = 1.5 * Math.PI;

    const groupLength = this.seriesGroupList.length;
    const width = this.chartRect.chartWidth;
    const height = this.chartRect.chartHeight;

    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const innerRadius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(width / 2, height / 2);
    const radius = outerRadius - (((outerRadius - innerRadius) / groupLength) * groupIndex);

    const totalValue = this.dataStore.getGroupTotalValue(groupIndex);
    for (let ix = 0, ixLen = this.seriesGroupList[groupIndex].length; ix < ixLen; ix++) {
      group = this.seriesGroupList[groupIndex][ix];
      if (group.show) {
        val = group.data;
        sliceAngle = 2 * Math.PI * (val / totalValue);

        color = this.seriesList[group.seriesIndex].color || this.options.colors[group.seriesIndex];
        if (val) {
          this.drawPieSlice(centerX, centerY, radius, startAngle,
            startAngle + sliceAngle, color, ixLen === 1);
          startAngle += sliceAngle;
        }
      }
    }
    // 시작지점 stroke 추가.
    this.bufferCtx.stroke();
  }

  drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color, isSingle) {
    const ctx = this.bufferCtx;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.lineWidth = this.options.border;
    ctx.strokeStyle = '#FFF';
    if (!isSingle) {
      ctx.moveTo(centerX, centerY);
    }
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  drawDoughnutHole() {
    const ctx = this.bufferCtx;

    const width = this.chartRect.chartWidth;
    const height = this.chartRect.chartHeight;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const radius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // inner stroke
    ctx.beginPath();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = this.options.border;
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }
}
