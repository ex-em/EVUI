<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-checkbox
      v-model="checkVal1"
    >
      Checkbox
    </ev-checkbox>
    <div class="description">
      <button
        class="btn"
        @click="clickButton"
      >
        click to change the check value
      </button>
      &nbsp; {{ checkVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Use Change Event</p>
    <ev-checkbox
      v-model="checkVal2"
      @change="changeCheck"
    >
      Single Checkbox
    </ev-checkbox>
    <div class="description">
      <span class="badge">
        Value in changeEvent
      </span>
      {{ checkResult2.value }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-checkbox
      v-model="checkVal1"
      :disabled="isDisable"
    >
      DISABLED
    </ev-checkbox>
    <div class="description">
      <button
        class="btn"
        @click="toggleDisable"
      >
        toggle to disable
      </button>
    </div>
  </div>
  <div class="case">
    <p class="case-title">Indeterminate</p>
    <ev-checkbox
      v-model="checkVal3"
      :indeterminate="isIndeterminate"
    >
      INDETERMINATE
    </ev-checkbox>
    <div class="description">
      <button
        class="btn"
        @click="toggleIndeterminate"
      >
        toggle to indeterminate
      </button>
      &nbsp; {{ isIndeterminate }}
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  setup() {
    const checkVal1 = ref(false);
    const clickButton = () => {
      checkVal1.value = !checkVal1.value;
    };

    const checkVal2 = ref(true);
    const checkResult2 = reactive({
      value: '',
    });
    const changeCheck = (value, e) => {
      checkResult2.value = value;
      checkResult2.e = e;
    };

    const isDisable = ref(true);
    const toggleDisable = () => {
      isDisable.value = !isDisable.value;
    };

    const checkVal3 = ref(false);
    const isIndeterminate = ref(false);
    const toggleIndeterminate = () => {
      isIndeterminate.value = !isIndeterminate.value;
    };

    return {
      checkVal1,
      clickButton,

      checkVal2,
      checkResult2,
      changeCheck,

      isDisable,
      toggleDisable,

      checkVal3,
      isIndeterminate,
      toggleIndeterminate,
    };
  },
};
</script>

<style lang="scss">
</style>
