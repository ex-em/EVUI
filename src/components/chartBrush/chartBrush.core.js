export default class EvChartBrush {
  constructor(evChart, evChartData, evChartOption, brushIdx, evChartBrushRef) {
    this.evChart = evChart;
    this.evChartData = evChartData;
    this.evChartOption = evChartOption;
    this.brushIdx = brushIdx;
    this.evChartBrushRef = evChartBrushRef;
  }

  init(isResize) {
    const { chartRect, labelOffset } = this.evChart;

    if (chartRect && labelOffset) {
      if (this.brushIdx.start > this.brushIdx.end) {
        return;
      }

      const evChartRange = {
        x1: chartRect.x1 + labelOffset.left,
        x2: chartRect.x2 - labelOffset.right,
        y1: chartRect.y1 + labelOffset.top,
        y2: chartRect.y2 - labelOffset.bottom,
      };

      const existedBrushCanvas = this.evChartBrushRef.value.querySelector('.brush-canvas');

      if (!existedBrushCanvas) {
        const brushCanvas = document.createElement('canvas');

        brushCanvas.setAttribute('class', 'brush-canvas');
        brushCanvas.setAttribute('style', 'display: block; z-index: 1;');

        const evChartBrushContainer = this.evChartBrushRef.value.querySelector('.ev-chart-brush-container');
        evChartBrushContainer.appendChild(brushCanvas);

        brushCanvas.style.position = 'absolute';
        brushCanvas.style.top = `${evChartRange.y1}px`;
        brushCanvas.style.left = `${evChartRange.x1}px`;

        this.drawBrushRect(brushCanvas, evChartRange);
      } else {
        this.drawBrushRect(existedBrushCanvas, evChartRange, isResize);
      }
    }
  }

  drawBrushRect(canvas, evChartRange, isResize) {
    const pixelRatio = window.devicePixelRatio || 1;
    const brushCanvasWidth = evChartRange.x2 - evChartRange.x1;
    const brushCanvasHeight = evChartRange.y2 - evChartRange.y1;

    const isEqualWidth = canvas.width === Math.floor(
      (brushCanvasWidth) * pixelRatio,
    );

    if (isResize && isEqualWidth) {
      return;
    }

    const labelEndIdx = this.evChartData.value.labels.length - 1;
    const axesXInterval = brushCanvasWidth / labelEndIdx;
    const brushRectX = this.brushIdx.start * axesXInterval * pixelRatio;
    const brushRectWidth = (
      brushCanvasWidth - (labelEndIdx - (this.brushIdx.end - this.brushIdx.start)) * axesXInterval
    ) * pixelRatio;

    if (!isEqualWidth) {
      canvas.width = (brushCanvasWidth) * pixelRatio;
      canvas.style.width = `${brushCanvasWidth}px`;
      canvas.height = (brushCanvasHeight) * pixelRatio;
      canvas.style.height = `${brushCanvasHeight}px`;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(
      0,
      0,
      (brushCanvasWidth) * pixelRatio,
      this.evChartOption.value.height - evChartRange.y1,
    );

    ctx.fillStyle = this.evChartOption.value.dragSelection.fillColor;
    ctx.globalAlpha = this.evChartOption.value.dragSelection.opacity;
    ctx.fillRect(brushRectX, 0, brushRectWidth, this.evChartOption.value.height - evChartRange.y1);
  }
}
