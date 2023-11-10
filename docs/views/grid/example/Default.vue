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
        adjust: true,
        showHeader: showHeaderMV,
        rowHeight: rowHeightMV,
        columnWidth: columnWidthMV,
        useGridSetting: {
          use: useGridSettingMV,
          customContextMenu: gridSettingMenuItems,
        },
        useFilter: useFilterMV,
        customContextMenu: menuItems,
        useCheckbox: {
          use: useCheckboxMV,
          mode: checkboxModeMV,
          headerCheck: headerCheckMV,
        },
        useFilter: true,
        useSelection: {
          use: useSelectionMV,
          multiple: isSelectionMultiple,
        },
        style: {
          stripe: stripeMV,
          border: borderMV,
          highlight: highlightMV,
        },
        page: pageInfo,
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
      @page-change="onRequestData"
    />
    <!-- description -->
    <div class="description">
      <div class="form-rows">
        <span class="badge yellow">
          Show Header
        </span>
        <ev-toggle
          v-model="showHeaderMV"
        />
        <span class="badge yellow">
          Use Filter
        </span>
        <ev-toggle
          v-model="useFilterMV"
          readonly
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
          v-model="useSelectionMV"
        />
        <span class="badge yellow">
          Multiple Selection
        </span>
        <ev-toggle
          v-model="isSelectionMultiple"
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
            :min="35"
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
            :min="-1"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Border Style
          </span>
          <ev-select
            v-model="borderMV"
            :items="items"
            clearable
            placeholder="Please select value."
          />
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
    const showHeaderMV = ref(true);
    const stripeMV = ref(false);
    const rowHeightMV = ref(45);
    const columnWidthMV = ref(80);
    const useFilterMV = ref(false);
    const useCheckboxMV = ref(true);
    const checkboxModeMV = ref('multi');
    const headerCheckMV = ref(true);
    const checkedRowsMV = ref();
    const clickedRowMV = ref();
    const DbClickedRowsMV = ref();
    const useSelectionMV = ref(true);
    const isSelectionMultiple = ref(false);
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
        click: param => console.log(`[Menu1] Selected Row Data: ${param?.selectedRow}`),
      }, {
        text: 'Menu2',
        click: param => console.log('[Menu2]', param.contextmenuInfo),
      },
    ]);
    const highlightMV = ref(-1);
    const borderMV = ref('rows');
    const items = ref([
      {
        name: 'none',
        value: 'none',
      },
      {
        name: 'rows',
        value: 'rows',
      },
    ]);
    const columns = ref([
      { caption: 'Name', field: 'userName', type: 'string', width: 80 },
      { caption: 'Role', field: 'role', type: 'string', width: 80, hiddenDisplay: true },
      { caption: 'number', field: 'number', type: 'number', width: 80 },
      { caption: 'boolean', field: 'boolean', type: 'boolean', width: 80 },
      { caption: 'Phone', field: 'phone', type: 'string', sortable: false },
      { caption: 'Email', field: 'email', type: 'string', width: 80 },
      { caption: 'Last Login', field: 'lastLogin', type: 'string' },
    ]);
    const resetBorderStyle = () => {
      borderMV.value = '';
    };
    const changeMode = (mode) => {
      checkboxModeMV.value = mode;
      checked.value = [];
    };
    const onCheckedRow = () => {
      let checkedRow = '';
      checked.value.forEach((row) => {
        checkedRow += JSON.stringify(row);
      });
      checkedRowsMV.value = checkedRow;
    };
    const onDoubleClickRow = (e) => {
      DbClickedRowsMV.value = `${e.rowData}`;
    };
    const onClickRow = () => {
      let clickedRow = '';
      selected.value.forEach((row) => {
        clickedRow += JSON.stringify(row);
      });
      clickedRowMV.value = clickedRow;
    };
    const getData = (count, startIndex) => {
      const temp = [];
      const roles = ['Common', 'Admin'];
      const booleans = [true, false];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          `user_${ix + 1}`,
          roles[ix % 2],
          ix,
          booleans[ix % 2],
          '010-0000-0000',
          'kmn0827@ex-em.com',
          '2020.08.04 14:15',
        ]);
      }
      return temp;
    };
    const onRequestData = (e) => {
      if (e.eventName?.onSort || e.eventName?.onSearch) {
        tableData.value = getData(50, 0);
      } else if (e.eventName?.onScrollEnd && tableData.value.length < 1000) {
        const newData = getData(50, tableData.value.length);
        tableData.value = [
          ...tableData.value,
          ...newData,
        ];
      }
    };
    const pageInfo = reactive({
      use: true,
      isInfinite: true,
      perPage: 50,
      total: computed(() => tableData.value.length),
      useClient: true,
    });

    tableData.value = getData(50, 0);
    return {
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
      useFilterMV,
      useCheckboxMV,
      checkboxModeMV,
      headerCheckMV,
      checkedRowsMV,
      clickedRowMV,
      DbClickedRowsMV,
      menuItems,
      highlightMV,
      borderMV,
      items,
      pageInfo,
      isSelectionMultiple,
      useSelectionMV,
      useGridSettingMV,
      gridSettingMenuItems,
      changeMode,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      resetBorderStyle,
      onRequestData,
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
