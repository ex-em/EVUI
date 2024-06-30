<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-text-field
      v-model="modelValue1"
      placeholder="Search"
      type="search"
      @search="searchInput"
    />
    <div class="description">
      <span class="badge yellow">
        type="search"
      </span>
      <span class="badge">
        Search Event
      </span>
      {{ searchValue }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const modelValue1 = ref();
    const searchValue = ref();
    const searchInput = (val) => {
      searchValue.value = val;
    };

    return {
      modelValue1,
      searchValue,
      searchInput,
    };
  },
};
</script>
