<template>
  <div class="case">
    <ev-grid
      :columns="columns"
      :rows="tableData"
      :width="widthMV"
      :height="heightMV"
      :option="{
        adjust: true,
        useGridSetting: {
          use: true,
        },
      }"
      @resize-column="onResizeColumn"
      @change-column-order="onChangeColumnOrder"
      @change-column-status="onChangeColumnStatus"
    />
    <!-- description -->
    <div class="description column-event-description">
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Resize Column Width
          </span>
          <ev-text-field
            v-model="columnEventsInfo.resize"
            class="custom-text-area"
            type="textarea"
            readonly
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Change Column Position
          </span>
          <ev-text-field
            v-model="columnEventsInfo.order"
            class="custom-text-area"
            type="textarea"
            readonly
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Grid Column Setting(Column Show/Hide Status)
          </span>
          <ev-text-field
            v-model="columnEventsInfo.status"
            class="custom-text-area"
            type="textarea"
            readonly
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const widthMV = ref('100%');
    const heightMV = ref(300);
    const columns = ref([
      { caption: 'A Column', field: 'aColumn', type: 'string' },
      { caption: 'B Column', field: 'bColumn', type: 'string' },
      { caption: 'C Column', field: 'cColumn', type: 'string' },
      { caption: 'D Column', field: 'dColumn', type: 'string', hiddenDisplay: true },
      { caption: 'E Column', field: 'eColumn', type: 'string' },
    ]);
    const columnEventsInfo = ref({
      resize: '',
      order: '',
      status: '',
    });
    const getData = (count, startIndex) => {
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          `A Column Data_${ix}`,
          `B Column Data_${ix + 1}`,
          `C Column Data_${ix + 2}`,
          `D Column Data_${ix + 3}`,
          `E Column Data_${ix + 4}`,
        ]);
      }
      return temp;
    };

    tableData.value = getData(10, 0);

    const onResizeColumn = (columnInfo) => {
      columnEventsInfo.value.resize = JSON.stringify(columnInfo, null, 2);
    };
    const onChangeColumnOrder = (columnInfo) => {
      columnEventsInfo.value.order = JSON.stringify(columnInfo, null, 2);
    };
    const onChangeColumnStatus = (columnInfo) => {
      columnEventsInfo.value.status = JSON.stringify(columnInfo, null, 2);
    };

    return {
      columns,
      tableData,
      widthMV,
      heightMV,
      columnEventsInfo,
      onResizeColumn,
      onChangeColumnOrder,
      onChangeColumnStatus,
    };
  },
};
</script>

<style lang="scss">
.description {
  .form-rows {
    display: flex;
    flex-direction: row;
    gap: 10px;
  }

  .form-row {
    width: 50%;
  }

  .badge {
    margin-bottom: 2px;
    margin-right: 5px !important;
  }
}

.column-event-description {
  min-width: 200px;
  min-height: 300px;

  .custom-text-area {
    width: 100% !important;
  }

  .ev-textarea {
    height: 200px !important;
  }
}
</style>
