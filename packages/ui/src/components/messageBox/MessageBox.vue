<template>
  <teleport to="body">
    <transition
      name="ev-message-box-fade"
      appear
    >
      <div
        v-show="state.isShow"
        id="ev-message-box-modal"
        @click.self="closeMsg('modal')"
        @wheel.stop.prevent="() => {}"
      >
        <div
          ref="msgRef"
          class="ev-message-box"
          :class="{
            [`type-${props.type}`]: !!props.type,
            'show-close': props.showClose,
            'has-icon': !!state.iconClass,
            'has-title': !!props.title,
          }"
          tabindex="-1"
        >
          <span
            v-if="state.iconClass"
            class="ev-message-box-icon"
          >
            <i :class="state.iconClass" />
          </span>
          <div class="ev-message-box-content">
            <p
              v-if="props.title"
              class="ev-message-box-title"
            >
              {{ props.title }}
            </p>
            <p
              v-if="props.useHTML"
              class="ev-message-box-message"
              v-html="props.message"
            />
            <p
              v-else
              class="ev-message-box-message"
            >
              {{ props.message }}
            </p>
          </div>
          <div class="ev-message-box-btn">
            <ev-button
              v-if="props.showCancelBtn"
              size="small"
              class="ev-message-box-cancel"
              :auto-focus="hasFocus('cancelBtn')"
              @click="closeMsg('cancel')"
            >
              {{ props.cancelBtnText }}
            </ev-button>
            <ev-button
              v-if="props.showConfirmBtn"
              type="primary"
              size="small"
              class="ev-message-box-confirm"
              :auto-focus="hasFocus('confirmBtn')"
              @click="closeMsg('ok')"
            >
              {{ props.confirmBtnText }}
            </ev-button>
          </div>
          <span
            v-if="props.showClose"
            class="ev-message-box-close"
            @click="closeMsg('cancel')"
          >
            <i class="ev-icon-close" />
          </span>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { reactive, watch, onMounted, ref, onBeforeUnmount } from 'vue';
import type {
  Props,
  MessageType,
  CloseType,
  FocusType,
} from './messageBox.type';
import EvButton from '../button/Button.vue';

defineOptions({
  name: 'EvMessageBox',
});

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  title: '',
  message: '',
  iconClass: 'ev-icon-info2',
  showClose: true,
  showConfirmBtn: true,
  showCancelBtn: true,
  confirmBtnText: 'OK',
  cancelBtnText: 'Cancel',
  closeOnClickModal: true,
  useHTML: false,
  focusable: false,
  onClose: () => null,
  unmount: () => null,
});
const msgRef = ref<HTMLElement | null>(null);

const state = reactive({
  isShow: true,
  iconClass: '',
});
const closeMsg = (btnType: CloseType) => {
  if (!props.closeOnClickModal && btnType === 'modal') {
    return;
  }

  const type = btnType === 'modal' ? 'cancel' : btnType;
  state.isShow = false;

  if (props.onClose) {
    props.onClose(type);
  }
  if (props.unmount) {
    setTimeout(props.unmount, 1000);
  }
};
const keydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && state.isShow) {
    closeMsg('cancel');
  }
};

const getIconClassName = (type: MessageType) => {
  switch (type) {
    case 'success':
      return 'ev-icon-arrow-check';
    case 'warning':
      return 'ev-icon-warning2';
    case 'error':
      return 'ev-icon-warning3';
    case 'info':
    default:
      return 'ev-icon-info2';
  }
};
const setState = () => {
  if (props.iconClass) {
    state.iconClass = props.iconClass;
  } else if (props.type) {
    state.iconClass = getIconClassName(props.type);
  }
};

const hasFocus = (type: FocusType) => {
  if (!props.focusable) return false;

  switch (type) {
    case 'confirmBtn':
      return props.showConfirmBtn;
    case 'cancelBtn':
      return !props.showConfirmBtn && props.showCancelBtn;
    case 'messageBox':
      return !props.showConfirmBtn && !props.showCancelBtn;
    default:
      return false;
  }
};

onMounted(() => {
  setState();
  document.addEventListener('keydown', keydown);
  if (hasFocus('messageBox')) {
    msgRef.value?.focus();
  }
});
watch(
  () => state.isShow,
  (val) => {
    if (!val) {
      document.removeEventListener('keydown', keydown);
    }
  }
);
onBeforeUnmount(() => {
  document.removeEventListener('keydown', keydown);
});
</script>

<style lang="scss">
@import '../../style/index.scss';

#ev-message-box-modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 901;
  width: 100vw;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.2s ease-in-out;
}
.ev-message-box {
  $padding-vertical: 20px;
  $padding-horizontal: 17px;

  position: relative;
  width: 400px;
  padding: $padding-vertical $padding-horizontal $padding-vertical - 5px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border-radius: $default-radius;
  background-color: #fdfdfd;
  border: 1px solid #e3e3e3;
  transition:
    opacity 0.2s ease-in-out,
    transform 0.3s ease-in-out;
  font-size: $font-size-medium;
  line-height: 1.5em;

  &-fade-enter-active,
  &-fade-leave-active {
    .ev-message-box-layer {
      opacity: 0;
    }
    .ev-message-box {
      opacity: 0;
      transform: translateY(-10%);
    }
  }
  &-title {
    margin-bottom: 17px;
    font-size: $font-size-large;
    font-weight: 700;
  }
  &-icon {
    position: absolute;
    top: $padding-vertical;
    left: $padding-horizontal;
    font-size: $font-size-large + 2px;
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
  &-btn {
    margin-top: 23px;
    text-align: right;
    .ev-button {
      min-width: 70px;
      margin-left: 5px;
    }
  }

  @include state('show-close') {
    .ev-message-box-message {
      margin-right: 20px;
    }
  }
  @include state('has-icon') {
    .ev-message-box-message {
      margin-left: 23px;
    }
  }
  @include state('has-title') {
    .ev-message-box-message {
      margin: 0 5px;
    }
    &.show-close {
      .ev-message-box-title {
        margin-right: 20px;
      }
      .ev-message-box-message {
        margin-right: 5px;
      }
    }
    &.has-icon {
      .ev-message-box-title {
        margin-left: 23px;
      }
      .ev-message-box-message {
        margin-left: 5px;
      }
    }
  }

  @each $type in ('info', 'success', 'warning', 'error') {
    &.type-#{$type} {
      .ev-message-box-icon {
        @include evThemify() {
          color: evThemed($type);
        }
      }
    }
  }
}
</style>
