import _ from 'lodash';
import BaseChart from './chart.base';

export default class SunburstChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);
    this.seriesList = this.dataSet.getSeriesList();
    this.seriesGroupList = this.dataSet.getSeriesGroupList();
  }

  createChart() {
    if (this.options.title.show) {
      this.createTitle();
    }
    this.createPie();

    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createPie() {
    this.calculateSunburstAngle();

    if (!this.options.reverse) {
      this.seriesGroupList = _.reverse(this.seriesGroupList);
    }

    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) {
      this.drawPieGroup(ix);
    }

    if (this.options.doughnutHoleSize > 0) {
      this.drawDoughnutHole();
    }
  }

  drawPieGroup(groupIndex) {
    const groupLength = this.seriesGroupList.length;
    const width = this.chartRect.chartWidth;
    const height = this.chartRect.chartHeight;

    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const innerRadius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(width / 2, height / 2);
    const radius = outerRadius - (((outerRadius - innerRadius) / groupLength) * groupIndex);

    const keys = Object.keys(this.seriesGroupList[groupIndex]);

    let node;
    let color;

    for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
      node = this.seriesGroupList[groupIndex][keys[ix]].node;

      for (let jx = 0, jxLen = node.length; jx < jxLen; jx++) {
        if (node[jx].isDummy) {
          color = '#FFF';
          this.bufferCtx.save();
          this.bufferCtx.globalCompositeOperation = 'destination-out';
        } else {
          color = this.seriesList[node[jx].seriesIndex].color ||
            this.options.colors[node[jx].seriesIndex];
        }

        this.drawPieSlice(centerX, centerY, radius, node[jx].startAngle,
          node[jx].startAngle + node[jx].sliceAngle, color, jxLen === 1);

        if (node[jx].isDummy) {
          this.bufferCtx.restore();
        }
      }
    }
  }

  drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color, isSingle) {
    const ctx = this.bufferCtx;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.lineWidth = this.options.border;
    ctx.strokeStyle = '#FFF';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
    if (!isSingle) {
      ctx.stroke();
    }
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
    ctx.closePath();
    ctx.stroke();
  }

  calculateSunburstAngle() {
    let nodeKeys;
    let startAngle;
    let totalAngle;
    let totalValue;
    let node;
    let key;
    let parent;

    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) { // lvl
      nodeKeys = Object.keys(this.seriesGroupList[ix]);

      for (let jx = 0, jxLen = nodeKeys.length; jx < jxLen; jx++) { // parentIndex
        key = +nodeKeys[jx];
        node = this.seriesGroupList[ix][key].node;
        node = _.orderBy(node, 'data', 'desc');

        if (key === -1) {
          startAngle = 1.5 * Math.PI;
          totalAngle = 2 * Math.PI;
          totalValue = this.seriesGroupList[ix][key].totalValue;
        } else {
          parent = this.getParentObject(ix - 1, key);
          startAngle = parent.startAngle;
          totalAngle = parent.sliceAngle;
          totalValue = this.seriesGroupList[ix][key].totalValue;
        }

        for (let kx = 0, kxLen = node.length; kx < kxLen; kx++) {
          node[kx].sliceAngle = totalAngle * (node[kx].data / totalValue);
          node[kx].startAngle = startAngle;

          startAngle += node[kx].sliceAngle;
        }
      }
    }
  }

  getParentObject(pGroupIndex, pSeriesIndex) {
    const nodeKeys = Object.keys(this.seriesGroupList[pGroupIndex]);

    let node;
    let key;
    let retObject = null;

    for (let ix = 0, ixLen = nodeKeys.length; ix < ixLen; ix++) {
      key = +nodeKeys[ix];
      node = this.seriesGroupList[pGroupIndex][key].node;
      for (let jx = 0, jxLen = node.length; jx < jxLen; jx++) {
        if (node[jx].seriesIndex === pSeriesIndex) {
          retObject = node[jx];
          break;
        }
      }
    }

    return retObject;
  }
}
