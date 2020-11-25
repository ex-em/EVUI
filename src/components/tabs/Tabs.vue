<template>
  <section
    class="ev-tabs"
    :class="{
      closable,
    }"
  >
    <div
      class="ev-tabs-header"
    >
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
    <div class="ev-tabs-body">
      <slot />
    </div>
  </section>
</template>

<script>

import { ref, reactive, computed, watch,
  provide, getCurrentInstance, nextTick } from 'vue';

export default {
  name: 'EvTabs',
  components: {
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    closable: {
      type: Boolean,
      default: true,
    },
  },
  emits: {
    'update:modelValue': [String, Number],
    change: null,
  },
  setup(props, { emit }) {
    const instance = getCurrentInstance();
    provide('evTabs', instance);

    const mv = computed({
      get: () => props.modelValue,
      set: val => emit('update:modelValue', val),
    });
    const tabList = reactive([]);

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

    watch(
      () => tabList,
      curr => console.log(curr),
    );

    const addTab = async (val) => {
      if (!val.value) {
        console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is essential.');
        return;
      }
      if (tabList.some(v => v.value === val.value)) {
        console.warn('[EVUI][Tabs] TabPanel \'value\' attribute is duplicate values.');
        return;
      }
      tabList.push(val);

      await nextTick();
      observeListEl();
    };
    const clickTab = (val) => { mv.value = val; };
    const removeTab = async (val) => {
      if (tabList.length < 2) {
        return;
      }
      const selectedIdx = tabList.findIndex(v => v.value === val);
      if (val === mv.value) {
        if (selectedIdx === 0) {
          mv.value = tabList[1].value;
        } else {
          mv.value = tabList[selectedIdx - 1].value;
        }
      }
      tabList.splice(selectedIdx, 1);

      await nextTick();
      observeListEl();
    };
    const scrollTab = (type) => {
      console.log(type);
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
