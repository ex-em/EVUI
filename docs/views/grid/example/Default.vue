<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-grid
      v-model="mv"
    />
    <div class="description">
      <span class="badge">
        CLICK
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const mv = ref('v-model 바인딩 값');

    return {
      mv,
    };
  },
};
</script>

<style>
</style>
