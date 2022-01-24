<template>
  <div class="case">
    <ev-tree-grid
      v-model:selected="selected"
      v-model:checked="checked"
      :columns="columns"
      :rows="tableData"
      :width="widthMV"
      :height="heightMV"
      :option="{
        adjust: adjustMV,
        showHeader: showHeaderMV,
        rowHeight: rowHeightMV,
        columnWidth: columnWidthMV,
        useFilter: useFilterMV,
        useCheckbox: {
          use: useCheckboxMV,
          mode: checkboxModeMV,
          headerCheck: headerCheckMV,
        },
        searchValue: searchVm,
        customContextMenu: menuItems,
        style: {
          stripe: stripeMV,
          border: borderMV,
        },
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
      <!-- toolbar -->
      <template #toolbar="{ item }">
        <ev-button
          type="info"
          @click="addNode"
        >
          Add
        </ev-button>
        <ev-button
          type="info"
          @click="onClickCustom"
        >
          Set Search Value
        </ev-button>
        <ev-text-field
          v-model="searchVm"
          class="search"
          type="search"
          placeholder="Search"
          @input="item.onSearch"
        />
      </template>
    </ev-tree-grid>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const selected = ref([]);
    const checked = ref([]);
    const widthMV = ref('100%');
    const heightMV = ref(300);
    const adjustMV = ref(true);
    const showHeaderMV = ref(true);
    const stripeMV = ref(false);
    const rowHeightMV = ref(35);
    const columnWidthMV = ref(80);
    const useFilterMV = ref(false);
    const useCheckboxMV = ref(true);
    const checkboxModeMV = ref('multi');
    const headerCheckMV = ref(true);
    const checkedRowsMV = ref();
    const clickedRowMV = ref();
    const DbClickedRowsMV = ref();
    const menuItems = ref([
      {
        text: 'Menu1',
        click: () => console.log(`[Menu1] Selected Row Data: ${selected.value.data}`),
      }, {
        text: 'Menu2',
        click: () => console.log('[Menu2]'),
      },
    ]);
    const borderMV = ref('');
    const searchVm = ref('');
    const onCheckedRow = () => {
      let checkedRow = '';
      checkedRowsMV.value = checked.value.reduce((prev, curr) => {
        checkedRow += JSON.stringify(curr?.data);
        return checkedRow;
      }, JSON.stringify(checked.value[0]?.data));
    };
    const onDoubleClickRow = (e) => {
      const rowData = e.rowData.data;
      DbClickedRowsMV.value = JSON.stringify(rowData);
    };
    const onClickRow = (e) => {
      const rowData = e.rowData.data;
      clickedRowMV.value = JSON.stringify(rowData);
    };
    const getData = () => {
      tableData.value = [
        {
          id: 'attributes.ini',
          children: [
            {
              id: 'pythontrace',
              children: [
                { id: 'level' },
                { id: 'trace_errors' },
                { id: 'trace_indexes' },
                { id: 'truncate_doclists' },
              ],
            },
          ],
        },
        {
          id: 'diserver.ini',
          children: [
            { id: 'api' },
            { id: 'blobs' },
            { id: 'connection' },
            { id: 'make' },
          ],
        },
        {
          id: 'docstore.ini',
          children: [
            { id: 'docstore' },
          ],
        },
      ];
    };
    const columns = ref([
      { caption: 'ID', field: 'id', type: 'number' },
      { caption: 'Date', field: 'date', type: 'string' },
      { caption: 'Name', field: 'name', type: 'number' },
    ]);
    const onClickCustom = () => {
      searchVm.value = 'diserver';
    };

    const addNode = () => {
      tableData.value[0].children.push({
        id: 'newenwenwenwenwenwenwenwenw',
        date: '2016-05-02',
        name: '3',
      });
    };
    getData();
    return {
      columns,
      tableData,
      selected,
      checked,
      widthMV,
      heightMV,
      adjustMV,
      showHeaderMV,
      stripeMV,
      rowHeightMV,
      columnWidthMV,
      useFilterMV,
      useCheckboxMV,
      checkboxModeMV,
      headerCheckMV,
      checkedRowsMV,
      clickedRowMV,
      DbClickedRowsMV,
      menuItems,
      borderMV,
      searchVm,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      onClickCustom,
      addNode,
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
  width: 30%;
}
.badge {
  margin-bottom: 2px;
  margin-right: 5px !important;
}
.ev-toggle {
  margin-right: 10px;
}
</style>
