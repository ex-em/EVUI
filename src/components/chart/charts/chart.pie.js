import _ from 'lodash-es';
import BaseChart from './chart.base';
import PieDataStore from '../core/data/data.pie';

export default class PieChart extends BaseChart {
  constructor(target, data, options) {
    super(target, data, options);

    this.radiusArr = [];
  }

  createDataStore() {
    this.store = new PieDataStore({
      chartData: this.data,
      chartOptions: this.options,
    });
  }

  drawChart() {
    this.createPie();
    this.displayCtx.drawImage(this.bufferCanvas, 0, 0);
  }

  createPie() {
    const graphData = this.graphData;
    let dsLength = 0;
    let showIndex = 0;

    for (let ix = 0, ixLen = graphData.length; ix < ixLen; ix++) {
      if (graphData[ix].total) {
        dsLength += 1;
      }
    }

    for (let ix = 0, ixLen = graphData.length; ix < ixLen; ix++) {
      this.store.sortingDescDataSet(ix);
      if (graphData[ix].total) {
        this.drawPieDataSet(graphData[ix], showIndex, dsLength);
        showIndex += 1;
      }
    }

    if (this.options.doughnutHoleSize > 0) {
      this.drawDoughnutHole(graphData.length - 1);
    }
  }

  drawPieDataSet(dataSetInfo, dsIndex, dsLength) {
    let item;
    let val;
    let sliceAngle;
    let color;
    let startAngle = 1.5 * Math.PI;
    let endAngle;
    let series;

    const dsInfo = dataSetInfo;
    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;

    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const innerRadius = Math.min(width / 2, height / 2) * this.options.doughnutHoleSize;
    const outerRadius = Math.min(width / 2, height / 2);

    const radius = outerRadius - (((outerRadius - innerRadius) / dsLength) * dsIndex);

    dsInfo.or = radius;
    if (dsIndex < dsLength - 1) {
      dsInfo.ir = outerRadius - (((outerRadius - innerRadius) / dsLength) * (dsIndex + 1));
    } else {
      dsInfo.ir = 1;
    }

    if (dsInfo.total) {
      for (let ix = 0, ixLen = dsInfo.data.length; ix < ixLen; ix++) {
        item = dsInfo.data[ix];
        series = this.seriesList[item.id];
        val = item.value;
        sliceAngle = 2 * Math.PI * (val / dsInfo.total);
        endAngle = startAngle + sliceAngle;
        color = this.seriesList[item.id].color;

        item.sa = startAngle;
        item.ea = endAngle;

        if (val && series.show) {
          this.drawPieSlice(centerX, centerY, radius, startAngle, endAngle, color, ixLen === 1);
          startAngle += sliceAngle;
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

  drawDoughnutHole(dsIndex) {
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

    this.graphData[dsIndex].ir = radius;
  }

  seriesHighlight(seriesId) {
    const ctx = this.overlayCtx;
    const series = this.seriesList[seriesId];
    const color = series.color;
    const graphData = this.graphData;

    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    let findIndex = false;
    for (let ix = 0, ixLen = graphData.length; ix < ixLen; ix++) {
      const gdata = graphData[ix];

      for (let jx = 0, jxLen = gdata.data.length; jx < jxLen; jx++) {
        if (gdata.data[jx].id === seriesId) {
          findIndex = jx;
        }
      }

      const info = gdata.data[findIndex];
      const or = gdata.or;
      const ir = gdata.ir;

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
      ctx.arc(centerX, centerY, or, sa, ea);
      ctx.fill();
      ctx.closePath();
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillOpacity = 1;
      ctx.arc(centerX, centerY, ir, sa - 1, ea + 1);
      ctx.fill();
      ctx.closePath();
      ctx.restore();
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
    if (item.dsIndex === null || item.sId === null) {
      return;
    }
    const ctx = this.overlayCtx;

    const series = this.seriesList[item.sId];
    const color = series.color;
    const ds = this.graphData[item.dsIndex];
    const gdata = _.find(ds.data, { id: item.sId });

    const width = this.chartRect.chartWidth - this.chartRect.padding.left;
    const height = this.chartRect.chartHeight - this.chartRect.padding.top;
    const centerX = (width / 2) + this.chartRect.padding.left;
    const centerY = (height / 2) + this.chartRect.padding.top;

    const or = ds.or;
    const ir = ds.ir;

    const sa = gdata.sa;
    const ea = gdata.ea;

    ctx.fillStyle = color;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.lineWidth = this.options.border;
    ctx.strokeStyle = '#fff';

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, or, sa, ea);
    ctx.fill();
    ctx.closePath();


    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillOpacity = 1;
    ctx.arc(centerX, centerY, ir, sa - 1, ea + 1);
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
  }

  showTooltip(offset, e, item) {
    const index = item.dsIndex;
    if (index === null) {
      this.tooltipDOM.style.display = 'none';
      return;
    }

    const graphData = this.graphData[item.dsIndex].data;
    const offsetX = offset[0];
    const offsetY = offset[1];

    const mouseX = e.pageX;
    const mouseY = e.pageY;
    const clientX = e.clientX;
    const clientY = e.clientY;
    const bodyWidth = document.body.clientWidth;
    const bodyHeight = document.body.clientHeight;

    const graphPos = {
      x1: this.chartRect.x1 + this.labelOffset.left,
      x2: this.chartRect.x2 - this.labelOffset.right,
      y1: this.chartRect.y1 + this.labelOffset.top,
      y2: this.chartRect.y2 - this.labelOffset.bottom,
    };

    if ((offsetX >= (graphPos.x1 - 1) && offsetX <= (graphPos.x2))
      && (offsetY >= (graphPos.y1 - 1) && offsetY <= (graphPos.y2 + 1))) {
      this.tooltipTitleDOM.style.display = 'none';

      const listDOM = this.ulDOM.children;
      let sId;
      let series;
      let valueDOM;
      let gdata;

      for (let ix = 0, ixLen = listDOM.length; ix < ixLen; ix++) {
        sId = listDOM[ix].dataset.seriesId;
        series = this.seriesList[sId];

        if (series && series.show) {
          gdata = _.find(graphData, { id: sId }).value;
          listDOM[ix].style.display = 'block';
          valueDOM = listDOM[ix].children[3];
          valueDOM.textContent = gdata;
        } else {
          listDOM[ix].style.display = 'none';
        }
      }

      this.tooltipDOM.style.display = 'block';

      if (offsetX > ((graphPos.x2 * 4) / 5) || clientX > ((bodyWidth * 4) / 5)) {
        this.tooltipDOM.style.left = `${mouseX - (this.tooltipDOM.clientWidth + 10)}px`;
      } else {
        this.tooltipDOM.style.left = `${mouseX + 15}px`;
      }

      if (offsetY > ((graphPos.y2 * 3) / 4) || clientY > ((bodyHeight * 3) / 4)) {
        this.tooltipDOM.style.top = `${mouseY - (this.tooltipDOM.clientHeight + 5)}px`;
      } else {
        this.tooltipDOM.style.top = `${mouseY + 10}px`;
      }
    } else {
      this.tooltipDOM.style.display = 'none';
    }
  }
}
