import BaseChart from './chart.base';
import PieDataStore from '../core/data/data.pie';

export default class PieChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);
    this.seriesList = this.dataStore.getSeriesList();
    this.seriesGroupList = this.dataStore.getSeriesGroupList();

    this.radiusArr = [];
  }

  createDataStore() {
    this.dataStore = new PieDataStore({
      chartData: this.data,
      chartOptions: this.options,
      seriesList: this.seriesList,
      seriesGroupList: this.seriesGroupList,
    });
  }

  drawChart() {
    this.createPie();
    // this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createPie() {
    let showIndex = 0;
    let lastGrpIndex = 0;
    this.groupLength = 0;
    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) {
      if (this.seriesGroupList[ix].show) {
        this.groupLength++;
      }
    }

    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) {
      if (this.seriesGroupList[ix].show) {
        this.dataStore.sortingDescGroupData(ix);
        this.drawPieGroup(ix, showIndex);
        showIndex++;
        lastGrpIndex = ix;
      }
    }

    if (this.options.doughnutHoleSize > 0) {
      this.drawDoughnutHole(lastGrpIndex);
    }
  }

  drawPieGroup(groupIndex, showIndex) {
    let item;
    let val;
    let sliceAngle;
    let color;
    let startAngle = 1.5 * Math.PI;
    let endAngle;

    const groupLength = this.groupLength;
    const groupInfo = this.seriesGroupList[groupIndex];
    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;

    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const innerRadius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(width / 2, height / 2);

    const radius = outerRadius - (((outerRadius - innerRadius) / groupLength) * showIndex);

    groupInfo.r2 = radius;
    if (groupIndex < groupLength - 1) {
      groupInfo.r1 = outerRadius - (((outerRadius - innerRadius) / groupLength) * (showIndex + 1));
    } else {
      groupInfo.r1 = 1;
    }

    const totalValue = this.dataStore.getGroupTotalValue(groupIndex);
    for (let ix = 0, ixLen = groupInfo.data.length; ix < ixLen; ix++) {
      item = groupInfo.data[ix];
      if (item.show) {
        val = item.data;
        sliceAngle = 2 * Math.PI * (val / totalValue);
        endAngle = startAngle + sliceAngle;
        color = this.seriesList[item.seriesIndex].color || this.options.colors[item.seriesIndex];
        groupInfo.drawInfo.push({
          sa: startAngle,
          ea: endAngle,
        });
        if (val) {
          this.drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color, ixLen === 1);
          startAngle += sliceAngle;
        }
      } else {
        groupInfo.drawInfo.push({
          sa: 0,
          ea: 0,
        });
      }
    }

    this.bufferCtx.beginPath();
    this.bufferCtx.lineWidth = this.options.border;
    this.bufferCtx.strokeStyle = '#fff';
    this.bufferCtx.strokeOpacity = 0;
    this.bufferCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.bufferCtx.stroke();
    this.bufferCtx.closePath();
  }

  drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color, isSingle) {
    const ctx = this.bufferCtx;
    ctx.beginPath();
    ctx.fillStyle = color;
    if (!isSingle) {
      ctx.moveTo(centerX, centerY);
    }
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.fill();
    ctx.closePath();
  }

  drawDoughnutHole(lastGrpIndex) {
    const ctx = this.bufferCtx;

    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const radius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.fillOpacity = 0;
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

    if (this.seriesGroupList[lastGrpIndex]) {
      this.seriesGroupList[lastGrpIndex].r1 = radius;
    }
  }

  seriesHighlight(seriesIndex) {
    const ctx = this.overlayCtx;

    const series = this.seriesList[seriesIndex];
    const color = series.color;

    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;


    let findIndex;
    let group;

    for (let ix = 0, ixLen = this.seriesGroupList.length; ix < ixLen; ix++) {
      group = this.seriesGroupList[ix];

      if (group.show) {
        for (let jx = 0, jxLen = group.data.length; jx < jxLen; jx++) {
          if (group.data[jx].seriesIndex === seriesIndex) {
            findIndex = jx;
            break;
          }
        }

        const info = group.drawInfo[findIndex];

        const r2 = group.r2;
        const r1 = group.r1;

        const sa = info.sa;
        const ea = info.ea;

        ctx.fillStyle = color;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.lineWidth = this.options.border;
        ctx.strokeStyle = '#fff';

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, r2, sa, ea);
        ctx.fill();
        ctx.closePath();

        ctx.save();
        ctx.beginPath();

        ctx.moveTo(centerX, centerY);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillOpacity = 1;
        ctx.arc(centerX, centerY, r1, sa - 1, ea + 1);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
      }
    }

    const hole = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.fillOpacity = 0;
    ctx.arc(centerX, centerY, hole, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  itemHighlight(item) {
    if (item.groupIndex === null || item.itemIndex === null) {
      return;
    }
    const ctx = this.overlayCtx;

    const group = this.seriesGroupList[item.groupIndex];
    const info = group.drawInfo[item.itemIndex];
    const data = group.data[item.itemIndex];
    const series = this.seriesList[data.seriesIndex];

    const color = series.color;

    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const r2 = group.r2;
    const r1 = group.r1;

    const sa = info.sa;
    const ea = info.ea;

    ctx.fillStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.lineWidth = this.options.border;
    ctx.strokeStyle = '#fff';

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, r2, sa, ea);
    ctx.fill();
    ctx.closePath();

    ctx.save();
    ctx.beginPath();

    ctx.moveTo(centerX, centerY);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillOpacity = 1;
    ctx.arc(centerX, centerY, r1, sa - 1, ea + 1);
    ctx.fill();
    ctx.closePath();
    ctx.restore();

    const hole = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.fillOpacity = 0;
    ctx.arc(centerX, centerY, hole, 0, 2 * Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }

  findHitItem(offset) {
    const mouseX = offset[0];
    const mouseY = offset[1];

    const width = this.chartRect.chartWidth;
    const height = this.chartRect.chartHeight;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const dx = mouseX - centerX;
    const dy = mouseY - centerY;

    let angle;
    let grpIdx = null;
    let itemIdx = null;

    angle = ((Math.atan2(-dy, -dx) * 180) / Math.PI) - 90;
    angle = angle < 0 ? 360 + angle : angle;

    const rad = ((angle * Math.PI) / 180) + (1.5 * Math.PI);
    const distance = Math.round(Math.sqrt((dx ** 2) + (dy ** 2)));

    for (let ix = this.seriesGroupList.length - 1; ix >= 0; ix--) {
      const r2 = this.seriesGroupList[ix].r2;
      const r1 = this.seriesGroupList[ix].r1;
      if (distance > r1 && distance < r2) {
        grpIdx = ix;
        break;
      }
    }

    if (this.seriesGroupList[grpIdx] && this.seriesGroupList[grpIdx].drawInfo) {
      for (let ix = 0, ixLen = this.seriesGroupList[grpIdx].drawInfo.length; ix < ixLen; ix++) {
        const info = this.seriesGroupList[grpIdx].drawInfo[ix];

        if (rad > info.sa && rad < info.ea) {
          itemIdx = ix;
          break;
        }
      }
    }

    return {
      groupIndex: grpIdx,
      itemIndex: itemIdx,
    };
  }
}
