import { throttle, debounce } from 'lodash-es';

const BRUSH_UPDATE_MODE = {
  WHEEL: {
    UP: 'MOVEUP_WHEEL',
    DOWN: 'MOVEDOWN_WHEEL',
  },
  GRAB: {
    UP: 'MOVEUP_GRAB',
    DOWN: 'MOVEDOWN_GRAB',
  },
  BUTTON: {
    INCREASE: 'INCREASE',
    DECREASE: 'DECREASE',
  },
};

const BUTTON_TYPE = {
  LEFT: 'leftX',
  RIGHT: 'rightX',
};

export default class EvChartBrush {
  constructor(evChart, evChartData, evChartBrushOptions, brushIdx, evChartBrushRef) {
    this.evChart = evChart;
    this.evChartBrushOptions = evChartBrushOptions;
    this.evChartBrushRef = evChartBrushRef;
    this.evChartData = evChartData;

    this.brushIdx = brushIdx;
    if (evChartBrushOptions.value.useDebounce) {
      this.debounceBrushIdx = { start: brushIdx.start, end: brushIdx.end };
    }
  }

  init(isResize) {
    if (this.brushIdx.start > this.brushIdx.end) {
      this.removeBrushCanvas();
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

  drawBrushRect({ brushCanvas, isResize, isDebounce, mode, offsetX }) {
    const { chartRect, labelOffset } = this.evChart;
    if (!chartRect && !labelOffset) {
      return;
    }

    const labelEndIdx = this.evChartData.value.labels.length - 1;
    this.labelEndIdx = labelEndIdx;

    const evChartRange = {
      x1: chartRect.x1 + labelOffset.left,
      x2: chartRect.x2 - labelOffset.right,
      y1: chartRect.y1 + labelOffset.top,
      y2: chartRect.y2 - labelOffset.bottom,
    };

    const canvasPosInfo = this.setCanvasWidthHeight(evChartRange, brushCanvas);

    if (isResize && this.isEqualWidth) {
      return;
    }

    if (labelEndIdx >= 0) {
      const brushPosInfo = this.setBrushXAndWidth(canvasPosInfo, offsetX, isDebounce, mode);

      if (canvasPosInfo && brushPosInfo) {
        this.drawBrush(canvasPosInfo, brushPosInfo, evChartRange, brushCanvas);
      }
    }
  }

  setCanvasWidthHeight(evChartRange, brushCanvas) {
    const brushButtonWidth = 6;
    const brushCanvasWidth = evChartRange.x2 - evChartRange.x1 + brushButtonWidth;
    const brushCanvasHeight = evChartRange.y2 - evChartRange.y1;

    const axesXInterval = (evChartRange.x2 - evChartRange.x1) / this.labelEndIdx;

    const pixelRatio = window.devicePixelRatio || 1;

    this.isEqualWidth = brushCanvas.width === Math.floor(brushCanvasWidth * pixelRatio);

    return {
      brushButtonWidth,
      brushCanvasHeight,
      brushCanvasWidth,
      axesXInterval,
      pixelRatio,
    };
  }

  setBrushXAndWidth(canvasPosInfo, offsetX = 0, isDebounce, mode) {
    const {
      brushButtonWidth,
      brushCanvasWidth,
      axesXInterval,
      pixelRatio,
    } = canvasPosInfo;

    if (!isDebounce && this.debounceBrushIdx) {
      this.debounceBrushIdx.start = this.brushIdx.start;
      this.debounceBrushIdx.end = this.brushIdx.end;
    }
    const brushIdx = this.debounceBrushIdx ?? this.brushIdx;

    switch (mode) {
      case BRUSH_UPDATE_MODE.BUTTON.INCREASE:
      case BRUSH_UPDATE_MODE.BUTTON.DECREASE:
        this.brushRectWidth = brushCanvasWidth * pixelRatio;

        if (this.curBrushButtonType === BUTTON_TYPE.LEFT) {
          this.brushRectWidth = this.beforeBrushRectWidth
            ? this.beforeBrushRectWidth - offsetX : this.brushRectWidth - offsetX;

          if (this.brushRectWidth <= brushButtonWidth) {
            this.brushRectWidth = brushButtonWidth;
          } else {
            this.brushRectX = offsetX * pixelRatio;
            this.beforeBrushRectX = this.brushRectX;
          }
        } else if (this.curBrushButtonType === BUTTON_TYPE.RIGHT) {
          this.brushRectWidth = offsetX - this.beforeBrushRectX;

          if (this.brushRectWidth <= brushButtonWidth) {
            this.brushRectWidth = brushButtonWidth;
          } else {
            this.brushRectX = this.beforeBrushRectX;
            this.beforeBrushRectWidth = this.brushRectWidth + this.brushRectX;
          }
        }
        break;
      case BRUSH_UPDATE_MODE.GRAB.UP:
      case BRUSH_UPDATE_MODE.GRAB.DOWN:
        if (
          (this.brushRectX <= 0 && mode === BRUSH_UPDATE_MODE.GRAB.DOWN)
          || (
            this.brushRectX + this.brushRectWidth >= brushCanvasWidth
            && mode === BRUSH_UPDATE_MODE.GRAB.UP
          )
        ) {
          this.offsetXAndRectXInterval = null;
        } else {
          if (!this.offsetXAndRectXInterval) {
            this.offsetXAndRectXInterval = offsetX - this.brushRectX;
          }

          this.brushRectX = offsetX - this.offsetXAndRectXInterval;
        }

        break;
      default:
        if (!offsetX) {
          this.brushRectX = brushIdx.start * axesXInterval * pixelRatio;
          this.brushRectWidth = (
            brushCanvasWidth - (
              this.labelEndIdx - (brushIdx.end - brushIdx.start)
            ) * axesXInterval
          ) * pixelRatio;

          this.beforeBrushRectX = this.brushRectX;
          this.beforeBrushRectWidth = this.brushRectWidth + this.brushRectX;
        }
        break;
    }

    return {
      brushRectX: this.brushRectX,
      brushRectWidth: this.brushRectWidth,
    };
  }

  drawBrush(canvasPosInfo, brushPosInfo, evChartRange, brushCanvas) {
    const {
      brushButtonWidth,
      brushCanvasHeight,
      brushCanvasWidth,
      axesXInterval,
      pixelRatio,
    } = canvasPosInfo;

    const {
      brushRectX,
      brushRectWidth,
    } = brushPosInfo;

    const {
      height,
      selection: {
        fillColor,
        opacity,
      },
    } = this.evChartBrushOptions.value;

    const brushRectHeight = height - evChartRange.y1;
    const brushButtonLeftXPos = brushRectX;
    const brushButtonRightXPos = brushRectX + brushRectWidth;

    if (!brushCanvas.style.position) {
      brushCanvas.style.position = 'absolute';
      brushCanvas.style.top = `${evChartRange.y1}px`;
      brushCanvas.style.left = `${evChartRange.x1 - (brushButtonWidth / 2)}px`;
    }

    if (!this.isEqualWidth) {
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

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = opacity;
    ctx.fillRect(brushRectX, 0, brushRectWidth, brushRectHeight);
    ctx.fillRect(brushButtonLeftXPos, 0, brushButtonWidth, brushRectHeight);
    ctx.fillRect(brushButtonRightXPos - brushButtonWidth, 0, brushButtonWidth, brushRectHeight);

    this.brushPosInfo = {
      leftX: brushButtonLeftXPos / pixelRatio,
      rightX: brushButtonRightXPos / pixelRatio,
      buttonWidth: brushButtonWidth,
      axesXInterval,
      ...canvasPosInfo,
      ...brushPosInfo,
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

      const mode = e.deltaY > 0 ? BRUSH_UPDATE_MODE.WHEEL.DOWN : BRUSH_UPDATE_MODE.WHEEL.UP;

      this.updateBrushIdx(mode);

      if (this.debounceBrushIdx) {
        this.drawBrushRect({
          brushCanvas: this.brushCanvas,
          isDebounce: true,
          mode,
        });
      }

      this.brushIdx.isUseScroll = true;
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
    const calDisToCurMouseX = xPos => Math.abs(this.brushPosInfo[xPos] - e.offsetX);
    const buttonType = calDisToCurMouseX(BUTTON_TYPE.RIGHT) > calDisToCurMouseX(BUTTON_TYPE.LEFT)
      ? BUTTON_TYPE.LEFT : BUTTON_TYPE.RIGHT;

    const isMoveRight = xPos => e.offsetX > this.brushPosInfo[xPos];
    const isMoveLeft = xPos => e.offsetX < this.brushPosInfo[xPos];

    const isOutsideBrush = isMoveLeft(BUTTON_TYPE.LEFT) || isMoveRight(BUTTON_TYPE.RIGHT);
    const isInsideBrush = isMoveRight(BUTTON_TYPE.LEFT) && isMoveLeft(BUTTON_TYPE.RIGHT);

    const isInsideButton = e.offsetX + this.brushPosInfo.buttonWidth
      >= this.brushPosInfo[buttonType]
      && e.offsetX - this.brushPosInfo.buttonWidth
      <= this.brushPosInfo[buttonType];

    this.curBrushButtonType = isInsideButton && buttonType;

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
        clickIdx = Math.round(e.offsetX / this.brushPosInfo.axesXInterval);

        left = Math.ceil(middle);
        right = Math.floor(middle);
      } else {
        clickIdx = Math.ceil(e.offsetX / this.brushPosInfo.axesXInterval);

        left = Math.ceil(middle);
        right = Math.floor(middle);
      }
    } else {
      clickIdx = Math.floor(e.offsetX / this.brushPosInfo.axesXInterval);

      if (
        e.offsetX - (clickIdx * this.brushPosInfo.axesXInterval)
        > (this.brushPosInfo.axesXInterval / 2)
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
    const moveSensitive = this.debounceBrushIdx ? 0 : (this.brushPosInfo.axesXInterval / 3);
    let mode;

    if (e.offsetX > this.beforeMouseXPos) {
      // 오른쪽 이동
      if (this.clickBrushInsideX > 0) {
        if (this.clickBrushInsideX < e.offsetX - moveSensitive) {
          mode = BRUSH_UPDATE_MODE.GRAB.UP;

          this.isUseBrushGrab = true;
          this.brushIdx.isUseScroll = true;
          this.clickBrushInsideX = e.offsetX + moveSensitive;
        }
      } else {
        const isMoveRight = e.offsetX - this.brushPosInfo[this.curBrushButtonType]
          > moveSensitive;

        if (isMoveRight) {
          mode = this.curBrushButtonType === BUTTON_TYPE.LEFT
            ? BRUSH_UPDATE_MODE.BUTTON.DECREASE : BRUSH_UPDATE_MODE.BUTTON.INCREASE;

          this.brushIdx.isUseButton = true;
        }
      }
    } else if (e.offsetX < this.beforeMouseXPos) {
      // 왼쪽 이동
      if (this.clickBrushInsideX > 0) {
        if (this.clickBrushInsideX > e.offsetX + moveSensitive) {
          mode = BRUSH_UPDATE_MODE.GRAB.DOWN;

          this.isUseBrushGrab = true;
          this.brushIdx.isUseScroll = true;
          this.clickBrushInsideX = e.offsetX - moveSensitive;
        }
      } else {
        const isMoveLeft = this.brushPosInfo[this.curBrushButtonType] - e.offsetX
          > moveSensitive;

        if (isMoveLeft) {
          mode = this.curBrushButtonType === BUTTON_TYPE.LEFT
            ? BRUSH_UPDATE_MODE.BUTTON.INCREASE : BRUSH_UPDATE_MODE.BUTTON.DECREASE;

          this.brushIdx.isUseButton = true;
        }
      }
    }

    if (this.debounceBrushIdx) {
      this.drawBrushRect({
        brushCanvas: this.brushCanvas,
        isDebounce: true,
        mode,
        offsetX: e.offsetX,
      });
    } else {
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
      case BRUSH_UPDATE_MODE.WHEEL.UP:
      case BRUSH_UPDATE_MODE.GRAB.UP:
        if (brushIdx.end >= this.labelEndIdx) {
          return;
        }

        brushIdx.start += 1;
        brushIdx.end += 1;

        break;
      case BRUSH_UPDATE_MODE.WHEEL.DOWN:
      case BRUSH_UPDATE_MODE.GRAB.DOWN:
        if (brushIdx.start <= 0) {
          return;
        }

        brushIdx.start -= 1;
        brushIdx.end -= 1;

        break;
      case BRUSH_UPDATE_MODE.BUTTON.INCREASE:
        if (this.curBrushButtonType === BUTTON_TYPE.LEFT) {
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

        break;
      case BRUSH_UPDATE_MODE.BUTTON.DECREASE:
        if (brushIdx.start === brushIdx.end - 1) {
          return;
        }

        if (this.curBrushButtonType === BUTTON_TYPE.LEFT) {
          brushIdx.start += 1;
        } else {
          brushIdx.end -= 1;
        }

        break;
      default:
        break;
    }
  }

  updateBrushIdxUseXPos() {
    if (!this.debounceBrushIdx) {
      return;
    }

    const calculateBrushIdxByPos = () => {
      let brushStartIdx;
      let brushEndIdx;
      if (this.brushPosInfo) {
        const {
          brushRectX,
          brushRectWidth,
          brushCanvasWidth,
          axesXInterval,
        } = this.brushPosInfo;

        if ((this.brushIdx.isUseButton || this.isUseBrushGrab)) {
          brushStartIdx = brushRectX / axesXInterval;
          brushEndIdx = this.labelEndIdx - (
            (brushCanvasWidth - (brushRectX + brushRectWidth)) / axesXInterval
          );

          if (this.curBrushButtonType === BUTTON_TYPE.LEFT) {
            brushStartIdx = Math.round(brushStartIdx);
            brushEndIdx = this.brushIdx.end;

            if (brushStartIdx === brushEndIdx) {
              brushStartIdx -= 1;
            }
          } else if (this.curBrushButtonType === BUTTON_TYPE.RIGHT) {
            brushStartIdx = this.brushIdx.start;
            brushEndIdx = Math.round(brushEndIdx);

            if (brushStartIdx === brushEndIdx) {
              brushEndIdx += 1;
            }
          } else {
            brushStartIdx = Math.round(brushStartIdx);
            brushEndIdx = Math.round(brushEndIdx);
          }

          if (brushEndIdx > this.labelEndIdx) {
            const excessIdx = brushEndIdx - this.labelEndIdx;

            brushStartIdx -= excessIdx;
            brushEndIdx -= excessIdx;
          }

          if (brushStartIdx < 0) {
            const excessIdx = Math.abs(brushStartIdx);

            brushStartIdx = 0;
            brushEndIdx += excessIdx;
          }
        }
      }
      return {
        brushStartIdx,
        brushEndIdx,
      };
    };

    const {
      brushStartIdx,
      brushEndIdx,
    } = calculateBrushIdxByPos();

    if (this.brushIdx.start === brushStartIdx && this.brushIdx.end === brushEndIdx) {
      this.drawBrushRect({ brushCanvas: this.brushCanvas });
    }

    this.brushIdx.start = brushStartIdx ?? this.debounceBrushIdx.start;
    this.brushIdx.end = brushEndIdx ?? this.debounceBrushIdx.end;
  }

  /**
   * @param {boolean} updateBrushIdxUseXPos to initialize state after update brush index value
   *
   * @returns {undefined}
   */
  initEventState() {
    const promise = new Promise((resolve) => {
      this.updateBrushIdxUseXPos();

      resolve(true);
    });

    promise.then((isUpdateBrushIdx) => {
      if (isUpdateBrushIdx) {
        this.clickBrushInsideX = null;
        this.beforeMouseXPos = null;
        this.curBrushButtonType = null;

        this.isUseBrushGrab = false;
        this.offsetXAndRectXInterval = null;
        this.brushIdx.isUseButton = false;
        this.brushIdx.isUseScroll = false;
      }
    });
  }
}
