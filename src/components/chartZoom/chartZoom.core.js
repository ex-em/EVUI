export default class EvChartZoom {
  constructor(evChartInfo, evChartClone) {
    this.evChartProps = evChartInfo.props;
    this.evChartCloneData = evChartClone.data;
    const cloneLabelsLastIdx = evChartClone.data[0].labels.length - 1;
    this.cloneLabelsLastIdx = cloneLabelsLastIdx;
    this.isAnimationFinish = true;

    this.zoomAreaMemory = {
      previous: [],
      current: [[0, cloneLabelsLastIdx]],
      latest: [],
    };

    this.wrapWheelMoveZoomArea = this.wheelMoveZoomArea.bind(this);
    this.evChartDomContainers = this.drawAnimationCanvas(evChartInfo.dom);
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

  moveZoomArea(isUseZoomMode, mode) {
    const toggleEventListener = isUseZoomMode ? 'addEventListener' : 'removeEventListener';

    if (!this.isAnimationFinish) {
      return;
    }

    switch (mode) {
      case 'wheel':
        this.evChartDomContainers.forEach((dom) => {
          dom[toggleEventListener]('wheel', this.wrapWheelMoveZoomArea);
        });
        break;
      case 'previous':
      case 'latest':
        if (isUseZoomMode) {
          this.clickMoveZoomArea(mode);
        }
        break;
      default:
        break;
    }
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

    this.executeZoom(zoomMoveStartIdx, zoomMoveEndIdx);
    this.zoomAreaMemory.current[0] = [zoomMoveStartIdx, zoomMoveEndIdx];
  }

  clickMoveZoomArea(direction) {
    if (!this.zoomAreaMemory[direction].length) {
      return;
    }

    const [zoomStartIdx, zoomEndIdx] = this.zoomAreaMemory[direction].pop();

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

    const dragChartIdx = this.evChartProps.length > 1 ? this.evChartProps.findIndex(
      ({ options: { title } }) => title.text === chartTitle,
    ) : 0;

    if (this.evChartProps[dragChartIdx].options?.axesX[0]?.type === 'time') {
      const zoomSeries = zoomInfoData[dragChartIdx].items;
      const zoomStartDate = zoomSeries[0].x;
      const zoomEndDate = zoomSeries[zoomSeries.length - 1].x;
      const currentChartDataLabels = this.evChartProps[dragChartIdx].data.labels;
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

    for (let i = 0; i < displayAnimaionCanvas.length; i++) {
      const [displayCanvas, animationCanvas] = displayAnimaionCanvas[i];

      const animationCtx = animationCanvas.getContext('2d');

      animationCanvas.style.top = `${chartRange.y1}px`;
      animationCanvas.style.left = `${chartRange.x1}px`;

      animationCanvas.width = exceptAxesYChartWidth * pixelRatio;
      animationCanvas.style.width = `${exceptAxesYChartWidth}px`;
      animationCanvas.height = exceptAxesXChartHeight * pixelRatio;
      animationCanvas.style.height = `${exceptAxesXChartHeight}px`;

      animationCtx.fillRect(0, 0, exceptAxesYChartWidth, exceptAxesXChartHeight);

      if (animationCanvas.style.display === 'none') {
        animationCanvas.style.display = 'block';
      }

      this.isAnimationFinish = false;
      this.executeDragZoomAnimation(
        displayCanvas,
        animationCtx,
        dragSelectionInfo,
        newDragStartAxesX,
        newDragEndAxesX,
      ).then((isAnimationFinish) => {
        animationCanvas.style.display = 'none';

        if (isAnimationFinish && i === displayAnimaionCanvas.length - 1) {
          this.isAnimationFinish = isAnimationFinish;
          this.executeZoom(newZoomStartIdx, newZoomEndIdx);
          this.setZoomAreaMemory(newZoomStartIdx, newZoomEndIdx);
        }
      });
    }
  }

  setZoomAreaMemory(zoomStartIdx, zoomEndIdx, direction) {
    const currentZoomArea = this.zoomAreaMemory.current.pop();

    if (direction) {
      this.zoomAreaMemory[direction].push(currentZoomArea);
    } else {
      this.zoomAreaMemory.previous.push(currentZoomArea);
      this.zoomAreaMemory.latest.length = 0;
    }

    this.zoomAreaMemory.current.push([zoomStartIdx, zoomEndIdx]);
  }

  executeZoom(zoomStartIdx, zoomEndIdx) {
    for (let idx = 0; idx < this.evChartCloneData.length; idx++) {
      const {
        data: cloneData,
        labels: cloneLabels,
        series: cloneSeries,
      } = this.evChartCloneData[idx];
      const { data } = this.evChartProps[idx];

      const cloneSeriesNames = Object.keys(cloneSeries);

      for (let jdx = 0; jdx < cloneSeriesNames.length; jdx++) {
        const cloneSeriesName = cloneSeriesNames[jdx];

        data.data[cloneSeriesName] = cloneData[cloneSeriesName].filter(
          (d, dataIdx) => zoomStartIdx <= dataIdx && zoomEndIdx >= dataIdx,
        );
      }

      data.labels = cloneLabels.filter(
        (l, labelIdx) => zoomStartIdx <= labelIdx && zoomEndIdx >= labelIdx,
      );
    }
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

    return new Promise((response) => {
      animate(response);
    });
  }

  updateEvChartCloneData(evChartClone) {
    const cloneLabelsLastIdx = evChartClone.data[0].labels.length - 1;
    this.cloneLabelsLastIdx = cloneLabelsLastIdx;
    this.evChartCloneData = evChartClone.data;

    this.zoomAreaMemory = {
      previous: [],
      current: [[0, cloneLabelsLastIdx]],
      latest: [],
    };
  }

  initZoom() {
    if (!this.isAnimationFinish) {
      return;
    }

    const [currentZoomStartIdx, currentZoomEndIdx] = this.zoomAreaMemory.current[0];
    const cloneLabelsLastIdx = this.cloneLabelsLastIdx;

    if (currentZoomStartIdx !== 0 || currentZoomEndIdx !== cloneLabelsLastIdx) {
      this.executeZoom(0, cloneLabelsLastIdx);
      this.setZoomAreaMemory(0, cloneLabelsLastIdx);
    }
  }
}
