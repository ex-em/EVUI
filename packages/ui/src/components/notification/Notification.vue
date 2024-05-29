<template>
  <transition name="ev-notification-fade" appear>
    <div
      v-show="state.isShow"
      class="ev-notification"
      :class="{
        [`type-${props.type}`]: !!props.type,
        'show-close': props.showClose,
        'has-icon': !!props.iconClass,
        'has-click': !!props.onClick,
      }"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
      @click="clickMsg"
    >
      <span v-if="props.iconClass" class="ev-notification-icon">
        <i :class="props.iconClass" />
      </span>
      <div class="ev-notification-content">
        <p v-if="props.title" class="title">
          {{ props.title }}
        </p>
        <p v-if="props.useHTML" class="message" v-html="props.message" />
        <p v-else class="message">
          {{ props.message }}
        </p>
      </div>
      <span
        v-if="props.showClose"
        class="ev-notification-close"
        @click="closeMsg"
      >
        <i class="ev-icon-close" />
      </span>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue';
import type { Props } from './notification.type';

defineOptions({
  name: 'EvNotification',
});

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  message: '',
  position: 'top-right',
  duration: 3000,
  showClose: true,
  iconClass: '',
  onClose: () => null,
  onClick: () => null,
  useHTML: false,
  unmount: () => null,
});
const state = reactive<{
  timer: ReturnType<typeof setTimeout> | null;
  isShow: boolean;
}>({
  timer: null,
  isShow: true,
});
const clearTimer = () => {
  if (state.timer) clearTimeout(state.timer);
  state.timer = null;
};
const clickMsg = (e: MouseEvent) => {
  if ((e.target as HTMLElement)?.className === 'ev-notification-close') {
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
const keydown = (e: KeyboardEvent) => {
  if (e.code === 'Escape' && state.isShow) {
    closeMsg();
  }
};

onMounted(() => {
  startTimer();
  document.addEventListener('keydown', keydown);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown);
  clearTimer();
});
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
      } @else if $position == 'top-right' {
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
      } @else if $position == 'bottom-left' {
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
      } @else if $position == 'bottom-right' {
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
  transition:
    opacity 0.3s ease-in-out,
    transform 0.2s ease-in-out;
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
        background-color: #fdfdfd;
        border: 1px solid #e3e3e3;
      } @else {
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
