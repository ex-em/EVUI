import {
  ref,
  reactive,
  computed,
  watch,
  nextTick,
  getCurrentInstance,
  onMounted,
  onUnmounted,
} from 'vue';
import { getRegExp, engToKor, korToEng } from 'korean-regexp';
import { resolveTeleportTarget } from '@/common/utils.teleport';

export const useModel = () => {
  const { props, emit } = getCurrentInstance();

  /**
   * Select 컴포넌트의 v-model 값
   * single 모드 : modelValue(String), 없는 경우 null
   * multiple 모드 : modelValue(Array), 없는 경우 []
   */
  const singleMv = {
    get: () => {
      if (props.items.some((v) => v.value === props.modelValue)) {
        return props.modelValue;
      }
      return null;
    },
    set: (value) => emit('update:modelValue', value),
  };
  const multiMv = {
    get: () => {
      if (Array.isArray(props.modelValue)) {
        return props.modelValue;
      }
      return [];
    },
    set: (value) => emit('update:modelValue', value),
  };
  const mv = computed(!props.multiple ? singleMv : multiMv);

  /**
   * 현재 select에서 선택된 항목들
   * single 모드 : { name: 'name', value: 'value' }
   * multiple 모드 : [{ name: 'name', value: 'value' }, {...}]
   */
  const singleSm = () => props.items.find((v) => v.value === mv.value)?.name;
  const multipleSm = () => props.items.filter((v) => props.modelValue.includes(v.value));
  const selectedModel = computed(!props.multiple ? singleSm : multipleSm);

  const computedPlaceholder = computed(() => {
    if (!props.multiple) {
      return props.placeholder;
    }
    return mv.value.length ? null : props.placeholder;
  });

  /**
   * clearable 모드일 때, 항목(mv) 전체 삭제 아이콘 존재여부
   */
  const singleIci = () => mv.value;
  const multipleIci = () => mv.value.length;
  const isClearableIcon = computed(!props.multiple ? singleIci : multipleIci);

  /**
   * clearable모드일 때 [x] 아이콘 클릭 시 mv값을 초기화
   */
  const removeAllMv = () => {
    if (!props.disabled) {
      if (!props.multiple) {
        mv.value = null;
      } else {
        mv.value.splice(0);
        mv.value = [...mv.value];
      }
    }
  };

  /**
   * 해당 컴포넌트의 v-model값이 변경(change)되는 이벤트
   */
  const changeMv = async () => {
    await nextTick();
    emit('change', mv.value);
  };

  /**
   * multiple 모드인 경우 선택된 value를 mv에서 삭제하는 로직
   * @param val - tagWrapper에서 [x]클릭된 목록의 value
   */
  const removeMv = async (val) => {
    if (!props.disabled) {
      const idx = mv.value.indexOf(val);
      mv.value.splice(idx, 1);
      mv.value = [...mv.value];
      await changeMv();
    }
  };

  return {
    mv,
    selectedModel,
    computedPlaceholder,
    isClearableIcon,
    removeAllMv,
    removeMv,
    changeMv,
  };
};

