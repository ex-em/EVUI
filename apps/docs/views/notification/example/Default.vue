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
    <p class="case-title">Position</p>
    <ev-button
      @click="showTopRight"
    >
      Show Top-Right
    </ev-button>
    <ev-button
      @click="showTopLeft"
    >
      Show Top-Left
    </ev-button>
    <ev-button
      @click="showBottomRight"
    >
      Show Bottom-Right
    </ev-button>
    <ev-button
      @click="showBottomLeft"
    >
      Show Bottom-Left
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Title</p>
    <ev-button
      @click="showTitle"
    >
      Show Title
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Hide Close Button</p>
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
    <p class="case-title">Click Event</p>
    <ev-button
      @click="showOnClick"
    >
      Show onClick
    </ev-button>
    <div class="description">
      <span class="badge">
        After click
      </span>
      {{ onClickMsg }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Close Event</p>
    <ev-button
      @click="showOnClose"
    >
      Show onClose
    </ev-button>
    <div class="description">
      <span class="badge">
        After close
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
</template>

<script>
import { ref, getCurrentInstance } from 'vue';

export default {
  setup() {
    const { ctx } = getCurrentInstance();
    const showInfo = () => {
      ctx.$notify('Infomation. This is an Info type notification.');
    };
    const showSuccess = () => {
      ctx.$notify({
        message: 'Success! This is an Success type notification.',
        type: 'success',
      });
    };
    const showWarning = () => {
      ctx.$notify({
        message: 'Warning. This is an Warning type notification.',
        type: 'warning',
      });
    };
    const showError = () => {
      ctx.$notify({
        message: 'Error. This is an Error type notification.',
        type: 'error',
      });
    };

    const showTopRight = () => {
      ctx.$notify({
        title: 'Position: Top-Right',
        message: 'Position Top Right',
      });
    };
    const showTopLeft = () => {
      ctx.$notify({
        title: 'Position: Top-Left',
        message: 'Position Top Right',
        position: 'top-left',
      });
    };
    const showBottomRight = () => {
      ctx.$notify({
        title: 'Position: Bottom-Right',
        message: 'Position Bottom Right',
        position: 'bottom-right',
      });
    };
    const showBottomLeft = () => {
      ctx.$notify({
        title: 'Position: Bottom-Left',
        message: 'Position Bottom Left',
        position: 'bottom-left',
      });
    };
    const showTitle = () => {
      ctx.$notify({
        message: 'You can enter the title.',
        title: 'Notice!',
      });
    };
    const showClose = () => {
      ctx.$notify({
        message: 'You can choose to close properties',
        showClose: false,
      });
    };
    const showDuration = () => {
      ctx.$notify({
        message: 'You can change the duration.',
        duration: 1500,
      });
    };
    const showIcon = () => {
      ctx.$notify({
        message: 'You can add an icon.',
        title: 'Notice!',
        iconClass: 'ev-icon-getmore',
      });
    };
    const onClickMsg = ref();
    const showOnClick = () => {
      ctx.$notify({
        message: 'You can set the action after clicking!',
        showClose: true,
        onClick: () => {
          onClickMsg.value = 'You can set the action after clicking!';
        },
      });
    };
    const onCloseMsg = ref();
    const showOnClose = () => {
      ctx.$notify({
        message: 'You can set the behavior after closing.',
        showClose: true,
        onClose: () => {
          onCloseMsg.value = 'You can set the behavior after closing!';
        },
      });
    };
    const showHTML = () => {
      ctx.$notify({
        message: 'You <i>can enter</i> your message in <strong>html</strong>.',
        useHTML: true,
      });
    };
    return {
      showInfo,
      showSuccess,
      showWarning,
      showError,
      showTopRight,
      showTopLeft,
      showBottomRight,
      showBottomLeft,
      showTitle,
      showClose,
      showDuration,
      showIcon,
      onClickMsg,
      showOnClick,
      onCloseMsg,
      showOnClose,
      showHTML,
    };
  },
};
</script>

<style lang="scss" scoped>
.case .ev-button {
  margin-right: 10px;
}
</style>
