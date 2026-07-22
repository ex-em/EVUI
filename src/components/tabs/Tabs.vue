<template>
  <section
    v-resize="onResize"
    v-observe-visibility="{
      callback: onResize,
      once: true,
    }"
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
          <span class="ev-tabs-arrow prev" @click="scrollTab('prev')">
            <i class="ev-icon-s-arrow-left" />
          </span>
          <span class="ev-tabs-arrow next" @click="scrollTab('next')">
            <i class="ev-icon-s-arrow-right" />
          </span>
        </template>
        <div ref="listWrapperRef" class="ev-tabs-list-wrapper">
          <!-- ul 폭(탭 개수·라벨·아이콘 변화) 자체를 감시해 has-scroll 을 재계산한다.
               섹션 v-resize 는 뷰포트(섹션) 폭만 잡으므로 리스트 콘텐츠 폭 변화는 여기서 담당.
               (부수효과로 resize 디렉티브가 position:relative 를 걸어 li 의 offsetParent 가 ul 로 확정됨) -->
          <ul ref="listRef" v-resize="onResize" class="ev-tabs-list" :style="listRefStyle">
            <li
              v-for="(item, idx) in computedTabList"
              :key="`${item.value}_${idx}`"
              class="ev-tabs-title"
              v-bind="{ draggable }"
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
              <i v-if="item.iconClass" class="ev-tabs-icon" :class="item.iconClass" />
              <span class="text" :title="item.text">
                {{ item.text }}
              </span>
              <span v-if="closable" class="close-icon" @click.stop="removeTab(item.value)">
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
  ref,
  reactive,
  computed,
  provide,
  triggerRef,
  onBeforeUpdate,
  nextTick,
  watch,
} from 'vue';
import { ObserveVisibility as vObserveVisibility } from 'vue3-observe-visibility';
import { resize } from '@/directives/resize';

