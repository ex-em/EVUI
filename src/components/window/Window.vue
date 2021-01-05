<template>
  <teleport to="#ev-window-modal">
    <transition
      name="ev-window-fade"
      appear
    >
      <div
        v-if="visible"
        class="ev-window-wrapper"
      >
        <div
          v-if="showModalLayer"
          class="ev-window-dim-layer"
          @click="closeWin('layer')"
        />
        <div
          :class="['ev-window', windowClass]"
          :style="windowStyle"
        >
          <div
            v-if="$slots.header || iconClass || title"
            class="ev-window-header"
          >
            <template v-if="$slots.header">
              <slot name="header" />
            </template>
            <template v-else>
              <span
                v-if="iconClass"
                class="ev-window-icon"
              >
                <i :class="iconClass"/>
              </span>
              <p
                v-if="title"
                class="ev-window-title"
              >
                {{ title }}
              </p>
            </template>
          </div>
          <div class="ev-window-content">
            <slot />
          </div>
          <div
            v-if="$slots.footer"
            class="ev-window-footer"
          >
            <slot name="footer" />
          </div>
          <span
            class="ev-window-close"
            @click="closeWin"
          >
            <i class="ev-icon-close"/>
          </span>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvWindow',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: [String, Number],
      default: null,
    },
    windowClass: {
      type: String,
      default: '',
    },
    iconClass: {
      type: String,
      default: '',
    },
    width: {
      type: String,
      default: '50%',
    },
    height: {
      type: String,
      default: '50%',
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    showModalLayer: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:visible': [Boolean],
  },
  setup(props, { emit }) {
    /**
     * body에 ev-window-modal DIV를 append하는 로직
     */
    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-window-modal';
      const hasRoot = document.getElementById('ev-window-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };
    initWrapperDiv();

    const windowStyle = computed(() => {
      if (props.fullscreen) {
        return {
          width: '100%',
          height: '100%',
        };
      }
      return {
        width: props.width,
        height: props.height,
      };
    });
    /**
     * [x] 클릭 시 닫는 기능
     */
    const closeWin = (from) => {
      if (from === 'layer' && !props.closeOnClickModal) {
        return;
      }
      emit('update:visible', false);
    };

    return {
      windowStyle,
      closeWin,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-window-dim-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 700;
}
.ev-window {
  $padding-vertical: 20px;
  $padding-horizontal: 17px;

  display: flex;
  position: fixed;
  top: 50%;
  left: 50%;
  max-height: 100%;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: $default-radius;
  background-color: #FDFDFD;
  border: 1px solid #E3E3E3;
  transition: opacity .2s ease-in-out, transform .3s ease-in-out;
  transform: translate(-50%, -50%);
  font-size: $font-size-medium;
  line-height: 1.5em;
  z-index: 700;

  &-fade-enter-active,
  &-fade-leave-active {
    .ev-window {
      opacity: 0;
      transform: translate(-50%, -60%);
    }
  }

  &-header {
    display: flex;
    padding: $padding-vertical $padding-horizontal;
    font-weight: bold;
    font-size: $font-size-large;
  }

  &-content {
    padding: $padding-vertical $padding-horizontal;
    overflow: auto;
    flex: 1;
  }

  &-footer {
    padding: $padding-vertical $padding-horizontal;
  }

  &-title {
    color: #303133;
  }

  &-icon {
    margin-right: $padding-horizontal;
  }

  &-close {
    position: absolute;
    top: $padding-vertical;
    right: $padding-horizontal;
    cursor: pointer;
  }
}
</style>
