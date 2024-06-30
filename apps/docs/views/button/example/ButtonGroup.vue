<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div style="margin-bottom: 20px;">
      <ev-button-group>
        <ev-button>Default</ev-button>
        <ev-button
          type="primary"
        >
          Button 01
        </ev-button>
        <ev-button
          type="info"
        >
          Button 02
        </ev-button>
        <ev-button
          type="warning"
        >
          Button 03
        </ev-button>
        <ev-button
          type="error"
        >
          Button 04
        </ev-button>
      </ev-button-group>
    </div>
    <div>
      <ev-button-group>
        <ev-button
          type="info"
        >
          <ev-icon icon="ev-icon-db2" />
        </ev-button>
        <ev-button
          type="info"
        >
          <ev-icon icon="ev-icon-calendar" />
        </ev-button>
        <ev-button
          type="info"
        >
          <ev-icon icon="ev-icon-dolphin" />
        </ev-button>
        <ev-button
          type="info"
        >
          <ev-icon icon="ev-icon-bell-warning" />
        </ev-button>
      </ev-button-group>
    </div>
  </div>
</template>

<script>
export default {
  setup() {
    return {
    };
  },
};
</script>
