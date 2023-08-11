<template>
  <div class="case">
    <p class="case-title">Multiple Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      placeholder="Please select values."
      multiple
      @change="changeEvent"
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
    <div class="description">
      change val : {{ changeVal }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Multiple Clearable Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      multiple
      clearable
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Multiple Collapse Tags Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      multiple
      collapse-tags
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Multiple Disabled Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      multiple
      clearable
      disabled
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Multiple Filterable Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      multiple
      filterable
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Multiple Checkable Select</p>
    <ev-select
      v-model="selectVal1"
      :items="items1"
      placeholder="Please select values."
      multiple
      checkable
      @change="changeEvent"
    />
    <div class="description">
      first selectbox value : {{ selectVal1 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const selectVal1 = ref(['value4', 'value3']);
    const items1 = ref([
      {
        name: 'name0name0name0name0name0name0',
        value: 'value0',
        iconClass: 'ev-icon-query',
      },
      {
        name: 'name1name1name1name1name1name1',
        value: 'value1',
      },
      {
        name: 'name2name2name2name2name2name2',
        value: 'value2',
      },
      {
        name: 'name3name3name3name3name3name3',
        value: 'value3',
        iconClass: 'ev-icon-bell',
      },
      {
        name: 'name4name4name4name4name4name4',
        value: 'value4',
      },
      {
        name: 'name5name5name5name5name5name5',
        value: 'value5',
      },
      {
        name: 'name6name6name6name6name6name6',
        value: 'value6',
      },
      {
        name: 'name7name7name7name7name7name7',
        value: 'value7',
      },
    ]);
    const changeVal = ref();
    const changeEvent = (val) => {
      changeVal.value = val;
    };

    return {
      selectVal1,
      items1,
      changeVal,
      changeEvent,
    };
  },
};
</script>

<style lang="scss">
</style>
