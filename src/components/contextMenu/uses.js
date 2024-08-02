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
      const docHeight = document.documentElement.clientHeight;
      const docWidth = document.documentElement.clientWidth;
      const RIGHT_BUFFER_PX = 20;
      menuStyle.pageX = e.pageX;
      menuStyle.pageY = e.pageY;
      menuStyle.clientX = e.clientX;
      if (docHeight < e.clientY + menuListHeight) {
        // dropTop
        menuStyle.top = `${e.pageY - menuListHeight}px`;
        if (docWidth < e.clientX + menuListWidth + RIGHT_BUFFER_PX) {
          menuStyle.left = `${e.pageX - menuListWidth}px`;
        } else {
          menuStyle.left = `${e.pageX}px`;
        }
      } else {
        // dropDown
        menuStyle.top = `${e.pageY}px`;
        if (docWidth < e.clientX + menuListWidth + RIGHT_BUFFER_PX) {
          menuStyle.left = `${e.pageX - menuListWidth}px`;
        } else {
          menuStyle.left = `${e.pageX}px`;
        }
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
   * 자식 항목 숨기기 메소드
   * 다른 항목에 마우스오버 시 자식이 존재하는 항목의 자식 컴포넌트를 숨긴다.
   */
  const hideChild = () => {
    isShowChild.value = false;
  };
  /**
   * 자식 컴포넌트 보여주기 (nested구조에서 2depth 컴포넌트부터 사용한다.)
   * mouseenter된 항목의 좌표를 잡아서 offset 등 여러 조건에 따라 좌우로 드랍업/다운을 실행
   * @param e - 마우스 이벤트
   * @param children - 자식 리스트
   * @returns null
   */
  const showChild = async (e, children) => {
    isShowChild.value = true;
    childrenItems.value = children;
    await nextTick();
    if (!childMenu.value?.$el?.children[0]) {
      return;
    }

    const targetUlRect = e.target.parentElement?.getBoundingClientRect();
    const targetUlX = targetUlRect.x;
    const targetUIY = targetUlRect.y;
    const targetUlWidth = targetUlRect.width;
    const targetUlHeight = targetUlRect.height;

    const childMenuRect = childMenu.value?.$el?.children[0].getBoundingClientRect();
    const menuListHeight = childMenuRect.height;
    const menuListWidth = childMenuRect.width;

    const docHeight = document.documentElement.clientHeight;
    const docWidth = document.documentElement.clientWidth;
    const RIGHT_BUFFER_PX = 20;

    if (docHeight < targetUIY + e.target.offsetTop + menuListHeight) {
      // dropTop
      menuStyle.top = `${-menuListHeight + targetUlHeight}px`;
      if (docWidth < targetUlX + targetUlWidth + menuListWidth + RIGHT_BUFFER_PX) {
        menuStyle.left = `${0 - menuListWidth}px`;
      } else {
        menuStyle.left = `${targetUlWidth}px`;
      }
    } else {
      // dropDown
      menuStyle.top = `${e.target.offsetTop}px`;
      if (docWidth < targetUlX + targetUlWidth + menuListWidth + RIGHT_BUFFER_PX) {
        menuStyle.left = `${0 - menuListWidth}px`;
      } else {
        menuStyle.left = `${targetUlWidth}px`;
      }
    }
  };

  /**
   * 항목에 마우스엔터 시 발생하는 이벤트
   * @param e - 마우스 이벤트 (showChild에 넘김)
   * @param item - 마우스오버된 메뉴
   * @returns null
   */
  const mouseenterLi = async (e, item) => {
    if (!item.children || !Array.isArray(item.children) || item.disabled) {
      hideChild();
    } else {
      await showChild(e, item.children);
    }
  };

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
    mouseenterLi,
    hideAll,
  };
};
