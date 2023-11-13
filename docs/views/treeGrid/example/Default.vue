<template>
  <div class="case">
    <p class="case-title">TreeGrid</p>
    <ev-tree-grid
      v-model:selected="selected"
      v-model:checked="checked"
      :columns="columns"
      :rows="tableData"
      :width="widthMV"
      :height="heightMV"
      :option="{
        adjust: true,
        showHeader: showHeaderMV,
        rowHeight: rowHeightMV,
        columnWidth: columnWidthMV,
        useGridSetting: {
          use: useGridSettingMV,
          customContextMenu: gridSettingMenuItems,
        },
        useCheckbox: {
          use: useCheckboxMV,
          mode: checkboxModeMV,
          headerCheck: headerCheckMV,
        },
        useSelection: useSelection,
        customContextMenu: menuItems,
        style: {
          stripe: stripeMV,
          border: borderMV,
          highlight: highlightMV,
        },
        expandIcon: expandIconMV,
        collapseIcon: collapseIconMV,
        parentIcon: parentIconMV,
        childIcon: childIconMV,
        page: pageInfo,
        useSummary: true,
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
    </ev-tree-grid>
    <div class="description">
      <div class="form-rows">
        <span class="badge yellow">
          Show Header
        </span>
        <ev-toggle
          v-model="showHeaderMV"
        />
        <span class="badge yellow">
          Use Checkbox
        </span>
        <ev-toggle
          v-model="useCheckboxMV"
        />
        <span class="badge yellow">
          Stripe Style
        </span>
        <ev-toggle
          v-model="stripeMV"
        />
      </div>
      <div class="form-rows">
        <span class="badge yellow">
          Use Selection
        </span>
        <ev-toggle
          v-model="useSelection.use"
        />
        <span class="badge yellow">
          Multiple Selection
        </span>
        <ev-toggle
          v-model="useSelection.multiple"
        />
        <span class="badge yellow">
          Use Grid Setting
        </span>
        <ev-toggle
          v-model="useGridSettingMV"
        />
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Expand Column Index
          </span>
          <ev-input-number
            v-model="expandColumnMV"
            :step="1"
            :max="columns.length - 1"
            :min="0"
            @change="changeExpandTreeColumn"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Limit Count
          </span>
          <ev-select
            v-model="useSelection.limitCount"
            :items="limitItems"
            :style="{ width: '200px' }"
            clearable
            placeholder="Please select value."
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Width
          </span>
          <ev-text-field
            v-model="widthMV"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Height
          </span>
          <ev-text-field
            v-model="heightMV"
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Row Height
          </span>
          <ev-input-number
            v-model="rowHeightMV"
            :step="10"
            :max="150"
            :min="10"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Column Width
          </span>
          <ev-input-number
            v-model="columnWidthMV"
            :step="20"
            :max="300"
            :min="40"
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Checkbox
          </span>
          <ev-radio-group
            v-model="checkboxModeMV"
            type="button"
            @change="changeMode"
          >
            <ev-radio label="single" />
            <ev-radio label="multi" />
          </ev-radio-group>
          <span class="badge">
            Mode
          </span>{{ checkboxModeMV }}
          <span class="badge">
            Count
          </span>{{ checked.length }}
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Checked Row
          </span>
          <ev-text-field
            v-model="checkedRowsMV"
            type="textarea"
            readonly
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Clicked Row
          </span>
          <ev-text-field
            v-model="clickedRowMV"
            type="textarea"
            readonly
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Double Clicked Row
          </span>
          <ev-text-field
            v-model="DbClickedRowsMV"
            type="textarea"
            readonly
          />
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Highlight
          </span>
          <ev-input-number
            v-model="highlightMV"
            :step="1"
            :max="100"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Border Style
          </span>
          <ev-select
            v-model="borderMV"
            :items="borderItems"
            placeholder="Please select value."
          />
          <button
            class="btn"
            @click="onReset('border')"
          >
            <ev-icon
              icon="ev-icon-trash3"
              size="small"
            />Reset
          </button>
        </div>
      </div>
      <div class="form-rows">
        <div class="form-row">
          <span class="badge yellow">
            Expand/Collapse Icon
          </span>
          <ev-select
            v-model="iconMV"
            :items="iconItems"
            placeholder="Please select value."
          />
          <button
            class="btn"
            @click="onReset('treeIcon')"
          >
            <ev-icon
              icon="ev-icon-trash3"
              size="small"
            />Reset
          </button>
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Data Icon
          </span>
          <ev-select
            v-model="dataIconMV"
            :items="dataIconItems"
            placeholder="Please select value."
          />
          <button
            class="btn"
            @click="onReset('dataIcon')"
          >
            <ev-icon
              icon="ev-icon-trash3"
              size="small"
            />Reset
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue';

