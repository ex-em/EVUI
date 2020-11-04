<template>
  <transition
    name="ev-notification-fade"
    appear
  >
    <div
      v-show="isShow"
      class="ev-notification"
      :class="{
        [`type-${type}`]: !!type,
        'show-close': showClose,
        'has-icon': !!iconClass,
        'has-click': !!onClick,
      }"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      @click="clickMsg"
    >
      <span
        v-if="iconClass"
        class="ev-notification-icon"
      >
        <i
          :class="iconClass"
        />
      </span>
      <div class="ev-notification-content">
        <p
          v-if="title"
          class="title"
        >
          {{ title }}
        </p>
        <p
          v-if="useHTML"
          class="message"
          v-html="message"
        />
        <p
          v-else
          class="message"
        >
          {{ message }}
        </p>
      </div>
      <span
        v-if="showClose"
        class="ev-notification-close"
        @click="closeMsg"
      >
        <i class="ev-icon-close" />
      </span>
    </div>
  </transition>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue';

export default {
  name: 'EvNotification',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: val => ['info', 'success', 'warning', 'error'].includes(val),
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    position: {
      type: String,
      default: 'top-right',
      validator: val => ['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(val),
    },
    duration: {
      type: Number,
      default: 3000,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    iconClass: {
      type: String,
      default: '',
    },
    onClose: {
      type: Function,
      default: null,
    },
    onClick: {
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
  setup(props) {
    const state = reactive({
      timer: null,
      isShow: true,
    });
    const clearTimer = () => {
      clearTimeout(state.timer);
      state.timer = null;
    };
    const clickMsg = (e) => {
      if (e.target.className === 'ev-notification-close') {
        return;
      }
      if (props.onClick) {
        props.onClick();
      }
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

    onMounted(() => {
      startTimer();
      document.addEventListener('keydown', keydown);
    });
    onUnmounted(() => {
      document.removeEventListener('keydown', keydown);
    });
    return {
      startTimer,
      clearTimer,
      clickMsg,
      closeMsg,
      ...toRefs(state),
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

#ev-notification-modal {
  max-height: 100vh;
  overflow: hidden;

  @each $position in ('top-left', 'top-right', 'bottom-left', 'bottom-right') {
    .modal-#{$position} {
      position: fixed;
      z-index: 900;
      padding: 10px;

      @if $position == 'top-left' {
        top: 0;
        left: 0;

        .ev-notification-fade-enter-active {
          opacity: 0;
          transform: translateY(-10%);
        }
        .ev-notification-fade-leave-active {
          opacity: 0;
          transform: translateX(-100%);
        }
      }

      @else if $position == 'top-right' {
        top: 0;
        right: 0;

        .ev-notification-fade-enter-active {
          opacity: 0;
          transform: translateY(-10%);
        }
        .ev-notification-fade-leave-active {
          opacity: 0;
          transform: translateX(100%);
        }
      }
      @else if $position == 'bottom-left' {
        left: 0;
        bottom: 0;

        .ev-notification-fade-enter-active {
          opacity: 0;
          transform: translateY(10%);
        }
        .ev-notification-fade-leave-active {
          opacity: 0;
          transform: translateX(-100%);
        }
      }
      @else if $position == 'bottom-right' {
        bottom: 0;
        right: 0;

        .ev-notification-fade-enter-active {
          opacity: 0;
          transform: translateY(10%);
        }
        .ev-notification-fade-leave-active {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    }
  }
}
.ev-notification {
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
  transition: opacity .3s ease-in-out, transform .2s ease-in-out;
  font-size: $font-size-medium;
  line-height: 1.5em;

  @include evThemify() {
    box-shadow: 3px 3px 12px 3px evThemed('background-lighten');
  }

  &-content .title {
    margin-bottom: 7px;
    font-size: $font-size-large;
    font-weight: 700;
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
    .ev-notification-content {
      margin-right: 20px;
    }
  }
  @include state('has-icon') {
    .ev-notification-content {
      margin-left: 23px;
    }
  }
  @include state('has-click') {
    cursor: pointer;
  }

  @each $type in ('info', 'success', 'warning', 'error') {
    &.type-#{$type} {
      @if $type == 'info' {
        background-color: #FDFDFD;
        border: 1px solid #E3E3E3;
      }

      @else {
        @include evThemify() {
          background-color: evThemed($type);
        }
        .ev-notification-icon,
        .ev-notification-content {
          color: $color-white;
        }
      }
    }
  }
}
</style>
