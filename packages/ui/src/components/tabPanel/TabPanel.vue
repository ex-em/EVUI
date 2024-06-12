<template>
  <article
    v-show="isSelected"
    class="ev-tab-panel"
  >
    <slot />
  </article>
</template>

<script>
import { computed, inject } from 'vue';

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
  },
  emits: {},
  setup(props) {
    const evTabs = inject('evTabs', null);
    const isSelected = computed(() => props.value === evTabs.value);

    return {
      isSelected,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

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
