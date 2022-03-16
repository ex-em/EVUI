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
        searchValue: searchVm,
        style: {
          stripe: stripeMV,
          border: borderMV,
        },
        page: pageInfo,
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
      @request-data="onRequestData"
    >
      <!-- toolbar -->
      <template #toolbar="{ item }">
        <ev-button
          type="primary"
          class="refresh"
        >
          Refresh
        </ev-button>
        <ev-button
          type="primary"
          class="delete"
          @click="onClickAdd"
        >
          Add
        </ev-button>
        <ev-button
          type="info"
          @click="onClickCustom"
        >
          Set Search Value
        </ev-button>
        <ev-button
          type="info"
        >
          Custom
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
      <template #db-icon="{ item }">
        <div :class="`db-icon ${item.row[2][item.column.index]}`"></div>
      </template>
      <template #db-version="{ item }">
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
    <div class="description">
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Current Page</span>
          <ev-input-number
            v-model="pageInfo.currentPage"
            :min="1"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">Visible Page</span>
          <ev-input-number
            v-model="pageInfo.visiblePage"
            :min="7"
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Order</span>
          <ev-select
            v-model="pageInfo.order"
            :items="orderItems"
            placeholder="Please select value."
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">Data per page</span>
          <ev-input-number
            v-model="pageInfo.perPage"
            :min="1"
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">Page Info</span>
          <ev-toggle v-model="pageInfo.showPageInfo"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue';

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
      { caption: 'RTS Port', field: 'rts_port', type: 'stringNumber' },
      { caption: 'DB Version', field: 'db-version', type: 'string' },
      { caption: 'Lock', field: 'is_lock', type: 'boolean', searchable: false },
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
      const isLock = [true, false];
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          dbList[ix % 4],
          instanceList[ix % 12],
          instanceList[ix % 12],
          IPList[ix % 12],
          portList[ix % 3],
          dbVersionList[ix % 5],
          isLock[ix % 2],
        ]);
      }
      tableData.value = temp;
    };
    const onClickCustom = () => {
      searchVm.value = '2016';
    };
    const pageInfo = reactive({
      use: true,
      visiblePage: 7,
      currentPage: 3,
      perPage: 7,
      order: 'center',
      showPageInfo: true,
      total: computed(() => tableData.value.length),
      useClient: true,
    });
    getData(30, 0);
    const onClickAdd = () => {
      tableData.value.push(['oracle', 'LIN12G', 'LIN12G', '10.10.30.10', '2016']);
    };
    const onRequestData = (e) => {
      pageInfo.currentPage = e.pageInfo.currentPage;
    };
    const orderItems = ref([
      { name: 'left', value: 'left' },
      { name: 'right', value: 'right' },
      { name: 'center', value: 'center' },
    ]);
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
      orderItems,
      pageInfo,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      onClickCustom,
      onClickAdd,
      onRequestData,
    };
  },
};
</script>

<style lang="scss" scoped>
.form-rows {
  display: flex;
}
.form-row {
  flex: 1;
  margin: 5px;
  .badge {
    margin-bottom: 3px;
  }
}
.ev-toggle {
  display: block;
}
.db-icon {
  width: 100%;
  height: 100%;
  align-items: center;
  .postgresql {
    background: url('../../../assets/images/icon_postgresql.svg') no-repeat center center;
  }
  .oracle {
    background: url('../../../assets/images/icon_oracle.svg') no-repeat center center;
  }
  .mongodb {
    background: url('../../../assets/images/icon_mongodb.svg') no-repeat center center;
  }
  .mysql {
    background: url('../../../assets/images/icon_mysql.svg') no-repeat center center;
  }
}
</style>
