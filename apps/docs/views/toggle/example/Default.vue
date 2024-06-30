<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-toggle
      v-model="checkVal1"
    />
    <div class="description">
      {{ checkVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Readonly</p>
    <ev-toggle
      v-model="checkVal1"
      readonly
    />
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-toggle
      v-model="checkVal1"
      disabled
    />
  </div>
  <div class="case">
    <p class="case-title">Custom width</p>
    <ev-toggle
      v-model="checkVal1"
      :width="100"
    />
  </div>
  <div class="case">
    <p class="case-title">Custom color</p>
    <ev-toggle
      v-model="checkVal1"
      active-color="#FFDD57"
      inactive-color="#FB8C00"
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const checkVal1 = ref(true);

    return {
      checkVal1,
    };
  },
};
</script>

<style lang="scss">
</style>
