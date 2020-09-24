<template>
  <div class="case">
    <p class="case-title">Size</p>
    <div style="font-size: 40px;">
      <ev-icon icon="ev-icon-user" />
      <ev-icon icon="ev-icon-topology" />
      <i class="ev-icon-server"/>
    </div>
    <div class="description">
      font-size 지정하여 크기 변경
    </div>
    <div>
      <ev-icon
        icon="ev-icon-user2"
        size="s"
      />
      <ev-icon
        icon="ev-icon-user2"
        size="m"
      />
      <ev-icon
        icon="ev-icon-user2"
        size="l"
      />
    </div>
    <div class="description">
      size 변수(s, m, l) 바인딩
    </div>
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <div style="font-size: 40px;">
      <ev-icon
        icon="ev-icon-save"
        @click="clickIcon"
        @dblClick="dblClickIcon"
        @contextmenu="contextMenuIcon"
      />
    </div>
    <div class="description">
      <span class="badge">
        Click Event Name
      </span>
      {{ eventText }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const eventText = ref('No event occurred');
    const clickIcon = (e) => { eventText.value = e.type; };
    const dblClickIcon = (e) => { eventText.value = e.type; };
    const contextMenuIcon = (e) => { eventText.value = e.type; };
    return {
      eventText,
      clickIcon,
      dblClickIcon,
      contextMenuIcon,
    };
  },
};
</script>

<style lang="scss">
</style>
