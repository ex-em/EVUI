<template>
  <div>
    <h5># Checkbox Group</h5>
    <br>
    <EvCheckboxGroup
      v-model="checkboxGroup"
    >
      <EvCheckbox label="Option A">A</EvCheckbox>
      <EvCheckbox label="Option B" />
      <EvCheckbox label="Option C" />
      <EvCheckbox label="Option D" />
    </EvCheckboxGroup>
    <br>
    <br>
    checkboxGroup : {{ checkboxGroup }}
    <br>
    <br>
    <h5># Checkbox Group Event</h5>
    <br>
    <EvCheckboxGroup
      v-model="checkboxGroup2"
    >
      <EvCheckbox label="Option A">A</EvCheckbox>
      <EvCheckbox label="Option B" />
      <EvCheckbox label="Option C" />
      <EvCheckbox label="Option D" />
    </EvCheckboxGroup>
    <br>
    <button @click="clickButton">
      Add 'Option A'
    </button>
    <br>
    checkboxGroup2 : {{ checkboxGroup2 }}
    <br>
    <br>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  components: {},
  setup() {
    const checkboxGroup = ref(['Option A', 'Option B']);
    const checkboxGroup2 = ref([]);

    const clickButton = () => {
      if (!checkboxGroup2.value.length) {
        checkboxGroup2.value.push('Option A');
      }
    };

    return {
      checkboxGroup,
      checkboxGroup2,
      clickButton,
    };
  },
};
</script>

<style lang="scss">
</style>
