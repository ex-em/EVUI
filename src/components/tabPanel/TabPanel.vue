<template>
  <article
    v-show="isSelected"
    class="ev-tab-panel"
  >
    <slot />
  </article>
</template>

<script>
import { reactive, computed, inject } from 'vue';

export default {
  name: 'EvTabPanel',
  props: {
    text: {
      type: String,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
  },
  setup(props) {
    const tabInfo = reactive({
      text: props.text,
      value: props.value,
      disabled: props.disabled,
    });
    const evTabs = inject('evTabs', null);
    const mv = computed(() => evTabs.ctx.mv);
    const addTab = evTabs.ctx.addTab;

    addTab(tabInfo);
    const isSelected = computed(() => props.value === mv.value);

    return {
      mv,
      isSelected,
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
