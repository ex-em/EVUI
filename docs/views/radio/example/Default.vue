<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-radio
      v-model="radio1"
      label="Option A"
    >Radio Option A</ev-radio>
    <ev-radio
      v-model="radio1"
      label="Option B"
    >Radio Option B</ev-radio>
    <ev-radio
      v-model="radio1"
      label="Option C"
    >Radio Option C</ev-radio>
    <div class="description">
      <span class="badge">
        Selected Value
      </span>
      {{ radio1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-radio
      v-model="radio2"
      label="Option A"
      disabled
    />
    <ev-radio
      v-model="radio2"
      label="Option B"
      disabled
    />
    <ev-radio
      v-model="radio2"
      label="Option C"
      disabled
    />
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <ev-radio
      v-model="radio3"
      label="Option A"
      @change="changeRadio"
    />
    <ev-radio
      v-model="radio3"
      label="Option B"
      @change="changeRadio"
    />
    <ev-radio
      v-model="radio3"
      label="Option C"
      @change="changeRadio"
    />
    <div class="description">
      <span class="badge">
        Change Event
      </span>
      {{ eventText }}
    </div>
    <div class="description">
      <span class="badge">
        Button Event
      </span>
      <button
        class="btn"
        @click="selectValue('Option C')"
      >
        Select Option C
      </button>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const radio1 = ref('Option A');
    const radio2 = ref('Option A');
    const radio3 = ref('Option A');
    const eventText = ref('No event occurred');
    const changeRadio = () => {
      eventText.value = `Click radio and change value '${radio3.value}'`;
    };
    const selectValue = (val) => {
      radio3.value = val;
    };
    return {
      radio1,
      radio2,
      radio3,
      eventText,
      changeRadio,
      selectValue,
    };
  },
};
</script>

<style lang="scss">
</style>
