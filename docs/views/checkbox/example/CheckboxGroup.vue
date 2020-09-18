<template>
  <div class="case">
    <p class="case-title">Group</p>
    <EvCheckboxGroup
      v-model="checkboxGroup"
    >
      <EvCheckbox label="Option A">A</EvCheckbox>
      <EvCheckbox label="Option B" />
      <EvCheckbox label="Option C" />
      <EvCheckbox label="Option D" />
    </EvCheckboxGroup>
    <div class="description">
      <span class="badge">
        checkboxGroup
      </span>
      {{ checkboxGroup }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Event</p>
    <EvCheckboxGroup
      v-model="checkboxGroup2"
    >
      <EvCheckbox label="Option A">A</EvCheckbox>
      <EvCheckbox label="Option B">B</EvCheckbox>
      <EvCheckbox label="Option C" />
      <EvCheckbox label="Option D" />
    </EvCheckboxGroup>
    <div class="description">
      <span class="badge">
        checkboxGroup2
      </span>
      <button
        class="btn"
        @click="clickButton"
      >
        Add 'Option A'
      </button>
      {{ checkboxGroup2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">All Check</p>
    <EvCheckboxGroup
      v-model="checkboxGroup3"
    >
      <EvCheckbox
        v-for="(info, idx) in checkboxList3"
        :key="idx"
        :label="info.label"
      >
        {{ info.text }}
      </EvCheckbox>
    </EvCheckboxGroup>
    <div class="description">
      <span class="badge">
        checkboxGroup3
      </span>
      <EvCheckbox
        v-model="allCheck"
        @change="changeAllCheck"
      >
        ALL CHECK
      </EvCheckbox>
      {{ checkboxGroup3 }}
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue';
import { isEqual, sortBy } from 'lodash-es';

export default {
  setup() {
    const checkboxGroup = ref(['Option A', 'Option B']);

    const checkboxGroup2 = ref([]);
    const clickButton = () => {
      if (!checkboxGroup2.value.includes('Option A')) {
        checkboxGroup2.value.push('Option A');
      }
    };

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

    watch(checkboxGroup3, (cur) => {
      allCheck.value = isEqual(sortBy(cur), sortBy(labels));
    });

    return {
      checkboxGroup,
      checkboxGroup2,
      clickButton,
      checkboxGroup3,
      allCheck,
      checkboxList3,
      changeAllCheck,
    };
  },
};
</script>

<style lang="scss">
</style>
