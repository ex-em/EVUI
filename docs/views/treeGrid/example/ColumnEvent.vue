<template>
  <div class="case">
    <p class="case-title">TreeGrid</p>
    <ev-tree-grid
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
      @change-column-status="onChangeColumnStatus"
    >
    </ev-tree-grid>
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
    const columnEventsInfo = ref({
      resize: '',
      order: '',
      status: '',
    });
    const getData = () => {
      tableData.value = [
        {
          id: 'Exem 0',
          date: '2016-05-01',
          name: '1111',
          expand: true,
        },
        {
          id: 'Exem 1',
          date: '2016-05-01',
          name: '2222',
          value: 123,
          expand: true,
          children: [{
            id: 'Exem 2',
            date: '2016-05-02',
            name: '2',
            value: 222,
            expand: false,
            children: [{
              id: 'Exem 3',
              date: '2016-05-02',
              name: '3',
              value: 3333,
              uncheckable: true,
            }, {
              id: 'Exem 4',
              date: '2016-05-02',
              name: '4',
              expand: false,
              uncheckable: true,
              children: [{
                id: 'Exem 5',
                date: '2016-05-02',
                name: '5',
                children: [{
                  id: 'Exem 51',
                  date: '2016-05-02',
                  name: '1251',
                  children: [{
                    id: 'Exem 52',
                    date: '2016-05-02',
                    name: '20000',
                  }],
                }],
              }, {
                id: 'Exem 6',
                date: '2016-05-02',
                name: '6',
              }],
            }],
          }, {
            id: 'Exem 7',
            date: '2016-05-03',
            name: '7',
            children: [{
              id: 'Exem 8',
              date: '2016-05-03',
              name: '8',
              value: 333,
            }, {
              id: 'Exem 9',
              date: '2016-05-03',
              name: '9',
            }, {
              id: 'Exem 10',
              date: '2016-05-03',
              name: '10',
            }],
          }, {
            id: 'Exem 11',
            date: '2016-05-04',
            name: '11',
          }],
        },
      ];
    };
    const columns = ref([
      { caption: 'ID', field: 'id', type: 'number' },
      { caption: 'Date', field: 'date', type: 'string' },
      {
        caption: 'Name',
        field: 'name',
        type: 'float',
        summaryType: 'sum',
        summaryOnlyTopParent: true,
        summaryRenderer: 'Sum: {0} 최상위 부모만 summary',
        decimal: 1,
      },
      {
        caption: 'Value',
        field: 'value',
        type: 'number',
        summaryType: 'sum',
        summaryRenderer: 'Sum: {0} 모든 row summary',
        decimal: 1,
      },
    ]);

    const onResizeColumn = (columnInfo) => {
      columnEventsInfo.value.resize = JSON.stringify(columnInfo, null, 2);
    };
    const onChangeColumnStatus = (columnInfo) => {
      columnEventsInfo.value.status = JSON.stringify(columnInfo, null, 2);
    };

    getData();

    return {
      columns,
      tableData,
      widthMV,
      heightMV,
      columnEventsInfo,
      onResizeColumn,
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

  .ev-textarea {
    height: 200px !important;
  }
}
</style>
