import { throttle, debounce } from 'lodash-es';

export default class EvChartBrush {
  constructor(evChart, evChartData, evChartOption, brushIdx, evChartBrushRef) {
    this.evChart = evChart;
    this.evChartData = evChartData;
    this.evChartOption = evChartOption;
    this.evChartBrushRef = evChartBrushRef;

    this.brushIdx = brushIdx;
    if (evChartOption.value.brush.useDebounce) {
      this.debounceBrushIdx = { start: brushIdx.start, end: brushIdx.end };
    }
  }

  init(isResize) {
    if (this.brushIdx.start > this.brushIdx.end) {
      return;
    }

    const existedBrushCanvas = this.evChartBrushRef.value.querySelector('.brush-canvas');

    if (!existedBrushCanvas) {
      const brushCanvas = document.createElement('canvas');

      brushCanvas.setAttribute('class', 'brush-canvas');
      brushCanvas.setAttribute('style', 'display: block; z-index: 1;');

      const evChartBrushContainer = this.evChartBrushRef.value.querySelector('.ev-chart-brush-container');

      if (evChartBrushContainer) {
        this.brushCanvas = brushCanvas;
        evChartBrushContainer.appendChild(brushCanvas);
        this.evChartBrushContainer = evChartBrushContainer;

        this.drawBrushRect({ brushCanvas });
        this.addEvent(brushCanvas);
      }
    } else {
      this.drawBrushRect({ brushCanvas: existedBrushCanvas, isResize });
    }
  }

  drawBrushRect({ brushCanvas, isResize, isDebounce }) {
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

    if (!isDebounce && this.debounceBrushIdx) {
      this.debounceBrushIdx.start = this.brushIdx.start;
      this.debounceBrushIdx.end = this.brushIdx.end;
    }
    const brushIdx = this.debounceBrushIdx ?? this.brushIdx;

    const labelEndIdx = this.evChartData.value.labels.length - 1;
    this.labelEndIdx = labelEndIdx;
    const axesXInterval = (evChartRange.x2 - evChartRange.x1) / labelEndIdx;
    const brushRectX = brushIdx.start * axesXInterval * pixelRatio;
    const brushRectWidth = (
      brushCanvasWidth - (
        labelEndIdx - (brushIdx.end - brushIdx.start)
      ) * axesXInterval
    ) * pixelRatio;
    const brushRectHeight = this.evChartOption.value.height - evChartRange.y1;
    const brushButtonLeftXPos = brushRectX;
    const brushButtonRightXPos = brushRectX + brushRectWidth;

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
    ctx.fillRect(brushButtonRightXPos - brushButtonWidth, 0, brushButtonWidth, brushRectHeight);

    this.evChartBrushPos = {
      leftX: brushButtonLeftXPos / pixelRatio,
      rightX: brushButtonRightXPos / pixelRatio,
      buttonWidth: brushButtonWidth,
      axesXInterval,
    };
  }

  addEvent() {
    let mousePosition;

    this.onMouseDown = (e) => {
      e.preventDefault();

      if (mousePosition.isInsideButton) {
        this.clickBrushInsideX = -1;
      } else if (mousePosition.isInsideBrush) {
        this.clickBrushInsideX = e.offsetX;
      } else if (mousePosition.isOutsideBrush) {
        this.teleportBrush(e);
      }
    };

    const onMouseMove = (e) => {
      if (this.clickBrushInsideX) {
        this.mouseDownAndMove(e);
      } else {
        mousePosition = this.getMousePosition(e);

        this.changeCursor(mousePosition);
      }
    };
    this.onMouseMove = throttle(onMouseMove, 5);

    this.onWheel = (e) => {
      e.preventDefault();

      this.updateBrushIdx(e.deltaY > 0 ? 'movedown' : 'moveup');
    };

    this.onMouseUp = () => {
      this.initEventState();
    };

    this.onMouseLeave = () => {
      if (this.clickBrushInsideX) {
        this.initEventState();
      }
    };

    const onWheelDebounce = () => {
      this.initEventState();
    };
    this.onWheelDebounce = debounce(onWheelDebounce, 100);

    this.setEventListener('addEventListener');
  }

