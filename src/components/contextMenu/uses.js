import {
  ref, reactive, computed, nextTick,
  getCurrentInstance, defineComponent,
} from 'vue';
import MenuList from './MenuList';

export const useModel = () => {
  const comp = defineComponent(MenuList);
  const childrenItems = ref([]);

  /**
   * 컴포넌트 초기에 body에 wrapperDiv를 append한다.
   */
  const initWrapperDiv = () => {
    const root = document.createElement('div');
    root.id = 'ev-context-menu-modal';
    root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
    const hasRoot = document.getElementById('ev-context-menu-modal');
    if (!hasRoot) {
      document.body.appendChild(root);
    }
  };

  return {
    comp,
    childrenItems,
    initWrapperDiv,
  };
};

export const usePosition = () => {
  const { props } = getCurrentInstance();
  const isShowMenuOnClick = computed(() => props.isShowMenuOnClick);
  const isShow = ref(false);
  const rootMenuList = ref(null);
  const menuStyle = reactive({
    top: null,
    left: null,
    right: null,
    pageY: null,
    pageX: null,
    clientX: null,
  });

  /**
   * ContextMenu.vue 컴포넌트 생성 메소드
   * @param e - 사용자가 우클릭한 마우스 이벤트 정보
   * @returns null
   */
  const show = async (e) => {
    isShow.value = true;
    await nextTick();
    const menuListRect = rootMenuList.value?.$el?.children[0].getBoundingClientRect();
    if (menuListRect) {
      const menuListHeight = menuListRect.height;
      const menuListWidth = menuListRect.width;
      const browserHeight = document.documentElement.clientHeight;
      const browserWidth = document.documentElement.clientWidth;
      const RIGHT_BUFFER_PX = 20;
      menuStyle.pageX = e.pageX;
      menuStyle.pageY = e.pageY;
      menuStyle.clientX = e.clientX;
      if (browserHeight < e.clientY + menuListHeight) {
        // dropTop
        menuStyle.top = `${e.pageY - menuListHeight}px`;
      } else {
        // dropDown
        menuStyle.top = `${e.pageY}px`;
      }

      if (browserWidth < e.clientX + menuListWidth + RIGHT_BUFFER_PX) {
        menuStyle.left = `${e.pageX - menuListWidth}px`;
      } else {
        menuStyle.left = `${e.pageX}px`;
      }
    }
  };

  /**
   * ContextMenu 컴포넌트 숨김 메소드
   * @returns null
   */
  const hide = async () => {
    await nextTick();
    if (isShowMenuOnClick.value) {
      return;
    }
    isShow.value = false;
  };

  return {
    isShow,
    rootMenuList,
    menuStyle,
    show,
    hide,
  };
};

export const useMenuList = () => {
  const { props, emit } = getCurrentInstance();

  // nested구조 하위 리스트에서 최상단의 ContextMenu에 isShow를 전달할 때 사용하는 변수
  const computedIsShow = computed({
    get: () => props.isShow,
    set: val => emit('update:isShow', val),
  });
  // 자식(.children 속성) 존재 여부
  const isExistChild = computed(() => !!props.items.some(v => v.children));
  // 마우스오버한 항목에 자식 리스트 정보
  const childrenItems = ref([]);
  // 자식 컴포넌트 보임 여부
  const isShowChild = ref(false);
  const childMenu = ref(null);
  // MenuList 스타일 정보
  const menuStyle = reactive({
    top: null,
    left: null,
    right: null,
  });

  /**
   * 모두 닫기 메소드, 주로 정상적인 항목 클릭 후 해당 메소드 실행
   * 자식이 있는 항목은 클릭하였을 때, return 한다.
   * @param children
   */
  const hideAll = (children) => {
    if (children) {
      return;
    }
    computedIsShow.value = false;
  };

  /**
   * 자식 메뉴의 위치를 지정하는 함수
   * @param e - 마우스 이벤트
   */
  const useChildPosition = (e) => {
    const browserWidth = document.documentElement.clientWidth;
    const browserHeight = document.documentElement.clientHeight;
    const RIGHT_BUFFER_PX = 20;

    const parentMenuRect = e.target.parentElement?.getBoundingClientRect();
    const {
      x: parentMenuX,
      y: parentMenuY,
      width: parentMenuWidth,
      height: parentMenuHeight,
    } = parentMenuRect;

    const childMenuRect = childMenu.value?.$el?.children[0].getBoundingClientRect();
    const { width: childMenuWidth, height: childMenuHeight } = childMenuRect;

    // 자식 요소가 부모 요소로부터 얼마나 떨어져 있는 지 (Top)
    const elementOffsetTop = e.target.offsetTop;

    const isOverflowHeight = browserHeight < parentMenuY + elementOffsetTop + childMenuHeight;
    const isOverflowWidth = browserWidth < parentMenuX + parentMenuWidth
                                            + childMenuWidth + RIGHT_BUFFER_PX;

    if (!isOverflowHeight) {
      // dropDown
      menuStyle.top = `${elementOffsetTop}px`;
    } else {
      // dropTop
      menuStyle.top = `${parentMenuHeight - childMenuHeight}px`;
    }

    if (!isOverflowWidth) {
      menuStyle.left = `${parentMenuWidth}px`;
    } else {
      menuStyle.left = `${0 - childMenuWidth}px`;
    }
  };

  /**
   * 항목에 마우스 엔터 시 호출되는 함수
   * @param e - 마우스 이벤트
   * @param item - ContextMenu > Mouse Enter 된 요소의 값
   * - 자식 요소 없을 때: {click: Function, iconClass: String, text: String}
   * - 자식 요소 있을 때: {children: Array, text: String}
   * @returns null
   */
  const handleMouseEnter = async (e, item) => {
    if (!item.children || !Array.isArray(item.children) || item.disabled) {
      isShowChild.value = false;
    } else {
      isShowChild.value = true;
      childrenItems.value = item.children;
      await nextTick();
      useChildPosition(e);
    }
  };

  /**
   * 항목에 마우스 클릭 시 호출되는 함수
   * @param item - ContextMenu > 클릭된 요소의 값
   * - 자식 요소 없을 때: {click, iconClass, text}
   * - 자식 요소 있을 때: {children(Array), text}
   * @returns null
   */
  const handleItemClick = (item) => {
    if (item.click && !item.disabled) {
      item.click(item);
    }

    if (!item.isShowMenu) {
      hideAll(item.children);
    }
  };

  return {
    computedIsShow,
    isExistChild,
    isShowChild,
    childMenu,
    menuStyle,
    childrenItems,
    handleItemClick,
    handleMouseEnter,
    hideAll,
  };
};
