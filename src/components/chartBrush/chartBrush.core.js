import { throttle } from 'lodash-es';

export default class EvChartBrush {
  constructor(evChart, evChartData, evChartOption, isUseZoomMode, brushIdx, evChartBrushRef) {
    this.evChart = evChart;
    this.evChartData = evChartData;
    this.evChartOption = evChartOption;
    this.isUseZooMode = isUseZoomMode;
    this.brushIdx = brushIdx;
    this.evChartBrushRef = evChartBrushRef;

    this.evChart.brushIdx = brushIdx;
    this.evChart.isUseZoomMode = isUseZoomMode;
  }

  init(isResize) {
    if (this.brushIdx.start > this.brushIdx.end) {
      return;
    }

    const existedBrushCanvas = this.evChartBrushRef.value.querySelector('.brush-canvas');

    if (!existedBrushCanvas) {
      const brushCanvas = document.createElement('canvas');

      brushCanvas.setAttribute('class', 'brush-canvas');
      brushCanvas.setAttribute('style', 'display: block; z-index: 1; cursor: initial;');

      const evChartBrushContainer = this.evChartBrushRef.value.querySelector('.ev-chart-brush-container');
      evChartBrushContainer.appendChild(brushCanvas);

      this.drawBrushRect(brushCanvas);
      this.addEvent(brushCanvas);
    } else {
      this.drawBrushRect(existedBrushCanvas, isResize);
    }
  }

  drawBrushRect(brushCanvas, isResize) {
    const { chartRect, labelOffset } = this.evChart;
    if (!chartRect && !labelOffset) {
      return;
    }

    const evChartRange = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const pixelRatio = window.devicePixelRatio || 1;
    const brushButtonWidth = 6;
    const brushCanvasWidth = evChartRange.x2 - evChartRange.x1 + brushButtonWidth;
    const brushCanvasHeight = evChartRange.y2 - evChartRange.y1;

    const isEqualWidth = brushCanvas.width === Math.floor(brushCanvasWidth * pixelRatio);

    if (isResize && isEqualWidth) {
      return;
    }

    const labelEndIdx = this.evChartData.value.labels.length - 1;
    const axesXInterval = (evChartRange.x2 - evChartRange.x1) / labelEndIdx;
    const brushRectX = this.brushIdx.start * axesXInterval * pixelRatio;
    const brushRectWidth = (
      brushCanvasWidth - (labelEndIdx - (this.brushIdx.end - this.brushIdx.start)) * axesXInterval
    ) * pixelRatio;
    const brushRectHeight = this.evChartOption.value.height - evChartRange.y1;
    const brushButtonLeftXPos = brushRectX;
    const brushButtonRightXPos = brushRectX + brushRectWidth - brushButtonWidth;

    this.evBrushChartPos = {
      leftX: (brushButtonLeftXPos / pixelRatio) + evChartRange.x1,
      rightX: (brushButtonRightXPos / pixelRatio) + evChartRange.x1,
      buttonWidth: brushButtonWidth,
      x1: evChartRange.x1 - (brushButtonWidth / 2),
      axesXInterval,
    };
    this.evChart.evBrushChartPos = this.evBrushChartPos;

    if (!brushCanvas.style.position) {
      brushCanvas.style.position = 'absolute';
      brushCanvas.style.top = `${evChartRange.y1}px`;
      brushCanvas.style.left = `${evChartRange.x1 - (brushButtonWidth / 2)}px`;
    }

    if (!isEqualWidth) {
      brushCanvas.width = (brushCanvasWidth * pixelRatio);
      brushCanvas.style.width = `${brushCanvasWidth}px`;
      brushCanvas.height = brushCanvasHeight * pixelRatio;
      brushCanvas.style.height = `${brushCanvasHeight}px`;
    }

    const ctx = brushCanvas.getContext('2d');

    ctx.clearRect(
      0,
      0,
      brushCanvasWidth * pixelRatio,
      brushCanvasHeight * pixelRatio,
    );

    ctx.fillStyle = this.evChartOption.value.dragSelection.fillColor;
    ctx.globalAlpha = this.evChartOption.value.dragSelection.opacity;
    ctx.fillRect(brushRectX, 0, brushRectWidth, brushRectHeight);
    ctx.fillRect(brushButtonLeftXPos, 0, brushButtonWidth, brushRectHeight);
    ctx.fillRect(brushButtonRightXPos, 0, brushButtonWidth, brushRectHeight);
  }

