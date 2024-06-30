<template>
  <div class="case">
    <ev-radio-group
      v-model="radioGroup1"
    >
      <ev-radio label="Option A" />
      <ev-radio label="Option B" />
      <ev-radio label="Option C" />
    </ev-radio-group>
    <div class="description">
      <span class="badge">
        Selected Value
      </span>
      {{ radioGroup1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <ev-radio-group
      v-model="radioGroup2"
      @change="changeRadioGroup"
    >
      <ev-radio label="Option A" />
      <ev-radio label="Option B" />
      <ev-radio label="Option C" />
    </ev-radio-group>
    <div class="description">
      <span class="badge">
        Change Event
      </span>
      {{ eventText }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Button Type</p>
    <ev-radio-group
      v-model="radioGroup2"
      type="button"
    >
      <ev-radio label="Option A" />
      <ev-radio label="Option B" />
      <ev-radio label="Option C" />
    </ev-radio-group>
    <ev-radio-group
      v-model="radioGroup2"
      type="button"
    >
      <ev-radio
        label="Option A"
        disabled
      />
      <ev-radio label="Option B" />
      <ev-radio
        label="Option C"
        disabled
      />
    </ev-radio-group>
    <ev-radio-group
      v-model="radioGroup2"
      type="button"
    >
      <ev-radio
        label="Option A"
        disabled
      />
      <ev-radio
        label="Option B"
        disabled
      />
      <ev-radio
        label="Option C"
        disabled
      />
    </ev-radio-group>
  </div>
</template>

<script>
  import { ref } from 'vue';

  export default {
    components: {},
    setup() {
      const radioGroup1 = ref('Option A');
      const radioGroup2 = ref('Option A');
      const eventText = ref('No event occurred');
      const changeRadioGroup = (newValue) => {
        eventText.value = `Click radio and change value '${newValue}'`;
      };

      return {
        radioGroup1,
        radioGroup2,
        eventText,
        changeRadioGroup,
      };
    },
  };
</script>

<style lang="scss">
.case .ev-radio-group.type-button {
  margin-bottom: 10px;
}
</style>
