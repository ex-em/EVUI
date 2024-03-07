<template>
  <div class="case">
    <ev-grid
      :columns="columns"
      :rows="tableData"
      :height="500"
      :option="{
        sort: {
          field: {
            asc: (a, b) => {
              return (
                (a.split('_')[1] === null) - (b.split('_')[1] === null) ||
                Number(a.split('_')[1]) - Number(b.split('_')[1])
              );
            },
            desc: (a, b) => {
              return (
                (a.split('_')[1] === null) - (b.split('_')[1] === null) ||
                Number(b.split('_')[1]) - Number(a.split('_')[1])
              );
            },
          },
          value: {
            asc: (a, b) => {
              return (
                (a.split('-')[1] === null) - (b.split('-')[1] === null) ||
                Number(a.split('-')[1]) - Number(b.split('-')[1])
              );
            },
            desc: (a, b) => {
              return (
                (a.split('-')[1] === null) - (b.split('-')[1] === null) ||
                Number(b.split('-')[1]) - Number(a.split('-')[1])
              );
            },
          },
        },
      }"
    />
    <!-- description -->
    <div class="description"></div>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import { ref } from 'vue';

const arr = Array.from({ length: 50 }, () => [
  `field_${Math.round(Math.random() * 10000)}`,
  `value-${Math.round(Math.random() * 10000)}`,
]);

export default {
  setup() {
    const tableData = ref(cloneDeep(arr));
    const columns = ref([
      { caption: 'Field', field: 'field', type: 'string', width: 200 },
      { caption: 'Value', field: 'value', type: 'string', width: 200 },
    ]);

    return {
      tableData,
      columns,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  min-width: 200px;
}
.form-rows {
  display: flex;
  margin-bottom: 5px;
}
.form-row {
  width: 50%;
}
.ev-text-field,
.ev-input-number,
.ev-select {
  width: 80%;
}
.badge {
  margin-bottom: 2px;
  margin-right: 5px !important;
}
.ev-toggle {
  margin-right: 10px;
}
</style>