  getMousePosition(e) {
    const calDisToCurMouseX = xPos => Math.abs(this.evChartBrushPos[xPos] - e.offsetX);
    const buttonType = calDisToCurMouseX('rightX') > calDisToCurMouseX('leftX') ? 'leftX' : 'rightX';

    this.curBrushButtonType = buttonType;

    const isMoveRight = xPos => e.offsetX > this.evChartBrushPos[xPos];
    const isMoveLeft = xPos => e.offsetX < this.evChartBrushPos[xPos];

    const isOutsideBrush = isMoveLeft('leftX') || isMoveRight('rightX');
    const isInsideBrush = isMoveRight('leftX') && isMoveLeft('rightX');

    const isInsideButton = e.offsetX + this.evChartBrushPos.buttonWidth
      >= this.evChartBrushPos[buttonType]
      && e.offsetX - this.evChartBrushPos.buttonWidth
      <= this.evChartBrushPos[buttonType];

    return {
      isInsideButton,
      isInsideBrush,
      isOutsideBrush,
    };
  }

  destroy() {
    if (this.brushCanvas) {
      this.setEventListener('removeEventListener');

      this.brushCanvas = null;
    }

    const evChartBrushContainer = this.evChartBrushContainer;
    while (evChartBrushContainer.hasChildNodes()) {
      evChartBrushContainer.removeChild(evChartBrushContainer.firstChild);
    }
  }

  /**
   * @param {string} type eventListener setting type.
   *
   * @returns {undefined}
   */
  setEventListener(type) {
    this.brushCanvas[type]('mousemove', this.onMouseMove);
    this.brushCanvas[type]('mousedown', this.onMouseDown);
    this.brushCanvas[type]('mouseup', this.onMouseUp);
    this.brushCanvas[type]('mouseleave', this.onMouseLeave);
    this.brushCanvas[type]('wheel', this.onWheel);
    this.brushCanvas[type]('wheel', this.onWheelDebounce);
  }

  removeBrushWrapper() {
    if (this.evChartBrushRef.value) {
      const evChartBrushWrapper = this.evChartBrushRef.value.querySelector('.ev-chart-brush-wrapper');

      if (evChartBrushWrapper) {
        this.evChartBrushRef.value.removeChild(evChartBrushWrapper);
      }
    }
  }

  removeBrushCanvas() {
    if (this.evChartBrushContainer) {
      const brushCanvas = this.evChartBrushContainer.querySelector('.brush-canvas');

      if (brushCanvas) {
        this.evChartBrushContainer.removeChild(brushCanvas);
      }
    }
  }

  teleportBrush(e) {
    const brushIdx = this.debounceBrushIdx ?? this.brushIdx;

    const middle = (brushIdx.end - brushIdx.start) / 2;
    let left;
    let right;
    let clickIdx;

    if (middle > 0.5) {
      if ((brushIdx.end - brushIdx.start) % 2 === 0) {
        clickIdx = Math.round(e.offsetX / this.evChartBrushPos.axesXInterval);

        left = Math.ceil(middle);
        right = Math.floor(middle);
      } else {
        clickIdx = Math.ceil(e.offsetX / this.evChartBrushPos.axesXInterval);

        left = Math.ceil(middle);
        right = Math.floor(middle);
      }
    } else {
      clickIdx = Math.floor(e.offsetX / this.evChartBrushPos.axesXInterval);

      if (
        e.offsetX - (clickIdx * this.evChartBrushPos.axesXInterval)
        > (this.evChartBrushPos.axesXInterval / 2)
      ) {
        left = Math.floor(middle);
        right = Math.ceil(middle);
      } else {
        left = Math.ceil(middle);
        right = Math.floor(middle);

        if (middle < 1) {
          clickIdx += 1;
        }
      }
    }

    if (clickIdx - left <= 0) {
      brushIdx.start = 0;
      brushIdx.end = right + left;
    } else if (clickIdx + right >= this.labelEndIdx) {
      brushIdx.start = this.labelEndIdx - right - left;
      brushIdx.end = this.labelEndIdx;
    } else {
      brushIdx.start = clickIdx - left;
      brushIdx.end = clickIdx + right;
    }

    this.brushIdx.isUseScroll = true;
  }

