<template>
  <div
    v-show="visible"
    :aria-label="title || 'dialog'"
    :class="['ev-message-box-wrap', fade]"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    @click.self="handleWrapperClick"
  >
    <div class="ev-message-box-modal"/>
    <div
      :class="['ev-message-box', customClass]"
    >
      <div
        v-if="title !== null"
        class="ev-message-box-top"
      >
        <div class="el-message-box-top-title">
          <div
            v-if="icon"
            :class="['ev-message-box-status', icon]"
          />
          <span>{{ title }}</span>
        </div>
        <i
          class="ei ei-close"
          @click="handleAction('cancel')"
          @keydown.enter="handleAction('cancel')"
        />
      </div>
      <div class="ev-message-box-center">
        <div class="ev-message-box-container">
          <div
            v-if="icon && message !== ''"
            :class="['ev-message-box-status', icon]"
          />
          <div
            v-if="message !== ''"
            class="ev-message-box-message"
          >
            <slot>
              <p v-if="!useHTMLString">{{ message }}</p>
              <p
                v-else
                v-html="message"
              />
            </slot>
          </div>
        </div>
      </div>
      <div
        :class="['ev-message-box-bottom', bottomAlign]"
      >
        <ev-button
          v-if="showCancelButton"
          :loading="cancelButtonLoading"
          :class="[ cancelButtonClasses ]"
          size="small"
          @click.native="handleAction('cancel')"
          @keydown.enter="handleAction('cancel')">
          {{ cancelButtonText }}
        </ev-button>
        <ev-button
          v-show="showOKButton"
          ref="confirm"
          :loading="confirmButtonLoading"
          size="small"
          @click.native="handleAction('ok')"
          @keydown.enter="handleAction('ok')">
          {{ okButtonText }}
        </ev-button>
      </div>
    </div>
  </div>
</template>

<script type="text/babel">
  // let messageBox;
  const typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
  };

  export default {
    components: {
    },
    props: {
      // showClose: {
      //   type: Boolean,
      //   default: true,
      // },
      // closeOnClickModal: {
      //   type: Boolean,
      //   default: true,
      // },
      // closeOnPressEscape: {
      //   type: Boolean,
      //   default: true,
      // },
    },
    data() {
      return {
        uid: 1,
        type: 'info',
        visible: false,
        title: '',
        message: '',
        iconClass: '',
        customClass: '',
        showInput: false,
        showOKButton: true,
        showCancelButton: true,
        buttonAlign: 'right',
        action: '',
        okButtonText: 'OK',
        cancelButtonText: 'Cancel',
        confirmButtonLoading: false,
        cancelButtonLoading: false,
        confirmButtonClass: '',
        confirmButtonDisabled: false,
        cancelButtonClass: '',
        editorErrorMessage: null,
        callback: null,
        useHTMLString: false,
        focusAfterClosed: null,
        isOnComposition: false,
      };
    },
    computed: {
      icon() {
        const { type, iconClass } = this;
        return iconClass || (type && typeMap[type] ? `ev-icon-${typeMap[type]}` : '');
      },
      cancelButtonClasses() {
        return `${this.cancelButtonClass}`;
      },
      bottomAlign() {
        let result;
        switch (this.buttonAlign) {
          case 'left': result = 'ev-message-box-bottom-left'; break;
          case 'center': result = 'ev-message-box-bottom-center'; break;
          case 'right': result = 'ev-message-box-bottom-right'; break;
          default: break;
        }
        return result;
      },
      fade() {
        return this.visible ? 'ev-message-box-fade-enter-active' : 'ev-message-box-fade-leave-active';
      },
    },
    watch: {
      visible(val) {
        if (val) {
          this.uid++;
          this.$nextTick(() => {
            this.$refs.confirm.$el.focus();
          });
          this.focusAfterClosed = document.activeElement;
          // messageBox = new Dialog(this.$el, this.focusAfterClosed, this.getFirstFocus());
        }
      },
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
      getSafeClose() {
        const currentId = this.uid;
        return () => {
          this.$nextTick(() => {
            if (currentId === this.uid) this.doClose();
          });
        };
      },
      doClose() {
        if (!this.visible) return;
        this.visible = false;

        if (this.onClosed) {
          this.onClosed(this.action, this);
        }
      },
      handleWrapperClick() {
      },
      handleAction(action) {
        this.action = action;
        this.doClose();
      },
      handleClose() {
        this.handleAction('close');
      },
    },
  };
</script>
<style>
  @keyframes ev-message-box-fade-in {
    0% {
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }
    100% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
  }
  @keyframes ev-message-box-fade-out {
    0% {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }
    100% {
      transform: translate3d(0, -20px, 0);
      opacity: 0;
    }
  }

  .ev-message-box-root {
    z-index: 100000;
  }
  .ev-message-box-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  .ev-message-box-modal {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000000;
    opacity: 0.5;
    z-index: -1;
  }
  .ev-message-box {
    position: absolute;
    width: 420px;
    padding: 10px;
    background-color: #FFFFFF;
    border-radius: 4px;
    border: 1px solid #EBEEF5;
    font-size: 18px;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
    text-align: left;
    overflow: hidden;
    backface-visibility: hidden;
  }
  .ev-message-box-fade-enter-active .ev-message-box {
    animation: ev-message-box-fade-in .3s;
  }
  .ev-message-box-fade-leave-active .ev-message-box {
    animation: ev-message-box-fade-out .3s;
  }
  .ev-message-box-top {
    position: relative;
    padding-right: 20px;
  }
  .ev-message-box-top-title {
    font-size: 18px;
    line-height: 1;
    color: #303133;
  }
  .ev-message-box .ei-close {
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 12px;
    font-weight: 600;
  }
  .ev-message-box-center {
    margin: 14px 0;
    padding: 10px 0;
  }
  .ev-message-box-bottom {
    display: flex;
  }
  .ev-message-box-bottom-left {
    justify-content: flex-start;
  }
  .ev-message-box-bottom-right {
    justify-content: flex-end;
  }
  .ev-message-box-bottom-center {
    justify-content: center;
  }
  .ev-message-box-bottom button {
    margin: 0 4px;
  }
</style>
