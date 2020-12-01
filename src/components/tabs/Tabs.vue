<template>
  <section
    class="ev-tabs"
    :class="{
      closable,
      stretch,
    }"
  >
    <div class="ev-tabs-header">
      <div
        class="ev-tabs-nav-wrapper"
        :class="{
          'has-scroll': hasScroll,
        }"
      >
        <template v-if="hasScroll">
          <span
            class="ev-tabs-arrow prev"
            @click="scrollTab('prev')"
          >
            <i class="ev-icon-s-arrow-left" />
          </span>
          <span
            class="ev-tabs-arrow next"
            @click="scrollTab('next')"
          >
            <i class="ev-icon-s-arrow-right" />
          </span>
        </template>
        <div
          ref="listWrapperRef"
          class="ev-tabs-list-wrapper"
        >
          <ul
            ref="listRef"
            class="ev-tabs-list"
            :style="listRefStyle"
            draggable="false"
          >
            <li
              v-for="(item, idx) in computedTabList"
              :key="`${item.value}_${idx}`"
              class="ev-tabs-title"
              :draggable="draggable"
              :class="{
                active: item.value === mv,
                'has-icon': item.iconClass,
                'drag-select': dragSelectCls(item.value),
                'select-idx': selectIdxCls(idx),
              }"
              @click="clickTab(item.value)"
              @dragstart.stop="dragstartTab(item, idx)"
              @dragover.prevent="dragoverTab(item.value)"
              @dragend.prevent="dragendTab"
            >
              <i
                v-if="item.iconClass"
                class="ev-tabs-icon"
                :class="item.iconClass"
              />
              <span
                class="text"
                :title="item.text"
              >
                {{ item.text }}
              </span>
              <span
                v-if="closable"
                class="close-icon"
                @click.stop="removeTab(item.value)"
              >
                <i class="ev-icon-s-close" />
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="ev-tabs-body">
      <slot />
    </div>
  </section>
</template>

<script>
import {
  ref, reactive, computed,
  provide, getCurrentInstance, triggerRef,
  onBeforeUpdate, nextTick, onUpdated,
} from 'vue';

