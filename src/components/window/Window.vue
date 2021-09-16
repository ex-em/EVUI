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
          { 'scroll-lock': hideScroll },
          { 'scroll-allow': !hideScroll && !isModal },
        ]"
      >
        <div
          v-if="isModal"
          class="ev-window-dim-layer"
          @click="closeWin('layer')"
          @wheel.stop.prevent="() => {}"
        />
        <div
          ref="windowRef"
          :class="['ev-window', windowClass, { fullscreen: !!fullscreen }]"
          :style="{
            ...baseStyle,
            ...dragStyle,
          }"
          @mousedown.prevent="startDrag"
          @mousemove.prevent="moveMouse"
        >
          <div
            v-if="$slots.header || iconClass || title"
            ref="headerRef"
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
          <div class="ev-window-top-right-icon">
            <span
              v-if="maximizable && !fullscreen"
              class="ev-window-maximizable"
              @click="clickExpandBtn"
            >
              <i
                :class="maximizableIcon"
              />
            </span>
            <span
              class="ev-window-close"
              @click="closeWin"
            >
              <i class="ev-icon-close"/>
            </span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { useModel, useMouseEvent } from './uses';

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
      type: [String, Number],
      default: '50vw',
    },
    height: {
      type: [String, Number],
      default: '50vh',
    },
    minWidth: {
      type: [String, Number],
      default: 150,
    },
    minHeight: {
      type: [String, Number],
      default: 150,
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
      default: true,
    },
    draggable: {
      type: Boolean,
      default: false,
    },
    resizable: {
      type: Boolean,
      default: false,
    },
    maximizable: {
      type: Boolean,
      default: false,
    },
  },
  emits: [
    'update:visible',
    'mousedown',
    'mousedown-mouseup',
    'mousedown-mousemove',
    'resize',
  ],
  setup() {
    const {
      windowRef,
      headerRef,
      isFullExpandWindow,
      maximizableIcon,
      baseStyle,
      closeWin,
      numberToUnit,
      removeUnit,
    } = useModel();

    const {
      dragStyle,
      startDrag,
      moveMouse,
      clickExpandBtn,
    } = useMouseEvent({
      windowRef,
      headerRef,
      isFullExpandWindow,
      numberToUnit,
      removeUnit,
    });

    return {
      windowRef,
      headerRef,
      baseStyle,
      dragStyle,
      maximizableIcon,

      closeWin,
      startDrag,
      moveMouse,
      clickExpandBtn,
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';
.ev-window-scroll-lock {
  overflow: hidden !important;
}
.ev-window-scroll-allow {
  position: relative !important;
  overflow-x: hidden !important;
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
  top: 0;
  left: 0;
  width: 50vw;
  height: 50vh;
  max-width: 100%;
  max-height: 100%;
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

  &-top-right-icon {
    position: absolute;
    top: $padding-vertical;
    right: $padding-horizontal;
    > span {
      display: inline-flex;
      width: 22px;
      height: 22px;
      margin-left: 8px;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      font-size: 16px;
    }
  }
}
</style>
