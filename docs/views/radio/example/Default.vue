<template>
  <div class="case">
    <EvRadio
      v-model="radio1"
      label="Option A"
    />
    <EvRadio
      v-model="radio1"
      label="Option B"
    />
    <EvRadio
      v-model="radio1"
      label="Option C"
    />
    <div class="description">
      <span class="badge">
        Selected Value
      </span>
      {{ radio1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <EvRadio
      v-model="radio2"
      label="Option A"
      disabled
    />
    <EvRadio
      v-model="radio2"
      label="Option B"
      disabled
    />
    <EvRadio
      v-model="radio2"
      label="Option C"
      disabled
    />
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <EvRadio
      v-model="radio3"
      label="Option A"
      @change="changeRadio"
    />
    <EvRadio
      v-model="radio3"
      label="Option B"
      @change="changeRadio"
    />
    <EvRadio
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
    return {
      radio1,
      radio2,
      radio3,
      eventText,
      changeRadio,
    };
  },
};
</script>

<style lang="scss">
</style>