export const useDropdown = (param) => {
  const { props } = getCurrentInstance();
  const { mv, changeMv } = param;

  const isDropbox = ref(false);
  const filterTextRef = ref(props.filterText);
  const select = ref(null);
  const selectWrapper = ref(null);
  const dropbox = ref(null);
  const itemWrapper = ref(null);
  const dropboxWidth = ref('100%');
  const initialDropboxWidth = ref(null);
  const dropboxPosition = reactive({
    top: 0,
    left: 'auto',
  });

  // teleport target은 dropbox가 열리는 시점에 clickSelectInput에서 동기적으로 resolve한다.
  // (Select보다 늦게 마운트되는 target도 잡히도록 매 open 시 재평가)
  const teleportTarget = ref('body');

  /**
   * filterable 모드 시 인풋박스에 입력된 텍스트가 포함된 목록 가져오기
   * @param val - filterable 모드 시 인풋박스에 입력된 텍스트
   * @returns [] - 필터링 결과의 목록
   */
  const filteredItems = computed(() => {
    if (!filterTextRef.value || !props.filterable) {
      return props.items;
    }
    const trimText = filterTextRef.value?.trim();
    const korean = engToKor(trimText);
    const eng = korToEng(trimText);

    return props.items.filter(
      ({ name }) =>
        name.search(getRegExp(trimText)) > -1 ||
        name.search(getRegExp(korean)) > -1 ||
        name.search(getRegExp(eng)) > -1,
    );
  });

  /**
   * filterable 에서 text input 이벤트 핸들러
   */
  const changeFilterText = (e) => {
    filterTextRef.value = e?.target?.value;
  };

  /**
   * dropbox flip 판단에 쓰일 가장 가까운 스크롤 가능한 ancestor를 찾는다.
   * `.ev-window-content`처럼 자체 스크롤을 가진 컨테이너 내부에서도
   * 컨테이너 경계 기준으로 dropTop/dropDown을 정확히 결정하기 위함.
   * 못 찾으면 viewport(document.documentElement)로 폴백.
   * @param {HTMLElement | null | undefined} el
   * @returns {HTMLElement}
   */
  const findScrollableAncestor = (el) => {
    let parent = el?.parentElement;
    while (parent && parent !== document.documentElement) {
      const cs = window.getComputedStyle(parent);
      const verticallyScrollable =
        /(auto|scroll|overlay)/.test(cs.overflowY) ||
        (/(auto|scroll|overlay)/.test(cs.overflow) && parent.scrollHeight > parent.clientHeight);
      if (verticallyScrollable) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return document.documentElement;
  };

  /**
   * dropdown box 위치 변경하는 메소드
   */
  const changeDropboxPosition = async () => {
    await nextTick();
    if (!selectWrapper.value || !dropbox.value) {
      return;
    }
    const selectRect = selectWrapper.value.getBoundingClientRect();
    const selectHeight = selectRect.height;
    const selectY = selectRect.y;
    const dropboxHeight = dropbox.value.getBoundingClientRect().height;

    // teleport 모드는 dropbox가 body로 옮겨져 부모(예: ev-window) 컨테이너 경계의
    // overflow:hidden 영향을 받지 않으므로 viewport만 기준으로 flip 계산하고
    // position:fixed + viewport 절대 좌표를 사용한다.
    if (props.teleport) {
      const viewportHeight = document.documentElement.clientHeight;
      const spaceAbove = selectRect.top;
      const spaceBelow = viewportHeight - selectRect.bottom;
      const overflowsBottom = dropboxHeight > spaceBelow;

      if (overflowsBottom && spaceAbove > spaceBelow) {
        dropboxPosition.top = `${selectRect.top - dropboxHeight}px`; // dropTop
      } else {
        dropboxPosition.top = `${selectRect.bottom}px`; // dropDown
      }
      dropboxPosition.left = `${selectRect.left}px`;
      return;
    }

    const container = findScrollableAncestor(selectWrapper.value);
    const isViewport = container === document.documentElement;
    const containerRect = container.getBoundingClientRect();
    const viewportHeight = document.documentElement.clientHeight;
    // ev-window를 viewport 밖으로 드래그한 경우처럼 컨테이너가 viewport를 벗어날 수 있으므로
    // 컨테이너 경계와 viewport 경계의 교집합을 실제 가시 영역으로 사용한다.
    const bottomBoundary = isViewport
      ? viewportHeight
      : Math.min(containerRect.bottom, viewportHeight);
    const topBoundary = isViewport ? 0 : Math.max(containerRect.top, 0);

    const spaceAbove = selectY - topBoundary;
    const spaceBelow = bottomBoundary - (selectY + selectHeight);
    const overflowsBottom = dropboxHeight > spaceBelow;

    // 위쪽에 dropbox가 fully fit 하지 않더라도, 아래쪽이 더 좁으면 위로 펼친다.
    // (ev-window 내부 스크롤처럼 양쪽 모두 부족한 경우 더 많은 항목이 보이는 쪽 선택)
    if (overflowsBottom && spaceAbove > spaceBelow) {
      dropboxPosition.top = `-${dropboxHeight}px`; // dropTop
    } else {
      dropboxPosition.top = `${selectHeight}px`; // dropDown
    }
    dropboxPosition.left = 'auto';
  };

  /**
   * dropdown box 내 선택한 첫번째 아이템을 스크롤 가장 위로 올리는 메소드
   */
  const scrollToSelectedItem = () => {
    if (!itemWrapper.value?.children[0]?.children?.length) {
      return;
    }
    const SELECTED_CLS = 'selected';
    const childEls = itemWrapper.value.children[0].children;
    const wrapperOffsetTop = itemWrapper.value.offsetTop;
    let childEl = null;
    for (let i = 0; i < childEls.length; i++) {
      childEl = childEls[i];
      if (childEl.classList.contains(SELECTED_CLS)) {
        if (!childEl.offsetTop) {
          return;
        }
        itemWrapper.value.scrollTop = childEl.offsetTop - wrapperOffsetTop;
        break;
      }
    }
  };

  const calculateDropboxWidth = async () => {
    if (itemWrapper.value && dropbox.value) {
      await nextTick();

      if (
        initialDropboxWidth.value === null ||
        initialDropboxWidth.value !== selectWrapper.value.offsetWidth
      ) {
        initialDropboxWidth.value = selectWrapper.value.offsetWidth;
      }

      const items = itemWrapper.value.querySelectorAll('.ev-select-dropbox-item');
      let maxWidth = 0;

      items.forEach((item) => {
        const itemWidth = item.scrollWidth;
        if (itemWidth > maxWidth) {
          maxWidth = itemWidth;
        }
      });

      const { borderLeftWidth, borderRightWidth } = window.getComputedStyle(dropbox.value);
      const borderXWidth = parseInt(borderLeftWidth) + parseInt(borderRightWidth);

      const scrollbarWidth = itemWrapper.value.offsetWidth - itemWrapper.value.clientWidth;
      maxWidth += scrollbarWidth + borderXWidth;

      const windowWidth = window.innerWidth;
      const dropboxRect = dropbox.value.getBoundingClientRect();
      const dropboxLeft = dropboxRect.left;
      const maxAllowedWidth = windowWidth - dropboxLeft - 20;

      const finalWidth = Math.max(Math.min(maxWidth, maxAllowedWidth), initialDropboxWidth.value);

      dropboxWidth.value = `${finalWidth}px`;
    } else {
      dropboxWidth.value = '100%';
    }
  };

  watch(
    () => isDropbox.value,
    async (cur) => {
      if (cur) {
        await scrollToSelectedItem();
        await calculateDropboxWidth();
      }
    },
  );

  watch(
    () => filteredItems.value,
    async () => {
      await changeDropboxPosition();
    },
  );

  if (props.filterable) {
    watch(
      () => filteredItems.value,
      () => changeDropboxPosition(),
    );
  }

  /**
   * 인풋박스 클릭 이벤트
   * props로 받는 항목이 없는 경우 return처리
   * 인풋박스 위 클릭된 이벤트위치로 드롭박스의 사이즈, 위치를 계산
   */
  const clickSelectInput = async () => {
    if (props.items.length && !props.disabled) {
      isDropbox.value = !isDropbox.value;
      if (isDropbox.value) {
        // teleport 모드는 body에 옮겨지므로 target/초기 너비/위치를 동기적으로 잡아
        // 첫 렌더 프레임에서 body 전체 너비로 펼쳐졌다가 줄어드는 깜빡임을 막는다.
        if (props.teleport) {
          teleportTarget.value = resolveTeleportTarget(props.teleport, 'EvSelect');
          if (selectWrapper.value) {
            const rect = selectWrapper.value.getBoundingClientRect();
            dropboxWidth.value = `${rect.width}px`;
            dropboxPosition.top = `${rect.bottom}px`;
            dropboxPosition.left = `${rect.left}px`;
          }
        }
        await changeDropboxPosition();
      }
    }
  };

  /**
   * 드롭박스 외부 클릭 이벤트
   * filterable 모드인 경우는 필터링텍스트를 비운다.
   */
  const clickOutsideDropbox = () => {
    if (props.filterable) {
      filterTextRef.value = '';
    }
    isDropbox.value = false;
  };

  const allCheck = ref(false);
  const changeAllCheck = (isCheckBoxLabel) => {
    if (!isCheckBoxLabel) {
      allCheck.value = !allCheck.value;
    }
    if (allCheck.value) {
      mv.value = filteredItems.value.filter((item) => !item.disabled).map((item) => item.value);
    } else {
      mv.value = [];
    }
  };
  /**
   * 항목 클릭하여 선택하는 이벤트
   * 항목 내 disabled인 경우 클릭 로직을 타지 않게 한다.
   * multiple 모드가 아닌경우 리스트 클릭 시 드롭박스를 닫는다.
   * @param val - clicked item value
   */
  const singleClickItem = (val) => {
    if (props.filterable) {
      filterTextRef.value = '';
    }
    isDropbox.value = false;
    if (mv.value !== val) {
      mv.value = val;
      changeMv();
    }
  };
  const multipleClickItem = (val) => {
    if (props.filterable) {
      filterTextRef.value = '';
    }
    if (!mv.value.includes(val)) {
      mv.value.push(val);
    } else {
      const idx = mv.value.indexOf(val);
      mv.value.splice(idx, 1);
    }
    allCheck.value =
      mv.value.length === filteredItems.value.filter((item) => !item.disabled).length;
    mv.value = [...mv.value];
    changeMv();
  };
  const clickItem = !props.multiple ? singleClickItem : multipleClickItem;

  /**
   * 선택된 아이템을 구별하는 메소드
   * @param val
   * @returns {boolean | array}
   */
  const singleSelectedCls = (val) => val === mv.value;
  const multipleSelectedCls = (val) => mv.value.includes(val);
  const selectedItemClass = !props.multiple ? singleSelectedCls : multipleSelectedCls;

  watch(
    () => mv.value,
    (curr) => {
      if (props.multiple && props.checkable) {
        if (curr.length === 0) {
          allCheck.value = false;
        } else {
          allCheck.value =
            curr.length === filteredItems.value.filter((item) => !item.disabled).length;
        }
        changeDropboxPosition();
      }
    },
  );

  // teleport 모드에서는 viewport resize 시 dropbox를 닫는다 (native select와 동일 UX).
  // non-teleport 모드는 dropbox가 wrapper 내부에 있어 자연스럽게 따라가므로 기존
  // 너비/위치 재계산을 유지.
  const handleResize = () => {
    if (!isDropbox.value) {
      return;
    }
    if (props.teleport) {
      clickOutsideDropbox();
      return;
    }
    calculateDropboxWidth();
    changeDropboxPosition();
  };

  // teleport 모드에서는 dropbox가 body에 고정(position:fixed)되므로
  // ev-window content 등 스크롤 가능한 ancestor가 스크롤되면 select와 dropbox 위치가 어긋난다.
  // 위치 재계산 대신 닫는다(native select와 동일한 UX). 단 dropbox 내부 스크롤
  // (필터 input 포커싱, item 리스트 스크롤)은 닫기 트리거에서 제외한다.
  const handleScroll = (event) => {
    if (!isDropbox.value) {
      return;
    }
    // event.target이 window/document인 페이지-레벨 scroll은 외부 스크롤로 간주해 닫는다.
    // Element이면서 dropbox 내부에서 발생한 scroll(필터 input 포커싱, item 리스트 scroll)만 무시.
    const target = event.target;
    if (target instanceof Element && dropbox.value?.contains(target)) {
      return;
    }
    clickOutsideDropbox();
  };

  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });

  // teleport 모드 + dropbox open일 때만 scroll listener를 활성화한다.
  // dropbox가 닫혀있는 동안 capture-phase scroll 핸들러가 페이지 전체 스크롤마다 호출되는
  // 비용을 피한다.
  watch(
    () => !!props.teleport && isDropbox.value,
    (active, _prev, onCleanup) => {
      if (!active) {
        return;
      }
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });

      onCleanup(() => {
        window.removeEventListener('scroll', handleScroll, { capture: true });
      });
    },
  );

  return {
    select,
    selectWrapper,
    dropbox,
    itemWrapper,
    isDropbox,
    dropboxPosition,
    filterTextRef,
    filteredItems,
    clickSelectInput,
    clickOutsideDropbox,
    changeFilterText,
    changeDropboxPosition,
    clickItem,
    selectedItemClass,
    allCheck,
    changeAllCheck,
    dropboxWidth,
    teleportTarget,
  };
};
