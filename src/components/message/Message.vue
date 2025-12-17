<template>
  <teleport to="#ev-message-modal">
    <transition name="ev-message-fade" appear>
      <div
        v-show="isShow"
        ref="msgRef"
        class="ev-message"
        :class="{
          [`type-${type}`]: !!type,
          'show-close': showClose,
          'has-icon': !!iconClass,
        }"
        @mouseenter="clearTimer"
        @mouseleave="startTimer"
      >
        <span v-if="iconClass" class="ev-message-icon">
          <i :class="iconClass" />
        </span>
        <div v-if="useHTML" class="ev-message-content" v-html="message" />
        <div v-else class="ev-message-content">
          {{ message }}
        </div>
        <span v-if="showClose" class="ev-message-close" @click="closeMsg">
          <i class="ev-icon-close" />
        </span>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { reactive, toRefs, onMounted, onBeforeUnmount } from 'vue';

export default {
  name: 'EvMessage',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: val => ['info', 'success', 'warning', 'error'].includes(val),
    },
    message: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      default: 3000,
    },
    showClose: {
      type: Boolean,
      default: false,
    },
    iconClass: {
      type: String,
      default: '',
    },
    onClose: {
      type: Function,
      default: null,
    },
    useHTML: {
      type: Boolean,
      default: false,
    },
    unmount: {
      type: Function,
      default: null,
    },
  },
  setup(props, context) {
    const state = reactive({
      timer: null,
      isShow: true,
    });
    const clearTimer = () => {
      clearTimeout(state.timer);
      state.timer = null;
    };
    const closeMsg = () => {
      state.isShow = false;
      if (props.onClose) {
        props.onClose();
      }
      clearTimer();
      if (props.unmount) {
        setTimeout(props.unmount, 1000);
      }
    };
    const startTimer = () => {
      if (props.duration > 0) {
        state.timer = setTimeout(() => {
          if (state.isShow) {
            closeMsg();
          }
        }, props.duration);
      }
    };
    const keydown = (e) => {
      if (e.keyCode === 27 && state.isShow) {
        closeMsg();
      }
    };
    const hide = () => {
      closeMsg();
    };

    onMounted(() => {
      startTimer();
      document.addEventListener('keydown', keydown);
    });
    onBeforeUnmount(() => {
      document.removeEventListener('keydown', keydown);
      clearTimer();
    });

    context.expose({ hide });
    return {
      startTimer,
      clearTimer,
      closeMsg,
      ...toRefs(state),
      hide,
    };
  },
};
</script>

<style lang="scss">
@use '../../style/index.scss' as *;
@use 'sass:list';

#ev-message-modal {
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 900;
  max-height: 100vh;
  padding-top: 20px;
  overflow: hidden;
  transform: translateX(-50%);
}
.ev-message {
  $padding-vertical: 20px;
  $padding-horizontal: 17px;

  display: flex;
  position: relative;
  width: 400px;
  padding: $padding-vertical $padding-horizontal;
  margin-bottom: 10px;
  align-items: center;
  box-sizing: border-box;
  border-radius: $default-radius;
  border: 1px solid #ebeef5;
  background-color: #edf2fc;
  transition:
    opacity 0.4s ease-in-out,
    transform 0.3s ease-in-out;
  font-size: $font-size-medium;
  line-height: 1.5em;

  &-fade-enter-active,
  &-fade-leave-active {
    opacity: 0;
    transform: translateY(-100%);
  }
  &-icon {
    position: absolute;
    top: $padding-vertical;
    left: $padding-horizontal;
  }
  &-close {
    position: absolute;
    top: $padding-vertical;
    right: $padding-horizontal;
    font-size: $font-size-small;
    cursor: pointer;
    transition: opacity $animate-base;

    &:hover {
      opacity: 0.5;
    }
  }

  @include state('show-close') {
    .ev-message-content {
      margin-right: 20px;
    }
  }
  @include state('has-icon') {
    .ev-message-content {
      margin-left: 23px;
    }
  }

  @each $type,
    $color-list
      in (
        'info': (
            #fdfdfd,
            #eeeeee,
            #111111,
          ),
        'success': (
            #f0f9eb,
            #e1f3d8,
            #67c23a,
          ),
        'warning': (
            #fdf6ec,
            #faecd8,
            #e6a23c,
          ),
        'error': (
            #fef0f0,
            #fde2e2,
            #f56c6c,
          )
      )
  {
    &.type-#{$type} {
      background-color: list.nth($color-list, 1);
      border-color: list.nth($color-list, 2);
      .ev-message-icon,
      .ev-message-content {
        color: list.nth($color-list, 3);
      }
    }
  }
}
</style>
