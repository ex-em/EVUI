<template>
  <teleport to="body">
    <transition
      name="ev-message-box-fade"
      appear
    >
      <div
        v-show="isShow"
        id="ev-message-box-modal"
        @click.self="closeMsg('modal')"
      >
        <div
          ref="msgRef"
          class="ev-message-box"
          :class="{
          [`type-${type}`]: !!type,
          'show-close': showClose,
          'has-icon': !!iconClass,
          'has-title': !!title,
        }"
        >
          <span
            v-if="iconClass"
            class="ev-message-box-icon"
          >
            <i
              :class="iconClass"
            />
          </span>
          <div class="ev-message-box-content">
            <p
              v-if="title"
              class="ev-message-box-title"
            >
              {{ title }}
            </p>
            <p
              v-if="useHTML"
              class="ev-message-box-message"
              v-html="message"
            />
            <p
              v-else
              class="ev-message-box-message"
            >
              {{ message }}
            </p>
          </div>
          <div class="ev-message-box-btn">
            <ev-button
              v-if="showCancelBtn"
              size="small"
              class="ev-message-box-cancel"
              @click="closeMsg('cancel')"
            >
              {{ cancelBtnText }}
            </ev-button>
            <ev-button
              v-if="showConfirmBtn"
              type="primary"
              size="small"
              class="ev-message-box-confirm"
              @click="closeMsg('ok')"
            >
              {{ confirmBtnText }}
            </ev-button>
          </div>
          <span
            v-if="showClose"
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

<script>
import { reactive, toRefs, watch, onMounted } from 'vue';
import EvButton from '@/components/button/Button.vue';

export default {
  name: 'EvMessageBox',
  components: {
    EvButton,
  },
  props: {
    type: {
      type: String,
      default: '',
      validator: val => ['', 'info', 'success', 'warning', 'error'].includes(val),
    },
    title: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    iconClass: {
      type: String,
      default: '',
    },
    onClose: {
      type: Function,
      default: null,
    },
    showClose: {
      type: Boolean,
      default: true,
    },
    showConfirmBtn: {
      type: Boolean,
      default: true,
    },
    showCancelBtn: {
      type: Boolean,
      default: true,
    },
    confirmBtnText: {
      type: String,
      default: 'OK',
    },
    cancelBtnText: {
      type: String,
      default: 'Cancel',
    },
    closeOnClickModal: {
      type: Boolean,
      default: true,
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
      isShow: true,
      iconClass: '',
    });
    const closeMsg = (btnType) => {
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
    const keydown = (e) => {
      if (e.keyCode === 27 && state.isShow) {
        closeMsg();
      }
    };

    const getIconClassName = (type) => {
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

    onMounted(() => {
      setState();
      document.addEventListener('keydown', keydown);
      document.body.classList.add('ev-message-box-scroll-lock');
    });
    watch(() => state.isShow, (val) => {
      if (!val) {
        document.removeEventListener('keydown', keydown);
        document.body.classList.remove('ev-message-box-scroll-lock');
      }
    });
    return {
      closeMsg,
      ...toRefs(state),
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';

.ev-message-box-scroll-lock {
  overflow: hidden !important;
}
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
  transition: opacity .2s ease-in-out;
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
  background-color: #FDFDFD;
  border: 1px solid #E3E3E3;
  transition: opacity .2s ease-in-out, transform .3s ease-in-out;
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