export default {
  name: 'EvTabs',
  directives: {
    observeVisibility: vObserveVisibility,
    resize,
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
        const valueList = list.map((v) => v.value);
        const setList = [...new Set(valueList)];
        if (list.length !== setList.length) {
          console.warn("[EVUI][Tabs] TabPanel 'value' attribute is duplicate values.");
          return false;
        }
        if (!list.every((v) => Object.hasOwnProperty.call(v, 'value'))) {
          console.warn("[EVUI][Tabs] TabPanel 'value' attribute is essential.");
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
    // 드래그 상태 여부 (dragstart ~ dragend)
    const isDragState = ref(false);

    const tabCloneList = ref([]);

    const mv = computed({
      get: () => props.modelValue,
      set: (val) => {
        emit('update:modelValue', val);
        emit('change', val);
      },
    });

    provide('evTabs', mv);

    const tabList = computed({
      get: () => props.panels,
      set: (val) => emit('update:panels', val),
    });
    const computedTabList = computed(() => {
      if (!props.draggable) {
        return tabList.value;
      }
      if (!isDragState.value) {
        return tabList.value;
      }
      return tabCloneList.value;
    });
    const tabElValueList = tabList.value.map((v) => v.value);

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
     * 선택된(active) 탭이 헤더 뷰포트 밖에 있으면 뷰포트 안으로 들어오도록 스크롤한다.
     * modelValue 변경 및 최초 렌더/리사이즈 시점에 호출된다.
     */
    const scrollToActiveTab = () => {
      if (!hasScroll.value || !listRef.value || !listWrapperRef.value) {
        return;
      }
      const activeIdx = computedTabList.value.findIndex((v) => v.value === mv.value);
      if (activeIdx < 0) {
        return;
      }
      const activeEl = listRef.value.children[activeIdx];
      if (!activeEl) {
        return;
      }
      const listWrapperWidth = listWrapperRef.value.offsetWidth;
      const listWidth = listRef.value.offsetWidth;
      const widthLimit = listWrapperWidth - listWidth;
      // ul(listRef)에는 transform 이 걸려 있어 offsetParent 가 ul 이 되므로,
      // li 의 offsetLeft 는 이미 ul(=translateX 가 슬라이드하는 좌표계) 기준이다.
      const activeLeft = activeEl.offsetLeft;
      const activeRight = activeLeft + activeEl.offsetWidth;
      const viewLeft = -translateScroll.x;
      const viewRight = viewLeft + listWrapperWidth;

      const lastIdx = computedTabList.value.length - 1;
      let nextX = translateScroll.x;
      if (activeLeft < viewLeft) {
        // 선택 탭이 뷰포트 왼쪽 밖 → 왼쪽 끝을 뷰포트 시작에 맞춤
        // 첫 탭이면 0 으로 스냅해 리스트(ul) 좌측 border 까지 노출
        nextX = activeIdx === 0 ? 0 : -activeLeft;
      } else if (activeRight > viewRight) {
        // 선택 탭이 뷰포트 오른쪽 밖 → 오른쪽 끝을 뷰포트 끝에 맞춤
        // 마지막 탭이면 widthLimit(절대 끝)으로 스냅해 리스트(ul) 우측 border 까지 노출
        nextX = activeIdx === lastIdx ? widthLimit : listWrapperWidth - activeRight;
      }
      // 스크롤 가능 범위 [widthLimit, 0] 로 클램프
      translateScroll.x = Math.min(0, Math.max(widthLimit, nextX));
    };

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
        // has-scroll 전환 시 화살표 padding(좌우 40px)이 적용되어 뷰포트 폭이 바뀌므로,
        // DOM 갱신 이후의 폭을 기준으로 스크롤 위치를 계산한다.
        nextTick(scrollToActiveTab);
      } else {
        translateScroll.x = 0;
      }
    };

    // modelValue(선택 탭) 변경 시 헤더가 선택 탭을 따라 스크롤되도록 함
    watch(mv, () => {
      nextTick(scrollToActiveTab);
    });

    onBeforeUpdate(() => {
      // 삭제된 탭이 선택된 경우 탭선택 인덱스를 변경하는 로직
      if (tabElValueList.length === tabList.value.length + 1) {
        let longList;
        let shortList;
        if (tabElValueList.length > tabList.value.length) {
          longList = tabElValueList;
          shortList = tabList.value.map((v) => v.value);
        } else {
          longList = tabList.value.map((v) => v.value);
          shortList = tabElValueList;
        }
        const removeValue = longList.filter((v) => !shortList.includes(v))[0];
        if (mv.value === removeValue) {
          const selectedIdx = tabElValueList.findIndex((v) => v === removeValue);
          if (selectedIdx === 0) {
            mv.value = tabList.value[0].value;
          } else {
            mv.value = tabList.value[selectedIdx - 1].value;
          }
        }
      }
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
      const selectedIdx = tabList.value.findIndex((v) => v.value === val);
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
    const dragSelectCls = (val) => props.draggable && dragObj.item?.value === val;

    /**
     *  드래그하기위해 선택한 li의 idx 여부 클래스
     */
    const selectIdxCls = (idx) => props.draggable && dragObj.idx === idx;

    /**
     * 탭 드래그 시작 메소드, isDragState모드 시작
     * @param item - 선택한 아이템
     */
    const dragstartTab = (item, idx) => {
      if (!props.draggable) {
        return;
      }
      tabCloneList.value = [...tabList.value];
      dragObj.item = item;
      dragObj.idx = idx;
      isDragState.value = true;
    };

    /**
     * 탭 드래그오버 메소드
     * @param val - 오버 중인 아이템의 value
     */
    const dragoverTab = (val) => {
      if (!props.draggable || dragObj.item?.value === val) {
        return;
      }
      const dragValueIdx = tabCloneList.value.findIndex((v) => v.value === dragObj.item?.value);
      const targetValueIdx = tabCloneList.value.findIndex((v) => v.value === val);
      tabCloneList.value.splice(dragValueIdx, 1);
      tabCloneList.value.splice(targetValueIdx, 0, dragObj.item);
    };

    /**
     * 탭 드래그 종료 메소드, 원래 tabList에 값을 넣고 isDragState모드를 종료
     */
    const dragendTab = () => {
      if (!props.draggable) {
        return;
      }
      tabList.value = [...tabCloneList.value];
      dragObj.item = {};
      dragObj.idx = null;
      isDragState.value = false;
      tabCloneList.value.splice(0);
    };

    const onResize = () => {
      observeListEl();
    };

    return {
      mv,
      computedTabList,
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

      onResize,
    };
  },
};
</script>

<style lang="scss">
@use '../../style/index.scss' as *;

.ev-tabs {
  ul,
  li {
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
    user-select: none;
    overflow: hidden;
  }

  .ev-tabs-list {
    display: flex;
    float: left;
    border-radius: 4px 4px 0 0;
    border-bottom: none !important;
    text-align: center;
    transition: transform 0.3s;
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

      @include evThemify() {
        border-bottom: 1px solid evThemed('background-base');
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
  user-select: none;

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

      @include evThemify() {
        background-color: evThemed('background-base');
      }

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
