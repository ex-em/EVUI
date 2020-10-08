<template>
  <div class="case">
    <p class="case-title">Group</p>
    <ev-checkbox-group
      v-model="checkboxGroup"
    >
      <ev-checkbox label="Option A">A</ev-checkbox>
      <ev-checkbox label="Option B" />
      <div>
        <ev-checkbox label="Option C" />
      </div>
      <div>
        <ev-checkbox label="Option D" />
      </div>
    </ev-checkbox-group>
    <div class="description">
      <span class="badge">
        Checkbox Group Values
      </span>
      {{ checkboxGroup }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <ev-checkbox-group
      v-model="checkboxGroup2"
      @change="changeGroup2"
    >
      <ev-checkbox label="Option A">A</ev-checkbox>
      <ev-checkbox label="Option B">B</ev-checkbox>
      <ev-checkbox label="Option C" />
      <ev-checkbox label="Option D" />
    </ev-checkbox-group>
    <div class="description">
      <span class="badge">
        Checkbox Group Values
      </span>
      <button
        class="btn"
        @click="clickButton"
      >
        Add 'Option A'
      </button>
      &nbsp; {{ checkboxGroup2 }}
    </div>
    <div class="description">
      <span class="badge">
        Checkbox Group Change Event
      </span>
      &nbsp; {{ changeEventVal }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">All Check</p>
    <ev-checkbox-group
      v-model="checkboxGroup3"
      @change="changeGroupValues"
    >
      <ev-checkbox
        v-for="(info, idx) in checkboxList3"
        :key="`${info.label}_${idx}`"
        :label="`${info.label}`"
      >
        {{ info.text }}
      </ev-checkbox>
    </ev-checkbox-group>
    <div class="description">
      <span class="badge">
        Checkbox Group Values
      </span>
      <ev-checkbox
        v-model="allCheck"
        v-model:indeterminate="indeterminate"
        @change="changeAllCheck"
      >
        All Check & Indeterminate
      </ev-checkbox>
      {{ checkboxGroup3 }} / {{ indeterminate }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { isEqual, sortBy } from 'lodash-es';
import EvCheckboxGroup from '@/components/checkboxGroup/CheckboxGroup';

export default {
  components: { EvCheckboxGroup },
  setup() {
    const checkboxGroup = ref(['Option A', 'Option B']);

    const checkboxGroup2 = ref([]);
    const clickButton = () => {
      if (!checkboxGroup2.value.includes('Option A')) {
        checkboxGroup2.value.push('Option A');
      }
    };
    const changeEventVal = ref([]);
    const changeGroup2 = (val) => { changeEventVal.value = val; };

    const checkboxGroup3 = ref([]);
    const allCheck = ref(false);
    const checkboxList3 = [
      {
        label: 'Option A',
        text: 'A',
      },
      {
        label: 'Option B',
        text: 'B',
      },
      {
        label: 'Option C',
        text: 'C',
      },
      {
        label: 'Option D',
        text: 'D',
      },
    ];
    const labels = ['Option A', 'Option B', 'Option C', 'Option D'];

    const changeAllCheck = () => {
      if (allCheck.value) {
        checkboxGroup3.value = labels;
      } else {
        checkboxGroup3.value = [];
      }
    };
    const indeterminate = ref(false);
    const changeGroupValues = (val) => {
      allCheck.value = isEqual(sortBy(val), sortBy(labels));
      indeterminate.value = val.length && val.length !== labels.length;
    };

    return {
      checkboxGroup,
      checkboxGroup2,
      clickButton,
      changeEventVal,
      changeGroup2,
      checkboxGroup3,
      allCheck,
      checkboxList3,
      indeterminate,
      changeAllCheck,
      changeGroupValues,
    };
  },
};
</script>

<style lang="scss">
</style>
