<template>
  <transition name="ev-notification-fade">
    <div
      v-show="visible"
      :class="['ev-notification', `ev-notification-${type}`, customClass, hClass]"
      :style="positionStyle"
      role="alert"
      @mouseenter="clearTimer()"
      @mouseleave="startTimer()"
      @click="click"
    >
      <i
        v-if="type || iconClass"
        :class="[ iconClass === '' ? `ei-${type}` : iconClass ]"
        class="ev-notification-icon"
      />
      <div
        :class="{ 'is-with-icon': typeClass || iconClass }"
        class="ev-notification-wrap"
      >
        <h3
          class="ev-notification-title"
          v-text="title"
        />
        <div
          v-show="message"
          class="ev-notification-content"
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
        <i
          v-if="showClose"
          class="ev-notification-close-btn ei ei-close"
          @click.stop="close"
        />
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
  const typeMap = {
    success: 'success',
    info: 'info',
    warning: 'warning',
    error: 'error',
  };

  export default {
    data() {
      return {
        visible: false,
        title: '',
        message: '',
        height: 80,
        duration: 4500,
        type: 'info',
        showClose: true,
        customClass: '',
        iconClass: '',
        onClose: null,
        onClick: null,
        closed: false,
        offsetY: 0,
        timer: null,
        useHTMLString: false,
        position: 'top-right',
      };
    },
    computed: {
      typeClass() {
        return this.type && typeMap[this.type] ? `ei-${typeMap[this.type]}` : '';
      },
      hClass() {
        return this.position.indexOf('right') > -1 ? 'right' : 'left';
      },
      positionStyle() {
        return {
          [this.position.indexOf('top') > -1 ? 'top' : 'bottom']: `${this.offsetY}px`,
        };
      },
    },
    watch: {
      closed(newVal) {
        if (newVal) {
          this.visible = false;
          this.$el.addEventListener('transitionend', this.destroyElement);
        }
      },
    },
    mounted() {
      if (this.duration > 0) {
        this.timer = setTimeout(() => {
          if (!this.closed) {
            this.close();
          }
        }, this.duration);
      }
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    },
    methods: {
      destroyElement() {
        this.$el.removeEventListener('transitionend', this.destroyElement);
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      click() {
        if (typeof this.onClick === 'function') {
          this.onClick();
        }
      },
      close() {
        this.closed = true;
        if (typeof this.onClose === 'function') {
          this.onClose();
        }
        if (this.onBeforeClosed) {
          this.onBeforeClosed(this);
        }
      },
      clearTimer() {
        clearTimeout(this.timer);
      },
      startTimer() {
        if (this.duration > 0) {
          this.timer = setTimeout(() => {
            if (!this.closed) {
              this.close();
            }
          }, this.duration);
        }
      },
      keydown(e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          this.clearTimer();
        } else if (e.keyCode === 27) {
          if (!this.closed) {
            this.close();
          }
        } else {
          this.startTimer();
        }
      },
    },
  };
</script>
<style>
  .ev-notification {
    display: flex;
    width: 330px;
    box-sizing: border-box;
    position: fixed;
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(0, 0, 0, 0.1) 0 2px 12px 0;
    padding: 14px 26px 14px 13px;
    border-radius: 8px;
    border-width: 1px;
    border-style: solid;
    border-color: rgb(235, 238, 245);
    border-image: initial;
    overflow: hidden;
    transition-property: opacity, transform, left, right, top, bottom;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    transition-delay: 0s;
  }
  .ev-notification-fade-leave-active {
    opacity: 0;
  }
  .ev-notification-fade-enter.right {
    right: 0;
    transform: translateX(100%);
  }
  .ev-notification-fade-enter.left {
    left: 0;
    transform: translateX(-100%);
  }
  .ev-notification.top {
    top: 16px;
  }
  .ev-notification.right {
    right: 16px;
  }
  .ev-notification-title {
    margin: 0;
    font-weight: 700;
    font-size: 16px;
    color: rgb(48, 49, 51);
  }
  .ev-notification-close-btn {
    position: absolute;
    top: 18px;
    right: 15px;
    cursor: pointer;
    font-size: 16px;
  }
  .ev-notification-info {
    background-color: #FDFDFD;
    border-color: #EEEEEE;
  }
  .ev-notification-success {
    background-color: #F0F9EB;
    border-color: #E1F3D8;
  }
  .ev-notification-warning {
    background-color: #FDF6EC;
    border-color: #FAECD8;
  }
  .ev-notification-error {
    background-color: #FEF0F0;
    border-color: #FDE2E2;
  }
  .ev-notification-info .ev-notification-wrap {
    color: #111111;
  }
  .ev-notification-success .ev-notification-wrap {
    color: #67C23A;
  }
  .ev-notification-warning .ev-notification-wrap {
    color: #E6A23C;
  }
  .ev-notification-error .ev-notification-wrap {
    color: #F56C6C;
  }
  .ev-notification-wrap {
    width: 100%;
  }
  .ev-notification-success .ev-notification-title {
    color: #F56C6C;
  }
</style>
