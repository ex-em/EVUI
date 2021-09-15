import { getCurrentInstance, ref, computed, reactive, watch, nextTick } from 'vue';

const useModel = () => {
  const { props, emit } = getCurrentInstance();

  const windowRef = ref();
  const headerRef = ref();
  const isFullExpandWindow = ref(false);
  const maximizableIcon = computed(() => (isFullExpandWindow.value ? 'ev-icon-compress' : 'ev-icon-expand'));

  // body에 #ev-window-modal div append
  let root = document.getElementById('ev-window-modal');
  const initWrapperDiv = () => {
    if (!root) {
      const rootDiv = document.createElement('div');
      rootDiv.id = 'ev-window-modal';
      document.body.appendChild(rootDiv);
      root = document.getElementById('ev-window-modal');
    }
  };

  initWrapperDiv();

  const numberToPixel = (input) => {
    let output;
    let result;

    if (typeof input === 'string' || typeof input === 'number') {
      const match = (/^(normal|(-*\d+(?:\.\d+)?)(px|%|vw|vh)?)$/).exec(input);
      output = match ? { value: +match[2], unit: match[3] || undefined } : undefined;
    } else {
      output = undefined;
    }

    if (output === null || output === undefined) {
      result = undefined;
    } else if (output.unit) {
      result = `${output.value}${output.unit}`;
    } else {
      result = `${output.value}px`;
    }

    return result;
  };

  const removePixel = (input) => {
    let result;

    if (typeof input === 'string' && input) {
      const match = (/^(normal|(\d+(?:\.\d+)?)(px|%|vw|vh)?)$/).exec(input);
      if (match[2]) {
        result = +match[2];
      }
    } else {
      result = input;
    }

    return result || 0;
  };

  // set base style
  const basePosition = reactive({});
  const baseStyle = computed(() => ({
    ...props.style,
    ...basePosition,
  }));

  const getPositionInfo = (position, winSize, compSize) => {
    if (props.fullscreen) {
      return {
        top: 0,
        left: 0,
      };
    }

    const styleObj = {};
    let tempPosition;
    let tempUnit;
    if (Number.isInteger(+compSize)) {
      tempPosition = Math.floor((winSize - compSize) / 2);
    } else if (compSize.includes('px')) {
      tempPosition = Math.floor((winSize - removePixel(compSize)) / 2);
    } else {
      tempUnit = compSize.replace(/[0-9]/g, '');
      tempPosition = Math.floor((100 - removePixel(compSize)) / 2);
    }

    const size = position === 'top' ? 'height' : 'width';
    if (tempPosition > 0) {
      styleObj[position] = tempUnit ? `${tempPosition}${tempUnit}` : `${tempPosition}px`;
      styleObj[size] = compSize;
    } else {
      styleObj[position] = 0;
      styleObj[size] = '100%';
    }

    return styleObj;
  };

  const setBasePosition = () => {
    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const evWinWidth = props.style?.width ?? Math.floor(winWidth / 2);
    const evWinHeight = props.style?.height ?? Math.floor(winHeight / 2);

    const tempTop = getPositionInfo('top', winHeight, evWinHeight);
    const tempLeft = getPositionInfo('left', winWidth, evWinWidth);

    basePosition.width = tempLeft.width;
    basePosition.height = tempTop.height;
    basePosition.top = tempTop.top;
    basePosition.left = tempLeft.left;
  };

  // close window
  const closeWin = (from) => {
    if (from === 'layer' && !props.closeOnClickModal) {
      return;
    }
    emit('update:visible', false);
  };

  // props.hideScroll === true 시, body 우측 padding & overflow hidden class 추가
  const getScrollWidth = () => window.innerWidth - document.documentElement.clientWidth;
  const changeBodyCls = (isVisible) => {
    const windowCount = root?.getElementsByClassName('hide-scroll-layer')?.length;
    const bodyElem = document.body;

    if (isVisible) {
      if (props.hideScroll) {
        if (!windowCount) {
          const scrollWidth = getScrollWidth();
          bodyElem.style.paddingRight = `${scrollWidth}px`;
        }
        bodyElem.classList.add('ev-window-scroll-lock');
      }
    } else if (windowCount === 1) {
      bodyElem.style.removeProperty('padding-right');
      bodyElem.classList.remove('ev-window-scroll-lock');
    }
  };

  watch(
    () => props.visible,
    (newVal) => {
      changeBodyCls(newVal);
      if (newVal) {
        setBasePosition();
      }
    },
  );

  return {
    windowRef,
    headerRef,
    isFullExpandWindow,
    maximizableIcon,
    baseStyle,
    closeWin,
    numberToPixel,
    removePixel,
  };
};

