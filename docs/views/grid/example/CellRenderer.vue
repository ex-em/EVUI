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
      }"
      @check-row="onCheckedRow"
      @check-all="onCheckedRow"
      @click-row="onClickRow"
      @dblclick-row="onDoubleClickRow"
    >
      <!-- renderer start -->
      <template #gridButton>
        <ev-button
          type="ghost"
          size="small"
        >
          Delete
        </ev-button>
        <ev-button size="small">
          Edit
        </ev-button>
      </template>
      <template #check="{ item }">
        <ev-checkbox
          v-model="item.row[2][item.column.index]"
          label="check"
          @click.stop=""
          @dblclick.stop=""
        />
      </template>
      <template #select="{ item }">
        <ev-select
          v-model="item.row[2][item.column.index]"
          :items="[
              {
                name: 'a',
                value: 'a',
              }, {
                name: 'b',
                value: 'b',
              }, {
                name: 'c',
                value: 'c',
              },
            ]"
          placeholder="Please select value."
          @click.stop=""
          @dblclick.stop=""
        />
      </template>
      <template #slide="{ item }">
        <ev-slider
          v-model="item.row[2][item.column.index]"
          range
          readonly
          :mark="{
            33.33: 'W',
            66.66: 'C',
          }"
          :color="['#3C81F6', '#FADE4C', '#FF470E']"
          :show-tooltip="false"
        />
      </template>
      <template #custom="{ item }">
        <span
          :class="getStateClass(item.row[2][item.column.index])"
        >
          <span class="v-chip__content"> {{ item.row[2][item.column.index] }} </span>
        </span>
      </template>
      <template #inputNumber="{ item }">
        <ev-input-number
          v-model="item.row[2][item.column.index]"
          :max="100"
          :min="0"
          @click.stop="onInputNumberClick"
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
    const columns = ref([
      {
        caption: 'Check',
        field: 'check',
        type: 'boolean',
      },
      {
        caption: 'Select',
        field: 'select',
        type: 'string',
      },
      {
        caption: 'Slide',
        field: 'slide',
        type: 'string',
        sortable: false,
      },
      {
        caption: 'InputNumber',
        field: 'inputNumber',
        type: 'number',
        width: 140,
      },
      {
        caption: 'Custom',
        field: 'custom',
        type: 'string',
      },
      {
        caption: '',
        field: 'gridButton',
        type: 'boolean',
        width: 120,
      },
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
      const state = ['a', 'b', 'c'];
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          true, // check
          state[ix % 3], // select
          [33.33, 66.66], // slide
          10, // inputNumber
          Math.floor(Math.random() * (99 - 10 + 1)) + 10, // custom
          '',
        ]);
      }
      tableData.value = temp;
    };
    const onInputNumberClick = () => {
      console.log('On click InputNumber');
    };
    const getStateClass = (value) => {
      let stateColor = 'green';
      if (value >= 70) {
        stateColor = 'yellow';
      } else if (value >= 50) {
        stateColor = 'red';
      }
      return {
        'v-chip': true,
        'v-size--default': true,
        [stateColor]: true,
      };
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
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      onInputNumberClick,
      getStateClass,
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
.v-chip {
  display: inline-flex;
  position: relative;
  height: 32px;
  padding: 0 12px;
  align-items: center;
  cursor: default;
  color: #FFFFFF;
  line-height: 20px;
  max-width: 100%;
  outline: none;
  overflow: hidden;
  text-decoration: none;
  transition-duration: .28s;
  transition-property: box-shadow, opacity;
  transition-timing-function: cubic-bezier(.4,0,.2,1);
  vertical-align: middle;
  white-space: nowrap;
  border-radius: 16px;
  font-size: 14px;

  &.green {
    background-color: #4CAF50;
    border-color: #4CAF50;
  }
  &.yellow {
    background-color: #F7DF6A;
    border-color: #F7DF6A;
  }
  &.red {
    background-color: #FF4949;
    border-color: #FF4949;
  }
}
.v-chip .v-chip__content {
  display: inline-flex;
  height: 100%;
  align-items: center;
  max-width: 100%;
}
</style>
