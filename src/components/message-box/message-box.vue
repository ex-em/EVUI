<template>
  <div
    v-show="visible"
    :aria-label="title || 'dialog'"
    :class="['ev-message-box-wrap', fade]"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
  >
    <div class="ev-message-box-modal" />
    <div
      :class="['ev-message-box', customClass]"
    >
      <div
        class="ev-message-box-top"
      >
        <div class="ev-message-box-top-title">
          <ev-icon
            v-if="showHeaderIcon"
            :cls="headerTypeIconInfo.cls"
            :style="headerTypeIconInfo.style"
          />
          <span>{{ title }}</span>
        </div>
        <ev-icon
          :cls="'ei-close'"
          @click="handleAction('cancel')"
          @keydown.enter="handleAction('cancel')"
        />
      </div>
      <div class="ev-message-box-center">
        <div class="ev-message-box-container">
          <div
            v-if="message !== ''"
            class="ev-message-box-message"
          >
            <slot>
              <p v-if="!useHTMLString">
                {{ message }}
              </p>
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
          size="small"
          @click.native="handleAction('cancel')"
          @keydown.enter="handleAction('cancel')"
        >
          {{ cancelButtonText }}
        </ev-button>
        <ev-button
          v-show="showOKButton"
          ref="confirm"
          :type="'primary'"
          size="small"
          @click.native="handleAction('ok')"
          @keydown.enter="handleAction('ok')"
        >
          {{ okButtonText }}
        </ev-button>
      </div>
    </div>
  </div>
</template>

<script type="text/babel">
  export default {
    data() {
      return {
        type: 'info',
        visible: false,
        title: '',
        message: '',
        iconClass: '',
        customClass: '',
        showOKButton: true,
        showCancelButton: true,
        buttonAlign: 'right',
        action: '',
        okButtonText: 'OK',
        cancelButtonText: 'Cancel',
        confirmButtonClass: '',
        confirmButtonDisabled: false,
        cancelButtonClass: '',
        callback: null,
        showHeaderIcon: true,
        useHTMLString: false,
        headerTypeIconInfo: {
          cls: '',
          style: '',
        },
      };
    },
    computed: {
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
      type: {
        immediate: true,
        handler(value) {
          switch (value) {
            case 'success':
              this.headerTypeIconInfo = {
                cls: '',
                style: '',
              };
              break;
            case 'info':
              this.headerTypeIconInfo = {
                cls: 'ei-info2',
                style: 'color: #4169E1;',
              };
              break;
            case 'warning':
              this.headerTypeIconInfo = {
                cls: 'ei-warning2',
                style: 'color: #FE8A00;',
              };
              break;
            case 'error':
              this.headerTypeIconInfo = {
                cls: 'ei-warning3',
                style: 'color: #FF0000;',
              };
              break;
            default:
              break;
          }
        },
      },
      visible(val) {
        if (val) {
          setTimeout(() => {
            if (this.$refs.confirm) {
              this.$refs.confirm.$el.focus();
            }
          });
        }
      },
    },
    mounted() {
    },
    beforeDestroy() {
    },
    methods: {
      doClose() {
        if (!this.visible) {
          return;
        }
        this.visible = false;

        if (this.onClosed) {
          this.onClosed(this.action, this);
        }
      },
      handleAction(action) {
        this.action = action;
        this.doClose();
      },
    },
  };
</script>
<style lang="scss">
  @import '~@/styles/default';

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

  .ev-message-box-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
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
    color: #303133;
  }
  ev-message-box-top-title .ei {
    font-size: 16px;
  }
  .ev-message-box .ei-close {
    position: absolute;
    top: 5px;
    right: 7px;
    font-size: 12px;
    cursor: pointer;
  }
  .ev-message-box .ei-close:hover {
    transition: color $animate-fast;

    @include evThemify() {
      color: evThemed('color-primary');
    }
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
