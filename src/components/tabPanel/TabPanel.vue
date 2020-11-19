<template>
  <article class="ev-tab-panel">
    <slot />
  </article>
</template>

<script>
export default {
  name: 'EvTabPanel',
  props: {
    modelValue: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
    label: {
      type: [String, Number, Symbol, Boolean],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update:modelValue': null,
    change: null,
  },
  setup() {
    return {
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-tab {
  ul, li {
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
