<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div style="width: 400px; height: 400px; background-color: gray;">
      <ev-loading v-model="isLoading"/>
      CONTENTS
    </div>
    <div class="description">
      <button
        class="btn"
        @click="changeLoading"
      >
        click to change loading
      </button>
      &nbsp; {{ isLoading }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const isLoading = ref(false);
    const changeLoading = () => {
      isLoading.value = !isLoading.value;
    };

    return {
      isLoading,
      changeLoading,
    };
  },
};
</script>

<style lang="scss">
</style>
