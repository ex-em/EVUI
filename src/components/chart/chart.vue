<template>
  <div
    :id="id"
    ref="wrapper"
    class="evui-chart-wrapper"
    :style="chartStyle"
  >
    <canvas
      ref="canvas"
      style="width: 100%; height: 100%"
    />
  </div>
</template>
<script>
  export default {
    props: {
      id: {
        type: String,
        default() {
          return `evui-chart-${this._uid}`;
        },
      },
      name: {
        type: String,
        default: 'Chart',
      },
      width: {
        type: [String, Number],
        default: '100%',
      },
      height: {
        type: [String, Number],
        default: '100%',
      },
      chartData: {
        type: Array,
        default() {
          return [];
        },
      },
      margin: {
        type: Object,
        default() {
          return { top: 0, left: 0, right: 0, bottom: 0 };
        },
      },
    },
    data() {
      return {
        chartStyle: null,
        chartHeight: null,
        chartWidth: null,
        xMax: null,
        yMax: null,
        ratio: null,
        ctx: null,
        canvas: null,
        maxYValue: 0,
      };
    },
    created() {
      // using wrapper div
      this.chartStyle = {
        width: typeof this.width === 'number' ? `${this.width}px` : this.width,
        height: typeof this.height === 'number' ? `${this.height}px` : this.height,
      };
    },
    mounted() {
      if (!this.checkCanvasElement()) {
        throw new Error('Cannot get canvas. Please Check this Browser Support Canvas element');
      } else {
        this.canvas = this.$refs.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.$refs.wrapper.clientWidth;
        this.canvas.height = this.$refs.wrapper.clientHeight;
      }

      this.render();
    },
    methods: {
      checkCanvasElement() {
        const vm = this;
        const canvas = vm.$refs.canvas;

        return !!(canvas && canvas.getContext('2d'));
      },
      getMaxDataYValue() {
        for (let ix = 0, ixLen = this.chartData.length; ix < ixLen; ix++) {
          if (this.chartData[ix].y > this.maxYValue) {
            this.maxYValue = this.chartData[ix].y;
          }
        }
      },
      render() {
        this.getMaxDataYValue();

        this.chartWidth = this.canvas.width;
        this.chartHeight = this.canvas.height;

        this.xMax = this.chartWidth - (this.margin.left + this.margin.right);
        this.yMax = this.chartHeight - (this.margin.top + this.margin.bottom);

        this.ratio = this.yMax / this.maxYValue;

        this.renderChart();
      },
      renderChart() {
        this.renderBackground();
        this.renderText();
        this.renderLinesAndLabels();

        this.renderData();
      },
      renderBackground() {
        const ctx = this.ctx;
        const margin = this.margin;

        const lingrad =
          ctx.createLinearGradient(margin.left, margin.top, this.xMax - margin.right, this.yMax);

        lingrad.addColorStop(0.0, '#d4d4d4');
        lingrad.addColorStop(0.2, '#fff');
        lingrad.addColorStop(0.8, '#fff');
        lingrad.addColorStop(1, '#d4d4d4');

        ctx.fillStyle = lingrad;
        ctx.fillRect(margin.left, margin.top, this.xMax - margin.left, this.yMax - margin.top);
        ctx.fillStyle = 'black';
      },
      renderText() {
        const ctx = this.ctx;
        const margin = this.margin;
        const labelFont = '19pt Arial';

        ctx.font = labelFont;
        ctx.textAlign = 'center';

        // Title
        let txtSize = ctx.measureText('sample title');
        ctx.fillText('sample title', (this.chartWidth / 2), (margin.top / 2));

        // X-axis Text
        txtSize = ctx.measureText('xLabel Text');
        ctx.fillText('xLabel Text', margin.left - ((this.xMax / 2) + (txtSize.width / 2)), this.yMax + (margin.bottom / 1.2));

        // Y-axis Text
        ctx.save();
        ctx.rotate(-Math.PI / 2);
        ctx.font = labelFont;
        ctx.fillText('xLabel Text', (this.yMax / 2) * -1, margin.left / 4);
        ctx.restore();
      },
      getXInc() {
        return Math.round(this.xMax / this.chartData.length) - 1;
      },
      renderLinesAndLabels() {
        // Vertical guide lines
        const xInc = this.getXInc();
        const yInc = this.yMax / this.chartData.length;

        let xPos = this.margin.left;
        let yPos = 0;

        for (let ix = 0, ixLen = this.chartData.length; ix < ixLen; ix += 1) {
          // Draw horizontal lines
          yPos += (ix === 0) ? this.margin.top : yInc;
          this.drawLine(this.margin.left, yPos, this.xMax, yPos, '#e8e8e8');

          // y axis labels
          this.ctx.font = '10pt Calibri';
          let txt = Math.round(this.maxYValue - ((ix === 0) ? 0 : yPos / this.ratio));
          let txtSize = this.ctx.measureText(txt);
          this.ctx.fillText(txt, this.margin.left - ((txtSize.width >= 14) ?
            txtSize.width : 10) - 7, yPos + 4);

          // x axis labels
          txt = this.chartData[ix].x;
          txtSize = this.ctx.measureText(txt);
          this.ctx.fillText(txt, xPos, this.yMax + (this.margin.bottom / 3));
          xPos += xInc;
        }
      },
      drawLine(startX, startY, endX, endY, strokeStyle, lineWidth) {
        if (strokeStyle != null) {
          this.ctx.strokeStyle = strokeStyle;
        }
        if (lineWidth != null) {
          this.ctx.lineWidth = lineWidth;
        }
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        this.ctx.closePath();
      },
      renderData() {
        const xInc = this.getXInc();
        let prevX = 0;
        let prevY = 0;
        let ptX;
        let pt;

        for (let ix = 0, ixLen = this.chartData.length; ix < ixLen; ix++) {
          pt = this.chartData[ix];
          let ptY = (this.maxYValue - pt.y) * this.ratio;

          if (ptY < this.margin.top) {
            ptY = this.margin.top;
          }

          ptX = (ix * xInc) + this.margin.left;
          if (ix > 0) {
            this.drawLine(ptX, ptY, prevX, prevY, 'black', 2);
          }

          prevX = ptX;
          prevY = ptY;
        }
      },
    },
  };
</script>
<style>
</style>
