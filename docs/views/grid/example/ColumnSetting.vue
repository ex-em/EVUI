<template>
  <div class="case">
    <ev-grid
      :columns="gridColumns"
      :rows="tableData"
      :width="widthMV"
      :height="heightMV"
      :option="{
        useGridSetting: {
          use: true,
          useDefaultColumnSetting: false,
          customContextMenu: gridSettingMenuItems,
        },
        useFilter: true,
      }"
      @resize-column="onUpdateColumns"
      @change-column-order="onUpdateColumns"
      @change-column-status="onUpdateColumns"
    >
    </ev-grid>
    <custom-column-list
      v-model:is-visible="isVisible"
      v-model:columns="gridColumns"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import CustomColumnList from 'docs/views/grid/example/partitals/CustomColumnList.vue';

export default {
  components: { CustomColumnList },
  setup() {
    const isVisible = ref(false);
    const tableData = ref([]);
    const selected = ref([]);
    const checked = ref([]);
    const widthMV = ref('100%');
    const heightMV = ref(300);
    const gridSettingMenuItems = ref([
      {
        text: 'Menu1',
        click: param => console.log(`[Menu1]: ${JSON.stringify(param, null, 2)}`),
      }, {
        text: 'Menu2',
        click: param => console.log('[Menu2]', param.contextmenuInfo),
      }, {
        text: 'Custom Column List',
        click: () => {
          isVisible.value = true;
        },
      },
    ]);
    const gridColumns = ref([
      { caption: 'Column A', field: 'columnA', type: 'string', width: 120 },
      { caption: 'Column B', field: 'columnB', type: 'string', width: 120, hiddenDisplay: true },
      { caption: 'Column C', field: 'columnC', type: 'string', width: 120 },
      { caption: 'Column D', field: 'columnD', type: 'string', width: 120 },
      { caption: 'Column E', field: 'columnE', type: 'string', width: 120, sortable: false },
      { caption: 'Column F', field: 'columnF', type: 'string', width: 120, hide: true },
    ]);
    const onUpdateColumns = ({ columns }) => {
      gridColumns.value = columns;
    };
    const getData = (count, startIndex) => {
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          `Column A - ${ix + 1}`,
          `Column B - ${ix + 1}`,
          `Column C - ${ix + 1}`,
          `Column D - ${ix + 1}`,
          `Column E - ${ix + 1}`,
        ]);
      }
      return temp;
    };

    tableData.value = getData(10, 0);
    return {
      isVisible,
      gridColumns,
      tableData,
      selected,
      checked,
      widthMV,
      heightMV,
      gridSettingMenuItems,
      onUpdateColumns,
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

.badge {
  margin-bottom: 2px;
  margin-right: 5px !important;
}

.ev-toggle {
  margin-right: 10px;
}
</style>
