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
    <p class="case-title">Title</p>
    <ev-button
      @click="showTitle"
    >
      Show Title
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
    <p class="case-title">On/Off Element</p>
    <ev-button
      @click="showConfirm"
    >
      Hide Cancel
    </ev-button>
    <ev-button
      @click="showCancel"
    >
      Hide Confirm
    </ev-button>
    <ev-button
      @click="showClose"
    >
      Hide Close
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Custom Button Text</p>
    <ev-button
      @click="showCustomText"
    >
      Custom Text
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
</template>

<script>
import { ref, getCurrentInstance } from 'vue';

export default {
  setup() {
    const { ctx } = getCurrentInstance();
    const showInfo = () => {
      ctx.$messagebox({
        message: 'Success! This is an Success type message.',
        type: 'info',
      });
    };
    const showSuccess = () => {
      ctx.$messagebox({
        message: 'Success! This is an Success type message.',
        type: 'success',
      });
    };
    const showWarning = () => {
      ctx.$messagebox({
        message: 'Warning. This is an Warning type message.',
        type: 'warning',
      });
    };
    const showError = () => {
      ctx.$messagebox({
        message: 'Error. This is an Error type message.',
        type: 'error',
      });
    };
    const showTitle = () => {
      ctx.$messagebox({
        title: 'Title!',
        message: 'You can enter the title.',
        iconClass: 'ev-icon-getmore',
      });
    };
    const showIcon = () => {
      ctx.$messagebox({
        message: 'You can add an icon.',
        iconClass: 'ev-icon-getmore',
      });
    };
    const showConfirm = () => {
      ctx.$messagebox({
        title: 'On/Off Element',
        message: 'Hide cancel button.',
        iconClass: 'ev-icon-getmore',
        showCancelBtn: false,
      });
    };
    const showCancel = () => {
      ctx.$messagebox({
        title: 'On/Off Element',
        message: 'Hide confirm button.',
        iconClass: 'ev-icon-getmore',
        showConfirmBtn: false,
      });
    };
    const showClose = () => {
      ctx.$messagebox({
        title: 'On/Off Element',
        message: 'Hide close button.',
        iconClass: 'ev-icon-getmore',
        showClose: false,
      });
    };
    const showCustomText = () => {
      ctx.$messagebox({
        title: 'Custom Button Text',
        message: 'You can modify the name of the button.',
        iconClass: 'ev-icon-getmore',
        confirmBtnText: 'Custom Confirm',
        cancelBtnText: 'Custom Cancel',
      });
    };
    const onCloseMsg = ref();
    const showOnClose = () => {
      ctx.$messagebox({
        title: 'After Close Event',
        message: 'You can set the behavior after closing.',
        onClose: (type) => {
          onCloseMsg.value = `[ type = '${type}' ] You can set the behavior after closing!`;
        },
      });
    };
    const showHTML = () => {
      ctx.$messagebox({
        title: 'Use HTML',
        message: 'You <i>can enter</i> your message in <strong>html</strong>.',
        useHTML: true,
      });
    };
    return {
      showInfo,
      showSuccess,
      showWarning,
      showError,
      showTitle,
      showIcon,
      showConfirm,
      showCancel,
      showClose,
      showCustomText,
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
