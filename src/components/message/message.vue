<template>
  <transition
    name="ev-message-fade"
    @after-leave="onAfterLeave"
  >
    <div
      v-show="visible"
      :class="[
        'ev-message',
        `ev-message-${ type }`,
        center ? 'is-center' : '',
        showClose ? 'is-closable' : '',
        customClass
      ]"
      :style="positionStyle"
      role="alert"
      @mouseenter="clearTimer"
      @mouseleave="startTimer"
    >
      <i
        v-if="iconClass"
        :class="iconClass"
      />
      <slot>
        <p
          v-if="!useHTMLString"
          class="el-message-content"
        >
          {{ message }}
        </p>
        <p
          v-else
          class="el-message-content"
          v-html="message"
        />
      </slot>
      <i
        v-if="showClose"
        class="ei ei-close"
        @click="close"
      />
    </div>
  </transition>
</template>
<script>
  // const typeMap = {
  //   info: 'info',
  //   success: 'success',
  //   warning: 'warning',
  //   error: 'error',
  // };
  export default {
    data() {
      return {
        type: 'info',
        visible: false,
        height: 60,
        offset: {
          x: 0,
          y: 0,
        },
        message: '',
        duration: 3000,
        iconClass: '',
        customClass: '',
        onClose: null,
        showClose: false,
        closed: false,
        timer: null,
        useHTMLString: false,
        center: false,
      };
    },
    computed: {
      positionStyle() {
        return {
          top: `${this.offset.y}px`,
          height: `${this.height}px`,
        };
      },
    },
    watch: {
      closed(newVal) {
        if (newVal) {
          this.visible = false;
        }
      },
    },
    mounted() {
      this.startTimer();
      document.addEventListener('keydown', this.keydown);
    },
    beforeDestroy() {
      document.removeEventListener('keydown', this.keydown);
    },
    methods: {
      onAfterLeave() {
        this.$destroy(true);
        this.$el.parentNode.removeChild(this.$el);
      },
      close() {
        this.closed = true;
        if (this.onClose) {
          this.onClose(this);
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
        if (e.keyCode === 27) {
          if (!this.closed) {
            this.close();
          }
        }
      },
    },
  };
</script>
<style>
  .ev-message-root {
    position: absolute;
    top: 0;
    left: 0;
  }
  .ev-message {
    display: flex;
    position: fixed;
    left: 50%;
    top: 20px;
    z-index: 900;
    min-width: 380px;
    padding: 15px 15px 15px 20px;
    box-sizing: border-box;
    border-radius: 4px;
    border: 1px solid #EBEEF5;
    background-color: #EDF2FC;
    align-items: center;
    overflow: hidden;
    transform: translateX(-50%);
    transition: opacity .3s, transform .3s, top .3s;
  }
  .ev-message-fade-enter,
  .ev-message-fade-leave-active {
    opacity: 0;
    transform: translate(-50%, -100%);
  }
  .ev-message-info {
    background-color: #FDFDFD;
    border-color: #EEEEEE;
  }
  .ev-message-success {
    background-color: #F0F9EB;
    border-color: #E1F3D8;
  }
  .ev-message-warning {
    background-color: #FDF6EC;
    border-color: #FAECD8;
  }
  .ev-message-error {
    background-color: #FEF0F0;
    border-color: #FDE2E2;
  }
  .ev-message-info .el-message-content {
    color: #111111;
  }
  .ev-message-success .el-message-content {
    color: #67C23A;
  }
  .ev-message-warning .el-message-content {
    color: #E6A23C;
  }
  .ev-message-error .el-message-content {
    color: #F56C6C;
  }
  .el-message-content {
    width: 100%;
  }
</style>