  changeCursor(mousePosition) {
    if (mousePosition.isOutsideBrush) {
      this.brushCanvas.style.cursor = 'pointer';
    } else if (mousePosition.isInsideBrush) {
      if (mousePosition.isInsideButton) {
        this.brushCanvas.style.cursor = 'ew-resize';
      } else {
        this.brushCanvas.style.cursor = 'grab';
      }
    }
  }

  mouseDownAndMove(e) {
    const moveSensitive = this.evChartBrushPos.axesXInterval / 3;
    let mode;

    if (e.offsetX > this.beforeMouseXPos) {
      // 오른쪽 이동
      if (this.clickBrushInsideX > 0) {
        if (this.clickBrushInsideX < e.offsetX - moveSensitive) {
          mode = 'moveup';
          this.clickBrushInsideX = e.offsetX + moveSensitive;
        }
      } else {
        const isMoveRight = e.offsetX - this.evChartBrushPos[this.curBrushButtonType]
          > moveSensitive;

        if (isMoveRight) {
          mode = this.curBrushButtonType === 'leftX' ? 'decrease' : 'increase';
        }
      }
    } else if (e.offsetX < this.beforeMouseXPos) {
      // 왼쪽 이동
      if (this.clickBrushInsideX > 0) {
        if (this.clickBrushInsideX > e.offsetX + moveSensitive) {
          mode = 'movedown';
          this.clickBrushInsideX = e.offsetX - moveSensitive;
        }
      } else {
        const isMoveLeft = this.evChartBrushPos[this.curBrushButtonType] - e.offsetX
          > moveSensitive;

        if (isMoveLeft) {
          mode = this.curBrushButtonType === 'leftX' ? 'increase' : 'decrease';
        }
      }
    }

    if (mode) {
      this.updateBrushIdx(mode);
    }

    this.beforeMouseXPos = e.offsetX;
  }

  /**
   * @param {string} mode determines how to update the brush index value.
   *
   * @returns {undefined}
   */
  updateBrushIdx(mode) {
    const brushIdx = this.debounceBrushIdx ?? this.brushIdx;

    switch (mode) {
      case 'moveup':
        if (brushIdx.end === this.labelEndIdx) {
          return;
        }

        brushIdx.start += 1;
        brushIdx.end += 1;

        this.brushIdx.isUseScroll = true;
        break;
      case 'movedown':
        if (!brushIdx.start) {
          return;
        }

        brushIdx.start -= 1;
        brushIdx.end -= 1;

        this.brushIdx.isUseScroll = true;
        break;
      case 'increase':
        if (this.curBrushButtonType === 'leftX') {
          if (!brushIdx.start) {
            return;
          }

          brushIdx.start -= 1;
        } else {
          if (brushIdx.end === this.labelEndIdx) {
            return;
          }

          brushIdx.end += 1;
        }

        this.brushIdx.isUseButton = true;
        break;
      case 'decrease':
        if (brushIdx.start === brushIdx.end - 1) {
          return;
        }

        if (this.curBrushButtonType === 'leftX') {
          brushIdx.start += 1;
        } else {
          brushIdx.end -= 1;
        }

        this.brushIdx.isUseButton = true;
        break;
      default:
        break;
    }

    if (mode && this.debounceBrushIdx) {
      this.drawBrushRect({
        brushCanvas: this.brushCanvas,
        isResize: false,
        isDebounce: true,
      });
    }
  }

  /**
   * @param {boolean} isUpdateBrushIdx to initialize state after update brush index value
   *
   * @returns {undefined}
   */
  initEventState() {
    const promise = new Promise((resolve) => {
      if (
        this.debounceBrushIdx
        && (this.brushIdx.isUseButton || this.brushIdx.isUseScroll)
      ) {
        this.brushIdx.start = this.debounceBrushIdx.start;
        this.brushIdx.end = this.debounceBrushIdx.end;
      }

      resolve(true);
    });

    promise.then((isUpdateBrushIdx) => {
      if (isUpdateBrushIdx) {
        this.clickBrushInsideX = null;
        this.beforeMouseXPos = null;
        this.curBrushButtonType = null;

        this.brushIdx.isUseButton = false;
        this.brushIdx.isUseScroll = false;
      }
    });
  }
}
