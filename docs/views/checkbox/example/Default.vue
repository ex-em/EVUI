<template>
  <div class="case">
    <p class="case-title">Common</p>
    <EvCheckbox
      v-model="checkVal1"
    >
      Checkbox
    </EvCheckbox>
    <div class="description">
      <button
        class="btn"
        @click="clickButton1"
      >
        click to change the check value
      </button>
      {{ checkResult2.value }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Use Change Event</p>
    <EvCheckbox
      v-model="checkVal2"
      @change="changeVal2"
    >
      Single Checkbox
    </EvCheckbox>
    <div class="description">
      <span class="badge">
        Value in changeEvent
      </span>
      {{ checkResult2.value }}
    </div>
    <div class="description">
      <span class="badge">
        Event in changeEvent
      </span>
      {{ checkResult2.e }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <EvCheckbox
      v-model="checkVal3"
      :disabled="isDisable"
    >
      DISABLED
    </EvCheckbox>
    <div class="description">
      <button
        class="btn"
        @click="toggleDisable"
      >
        toggle to disable
      </button>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';

export default {
  setup() {
    const checkVal1 = ref(false);
    const clickButton1 = () => {
      checkVal1.value = !checkVal1.value;
    };

    const checkVal2 = ref(true);
    const checkResult2 = reactive({
      value: '',
      e: null,
    });
    const changeVal2 = (value, e) => {
      checkResult2.value = value;
      checkResult2.e = e;
    };

    const checkVal3 = ref(false);
    const isDisable = ref(true);
    const toggleDisable = () => {
      isDisable.value = !isDisable.value;
    };

    return {
      checkVal1,
      checkVal2,
      clickButton1,
      checkResult2,
      changeVal2,
      checkVal3,
      isDisable,
      toggleDisable,
    };
  },
};
</script>

<style lang="scss">
</style>
