<template>
  <teleport to="#ev-window-modal">
    <transition
      name="ev-window-fade"
      appear
    >
      <div
        v-if="visible"
        :class="[
          'ev-window-wrapper',
          { 'hide-scroll-layer': hideScroll },
        ]"
      >
        <div
          v-if="isModal"
          class="ev-window-dim-layer"
          @click="closeWin('layer')"
          @wheel.stop.prevent="() => {}"
        />
        <div
          :class="['ev-window', windowClass, { fullscreen: !!fullscreen }]"
          :style="style"
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
          <div
            ref="windowContent"
            class="ev-window-content"
            @wheel="onWheelContent"
          >
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
import { ref, computed, watch } from 'vue';

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
    style: {
      type: Object,
      default: () => {},
    },
    fullscreen: {
      type: Boolean,
      default: false,
    },
    isModal: {
      type: Boolean,
      default: true,
    },
    closeOnClickModal: {
      type: Boolean,
      default: false,
    },
    hideScroll: {
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
    let root = document.getElementById('ev-window-modal');
    const initWrapperDiv = () => {
      if (!root) {
        const rootDiv = document.createElement('div');
        rootDiv.id = 'ev-window-modal';
        document.body.appendChild(rootDiv);
        root = document.getElementById('ev-window-modal');
      }
    };
    initWrapperDiv();

    const windowContent = ref(null);

    /**
     * [x] 클릭 시 닫는 기능
     */
    const closeWin = (from) => {
      if (from === 'layer' && !props.closeOnClickModal) {
        return;
      }
      emit('update:visible', false);
    };

    const changeBodyCls = (isVisible) => {
      if (isVisible) {
        if (props.hideScroll) {
          document.body.classList.add('ev-window-scroll-lock');
        }
      } else {
        const windowCount = root?.getElementsByClassName('hide-scroll-layer')?.length;
        if (windowCount === 1) {
          document.body.classList.remove('ev-window-scroll-lock');
        }
      }
    };

    const onWheelContent = (e) => {
      const hasScroll = windowContent.value.scrollHeight > windowContent.value.clientHeight;
      if (!hasScroll) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      const isMeetTop = windowContent.value.scrollTop === 0;
      const isMeetBottom = (windowContent.value.scrollHeight - windowContent.value.clientHeight)
        === windowContent.value.scrollTop;
      const isUpward = e.deltaY < 0;
      const isDownward = e.deltaY > 0;

      if ((isMeetBottom && isDownward) || (isMeetTop && isUpward)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    watch(
      () => props.visible,
      newVal => changeBodyCls(newVal),
    );

    return {
      windowContent,
      closeWin,
      onWheelContent,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-window-scroll-lock {
  overflow: hidden !important;
}
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
  width: 50vw;
  height: 50vh;
  max-width: 100%;
  max-height: 100%;
  margin-top: -25vh;
  margin-left: -25vw;
  flex-direction: column;
  box-sizing: border-box;
  border-radius: $default-radius;
  background-color: #FDFDFD;
  border: 1px solid #E3E3E3;
  transition: opacity .2s ease-in-out, transform .3s ease-in-out;
  font-size: $font-size-medium;
  line-height: 1.5em;
  z-index: 700;

  &.fullscreen {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  &-fade-enter-active,
  &-fade-leave-active {
    .ev-window {
      opacity: 0;
      transform: translateY(-10%);
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
