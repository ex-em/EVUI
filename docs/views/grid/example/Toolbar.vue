<template>
  <div class="case">
    <ev-grid
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
        customContextMenu: menuItems,
        style: {
          stripe: stripeMV,
          border: borderMV,
        },
        count: true,
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
      <!-- toolbar -->
      <template v-slot:toolbar="{ item }">
        <ev-button
          type="primary"
          class="refresh"
          @click="item.onRefresh"
        >
          Refresh
        </ev-button>
        <ev-button
          type="primary"
          class="delete"
          @click="item.onDelete"
        >
          Delete
        </ev-button>
        <ev-button
          type="info"
          @click="onClickCustom"
        >
          Custom1
        </ev-button>
        <ev-button
          type="info"
          @click="onClickCustom"
        >
          Custom2
        </ev-button>
        <ev-text-field
          v-model="searchVm"
          class="search"
          type="search"
          placeholder="Search"
          @input="item.onSearch"
        />
      </template>
      <!-- cell renderer -->
      <template v-slot:db-icon="{ item }">
        <div :class="`db-icon ${item.row[2][item.column.index]}`"></div>
      </template>
      <template v-slot:db_version="{ item }">
        <ev-select
          v-model="item.row[2][item.column.index]"
          :items="[
              {
                name: '10gR2',
                value: '10gR2',
              }, {
                name: '19c',
                value: '19c',
              }, {
                name: '12c',
                value: '12c',
              }, {
                name: '11gR2',
                value: '11gR2',
              }, {
                name: '920',
                value: '920',
              },
            ]"
          placeholder="Please select value."
          @click.stop=""
          @dblclick.stop=""
        />
      </template>
    </ev-grid>
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
    const useFilterMV = ref(true);
    const useCheckboxMV = ref(true);
    const checkboxModeMV = ref('multi');
    const headerCheckMV = ref(true);
    const checkedRowsMV = ref();
    const clickedRowMV = ref();
    const DbClickedRowsMV = ref();
    const menuItems = ref([
      {
        text: 'Menu1',
        click: () => console.log(`[Menu1] Selected Row Data: ${selected.value}`),
      }, {
        text: 'Menu2',
        click: () => console.log('[Menu2]'),
      },
    ]);
    const borderMV = ref('');
    const searchVm = ref('');
    const columns = ref([
      { caption: '', field: 'db-icon', type: 'string' },
      { caption: 'Instance Name', field: 'instance_name', type: 'string', width: 100 },
      { caption: 'Business Name', field: 'business_name', type: 'string' },
      { caption: 'IP Address', field: 'ip_address', type: 'string', searchable: false }, // searchable
      { caption: 'RTS Port', field: 'rts_port', type: 'string' },
      { caption: 'DB Version', field: 'db_version', type: 'string' },
    ]);
    const onCheckedRow = () => {
      let checkedRow = '';
      for (let i = 0; i < checked.value.length; i++) {
        checkedRow += JSON.stringify(checked.value[i]);
      }
      checkedRowsMV.value = checkedRow;
    };
    const onDoubleClickRow = (e) => {
      DbClickedRowsMV.value = `${e.rowData}`;
    };
    const onClickRow = (e) => {
      clickedRowMV.value = `${e.rowData}`;
    };
    const getData = (count, startIndex) => {
      const instanceList = [
        'AIX10G', 'AIX19C', 'AIX9I', 'EXA1_12C', 'EXA2_12C',
        'HP11G', 'LIN11G', 'LIN19C', 'SUN12C', 'WIN19C', 'EXA1', 'EXA2',
      ];
      const IPList = [
        '10.10.30.145', '10.10.32.33', '10.10.30.10', '10.10.31.95', '10.10.31.97',
        '10.10.32.36', '10.10.32.14', '10.10.100.247', '10.10.32.34',
        '10.10.32.227', '10.10.31.95', '10.10.31.97',
      ];
      const portList = ['4004', '25080', '25090'];
      const dbList = ['postgresql', 'oracle', 'mongodb', 'mysql'];
      const dbVersionList = ['10gR2', '19c', '12c', '11gR2', '920'];
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          dbList[ix % 4],
          instanceList[ix],
          instanceList[ix],
          IPList[ix],
          portList[ix % 3],
          dbVersionList[ix % 5],
        ]);
      }
      tableData.value = temp;
    };
    const onClickCustom = () => {
      console.log('On click custom button');
    };

    getData(7, 0);
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
.db-icon {
  width: 100%;
  height: 100%;
  align-items: center;
  .postgresql {
    background: url('~@/assets/icon_postgresql.svg') no-repeat center center;
  }
  .oracle {
    background: url('~@/assets/icon_oracle.svg') no-repeat center center;
  }
  .mongodb {
    background: url('~@/assets/icon_mongodb.svg') no-repeat center center;
  }
  .mysql {
    background: url('~@/assets/icon_mysql.svg') no-repeat center center;
  }
}
</style>
