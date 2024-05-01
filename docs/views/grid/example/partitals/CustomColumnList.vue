<template>
  <ev-window
    v-model:visible="visible"
    title="Custom Column List"
    width="20%"
    height="40%"
  >
    <ev-checkbox-group
      v-model="checkColumnGroup"
      class="column-group"
      @change="onCheckColumn"
    >
      <ev-checkbox
        v-for="(column, idx) in getDisplayColumnList(columnList)"
        :key="`${column.field}_${idx}`"
        :label="column?.field"
      >
        {{column?.caption}}
      </ev-checkbox>
    </ev-checkbox-group>
    <template #footer>
      <ev-button
        type="primary"
        @click="onApplyColumn"
      >
        OK
      </ev-button>
    </template>
  </ev-window>
</template>
<script>

import { computed, ref, watch } from 'vue';

export default {
  name: 'CustomColumnList',
  props: {
    isVisible: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: [Array],
      required: true,
    },
  },
  emits: ['update:isVisible', 'update:columns'],
  setup(props, { emit }) {
    const visible = computed({
      get: () => props.isVisible,
      set: value => emit('update:isVisible', value),
    });
    const columnList = computed({
      get: () => props.columns,
      set: value => emit('update:columns', value),
    });
    const checkColumnGroup = ref([]);
    let lastCheckColumn = null;
    const onCheckColumn = (checkColumns) => {
      if (checkColumns?.length === 1) {
        lastCheckColumn = checkColumns[0];
      } else if (checkColumns?.length < 1 && lastCheckColumn !== null) {
        checkColumnGroup.value.push(lastCheckColumn);
      }
    };

    const setCheckColumn = (columns) => {
      checkColumnGroup.value = columns
        .filter(column => !column.hiddenDisplay && !column.hide)
        .map(column => (column.field));
    };

    const sort = {
      ASC: (columns, target) => columns.sort((a, b) => a[target] - b[target]),
      DESC: (columns, target) => columns.sort((a, b) => b[target] - a[target]),
    };

    const getSortingColumns = (columns, type = 'ASC') => {
      const sortingTarget = 'index';
      const existTargetInColumns = columns.every(
        column => Object.prototype.hasOwnProperty.call(column, sortingTarget),
      );
      if (existTargetInColumns) {
        return sort[type](columns, sortingTarget);
      }
      return columns;
    };
    const getDisplayColumnList = (columns) => {
      if (!visible.value) {
        return columns;
      }
      return getSortingColumns(columns.filter(column => !column?.hide));
    };

    watch(() => visible.value, (newVal, prevVal) => {
      if (newVal && !prevVal) {
        setCheckColumn(columnList.value);
      }
    });

    const onApplyColumn = () => {
      columnList.value.forEach((column) => {
        column.hiddenDisplay = !checkColumnGroup.value.includes(column.field);
      });
      visible.value = false;
    };

    return {
      visible,
      columnList,
      checkColumnGroup,
      onCheckColumn,
      onApplyColumn,
      getDisplayColumnList,
    };
  },
};
</script>

<style scoped lang="scss">
.column-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
