<template>
  <div class="case">
    <ev-tree-grid
      v-model:selected="selected"
      v-model:checked="checked"
      :columns="gridColumns"
      :rows="tableData"
      :width="widthMV"
      :height="heightMV"
      :option="{
        adjust: true,
        useGridSetting: {
          use: true,
          useDefaultColumnSetting: false,
          customContextMenu: gridSettingMenuItems,
        },
      }"
      @resize-column="onUpdateColumns"
      @change-column-status="onUpdateColumns"
    >
    </ev-tree-grid>
    <custom-column-list
      v-model:columns="gridColumns"
      v-model:is-visible="isVisible"
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
        click: param => console.log(`[Menu1]: ${param}`),
      }, {
        text: 'Custom Column List',
        click: () => {
          isVisible.value = true;
        },
      },
    ]);
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
    const gridColumns = ref([
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

    const onUpdateColumns = ({ columns }) => {
      gridColumns.value = columns;
    };

    getData();
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
.ev-text-field, .ev-input-number, .ev-select {
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
