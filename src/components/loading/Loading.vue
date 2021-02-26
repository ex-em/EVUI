<template>
  <template v-if="fullscreen">
    <teleport to="body">
      <div
        v-if="modelValue"
        class="ev-loading full-screen"
        @[`${clickEventName}`]="closeLoading"
      >
        <div class="ev-loading-spinner">
          <template v-if="$slots.default">
            <slot />
          </template>
          <template v-else>
            <i
              :class="iconClass || 'ev-icon-refresh2'"
              class="ev-loading-icon"
              :style="iconStyle"
            />
          </template>
        </div>
      </div>
    </teleport>
  </template>
  <template v-else>
    <div
      v-if="modelValue"
      class="ev-loading"
      @[`${clickEventName}`]="closeLoading"
    >
      <div class="ev-loading-spinner">
        <template v-if="$slots.default">
          <slot />
        </template>
        <template v-else>
          <i
            :class="iconClass || 'ev-icon-refresh2'"
            class="ev-loading-icon"
            :style="iconStyle"
          />
        </template>
      </div>
    </div>
  </template>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvLoading',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    clickOutside: {
      type: Boolean,
      default: false,
    },
    iconClass: {
      type: String,
      default: null,
    },
    iconStyle: {
      type: Object,
      default: () => {},
    },
  },
  emits: {
    'update:modelValue': [Boolean],
  },
  setup(props, { emit }) {
    const clickEventName = computed(() => (props.clickOutside ? 'click' : null));

    const closeLoading = () => emit('update:modelValue', false);

    return {
      clickEventName,
      closeLoading,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  opacity: 0.5;
  &.full-screen {
    position: fixed;
  }
}
.ev-loading-spinner {
  position: absolute;
  top: 50%;
  width: 100%;
  color: #409EFF;
  text-align: center;
}
.ev-loading-icon {
  display: inline-block;
  font-size: 25px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}
</style>
