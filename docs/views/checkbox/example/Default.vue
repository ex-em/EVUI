<template>
  <div>
    <h5># Common</h5>
    <br>
    <EvCheckbox
      v-model="checkVal1"
    >
      Checkbox
    </EvCheckbox>
    <br>
    <br>
    <button @click="clickButton1">
      click to change the check value
    </button>
    <br>
    <br>
    <h5># Use Change Event</h5>
    <br>
    <EvCheckbox
      v-model="checkVal2"
      @change="changeVal2"
    >
      Single Checkbox
    </EvCheckbox>
    <br>
    <br>
    Value in changeEvent : {{ checkResult2.value }}
    <br>
    Event in changeEvent : {{ checkResult2.e }}
    <br>
    <br>
    <h5># Disabled</h5>
    <br>
    <EvCheckbox
      v-model="checkVal3"
      disabled
    >
      DISABLED
    </EvCheckbox>
    <br>
    <br>
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

    return {
      checkVal1,
      checkVal2,
      clickButton1,
      checkResult2,
      changeVal2,
      checkVal3,
    };
  },
};
</script>

<style lang="scss">
</style>
