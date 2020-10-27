<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-button>Default</ev-button>
    <ev-button
      type="primary"
    >
      Primary
    </ev-button>
    <ev-button
      type="info"
    >
      Info
    </ev-button>
    <ev-button
      type="warning"
    >
      Warning
    </ev-button>
    <ev-button
      type="error"
    >
      error
    </ev-button>
    <ev-button
      type="ghost"
    >
      ghost
    </ev-button>
    <ev-button
      type="dashed"
    >
      dashed
    </ev-button>
    <ev-button
      type="text"
    >
      Text
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Shape</p>
    <ev-button
      shape="radius"
    >
      Default
    </ev-button>
    <ev-button
      type="primary"
      shape="radius"
    >
      Primary
    </ev-button>
    <ev-button
      type="info"
      shape="radius"
    >
      Info
    </ev-button>
    <ev-button
      type="warning"
      shape="radius"
    >
      Warning
    </ev-button>
    <ev-button
      type="error"
      shape="radius"
    >
      error
    </ev-button>
    <ev-button
      type="ghost"
      shape="radius"
    >
      ghost
    </ev-button>
    <ev-button
      type="dashed"
      shape="radius"
    >
      dashed
    </ev-button>
    <div class="description" style="margin-bottom: 20px;">
      <div class="badge yellow">
        shape=radius
      </div>
    </div>
    <div style="margin-bottom: 20px;">

      <ev-button
        shape="circle"
      >
        Default
      </ev-button>
      <ev-button
        type="primary"
        shape="circle"
      >
        Primary
      </ev-button>
      <ev-button
        type="info"
        shape="circle"
      >
        Info
      </ev-button>
      <ev-button
        type="warning"
        shape="circle"
      >
        Warning
      </ev-button>
      <ev-button
        type="error"
        shape="circle"
      >
        error
      </ev-button>
      <ev-button
        type="ghost"
        shape="circle"
      >
        ghost
      </ev-button>
      <ev-button
        type="dashed"
        shape="circle"
      >
        dashed
      </ev-button>
    </div>
    <div>
      <ev-button
        shape="circle"
      >
        <ev-icon icon="ev-icon-db2" />
      </ev-button>
      <ev-button
        type="primary"
        shape="circle"
      >
        <ev-icon icon="ev-icon-calendar" />
      </ev-button>
      <ev-button
        type="info"
        shape="circle"
      >
        <ev-icon icon="ev-icon-dolphin" />
      </ev-button>
      <ev-button
        type="warning"
        shape="circle"
      >
        <ev-icon icon="ev-icon-bell-warning" />
      </ev-button>
      <ev-button
        type="error"
        shape="circle"
      >
        <ev-icon icon="ev-icon-close2" />
      </ev-button>
      <ev-button
        type="ghost"
        shape="circle"
      >
        <ev-icon icon="ev-icon-connection" />
      </ev-button>
      <ev-button
        type="dashed"
        shape="circle"
      >
        <ev-icon icon="ev-icon-pig" />
      </ev-button>
    </div>
    <div class="description">
      <div class="badge yellow">
        shape=circle
      </div>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-button
      disabled
    >
      Default
    </ev-button>
    <ev-button
      type="primary"
      disabled
    >
      Primary
    </ev-button>
    <ev-button
      type="info"
      disabled
    >
      Info
    </ev-button>
    <ev-button
      type="warning"
      disabled
    >
      Warning
    </ev-button>
    <ev-button
      type="error"
      disabled
    >
      error
    </ev-button>
    <ev-button
      type="ghost"
      disabled
    >
      ghost
    </ev-button>
    <ev-button
      type="dashed"
      disabled
    >
      dashed
    </ev-button>
    <ev-button
      type="text"
      disabled
    >
      Text
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Size</p>
    <ev-button
      size="large"
    >
      Large
    </ev-button>
    <ev-button
      size="medium"
    >
      Medium
    </ev-button>
    <ev-button
      size="small"
    >
      Small
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">HTML Type</p>
    <form>
      <ev-button
        html-type="button"
      >
        Button
      </ev-button>
      <ev-button
        html-type="submit"
      >
        Submit
      </ev-button>
      <ev-button
        html-type="reset"
      >
        Reset
      </ev-button>
    </form>
  </div>
  <div class="case">
    <p class="case-title">Auto Focus</p>
    <ev-button
      :auto-focus="true"
    >
      Auto Focus
    </ev-button>
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <ev-button
      type="info"
      @click="clickBtn"
    >
      <ev-icon icon="ev-icon-login" />
       Click!
    </ev-button>
    <div class="description">
      <span class="badge">Click Event</span>
      {{ clickMsg }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const clickMsg = ref('No event occurred');
    const clickBtn = (e) => {
      clickMsg.value = 'Button was clicked!';
      console.log('[EVUI][Button] Click event', e);
    };
    return {
      clickMsg,
      clickBtn,
    };
  },
};
</script>
<style lang="scss" scoped>
.case .ev-button {
  margin-right: 10px;
}
</style>
