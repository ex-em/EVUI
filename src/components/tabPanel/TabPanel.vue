<template>
  <article v-if="!lazy || hasBeenSelected" v-show="isSelected" class="ev-tab-panel">
    <slot />
  </article>
</template>

<script>
import { computed, inject, ref, watch } from 'vue';

export default {
  name: 'EvTabPanel',
  props: {
    text: {
      type: [String, Number],
      default: null,
    },
    value: {
      type: [String, Number],
      default: null,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // true면 한 번이라도 선택된 적 있는 탭만 mount하고 이후 유지(방문 캐시).
    // 기본 false는 기존 동작(모든 패널 mount + v-show 토글)과 동일.
    lazy: {
      type: Boolean,
      default: false,
    },
  },
  emits: {},
  setup(props) {
    const evTabs = inject('evTabs', null);
    const isSelected = computed(() => props.value === evTabs.value);
    // lazy 모드에서 한 번 선택되면 true로 고정되어 비선택 후에도 unmount되지 않는다.
    const hasBeenSelected = ref(isSelected.value);
    watch(isSelected, (selected) => {
      if (selected) {
        hasBeenSelected.value = true;
      }
    });

    return {
      isSelected,
      hasBeenSelected,
    };
  },
};
</script>

<style lang="scss">
@use '../../style/index.scss' as *;

.ev-tab {
  ul,
  li {
    list-style: none;
  }

  &-header {
    position: relative;

    .ev-tab-list {
      display: flex;
    }
    .ev-tab-title {
      padding: 5px 17px;

      @include evThemify() {
        border: 1px solid evThemed('border-base');
        border-left: 0;
      }
      @include shortening(block, 90px);

      &:first-child {
        @include evThemify() {
          border-left: 1px solid evThemed('border-base');
        }
      }
    }
  }
}
</style>