export default {
  name: 'EvTabs',
  components: {
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    panels: {
      type: Array,
      default: () => [],
      validator: (list) => {
        const valueList = list.map(v => v.value);
        const setList = [...new Set(valueList)];
        if (list.length !== setList.length) {
          console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is duplicate values.');
          return false;
        }
        if (!list.every(v => Object.hasOwnProperty.call(v, 'value'))) {
          console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is essential.');
          return false;
        }
        return true;
      },
    },
    closable: {
      type: Boolean,
      default: false,
    },
    stretch: {
      type: Boolean,
      default: false,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': [String, Number],
    'update:panels': [Array],
    change: [String, Number],
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    provide('evTabs', instance);

    const mv = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit('update:modelValue', val);
        emit('change', val);
      },
    });
    const tabList = computed({
      get: () => props.panels,
      set: val => emit('update:panels', val),
    });
    const tabCloneList = ref([]);
    const isDrag = ref(false);
    const computedTabList = computed(() => (!isDrag.value ? tabList.value : tabCloneList.value));
    const tabElValueList = tabList.value.map(v => v.value);

    const listWrapperRef = ref(null);
    const listRef = ref(null);
    const hasScroll = ref(false);

    const translateScroll = reactive({
      x: 0,
    });
    const listRefStyle = computed(() => ({
      transform: `translateX(${translateScroll.x}px)`,
    }));

    /**
     * 상단 탭 nav의 element 길이를 감시 및 계산하여 스크롤 여부 확인
     * UL의 길이가 긴 경우 양쪽에 버튼 노출
     */
    const observeListEl = () => {
      const listWrapperWidth = listWrapperRef.value.offsetWidth;
      const listWidth = listRef.value.offsetWidth;
      hasScroll.value = listWrapperWidth < listWidth;

      if (hasScroll.value) {
        const widthLimit = listWrapperWidth - listWidth;
        if (widthLimit > translateScroll.x) {
          translateScroll.x = widthLimit;
        }
      } else {
        translateScroll.x = 0;
      }
    };

    onBeforeUpdate(() => {
      // 삭제된 탭이 선택된 경우 탭선택 인덱스를 변경하는 로직
      if (tabElValueList.length === tabList.value.length + 1) {
        let longList;
        let shortList;
        if (tabElValueList.length > tabList.value.length) {
          longList = tabElValueList;
          shortList = tabList.value.map(v => v.value);
        } else {
          longList = tabList.value.map(v => v.value);
          shortList = tabElValueList;
        }
        const removeValue = longList.filter(v => !shortList.includes(v))[0];
        if (mv.value === removeValue) {
          const selectedIdx = tabElValueList.findIndex(v => v === removeValue);
          if (selectedIdx === 0) {
            mv.value = tabList.value[0].value;
          } else {
            mv.value = tabList.value[selectedIdx - 1].value;
          }
        }
      }
    });

    // 최초 렌더링 시 El의 너비 확인
    nextTick(() => {
      observeListEl();
    });

    // 화면 업데이트 시 El의 너비 확인
    onUpdated(() => {
      observeListEl();
    });

    /**
     *  탭 클릭 로직
     */
    const clickTab = (val) => {
      mv.value = val;
    };

    /**
     *  탭 삭제 로직
     */
    const removeTab = (val) => {
      if (tabList.value.length < 2) {
        return;
      }
      const selectedIdx = tabList.value.findIndex(v => v.value === val);
      if (selectedIdx < 0) {
        mv.value = tabList.value[0].value;
        return;
      }
      if (val === mv.value) {
        if (selectedIdx === 0) {
          mv.value = tabList.value[1].value;
        } else {
          mv.value = tabList.value[selectedIdx - 1].value;
        }
      }
      tabList.value.splice(selectedIdx, 1);
      nextTick(() => {
        tabElValueList.splice(selectedIdx, 1);
      });
      triggerRef(tabList);
    };

    /**
     * tab nav위에서 마우스 휠 동작
     * @param type - {'next'|'prev'}
     * @param movingWidth
     */
    const scrollTab = (type, movingWidth = 100) => {
      const listWrapperWidth = listWrapperRef.value.offsetWidth;
      const listWidth = listRef.value.offsetWidth;
      const widthLimit = listWrapperWidth - listWidth;
      if (type === 'next' && translateScroll.x !== widthLimit) {
        if (widthLimit >= translateScroll.x - movingWidth) {
          translateScroll.x = widthLimit;
        } else {
          translateScroll.x -= movingWidth;
        }
      } else if (type === 'prev' && translateScroll.x !== 0) {
        if (movingWidth * -1 <= translateScroll.x) {
          translateScroll.x = 0;
        } else {
          translateScroll.x += movingWidth;
        }
      }
    };

    // draggable 모드에서 drag되는 아이템
    const dragObj = reactive({
      item: {},
      idx: null,
    });

    /**
     * 드래그된 LI의 클래스
     * @param val
     * @returns {boolean|boolean}
     */
    const dragSelectCls = val => props.draggable && dragObj.item?.value === val;

    /**
     *  드래그하기위해 선택한 li의 idx 여부 클래스
     */
    const selectIdxCls = idx => props.draggable && dragObj.idx === idx;

    /**
     * 탭 드래그 시작 메소드, isDrag모드 시작
     * @param item - 선택한 아이템
     */
    const dragstartTab = (item, idx) => {
      tabCloneList.value = [...tabList.value];
      dragObj.item = item;
      dragObj.idx = idx;
      isDrag.value = true;
    };

    /**
     * 탭 드래그오버 메소드
     * @param val - 오버 중인 아이템의 value
     */
    const dragoverTab = (val) => {
      if (dragObj.item?.value === val) return;
      const dragValueIdx = tabCloneList.value.findIndex(v => v.value === dragObj.item?.value);
      const targetValueIdx = tabCloneList.value.findIndex(v => v.value === val);
      tabCloneList.value.splice(dragValueIdx, 1);
      tabCloneList.value.splice(targetValueIdx, 0, dragObj.item);
    };

    /**
     * 탭 드래그 종료 메소드, 원래 tabList에 값을 넣고 isDrag모드를 종료
     */
    const dragendTab = () => {
      tabList.value = [...tabCloneList.value];
      dragObj.item = {};
      dragObj.idx = null;
      isDrag.value = false;
      tabCloneList.value.splice(0);
    };

    return {
      mv,
      tabList,
      tabCloneList,
      computedTabList,
      isDrag,
      clickTab,
      removeTab,

      listWrapperRef,
      listRef,
      hasScroll,
      listRefStyle,
      scrollTab,

      dragstartTab,
      dragoverTab,
      dragendTab,
      dragSelectCls,
      selectIdxCls,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-tabs {
  ul, li {
    list-style: none;
  }

  @include state('closable') {
    .ev-tabs-title {
      &:hover {
        .text {
          transform: translateX(-5px);
        }
        .close-icon {
          opacity: 1;
        }
      }
    }
  }
  @include state('stretch') {
    .ev-tabs-title {
      width: 100%;
    }
  }
}

.ev-tabs-header {
  $tab-header-height: $input-default-height;
  position: relative;

  @include evThemify() {
    border-bottom: 1px solid evThemed('border-base');
  }

  .ev-tabs-list-wrapper {
    overflow: hidden;
  }
  .ev-tabs-list {
    display: flex;
    border-radius: 4px 4px 0 0;
    border-bottom: none !important;
    float: left;
    text-align: center;
    transition: transform .3s;
    user-select: none;

    @include evThemify() {
      border: 1px solid evThemed('border-base');
    }
  }
  .ev-tabs-title {
    position: relative;
    width: 100px;
    height: $tab-header-height;
    padding: 0 17px;
    line-height: $tab-header-height;
    cursor: pointer;

    @include evThemify() {
      background-color: evThemed('background-lighten');
    }
    &:not(:first-child) {
      @include evThemify() {
        border-left: 1px solid evThemed('border-base');
      }
    }
    &:not(.select-idx):hover {
      @include evThemify() {
        color: evThemed('primary');
      }
    }
    &.active {
      background-color: transparent;
      border-bottom: 1px solid #FFFFFF;

      @include evThemify() {
        color: evThemed('primary');
      }
    }
    &.has-icon {
      padding-left: 32px;
    }
    &.drag-select {
      @include evThemify() {
        background-color: rgba(evThemed('background-base'), 0.3);
      }
    }

    .text {
      transition: transform $animate-base;

      @include shortening();
    }
    .close-icon {
      position: absolute;
      top: 50%;
      right: 7px;
      transform: translateY(-50%);
      font-size: $font-size-small;
      opacity: 0;
      transition: opacity $animate-base;
    }
  }
  .ev-tabs-icon {
    position: absolute;
    left: 10px;
  }
}

.ev-tabs-nav-wrapper {
  $tab-header-height: $input-default-height;
  box-sizing: border-box;
  margin-bottom: -1px;

  &.has-scroll {
    $arrow-width: 17px;
    padding: 0 20px;

    .ev-tabs-arrow {
      position: absolute;
      top: 0;
      width: $arrow-width;
      height: $tab-header-height;
      line-height: $tab-header-height;
      font-size: $font-size-base;
      text-align: center;
      cursor: pointer;
      background-color: #FFFFFF;
      &:hover {
        @include evThemify() {
          color: evThemed('primary');
        }
      }
      &.prev {
        left: 0;
      }
      &.next {
        right: 0;
      }
    }
  }
}
</style>
