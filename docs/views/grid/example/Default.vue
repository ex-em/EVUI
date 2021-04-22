<template>
  <div class="case">
    <p class="case-title">Grid</p>
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
          highlight: highlightMV,
        },
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
    </ev-grid>
    <div class="description">
      <div class="form-rows">
        <span class="badge yellow">
          Show Header
        </span>
        <ev-toggle
          v-model="showHeaderMV"
        />
        <span class="badge yellow">
          Adjust
        </span>
        <ev-toggle
          v-model="adjustMV"
        />
        <span class="badge yellow">
          Use Filter
        </span>
        <ev-toggle
          v-model="useFilterMV"
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
            :min="0"
          />
        </div>
        <div class="form-row">
          <span class="badge yellow">
            Border Style
          </span>
          <ev-select
            v-model="borderMV"
            :items="items"
            placeholder="Please select value."
          />
          <button
            class="btn"
            @click="resetBorderStyle"
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
        click: () => alert(`[Menu1] Selected Row Data: ${selected.value}`),
      }, {
        text: 'Menu2',
        click: () => alert('[Menu2]'),
      },
    ]);
    const highlightMV = ref(0);
    const borderMV = ref('');
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
    const resetBorderStyle = () => {
      borderMV.value = '';
    };
    const onClickCheckbox = (e) => {
      console.log(`checkbox component click: ${e}`);
    };
    const onClickButton = (e) => {
      console.log(`button component click: ${e}`);
    };
    const clearData = () => {
      tableData.value = [];
    };
    const changeMode = (mode) => {
      checkboxModeMV.value = mode;
      checked.value = [];
    };
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
      const countries = [
        'Russia', 'Canada', 'United States', 'China', 'Brazil',
        'Australia', 'India', 'Argentina', 'Kazakhstan', 'Algeria',
        'Denmark', 'Mexico', 'Indonesia', 'Sudan', 'Libya',
        'Iran', 'Japan', 'Korea', 'Egypt', 'Ethiopia',
      ];
      // const state = ['normal', 'warning', 'critical'];
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          ix + 1,
          countries[ix % 20],
          Math.random() * 10000,
          Math.random() * 100,
          Math.random() * 1000,
          true,
          true,
          Math.floor(Math.random() * (100 - 0 + 1)) + 0,
         'critical',
        ]);
      }
      tableData.value = temp;
    };
    const columns = ref([
      { caption: 'ID', field: 'id', type: 'number' },
      { caption: 'Country', field: 'country', type: 'string' },
      { caption: 'Area', field: 'area', type: 'number', hide: true },
      { caption: 'Population', field: 'population', type: 'float' },
      { caption: 'GDP', field: 'gdp', type: 'float' },
      {
        caption: 'Information',
        field: 'information',
        type: 'boolean',
        render: {
          use: true,
          type: 'button',
          option: {
            onClick: onClickButton,
            btnName: 'View Info',
            btnType: 'default',
            btnShape: 'square',
            btnIcon: 'ev-icon-document-search',
          },
        },
      },
      {
        caption: 'Check',
        field: 'check',
        type: 'boolean',
        render: {
          use: true,
          type: 'checkbox',
          option: {
            onClick: onClickCheckbox,
            label: 'check',
          },
        },
      },
      // {
      //   caption: 'Information',
      //   field: 'information',
      //   type: 'boolean',
      //   render: {
      //     use: true,
      //     type: 'button',
      //     option: {
      //       onClick: onClickButton,
      //       btnName: 'View Info',
      //       btnType: 'primary',
      //       btnShape: 'square',
      //       btnIcon: 'ev-icon-document-search',
      //     },
      //   },
      // },
      // {
      //   caption: 'Size',
      //   field: 'size',
      //   type: 'number',
      //   width: 100,
      //   render: {
      //     use: true,
      //     type: 'input_number',
      //     option: {
      //       minValue: 0,
      //       maxValue: 100,
      //     },
      //   },
      // },
      // {
      //   caption: 'State',
      //   field: 'state',
      //   type: 'string',
      //   width: 300,
      //   render: {
      //     use: true,
      //     type: 'select',
      //     option: {
      //       selectItem: [
      //         {
      //           name: 'normal',
      //           value: 'normal',
      //         }, {
      //           name: 'warning',
      //           value: 'warning',
      //         }, {
      //           name: 'critical',
      //           value: 'critical',
      //         },
      //       ],
      //     },
      //   },
      // },
    ]);

    getData(50, 0);
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
      highlightMV,
      borderMV,
      items,
      onClickCheckbox,
      onClickButton,
      clearData,
      changeMode,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      resetBorderStyle,
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
