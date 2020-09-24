<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-textfield
      v-model="textfield1"
      placeholder="Please enter the password"
      type="password"
    />
    <div class="description">
      <span class="badge yellow">
        type="password"
      </span>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Show Password</p>
    <ev-textfield
      v-model="textfield2"
      placeholder="Please enter the content"
      type="password"
      show-password
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const textfield1 = ref();
    const textfield2 = ref();

    return {
      textfield1,
      textfield2,
    };
  },
};
</script>