export default {
  setup() {
    const tableData = ref([]);
    const selected = ref([]);
    const checked = ref([]);
    const widthMV = ref('100%');
    const heightMV = ref(300);
    const showHeaderMV = ref(true);
    const stripeMV = ref(false);
    const rowHeightMV = ref(35);
    const columnWidthMV = ref(80);
    const useCheckboxMV = ref(true);
    const checkboxModeMV = ref('multi');
    const headerCheckMV = ref(true);
    const checkedRowsMV = ref();
    const clickedRowMV = ref();
    const DbClickedRowsMV = ref();
    const expandColumnMV = ref(0);
    const useGridSettingMV = ref(true);
    const gridSettingMenuItems = ref([
      {
        text: 'Menu1',
        click: param => console.log(`[Menu1]: ${param}`),
      },
    ]);
    const menuItems = ref([
      {
        text: 'Menu1',
        click: (param) => {
          console.log(`[Menu1] Selected Row Data: ${JSON.stringify(param?.selectedRow?.[0]?.data)}`);
        },
      }, {
        text: 'Menu2',
        click: param => console.log('[Menu2]', param),
      },
    ]);
    const highlightMV = ref(-1);
    const borderMV = ref('');
    const iconMV = ref('');
    const dataIconMV = ref('');
    const borderItems = ref([
      {
        name: 'none',
        value: 'none',
      },
      {
        name: 'rows',
        value: 'rows',
      },
    ]);
    const iconItems = ref([
      {
        name: 'plus',
        value: { expand: 'ev-icon-circle-plus', collapse: 'ev-icon-circle-minus' },
      },
      {
        name: 'arrow',
        value: { expand: 'ev-icon-s-arrow-down', collapse: 'ev-icon-s-arrow-right' },
      },
    ]);
    const dataIconItems = ref([
      {
        name: 'folder',
        value: { parent: 'ev-icon-folder', child: 'ev-icon-document' },
      },
      {
        name: 'database',
        value: { parent: 'ev-icon-db', child: 'ev-icon-connection' },
      },
      {
        name: 'none',
        value: { parent: 'none', child: 'none' },
      },
    ]);
    const expandIconMV = computed(() => (iconMV.value ? iconMV.value.expand : ''));
    const collapseIconMV = computed(() => (iconMV.value ? iconMV.value.collapse : ''));
    const parentIconMV = computed(() => (dataIconMV.value ? dataIconMV.value.parent : ''));
    const childIconMV = computed(() => (dataIconMV.value ? dataIconMV.value.child : ''));
    const resetBorderStyle = () => {
      borderMV.value = '';
    };
    const resetTreeIcon = () => {
      iconMV.value = '';
    };
    const resetDataIcon = () => {
      dataIconMV.value = '';
    };
    const onReset = (type) => {
        switch (type) {
          case 'border':
            borderMV.value = '';
            break;
          case 'treeIcon':
            iconMV.value = '';
            break;
          case 'dataIcon':
            dataIconMV.value = '';
            break;
          default:
            break;
        }
    };
    const onClickCheckbox = (e) => {
      console.log(`checkbox component click: ${e}`);
    };
    const onClickButton = (e) => {
      console.log(`button component click: ${e}`);
    };
    const changeMode = (mode) => {
      checkboxModeMV.value = mode;
      checked.value = [];
    };
    const onCheckedRow = () => {
      let checkedRow = '';
      for (let i = 0; i < checked.value.length; i++) {
        checkedRow += JSON.stringify(checked.value[i].data);
      }
      checkedRowsMV.value = checkedRow;
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
      tableData.value = [{
        id: 'Exem 1',
        date: '2016-05-01',
        name: '1',
        expand: true,
        children: [{
          id: 'Exem 2',
          date: '2016-05-02',
          name: '2',
          expand: false,
          children: [{
            id: 'Exem 3',
            date: '2016-05-02',
            name: '3',
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
      }];
    };
    const columns = ref([
      { caption: 'ID', field: 'id', type: 'number' },
      { caption: 'Date', field: 'date', type: 'string' },
      {
        caption: 'Name',
        field: 'name',
        type: 'float',
        summaryType: 'sum',
        summaryRenderer: 'Sum: {0}',
        decimal: 1,
      },
    ]);
    const changeExpandTreeColumn = (idx) => {
      columns.value.forEach((val) => {
        val.expandColumn = false;
      });
      columns.value[idx] = { ...columns.value[idx], expandColumn: true };
    };
    const limitItems = ref([
      {
        name: '2',
        value: 2,
      },
      {
        name: '4',
        value: 4,
      },
    ]);
    const useSelection = reactive({
      use: true,
      multiple: true,
      limitCount: 2,
    });
    const pageInfo = reactive({
      use: true,
      // isInfinite: true,
      perPage: 5,
      total: computed(() => tableData.value.length),
      useClient: true,
      showPageInfo: true,
    });

    getData();
    return {
      pageInfo,
      columns,
      tableData,
      selected,
      checked,
      widthMV,
      heightMV,
      showHeaderMV,
      stripeMV,
      rowHeightMV,
      columnWidthMV,
      useCheckboxMV,
      checkboxModeMV,
      headerCheckMV,
      checkedRowsMV,
      clickedRowMV,
      DbClickedRowsMV,
      menuItems,
      highlightMV,
      borderMV,
      borderItems,
      iconMV,
      iconItems,
      expandIconMV,
      collapseIconMV,
      dataIconMV,
      dataIconItems,
      parentIconMV,
      childIconMV,
      limitItems,
      useSelection,
      expandColumnMV,
      useGridSettingMV,
      gridSettingMenuItems,
      onClickCheckbox,
      onClickButton,
      changeMode,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      resetBorderStyle,
      resetTreeIcon,
      resetDataIcon,
      onReset,
      changeExpandTreeColumn,
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
