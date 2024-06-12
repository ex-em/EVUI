<template>
  <teleport to="#ev-message-modal">
    <transition
      name="ev-message-fade"
      appear
    >
      <div
        v-show="state.isShow"
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
        <span
          v-if="iconClass"
          class="ev-message-icon"
        >
          <i :class="iconClass" />
        </span>
        <div
          v-if="useHTML"
          class="ev-message-content"
          v-html="message"
        />
        <div
          v-else
          class="ev-message-content"
        >
          {{ message }}
        </div>
        <span
          v-if="showClose"
          class="ev-message-close"
          @click="closeMsg"
        >
          <i class="ev-icon-close" />
        </span>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, onMounted, onBeforeUnmount } from 'vue';
import type { Props } from './message.type';

defineOptions({
  name: 'EvMessage',
});

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  message: '',
  duration: 3000,
  showClose: false,
  iconClass: '',
  onClose: () => null,
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
  if (e.key === 'Escape' && state.isShow) {
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

defineExpose({ hide });
</script>

<style lang="scss">
@import '../../style/index.scss';

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
      background-color: nth($color-list, 1);
      border-color: nth($color-list, 2);

      .ev-message-icon,
      .ev-message-content {
        color: nth($color-list, 3);
      }
    }
  }
}
</style>