  addEvent(brushCanvas) {
    if (!this.overlayCanvas) {
      if (this.evChartBrushRef.value.querySelector('.overlay-canvas')) {
        this.overlayCanvas = this.evChartBrushRef.value.querySelector('.overlay-canvas');
      }
    }

    let isClickBrushButton = false;
    let beforeMouseXPos = 0;
    let curClickButtonType = null;

    const onMouseMove = (e) => {
      const evBrushChartPos = this.evBrushChartPos;

      if (brushCanvas.style.cursor === 'initial' && this.isUseZooMode.value) {
        brushCanvas.style.cursor = 'ew-resize';
      }

      if (isClickBrushButton) {
        if (!this.isUseZooMode.value) {
          return;
        }

        if (!curClickButtonType) {
          this.brushIdx.isExecutedByButton = true;
          const calDisToCurMouseX = xPos => Math.abs(
            evBrushChartPos[xPos] - evBrushChartPos.x1 - e.offsetX,
          );

          curClickButtonType = calDisToCurMouseX('rightX') > calDisToCurMouseX('leftX') ? 'leftX' : 'rightX';
          return;
        }

        const brushButtonSensitivity = evBrushChartPos.axesXInterval / 3;
        if (e.offsetX > beforeMouseXPos) {
          const isMoveRight = e.offsetX - (
            evBrushChartPos[curClickButtonType] - evBrushChartPos.x1
          ) > brushButtonSensitivity;

          if (isMoveRight && curClickButtonType === 'leftX') {
            if (this.brushIdx.start < this.brushIdx.end - 1) {
              this.brushIdx.start += 1;
            }
          } else if (isMoveRight && curClickButtonType === 'rightX') {
            if (this.brushIdx.end !== this.evChartData.value.labels.length - 1) {
              this.brushIdx.end += 1;
            }
          }
        } else if (e.offsetX < beforeMouseXPos) {
          const isMoveLeft = evBrushChartPos[curClickButtonType]
            - evBrushChartPos.x1 - e.offsetX > brushButtonSensitivity;

          if (isMoveLeft && curClickButtonType === 'leftX') {
            if (this.brushIdx.start !== 0) {
              this.brushIdx.start -= 1;
            }
          } else if (isMoveLeft && curClickButtonType === 'rightX') {
            if (this.brushIdx.start < this.brushIdx.end - 1) {
              this.brushIdx.end -= 1;
            }
          }
        }

        beforeMouseXPos = e.offsetX;
      } else {
        const moveRight = xPos =>
          e.offsetX + evBrushChartPos.x1 - evBrushChartPos.buttonWidth > evBrushChartPos[xPos];
        const moveLeft = xPos =>
          e.offsetX + evBrushChartPos.x1 + evBrushChartPos.buttonWidth < evBrushChartPos[xPos];

        const isCurMouseXOutsideBrush = moveLeft('leftX') || moveRight('rightX');
        const isCurMouseXInsideBrush = moveRight('leftX') && moveLeft('rightX');

        if (isCurMouseXOutsideBrush) {
          this.overlayCanvas.style['z-index'] = 2;
          brushCanvas.style['z-index'] = 1;
        }

        if (isCurMouseXInsideBrush) {
          this.overlayCanvas.style['z-index'] = 2;
          brushCanvas.style['z-index'] = 1;
        }
      }
    };

    const onMouseDown = (e) => {
      e.preventDefault();
      isClickBrushButton = true;
    };

    const initState = () => {
      brushCanvas.style.cursor = 'initial';
      this.brushIdx.isExecutedByButton = false;
      isClickBrushButton = false;
      beforeMouseXPos = 0;
      curClickButtonType = null;
    };

    const onMouseUp = () => {
      initState();
    };

    const onMouseLeave = () => {
      if (isClickBrushButton) {
        initState();
      }
    };

    brushCanvas.addEventListener('mousemove', throttle(onMouseMove, 50));
    brushCanvas.addEventListener('mousedown', onMouseDown);
    brushCanvas.addEventListener('mouseup', onMouseUp);
    brushCanvas.addEventListener('mouseleave', onMouseLeave);
  }
}
