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
        stripeRows: isStripeStyleMV,
        rowHeight: rowHeightMV,
        columnWidth: columnWidthMV,
        useFilter: useFilterMV,
        useCheckbox: {
          use: useCheckboxMV,
          mode: checkboxModeMV,
          headerCheck: headerCheckMV,
        },
        customContextMenu: menuItems,
      }"
      @check-row="onCheckedRow"
      @check-all="onAllCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
    </ev-grid>
    <div class="description">
      <div class="form-row-contents">
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Width</span>
            <div class="form-row-contents">
              <ev-text-field
                v-model="widthMV"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Height</span>
            <div class="form-row-contents">
              <ev-text-field
                v-model="heightMV"
              />
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Row Height</span>
            <div class="form-row-contents">
              <ev-input-number
                v-model="rowHeightMV"
                :step="10"
                :max="150"
                :min="35"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Column Width</span>
            <div class="form-row-contents">
              <ev-input-number
                v-model="columnWidthMV"
                :step="20"
                :max="300"
                :min="40"
              />
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Show Header</span>
            <div class="form-row-contents">
              <ev-toggle
                v-model="showHeaderMV"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Adjust</span>
            <div class="form-row-contents">
              <ev-toggle
                v-model="adjustMV"
              />
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Use Filter</span>
            <div class="form-row-contents">
              <ev-toggle
                v-model="useFilterMV"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Use Checkbox</span>
            <div class="form-row-contents">
              <ev-toggle
                v-model="useCheckboxMV"
              />
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Stripe Style</span>
            <div class="form-row-contents">
              <ev-toggle
                v-model="isStripeStyleMV"
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Clear Data</span>
            <div class="form-row-contents">
              <ev-button @click="clearData">
                <ev-icon icon="ev-icon-trash3" />
                Clear
              </ev-button>
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Checkbox Mode</span>
            <div class="form-row-contents">
              <ev-button-group>
                <ev-button
                  type="primary"
                  @click="changeMode('single')"
                >
                  Single
                </ev-button>
                <ev-button
                  type="warning"
                  @click="changeMode('multi')"
                >
                  Multi
                </ev-button>
              </ev-button-group>
              <div class="text">Mode: {{checkboxModeMV}}</div>
              <div class="text">Count: {{checked.length}}</div>
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Current Checked Row</span>
            <div class="form-row-contents">
              <ev-text-field
                v-model="checkedRowsMV"
                type="textarea"
                readonly
              />
            </div>
          </div>
        </div>
        <div class="form-rows">
          <div class="form-row">
            <span class="form-row-title">Clicked Row</span>
            <div class="form-row-contents">
              <ev-text-field
                v-model="clickedRowMV"
                type="textarea"
                readonly
              />
            </div>
          </div>
          <div class="form-row">
            <span class="form-row-title">Double Clicked Row</span>
            <div class="form-row-contents">
              <ev-text-field
                v-model="DbClickedRowsMV"
                type="textarea"
                readonly
              />
            </div>
          </div>
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
    const isStripeStyleMV = ref(false);
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
        text: 'TEXT1',
        click: () => console.log('CLICK text1'),
      },
    ]);
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
    const onCheckedRow = (e, index, rowData) => {
      checkedRowsMV.value = `${rowData}`;
    };
    const onDoubleClickRow = (e) => {
      DbClickedRowsMV.value = `${e.rowData}`;
    };
    const onClickRow = (e, rowIdx, cellName, cellIdx, rowData) => {
      clickedRowMV.value = `${rowData}`;
    };
    const onAllCheckedRow = (check) => {
      console.log(`All Check : ${check}`);
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
          type: 'toggle',
          option: {
            onClick: onClickButton,
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
      isStripeStyleMV,
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
      onClickCheckbox,
      onClickButton,
      clearData,
      changeMode,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      onAllCheckedRow,
    };
  },
};
</script>

<style lang="scss" scoped>
.description {
  width: 100%;
  margin-bottom: 20px;
}

.form-row-contents {
  min-height: 35px;
  flex: 1;
}

.form-rows {
  display: flex;
}

.form-row {
  display: flex;
  width: 100%;
  margin: 4px 0;
}

.form-row-title {
  width: 100px;
  line-height: 33px;
  vertical-align: middle;
}

.ev-toggle {
  margin-top: 8px;
}

.text {
  margin: 5px;
}

.ev-text-field, .ev-input-number {
  width: 200px;
}
</style>
