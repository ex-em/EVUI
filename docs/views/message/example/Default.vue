<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-button
      type="info"
      @click="showInfo"
    >
      Show Info
    </ev-button>
    <ev-button
      type="primary"
      @click="showSuccess"
    >
      Show Success
    </ev-button>
    <ev-button
      type="warning"
      @click="showWarning"
    >
      Show Warning
    </ev-button>
    <ev-button
      type="error"
      @click="showError"
    >
      Show Error
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">With Close Button</p>
    <ev-button
      @click="showClose"
    >
      Show Close
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Custom Duration</p>
    <ev-button
      @click="showDuration"
    >
      Show Duration
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Icon</p>
    <ev-button
      @click="showIcon"
    >
      Show Icon
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">After Closing</p>
    <ev-button
      @click="showOnClose"
    >
      Show onClose
    </ev-button>
    <div class="description">
      <span class="badge">
        After close behavior
      </span>
      {{ onCloseMsg }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">HTML</p>
    <ev-button
      @click="showHTML"
    >
      Show HTML
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Close from outside</p>
    <ev-button @click="showForLong">Show forever</ev-button>
    <ev-button v-show="isMessageShown" @click="hide">Hide</ev-button>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from 'vue';

export default {
  setup() {
    const ctx = getCurrentInstance().appContext.config.globalProperties;

    const showInfo = () => {
      ctx.$message('Infomation. This is an Info type message.');
    };
    const showSuccess = () => {
      ctx.$message({
        message: 'Success! This is an Success type message.',
        type: 'success',
      });
    };
    const showWarning = () => {
      ctx.$message({
        message: 'Warning. This is an Warning type message.',
        type: 'warning',
      });
    };
    const showError = () => {
      ctx.$message({
        message: 'Error. This is an Error type message.',
        type: 'error',
      });
    };
    const showClose = () => {
      ctx.$message({
        message: 'You can choose to close properties',
        showClose: true,
      });
    };
    const showDuration = () => {
      ctx.$message({
        message: 'You can change the duration.',
        duration: 1500,
      });
    };
    const showIcon = () => {
      ctx.$message({
        message: 'You can add an icon.',
        iconClass: 'ev-icon-getmore',
      });
    };
    const onCloseMsg = ref();
    const showOnClose = () => {
      ctx.$message({
        message: 'You can set the behavior after closing.',
        showClose: true,
        onClose: () => {
          onCloseMsg.value = 'You can set the behavior after closing!';
        },
      });
    };
    const showHTML = () => {
      ctx.$message({
        message: 'You <i>can enter</i> your message in <strong>html</strong>.',
        useHTML: true,
      });
    };
    const isMessageShown = ref(false);
    let hideFunction = () => {};
    const showForLong = () => {
      const { hide } = ctx.$message({
        message: 'This message stays long time until you press close button.',
        duration: 10000000,
      });
      hideFunction = hide;
      isMessageShown.value = true;
    };
    const hide = () => {
      isMessageShown.value = false;
      hideFunction();
    };
    return {
      showInfo,
      showSuccess,
      showWarning,
      showError,
      showClose,
      showDuration,
      showIcon,
      onCloseMsg,
      showOnClose,
      showHTML,
      showForLong,
      hide,
      isMessageShown,
    };
  },
};
</script>

<style lang="scss" scoped>
.case .ev-button {
  margin-right: 10px;
}
</style>
