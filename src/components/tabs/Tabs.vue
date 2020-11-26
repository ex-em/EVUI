<template>
  <section
    class="ev-tabs"
    :class="{
      closable: true,
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
          >
            <li
              v-for="item in tabList"
              :key="item"
              class="ev-tabs-title"
              :class="{ active: item.value === mv }"
              @click="clickTab(item.value)"
            >
              <span
                class="text"
                :title="item.text"
              >
                {{ item.text }}
              </span>
              <span
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
    <div
      class="ev-tabs-body"
    >
      <slot />
    </div>
  </section>
</template>

<script>
import {
  ref, computed,
  provide, getCurrentInstance,
  onBeforeUpdate, onUpdated,
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
    let tabElValueList = tabList.value.map(v => v.value);

    const listWrapperRef = ref(null);
    const listRef = ref(null);
    const hasScroll = ref(false);
    const listRefTranslateX = ref(0);
    const listRefStyle = computed(() => ({
      transform: `translateX(${listRefTranslateX.value}px)`,
    }));

    /**
     * 상단 탭 nav의 element 길이를 감시 및 계산하여 스크롤 여부 확인
     */
    const observeListEl = () => {
      const listWrapperWidth = listWrapperRef.value?.getBoundingClientRect().width;
      const listWidth = listRef.value?.getBoundingClientRect().width;
      hasScroll.value = listWrapperWidth < listWidth;
    };

    onBeforeUpdate(() => {
      // 삭제된 탭이 선택된 경우 탭선택인덱스를 변경하는 로직
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

    onUpdated(() => {
      observeListEl();
      tabElValueList = tabList.value.map(v => v.value);
    });

    /**
     *  탭 추가 로직
     */
    const addTab = (info) => {
      if (!info.value) {
        console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is essential.');
        return;
      }
      if (mv.value.some(v => v.value === info.value)) {
        console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is duplicate values.');
        return;
      }
      mv.value.push(info);
    };

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
    };

    /**
     * tab nav위에서 마우스 휠 동작
     * @param type - {'next'|'prev'}
     */
    const scrollTab = (type) => {
      if (type === 'next') {
        listRefTranslateX.value -= 100;
      } else {
        listRefTranslateX.value += 100;
      }
    };

    return {
      mv,
      tabList,
      addTab,
      clickTab,
      removeTab,

      listWrapperRef,
      listRef,
      hasScroll,
      listRefStyle,
      scrollTab,
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
          transform: translateX(-10%);
        }
        .close-icon {
          opacity: 1;
        }
      }
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
    transition: transform .3s;

    @include evThemify() {
      border: 1px solid evThemed('border-base');
    }
  }
  .ev-tabs-title {
    position: relative;
    width: 90px;
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
    &:hover {
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
