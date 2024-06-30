import {
  getCurrentInstance,
  ref,
  computed,
  reactive,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from 'vue';

// 세로 스크롤 너비
const getVScrollWidth = () => window.innerWidth - document.documentElement.clientWidth;
// 가로 스크롤 너비
// const getHScrollWidth = () => window.innerHeight - document.documentElement.clientHeight;

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

  const numberToUnit = (input) => {
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

  const removeUnit = (input, direction = 'horizontal') => {
    if (typeof input === 'number') {
      return input;
    } else if (!input) {
      return 0;
    }

    let result = 0;
    const match = (/^(normal|(\d+(?:\.\d+)?)(px|%|vw|vh)?)$/).exec(input);

    if (direction && ['%', 'vw', 'vh'].includes(match[3]) && match[2]) {
      const standard = direction === 'horizontal' ? window.innerWidth : window.innerHeight;
      result = Math.floor((standard * +match[2]) / 100);
    } else if (match[2]) {
      result = +match[2];
    }

    return result;
  };

  // set base style
  const basePosition = reactive({});
  const baseStyle = computed(() => ({
    ...props.style,
    ...basePosition,
  }));

  const setBasePosition = () => {
    basePosition.position = 'fixed';

    if (props.fullscreen) {
      basePosition.width = '100%';
      basePosition.height = '100%';
      basePosition.top = 0;
      basePosition.left = 0;
      return;
    }

    const convertedWidth = removeUnit(props.width, 'horizontal');
    const convertedMinWidth = removeUnit(props.minWidth, 'horizontal');
    if (convertedWidth < convertedMinWidth) {
      console.warn('Since width is less than min-width, it is replaced by min-width.');
      basePosition.width = numberToUnit(props.minWidth);
    } else {
      basePosition.width = numberToUnit(props.width);
    }

    const convertedHeight = removeUnit(props.height, 'vertical');
    const convertedMinHeight = removeUnit(props.minHeight, 'vertical');
    if (convertedHeight < convertedMinHeight) {
      console.warn('Since height is less than min-height, it is replaced by min-height.');
      basePosition.height = numberToUnit(props.minHeight);
    } else {
      basePosition.height = numberToUnit(props.height);
    }

    basePosition.top = `calc((100% - ${basePosition.height}) / 2)`;
    basePosition.left = `calc((100% - ${basePosition.width}) / 2)`;

    if (removeUnit(props.width, 'horizontal') > window.innerWidth) {
      basePosition.left = 0;
    }
    if (removeUnit(props.height, 'vertical') > window.innerHeight) {
      basePosition.top = 0;
    }
  };

  // close window
  const closeWin = (from) => {
    if (from === 'layer' && !props.closeOnClickModal) {
      return;
    }
    emit('update:visible', false);
  };

  const changeBodyCls = (isVisible) => {
    const hideScrollWindowCnt = root?.getElementsByClassName('scroll-lock')?.length;
    const bodyElem = document.body;

    if (isVisible) { // window open
      if (props.hideScroll) {
        // hideScroll 시, body 우측 padding 추가 & overflow hidden class 추가
        if (!hideScrollWindowCnt) {
          const scrollWidth = getVScrollWidth();
          bodyElem.style.paddingRight = `${scrollWidth}px`;
        }
        bodyElem.classList.add('ev-window-scroll-lock');
      }
    } else if (props.hideScroll && hideScrollWindowCnt === 1) { // window close
      bodyElem.style.removeProperty('padding-right');
      bodyElem.classList.remove('ev-window-scroll-lock');
    }
  };

  setBasePosition();

  watch(
    () => props.visible,
    async (newVal) => {
      changeBodyCls(newVal);
      if (newVal) {
        await nextTick(() => {
          setBasePosition();
        });
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
    numberToUnit,
    removeUnit,
  };
};

const useMouseEvent = (param) => {
  const { props, emit } = getCurrentInstance();
  const {
    windowRef,
    headerRef,
    isFullExpandWindow,
    numberToUnit,
    removeUnit,
  } = param;

  const draggingMinSize = 50;
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
  const draggedInfo = reactive({
    top: 0,
    left: 0,
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
      top: removeUnit(headerAreaStyleInfo.paddingTop, 'vertical'),
      left: removeUnit(headerAreaStyleInfo.paddingLeft, 'horizontal'),
      right: removeUnit(headerAreaStyleInfo.paddingRight, 'horizontal'),
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

    width = removeUnit(width, 'horizontal') > removeUnit(tMinWidth, 'horizontal') ? width : tMinWidth;
    height = removeUnit(height, 'vertical') > removeUnit(tMinHeight, 'vertical') ? height : tMinHeight;

    dragStyle.top = numberToUnit(top);
    dragStyle.left = numberToUnit(left);
    dragStyle.width = numberToUnit(width);
    dragStyle.height = numberToUnit(height);
    dragStyle.minWidth = numberToUnit(tMinWidth);
    dragStyle.minHeight = numberToUnit(tMinHeight);
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
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const isTop = grabbingBorderPosInfo.top;
    const isLeft = grabbingBorderPosInfo.left;
    const isRight = grabbingBorderPosInfo.right;
    const isBottom = grabbingBorderPosInfo.bottom;
    const minWidth = removeUnit(props.minWidth, 'horizontal');
    const minHeight = removeUnit(props.minHeight, 'vertical');
    const clientX = e.clientX >= windowWidth ? windowWidth : e.clientX;
    let clientY = e.clientY >= windowHeight ? windowHeight : e.clientY;
    clientY = e.clientY > 0 ? clientY : 0;
    const diffX = clientX - clickedInfo.clientX;
    const diffY = clientY - clickedInfo.clientY;

    let top = clickedInfo.top;
    let left = clickedInfo.left;
    let width = clickedInfo.width;
    let height = clickedInfo.height;
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

    width = Math.min(Math.max(width, minWidth), windowWidth);
    height = Math.min(Math.max(height, minHeight), windowHeight);

    const positionInfo = { top, left, width, height };
    setDragStyle(positionInfo);
    emit('resize', e, { ...positionInfo });
  };

  // 브라우저 상하 위치 제약
  const getValidTop = (windowHeight, top) => {
    let tempTop = top;

    if (tempTop < 0) { // 상
      tempTop = 0;
    } else if (tempTop > windowHeight - draggingMinSize) { // 하
      tempTop = Math.floor(windowHeight - draggingMinSize);
    }
    return tempTop;
  };
  // 브라우저 좌우 위치 제약
  const getValidLeft = (windowWidth, left) => {
    let tempLeft = left;
    if (tempLeft < -(clickedInfo.width - draggingMinSize)) { // 좌
      tempLeft = -Math.floor(clickedInfo.width - draggingMinSize);
    } else if (tempLeft > windowWidth - draggingMinSize) { // 우
      tempLeft = Math.floor(windowWidth - draggingMinSize);
    }
    return tempLeft;
  };

  // mousedown > mousemove: 마우스 드래그
  const dragging = (e) => {
    e.preventDefault();
    clickedInfo.state = 'mousedown-mousemove';

    // window header를 통해 mouseMove 됐을 경우
    if (props.draggable && clickedInfo.pressedSpot === 'header') {
      const windowWidth = document.documentElement.clientWidth;
      const windowHeight = document.documentElement.clientHeight;
      const diffTop = e.clientY - clickedInfo.clientY;
      const diffLeft = e.clientX - clickedInfo.clientX;

      let tempTop = clickedInfo.top + diffTop;
      let tempLeft = clickedInfo.left + diffLeft;

      tempTop = getValidTop(windowHeight, tempTop);
      tempLeft = getValidLeft(windowWidth, tempLeft);

      setDragStyle({
        top: `${tempTop}px`,
        left: `${tempLeft}px`,
        width: dragStyle.width ?? props.width,
        height: dragStyle.height ?? props.height,
      });
    } else if (props.resizable && clickedInfo.pressedSpot === 'border') {
      resizeWindow(e);
    }

    emit('mousedown-mousemove', e);
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
      if (isFullExpandWindow.value) {
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
      } else {
        setDragStyle({
          top: beforeExpandPosInfo.top,
          left: beforeExpandPosInfo.left,
          width: beforeExpandPosInfo.width,
          height: beforeExpandPosInfo.height,
        });
      }

      emit('expand', {
        top: beforeExpandPosInfo.top,
        left: beforeExpandPosInfo.left,
        width: beforeExpandPosInfo.width,
        height: beforeExpandPosInfo.height,
      });
    });
  };

  const initWindowInfo = () => {
    isFullExpandWindow.value = false;

    clickedInfo.state = '';
    clickedInfo.pressedSpot = '';
    clickedInfo.top = 0;
    clickedInfo.left = 0;
    clickedInfo.width = 0;
    clickedInfo.height = 0;
    clickedInfo.clientX = 0;
    clickedInfo.clientY = 0;

    draggedInfo.top = 0;
    draggedInfo.left = 0;

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

const activeWindows = (() => {
  let windows = [];
  let sequence = 0;

  return {
    add(activeWindow) {
      if (activeWindow === null || activeWindow === undefined) return;

      activeWindow.sequence = sequence++;
      windows.push(activeWindow);

      // eslint-disable-next-line consistent-return
      return activeWindow.sequence;
    },
    remove(inactiveWindow) {
      if (inactiveWindow === null || inactiveWindow === undefined) return;
      windows = windows.filter(activeWindow => activeWindow.sequence !== inactiveWindow.sequence);
    },

    get windows() {
      return windows.slice();
    },
    getWindowBySequence(targetSequence) {
      return windows.find(activeWindow => activeWindow.sequence === targetSequence);
    },

    isEmpty() {
      return windows.length <= 0;
    },
    isFirstWindowOpen() {
      return sequence === 1;
    },
  };
})();

const zIndexService = (() => {
  const LOWER = 700;
  const UPPER = 750;

  const INCREMENT = 1;
  const PADDING = INCREMENT * 2;

  const UPPER_LIMIT = UPPER - PADDING;

  let current = LOWER;

  return {
    getNext() {
      if (current >= UPPER_LIMIT) {
        return UPPER_LIMIT;
      }
      current += INCREMENT;
      return current;
    },
    getNextOverLimit() {
      return UPPER_LIMIT + INCREMENT;
    },
    getPrevFrom(index) {
      const prev = current - (index * INCREMENT);

      if (prev <= LOWER) return LOWER;
      return prev;
    },
    isUpperLimitClose() {
      return current >= UPPER_LIMIT;
    },
    resetToLower() {
      current = LOWER;
    },
    getAllocableCount() {
      return Math.floor((UPPER_LIMIT - LOWER) / INCREMENT);
    },
  };
})();

const getZIndexFromElement = (element) => {
  const zIndex = window.getComputedStyle(element).getPropertyValue('z-index').trim();

  if (!zIndex || isNaN(zIndex)) return 700; // window 초기 z-index 값

  return parseInt(zIndex);
};

const getActiveWindowsOrderByZIndexAsc = () => {
  // zIndex 클수록, 최근에 열린 것일수록(sequence 클수록) 뒤에 위치
  const compareByZIndex = (window1, window2) => {
    if (window1.zIndex > window2.zIndex) return 1;
    if (window1.zIndex < window2.zIndex) return -1;

    if (window1.sequence > window2.sequence) return 1;
    return -1;
  };

  const activeWindowsSorted = Array.prototype.map.call(activeWindows.windows, activeWindow => ({
    ...activeWindow,
    zIndex: getZIndexFromElement(activeWindow.elem),
  })).sort(compareByZIndex);

  return activeWindowsSorted;
};

const useEscCloseAndFocusable = ({ closeWin, windowRef }) => {
  const { props } = getCurrentInstance();

  let sequence = null;
  let timer = null;

  // escClose 관련 로직 시작
  const addActiveWindow = () => {
    const windowSequence = activeWindows.add({
      sequence,
      closeWin,
      elem: windowRef.value,
      escClose: props.escClose,
    });
    return windowSequence;
  };

  const removeInactiveWindow = (inactiveWindow) => {
    activeWindows.remove(inactiveWindow);
  };

  const keydownEsc = (event) => {
    if (activeWindows.isEmpty()) return;

    const { code } = event;
    if (code !== 'Escape') return;

    const activeWindowsSorted = getActiveWindowsOrderByZIndexAsc();
    const topActiveWindow = activeWindowsSorted[activeWindowsSorted.length - 1];

    // 예시 상황) Nested에서 외부 Window의 escClose는 true이고, 내부 Window의 escClose는 false인 경우,
    // esc 눌러도 외부 Window는 닫히지 않고, 가장 상단에 있는 내부 Window가 수동으로 닫힌 후에 닫히도록 하기 위해
    if (!topActiveWindow.escClose) return;

    topActiveWindow.closeWin();
  };

  const setWindowActive = () => {
    sequence = addActiveWindow();
    // DOM의 dataset에 sequence 값 추가해 식별 가능하도록
    windowRef.value.dataset.sequence = sequence;

    if (activeWindows.isFirstWindowOpen()) {
      document.addEventListener('keydown', keydownEsc);
    }
  };

  const setWindowInactive = () => {
    const inactiveWindow = activeWindows.getWindowBySequence(sequence);
    removeInactiveWindow(inactiveWindow);
  };
  // escClose 관련 로직 끝


  // focusable 관련 로직 시작
  const setZIndexToWindow = ({ elem, zIndex }) => {
    // 모달인 경우에는 dim layer도 같이 z-index 높여준다.
    if (props.isModal) {
      const dimLayerElem = elem.parentElement.getElementsByClassName('ev-window-dim-layer')[0];
      dimLayerElem.style.zIndex = zIndex;
    }

    elem.style.zIndex = zIndex;
  };

  const assignZIndex = () => {
    // Window가 1번째로 열릴 때, z-index 값을 시작값으로 설정
    if (activeWindows.windows.length === 1) {
      zIndexService.resetToLower();
    }

    const nextZIndex = zIndexService.getNext();
    setZIndexToWindow({ elem: windowRef.value, zIndex: nextZIndex });
  };

  const sameAsCurrent = windowData => String(windowData.sequence)
    === windowRef.value.dataset.sequence;

  // 할당하려는 z-index 값이 상한일 때
  const reassignZIndex = () => {
    const activeWindowsZIndexAsc = getActiveWindowsOrderByZIndexAsc();

    const overCountLimit = activeWindows.windows.length > zIndexService.getAllocableCount();
    // 할당 가능한 z-index 수보다 많은 Window를 띄웠을 때
    if (overCountLimit) {
      const activeWindowsZIndexDesc = activeWindowsZIndexAsc.reverse();

      // z-index 기준 내림차순으로 정렬한 Window의 z-index 값을 UPPER에서 LOWER로 1씩 감소한 값 할당
      let interval = 0;
      activeWindowsZIndexDesc.forEach((activeWindow) => {
        if (sameAsCurrent(activeWindow)) return;

        const prevZIndex = zIndexService.getPrevFrom(interval++);
        setZIndexToWindow({ elem: activeWindow.elem, zIndex: prevZIndex });
      });

      // 가장 상단으로 와야하는 현재 Window의 z-index 값을 최대로
      const nextZIndex = zIndexService.getNextOverLimit();
      setZIndexToWindow({ elem: windowRef.value, zIndex: nextZIndex });
    } else {
      zIndexService.resetToLower();

      activeWindowsZIndexAsc.forEach((activeWindow) => {
        if (sameAsCurrent(activeWindow)) return;

        const nextZIndex = zIndexService.getNext();
        setZIndexToWindow({ elem: activeWindow.elem, zIndex: nextZIndex });
      });

      // 가장 상단으로 와야하는 현재 Window의 z-index 값을 최대로
      const nextZIndex = zIndexService.getNext();
      setZIndexToWindow({ elem: windowRef.value, zIndex: nextZIndex });
    }
  };

  const checkLimitAndSetZIndex = () => {
    if (zIndexService.isUpperLimitClose()) {
      reassignZIndex();
    } else {
      assignZIndex();
    }
  };

  const setFocus = () => {
    // X 버튼을 클릭했을 때
    if (!windowRef.value) return;

    // focusable prop이 false인 경우에는 z-index를 높이지 않는다.
    if (!props.focusable) return;

    const activeWindowsSorted = getActiveWindowsOrderByZIndexAsc();
    const topActiveWindow = activeWindowsSorted[activeWindowsSorted.length - 1];

    const isAlreadyTop = sameAsCurrent(topActiveWindow);
    if (isAlreadyTop) return;

    checkLimitAndSetZIndex();
  };
  // focusable 관련 로직 끝


  /*
    실행 시점(=Window 열림):
      visible 초기값이 true일 때 watch를 실행시키지 않아 onMounted hook 사용
  */
  onMounted(() => {
    if (props.visible) {
      setWindowActive();
      timer = setTimeout(checkLimitAndSetZIndex, 0);
    }
  });

  /*
    실행 시점(=Window 닫힘):
      예시. 배열을 통해 Window 여러 개 띄울 때, 배열 원소 삭제로 인해 해당 Window가 닫히는 경우
      unmount가 발생해서 watch를 실행히시키지 않아 onBeforeUnmount hook 사용
  */
  onBeforeUnmount(() => {
    if (props.visible) {
      setWindowInactive();
      clearTimeout(timer);
    }
  });

  /*
    실행 시점:
      1. visible 값이 false -> true로 변했을 때(=Window 열림)
      2. visible 값이 true -> false로 변했을 때(=Window 닫힙)
  */
  watch(
    () => props.visible,
    (visible) => {
      nextTick(() => {
        if (visible) {
          // visible 값이 false -> true로 변경되었을 때
          setWindowActive();
          timer = setTimeout(checkLimitAndSetZIndex, 0);
        } else {
          // visible 값이 true -> false로 변경되었을 때
          setWindowInactive();
          clearTimeout(timer);
        }
      });
  });

  watch(
    () => props.escClose,
    (escClose) => {
      if (!props.visible) return;
      const currentWindow = activeWindows.getWindowBySequence(sequence);
      if (currentWindow) currentWindow.escClose = escClose;
    },
  );

  return {
    setFocus,
  };
};

export {
  useModel,
  useMouseEvent,
  useEscCloseAndFocusable,
};
