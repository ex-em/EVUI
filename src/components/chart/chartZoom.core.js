export default class EvChartZoom {
  constructor(
    evChartInfo,
    evChartClone,
    evChartZoomOptions,
    evChartToolbarRef,
    isExecuteZoom,
    brushIdx,
    emitFunc,
  ) {
    this.isExecuteZoom = isExecuteZoom;
    this.evChartProps = evChartInfo.props;
    this.evChartCloneData = evChartClone.data;
    this.brushIdx = brushIdx;

    this.setEvChartZoomOptions(evChartZoomOptions);
    this.setIcon(evChartToolbarRef);

    const cloneLabelsLastIdx = evChartClone.data[0].labels.length - 1;
    this.cloneLabelsLastIdx = cloneLabelsLastIdx;

    this.isAnimationFinish = true;

    this.zoomAreaMemory = {
      previous: [],
      current: [[0, cloneLabelsLastIdx]],
      latest: [],
    };

    if (emitFunc) {
      this.emitFunc = emitFunc;

      emitFunc.updateZoomStartIdx(0);
      emitFunc.updateZoomEndIdx(cloneLabelsLastIdx);
    }

    this.wrapWheelMoveZoomArea = this.wheelMoveZoomArea.bind(this);
    this.evChartDomContainers = this.drawAnimationCanvas(evChartInfo.dom);
  }

  setEvChartZoomOptions(options) {
    this.evChartZoomOptions = options;
  }

  setIcon(evChartToolbarRef) {
    if (!evChartToolbarRef) {
      return;
    }

    const dragZoomIcon = evChartToolbarRef.querySelector('.dragZoom');

    this.resetIcon = evChartToolbarRef.querySelector('.reset');
    this.previousIcon = evChartToolbarRef.querySelector('.previous');
    this.latestIcon = evChartToolbarRef.querySelector('.latest');
    this.dragZoomIcon = dragZoomIcon;

    this.iconStyle(dragZoomIcon, 'enable');
  }

  drawAnimationCanvas(evChartDom) {
    evChartDom.forEach((dom) => {
      const animationCanvas = document.createElement('canvas');
      animationCanvas.setAttribute('style', 'display: block;');
      animationCanvas.setAttribute('class', 'animation-canvas');
      animationCanvas.style.position = 'absolute';

      dom.appendChild(animationCanvas);
    });

    return evChartDom;
  }

  setEventListener(isUseZoomMode) {
    const toggleEventListener = isUseZoomMode ? 'addEventListener' : 'removeEventListener';
    this.isUseZoomMode = isUseZoomMode;

    this.evChartDomContainers.forEach((dom) => {
      dom[toggleEventListener]('wheel', this.wrapWheelMoveZoomArea);
    });
  }

  wheelMoveZoomArea(e) {
    e.preventDefault();
    const [zoomStartIdx, zoomEndIdx] = this.zoomAreaMemory.current[0];

    if (zoomStartIdx === zoomEndIdx) {
      return;
    }

    let zoomMoveStartIdx;
    let zoomMoveEndIdx;
    if (e.deltaY > 0) {
      if (!zoomStartIdx) {
        return;
      }

      zoomMoveStartIdx = zoomStartIdx - 1;
      zoomMoveEndIdx = zoomEndIdx - 1;
    } else {
      if (zoomEndIdx === this.cloneLabelsLastIdx) {
        return;
      }

      zoomMoveStartIdx = zoomStartIdx + 1;
      zoomMoveEndIdx = zoomEndIdx + 1;
    }

    this.isUseToolbar = true;
    this.executeZoom(zoomMoveStartIdx, zoomMoveEndIdx);
    this.zoomAreaMemory.current[0] = [zoomMoveStartIdx, zoomMoveEndIdx];
  }

  clickMoveZoomArea(direction) {
    if (!this.zoomAreaMemory[direction].length) {
      return;
    }

    const [zoomStartIdx, zoomEndIdx] = this.zoomAreaMemory[direction].pop();

    this.isUseToolbar = true;
    this.executeZoom(zoomStartIdx, zoomEndIdx);
    this.setZoomAreaMemory(zoomStartIdx, zoomEndIdx, direction === 'previous' ? 'latest' : 'previous');
  }

  dragZoom({ data: zoomInfoData, range: { dragSelectionInfo } }) {
    const {
      dragXsp,
      dragXep,
      exceptAxesYChartWidth,
      chartTitle,
    } = dragSelectionInfo;
    const { options: evChartOptions, data: evChartData } = this.evChartProps;

    const dragChartIdx = evChartOptions.length > 1 ? evChartOptions.findIndex(
      option => (option?.title?.text ?? '') === chartTitle,
    ) : 0;

    if (evChartOptions[dragChartIdx].axesX[0].type === 'time') {
      const zoomSeries = zoomInfoData[0].items;
      const zoomStartDate = zoomSeries[0].x;
      const zoomEndDate = zoomSeries[zoomSeries.length - 1].x;
      const currentChartDataLabels = evChartData[dragChartIdx].labels;
      const cloneChartDataLabels = this.evChartCloneData[dragChartIdx].labels;
      const [currentZoomStartIdx, currentZoomEndIdx] = this.zoomAreaMemory.current[0];

      let newZoomStartIdx = cloneChartDataLabels.findIndex(
        label => +label.$d === +zoomStartDate.$d,
      );

      let newZoomEndIdx = cloneChartDataLabels.findLastIndex(
        label => +label.$d === +zoomEndDate.$d,
      );

      const calculateAxesXPosition = (zoomIdx) => {
        const axesXInterval = exceptAxesYChartWidth / (currentChartDataLabels.length - 1);

        return axesXInterval * (zoomIdx - currentZoomStartIdx);
      };

      let newDragStartAxesX = calculateAxesXPosition(newZoomStartIdx);

      if (newZoomStartIdx === newZoomEndIdx) {
        // drag 영역에 한 포인트만 있을 경우
        if (newDragStartAxesX - dragXsp >= dragXep - newDragStartAxesX) {
            newZoomStartIdx -= 1;
        } else {
            newZoomEndIdx += 1;
        }
      }

      if (newZoomStartIdx === currentZoomStartIdx && newZoomEndIdx === currentZoomEndIdx) {
        return;
      }

      if (newZoomStartIdx - newZoomEndIdx === -1) {
        newDragStartAxesX = calculateAxesXPosition(newZoomStartIdx);
      }

      const newDragEndAxesX = calculateAxesXPosition(newZoomEndIdx);

      this.dragZoomAnimation(
        dragSelectionInfo,
        newZoomStartIdx,
        newZoomEndIdx,
        newDragStartAxesX,
        newDragEndAxesX,
      );
    }
  }

  dragZoomAnimation(
    dragSelectionInfo,
    newZoomStartIdx,
    newZoomEndIdx,
    newDragStartAxesX,
    newDragEndAxesX,
  ) {
    const {
      chartRange,
      exceptAxesYChartWidth,
      exceptAxesXChartHeight,
    } = dragSelectionInfo;
    const pixelRatio = window.devicePixelRatio || 1;

    const displayAnimaionCanvas = Array.from(this.evChartDomContainers).map((container) => {
      const animationCanvas = container.querySelector('.animation-canvas');
      const displayCanvas = container.children[0];

      return [displayCanvas, animationCanvas];
    });

    for (let idx = 0; idx < displayAnimaionCanvas.length; idx++) {
      const [displayCanvas, animationCanvas] = displayAnimaionCanvas[idx];

      const animationCtx = animationCanvas.getContext('2d');

      animationCanvas.style.top = `${chartRange.y1}px`;
      animationCanvas.style.left = `${chartRange.x1}px`;

      animationCanvas.width = exceptAxesYChartWidth * pixelRatio;
      animationCanvas.style.width = `${exceptAxesYChartWidth}px`;
      animationCanvas.height = exceptAxesXChartHeight * pixelRatio;
      animationCanvas.style.height = `${exceptAxesXChartHeight}px`;


      if (animationCanvas.style.display === 'none') {
        animationCanvas.style.display = 'block';
      }

      this.isAnimationFinish = false;
      this.isUseToolbar = true;
      this.executeDragZoomAnimation(
        displayCanvas,
        animationCtx,
        dragSelectionInfo,
        newDragStartAxesX,
        newDragEndAxesX,
      ).then((isAnimationFinish) => {
        animationCanvas.style.display = 'none';

        if (isAnimationFinish && idx === displayAnimaionCanvas.length - 1) {
          this.isAnimationFinish = isAnimationFinish;
          this.executeZoom(newZoomStartIdx, newZoomEndIdx);
          this.setZoomAreaMemory(newZoomStartIdx, newZoomEndIdx);
        }
      });
    }
  }

  executeZoom(zoomStartIdx, zoomEndIdx) {
    if (this.isExecuteZoom) {
      this.isExecuteZoom.value = true;
    }

    for (let idx = 0; idx < this.evChartCloneData.length; idx++) {
      const {
        data: cloneData,
        labels: cloneLabels,
        series: cloneSeries,
      } = this.evChartCloneData[idx];
      const evChartData = this.evChartProps.data[idx];

      const cloneSeriesNames = Object.keys(cloneSeries);

      for (let jdx = 0; jdx < cloneSeriesNames.length; jdx++) {
        const cloneSeriesName = cloneSeriesNames[jdx];

        evChartData.data[cloneSeriesName] = cloneData[cloneSeriesName].filter(
          (d, dataIdx) => zoomStartIdx <= dataIdx && zoomEndIdx >= dataIdx,
        );
      }

      evChartData.labels = cloneLabels.filter(
        (l, labelIdx) => zoomStartIdx <= labelIdx && zoomEndIdx >= labelIdx,
      );
    }

    if (!this.brushIdx.isUseButton && !this.brushIdx.isUseScroll) {
      this.brushIdx.start = zoomStartIdx;
      this.brushIdx.end = zoomEndIdx;
    }

    if (this.emitFunc) {
      this.emitFunc.updateZoomStartIdx(zoomStartIdx);
      this.emitFunc.updateZoomEndIdx(zoomEndIdx);
    }
  }

  setBrushIdx(evChartClone, brushChartIdx) {
    this.brushIdx.end = -1;
    for (let i = 0; i < brushChartIdx.value.length; i++) {
      const data = evChartClone.data[brushChartIdx.value[i]];

      if (data.labels.length) {
        this.brushIdx.start = 0;
        this.brushIdx.end = data.labels.length - 1;
      }
    }
  }

  updateEvChartCloneData(
    evChartClone,
    brushChartIdx,
    isUseZoomMode,
    isResetZoomMemory,
  ) {
    const cloneLabelsLastIdx = evChartClone.data[0].labels.length - 1;
    this.cloneLabelsLastIdx = cloneLabelsLastIdx;
    this.evChartCloneData = evChartClone.data;

    if (isResetZoomMemory) {
      if (this.dragZoomIcon) {
        this.dragZoomIcon.classList.remove('active');
      }

      this.zoomAreaMemory = {
        previous: [],
        current: [[0, cloneLabelsLastIdx]],
        latest: [],
      };

      if (this.emitFunc) {
        this.emitFunc.updateZoomStartIdx(0);
        this.emitFunc.updateZoomEndIdx(cloneLabelsLastIdx);
      }

      this.setIconStyle(isUseZoomMode);
    } else if (this.brushIdx.end !== -1) {
      this.setZoomAreaMemory(0, cloneLabelsLastIdx);
    }

    this.setBrushIdx(evChartClone, brushChartIdx);
  }

  setZoomAreaMemory(zoomStartIdx, zoomEndIdx, direction) {
    if (zoomStartIdx < 0 || zoomEndIdx <= 0) {
      return;
    }

    const { previous, current, latest } = this.zoomAreaMemory;
    const currentZoomArea = current.pop();
    const { bufferMemoryCnt } = this.evChartZoomOptions.zoom;

    if (direction) {
      if (previous.length >= bufferMemoryCnt) {
        previous.splice(0, previous.length - bufferMemoryCnt + 1);
      }

      this.zoomAreaMemory[direction].push(currentZoomArea);
    } else if (zoomStartIdx !== currentZoomArea[0] || zoomEndIdx !== currentZoomArea[1]) {
      if (currentZoomArea[0] === 0 && currentZoomArea[1] === -1) {
        previous.push([0, this.cloneLabelsLastIdx]);
      } else {
        previous.push(currentZoomArea);
      }
      latest.length = 0;
    }

    current.push([zoomStartIdx, zoomEndIdx]);

    this.setIconStyle(this.isUseZoomMode);
  }

  executeDragZoomAnimation(
    displayCanvas,
    animationCtx,
    dragSelectionInfo,
    newDragStartAxesX,
    newDragEndAxesX,
  ) {
    const {
      chartRange,
      exceptAxesYChartWidth,
      exceptAxesXChartHeight,
    } = dragSelectionInfo;

    let leftDx = 0;
    let centerDx = newDragStartAxesX;
    let centerDWidth = newDragEndAxesX - newDragStartAxesX;
    let rightDx = newDragEndAxesX;

    let globalAlpha = 1;
    const globalAlphaSensitivity = 0.0015;

    let evChartOpacity = 0.5;
    const evChartMinOpacity = 0.1;
    const evChartOpacitySensitivity = 0.05;

    const zoomSpeed = 50;
    const leftSpeed = Math.ceil(
      zoomSpeed * (newDragStartAxesX / exceptAxesYChartWidth),
    );
    const rightSpeed = Math.ceil(
      zoomSpeed * ((exceptAxesYChartWidth - newDragEndAxesX) / exceptAxesYChartWidth),
    );

    const animate = (responseFinishStatus) => {
      animationCtx.clearRect(0, 0, exceptAxesYChartWidth, exceptAxesXChartHeight);

      if (centerDx <= 0 && centerDWidth >= exceptAxesYChartWidth) {
        displayCanvas.style.opacity = 'initial';
        return responseFinishStatus(true);
      }

      if (evChartOpacity >= evChartMinOpacity) {
        displayCanvas.style.opacity = evChartOpacity;
        evChartOpacity -= evChartOpacitySensitivity;
      }

      animationCtx.globalAlpha = globalAlpha;

      // 줌 영역 왼쪽
      animationCtx.drawImage(
        displayCanvas,
        chartRange.x1,
        chartRange.y1,
        newDragStartAxesX,
        exceptAxesXChartHeight,
        leftDx,
        0,
        newDragStartAxesX,
        exceptAxesXChartHeight,
      );

      // 줌 영역
      animationCtx.drawImage(
        displayCanvas,
        chartRange.x1 + newDragStartAxesX,
        chartRange.y1,
        newDragEndAxesX - newDragStartAxesX,
        exceptAxesXChartHeight,
        centerDx,
        0,
        centerDWidth,
        exceptAxesXChartHeight,
      );

      // 줌 영역 오른쪽
      animationCtx.drawImage(
        displayCanvas,
        chartRange.x1 + newDragEndAxesX,
        chartRange.y1,
        exceptAxesYChartWidth,
        exceptAxesXChartHeight,
        rightDx,
        0,
        exceptAxesYChartWidth,
        exceptAxesXChartHeight,
      );

      globalAlpha -= globalAlphaSensitivity;
      leftDx -= leftSpeed;
      centerDx -= leftSpeed;
      centerDWidth += (leftSpeed + rightSpeed);
      rightDx += rightSpeed;

      return requestAnimationFrame(() => animate(responseFinishStatus));
    };

    return new Promise(response => animate(response));
  }

  setIconStyle(isUseZoomMode) {
    const toggleIconStyle = (icon, condition) => {
      if (condition) {
        this.iconStyle(icon, 'enable');
      } else {
        this.iconStyle(icon, 'disable');
      }
    };

    if (isUseZoomMode && this.dragZoomIcon.classList.contains('active')) {
      const { previous, latest } = this.zoomAreaMemory;

      toggleIconStyle(this.previousIcon, previous.length);
      toggleIconStyle(this.latestIcon, latest.length);
      this.iconStyle(this.resetIcon, 'enable');
    } else {
      toggleIconStyle(this.resetIcon);
      toggleIconStyle(this.previousIcon);
      toggleIconStyle(this.latestIcon);
    }
  }

  iconStyle(icon, mode) {
    if (!icon) {
      return;
    }

    const [opacity, pointerEvents] = mode === 'enable' ? [1, 'initial'] : [0.5, 'none'];

    icon.style.opacity = opacity;
    icon.style.pointerEvents = pointerEvents;
  }

  initZoom() {
    if (!this.isAnimationFinish) {
      return;
    }

    const [currentZoomStartIdx, currentZoomEndIdx] = this.zoomAreaMemory.current[0];
    const cloneLabelsLastIdx = this.cloneLabelsLastIdx;

    if (currentZoomStartIdx !== 0 || currentZoomEndIdx !== cloneLabelsLastIdx) {
      this.isUseToolbar = true;
      this.executeZoom(0, cloneLabelsLastIdx);
      this.setZoomAreaMemory(0, cloneLabelsLastIdx);
    }
  }
}