const useMouseEvent = (param) => {
  const { props, emit } = getCurrentInstance();
  const {
    windowRef,
    headerRef,
    isFullExpandWindow,
    numberToPixel,
    removePixel,
  } = param;

  const draggingMinSize = 30;
  const grabbingBorderSize = 5;
  const dragStyle = reactive({});
  const clickedInfo = reactive({
    state: '',
    pressedSpot: '',
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    clientX: 0,
    clientY: 0,
  });
  const grabbingBorderPosInfo = reactive({
    top: false,
    right: false,
    left: false,
    bottom: false,
  });
  const beforeExpandPosInfo = reactive({
    width: null,
    height: null,
    top: null,
    left: null,
  });

  const isInHeader = (x, y) => {
    if (x == null || y == null) {
      return false;
    }

    const rect = windowRef.value.getBoundingClientRect();
    const posX = +x - rect.left;
    const posY = +y - rect.top;
    const headerAreaStyleInfo = headerRef.value.style;
    const headerPaddingInfo = {
      top: removePixel(headerAreaStyleInfo.paddingTop),
      left: removePixel(headerAreaStyleInfo.paddingLeft),
      right: removePixel(headerAreaStyleInfo.paddingRight),
    };
    const startPosX = headerPaddingInfo.left;
    const endPosX = rect.width - headerPaddingInfo.right;
    const startPosY = headerPaddingInfo.top;
    const endPosY = startPosY + headerRef.value.offsetHeight;

    return posX > startPosX && posX < endPosX && posY > startPosY && posY < endPosY;
  };

  const setDragStyle = (paramObj) => {
    if (paramObj === null || typeof paramObj !== 'object') {
      return;
    }

    let top;
    let left;
    let width;
    let height;
    let tMinWidth;
    let tMinHeight;
    const windowEl = windowRef.value;
    const hasOwnProperty = Object.prototype.hasOwnProperty;

    if (hasOwnProperty.call(paramObj, 'top')) {
      top = paramObj.top;
    } else {
      top = clickedInfo.top;
    }

    if (hasOwnProperty.call(paramObj, 'left')) {
      left = paramObj.left;
    } else {
      left = clickedInfo.left;
    }

    if (hasOwnProperty.call(paramObj, 'width')) {
      width = paramObj.width;
    } else {
      width = windowEl.offsetWidth;
    }

    if (hasOwnProperty.call(paramObj, 'height')) {
      height = paramObj.height;
    } else {
      height = windowEl.offsetHeight;
    }

    if (hasOwnProperty.call(paramObj, 'minWidth')) {
      tMinWidth = paramObj.minWidth;
    } else {
      tMinWidth = props.minWidth;
    }

    if (hasOwnProperty.call(paramObj, 'minHeight')) {
      tMinHeight = paramObj.minHeight;
    } else {
      tMinHeight = props.minHeight;
    }

    width = Math.max(width, tMinWidth);
    height = Math.max(height, tMinHeight);

    dragStyle.top = numberToPixel(top);
    dragStyle.left = numberToPixel(left);
    dragStyle.width = numberToPixel(width);
    dragStyle.height = numberToPixel(height);
    dragStyle.minWidth = numberToPixel(tMinWidth);
    dragStyle.minHeight = numberToPixel(tMinHeight);
  };

  const changeMouseCursor = (e) => {
    if (!windowRef.value || clickedInfo.pressedSpot) {
      return;
    }

    if (props.resizable) {
      const rect = windowRef.value.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const top = y < grabbingBorderSize;
      const left = x < grabbingBorderSize;
      const right = x >= (rect.width - grabbingBorderSize);
      const bottom = y >= (rect.height - grabbingBorderSize);

      if ((top && left) || (bottom && right)) {
        windowRef.value.style.cursor = 'nwse-resize';
      } else if ((top && right) || (bottom && left)) {
        windowRef.value.style.cursor = 'nesw-resize';
      } else if (right || left) {
        windowRef.value.style.cursor = 'ew-resize';
      } else if (bottom || top) {
        windowRef.value.style.cursor = 'ns-resize';
      } else if (props.draggable && isInHeader(e.clientX, e.clientY)) {
        windowRef.value.style.cursor = 'move';
      } else {
        windowRef.value.style.cursor = 'default';
      }
    } else if (props.draggable && isInHeader(e.clientX, e.clientY)) {
      windowRef.value.style.cursor = 'move';
    } else {
      windowRef.value.style.cursor = 'default';
    }
  };

  // window resize
  const resizeWindow = (e) => {
    const isTop = grabbingBorderPosInfo.top;
    const isLeft = grabbingBorderPosInfo.left;
    const isRight = grabbingBorderPosInfo.right;
    const isBottom = grabbingBorderPosInfo.bottom;
    const diffX = e.clientX - clickedInfo.clientX;
    const diffY = e.clientY - clickedInfo.clientY;
    const minWidth = removePixel(props.minWidth);
    const minHeight = removePixel(props.minHeight);
    let top = clickedInfo.top;
    let left = clickedInfo.left;
    let width = windowRef.value.offsetWidth;
    let height = windowRef.value.offsetHeight;
    const maxTop = (top + clickedInfo.height) - minHeight;
    const maxLeft = (left + clickedInfo.width) - minWidth;

    if (isTop) {
      top = clickedInfo.top + diffY;
      height = clickedInfo.height - diffY;

      if (top > maxTop) {
        top = maxTop;
      }
    }

    if (isLeft) {
      left = clickedInfo.left + diffX;
      width = clickedInfo.width - diffX;

      if (left > maxLeft) {
        left = maxLeft;
      }
    }

    if (isRight) {
      width = clickedInfo.width + diffX;
    }

    if (isBottom) {
      height = clickedInfo.height + diffY;
    }

    width = Math.max(width, minWidth);
    height = Math.max(height, minHeight);

    const positionInfo = { top, left, width, height };
    setDragStyle(positionInfo);
    emit('resize', e, { ...positionInfo });
  };

  // mousedown > mousemove: 마우스 드래그 중
  const dragging = (e) => {
    clickedInfo.state = 'mousedown-mousemove';

    if (props.draggable && clickedInfo.pressedSpot === 'header') {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const diffTop = clickedInfo.clientY - e.clientY;
      const diffLeft = clickedInfo.clientX - e.clientX;

      let tempTop = clickedInfo.top + -diffTop;
      let tempLeft = clickedInfo.left + -diffLeft;

      if (tempTop < 0) {
        tempTop = 0;
      } else if (tempTop > windowHeight - draggingMinSize) {
        tempTop = Math.floor(windowHeight - draggingMinSize);
      }

      if (tempLeft < -(clickedInfo.width - draggingMinSize)) {
        tempLeft = -Math.floor(clickedInfo.width - draggingMinSize);
      } else if (tempLeft > windowWidth - draggingMinSize) {
        tempLeft = Math.floor(windowWidth - draggingMinSize);
      }

      setDragStyle({
        top: `${tempTop}px`,
        left: `${tempLeft}px`,
      });
    } else if (props.resizable && clickedInfo.pressedSpot === 'border') {
      resizeWindow(e);
    }

    emit('mousedown-mousemove', { ...clickedInfo });
  };

  // mousedown > mouseup: 마우스 드래그 종료
  const endDrag = (e) => {
    clickedInfo.state = '';
    clickedInfo.pressedSpot = '';

    emit('mousedown-mouseup', e);

    window.removeEventListener('mousemove', dragging);
    window.removeEventListener('mouseup', endDrag);
  };

  // mousedown: 드래그 시작
  const startDrag = (e) => {
    if (!windowRef.value || (!props.resizable && !props.draggable)) {
      return;
    }
    let pressedSpot = '';
    if (props.resizable) {
      const clientRect = windowRef.value.getBoundingClientRect();
      const x = e.clientX - clientRect.left;
      const y = e.clientY - clientRect.top;
      const isGrabTop = y < grabbingBorderSize;
      const isGrabLeft = x < grabbingBorderSize;
      const isGrabRight = x >= (clientRect.width - grabbingBorderSize);
      const isGrabBottom = y >= (clientRect.height - grabbingBorderSize);

      grabbingBorderPosInfo.top = isGrabTop;
      grabbingBorderPosInfo.left = isGrabLeft;
      grabbingBorderPosInfo.right = isGrabRight;
      grabbingBorderPosInfo.bottom = isGrabBottom;

      if (isGrabTop || isGrabLeft || isGrabRight || isGrabBottom) {
        pressedSpot = 'border';
      }
    }

    if (pressedSpot !== 'border' && isInHeader(e.clientX, e.clientY)) {
      pressedSpot = 'header';
    }

    if (!pressedSpot
      || (!props.draggable && pressedSpot === 'header')
      || (!props.resizable && pressedSpot === 'border')
    ) {
      return;
    }

    clickedInfo.state = 'mousedown';
    clickedInfo.pressedSpot = pressedSpot;
    clickedInfo.top = windowRef.value.offsetTop;
    clickedInfo.left = windowRef.value.offsetLeft;
    clickedInfo.width = windowRef.value.offsetWidth;
    clickedInfo.height = windowRef.value.offsetHeight;
    clickedInfo.clientX = e.clientX;
    clickedInfo.clientY = e.clientY;

    emit('mousedown', { ...clickedInfo });

    window.addEventListener('mousemove', dragging);
    window.addEventListener('mouseup', endDrag);
  };

  const moveMouse = (e) => {
    if (!props.draggable && !props.resizable) {
      return;
    }
    changeMouseCursor(e);
  };

  const clickExpandBtn = () => {
    isFullExpandWindow.value = !isFullExpandWindow.value;
    nextTick(() => {
      if (!isFullExpandWindow.value) {
        setDragStyle({
          top: beforeExpandPosInfo.top,
          left: beforeExpandPosInfo.left,
          width: beforeExpandPosInfo.width,
          height: beforeExpandPosInfo.height,
        });
      } else {
        beforeExpandPosInfo.top = windowRef.value.offsetTop;
        beforeExpandPosInfo.left = windowRef.value.offsetLeft;
        beforeExpandPosInfo.width = windowRef.value.offsetWidth;
        beforeExpandPosInfo.height = windowRef.value.offsetHeight;

        setDragStyle({
          top: 0,
          left: 0,
          width: document.body.clientWidth,
          height: document.body.clientHeight,
        });
      }
    });
  };

  const initWindowInfo = () => {
    clickedInfo.state = '';
    clickedInfo.pressedSpot = '';
    clickedInfo.top = 0;
    clickedInfo.left = 0;
    clickedInfo.width = 0;
    clickedInfo.height = 0;
    clickedInfo.clientX = 0;
    clickedInfo.clientY = 0;

    grabbingBorderPosInfo.top = false;
    grabbingBorderPosInfo.left = false;
    grabbingBorderPosInfo.right = false;
    grabbingBorderPosInfo.bottom = false;

    beforeExpandPosInfo.top = null;
    beforeExpandPosInfo.left = null;
    beforeExpandPosInfo.width = null;
    beforeExpandPosInfo.height = null;

    Object.keys(dragStyle).forEach((key) => {
      delete dragStyle[key];
    });
  };

  watch(
    () => props.visible,
    (newVal) => {
      if (!newVal) {
        initWindowInfo();
      }
    },
  );

  return {
    dragStyle,
    startDrag,
    moveMouse,
    clickExpandBtn,
  };
};

export {
  useModel,
  useMouseEvent,
};
