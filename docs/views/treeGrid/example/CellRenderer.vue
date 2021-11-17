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
        customContextMenu: menuItems,
        style: {
          stripe: stripeMV,
          border: borderMV,
        },
        expandIcon: expandIconMV,
        collapseIcon: collapseIconMV,
        parentIcon: parentIconMV,
        childIcon: childIconMV,
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
          @click="onRowDelete()"
        >
          Delete
        </ev-button>
        <ev-button
          size="small"
          @click="onRowEdit()"
        >
          Edit
        </ev-button>
      </template>
      <template #check="{ item }">
        <ev-checkbox
          v-model="item.data[item.fieldName]"
          label="check"
          @click.stop=""
          @dblclick.stop=""
        />
      </template>
      <template #slide="{ item }">
        <ev-slider
          v-model="item.data[item.fieldName]"
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
          :class="getStateClass(item.data[item.fieldName])"
        >
          <span class="v-chip__content"> {{ item.data[item.fieldName] }} </span>
        </span>
      </template>
      <template #inputNumber="{ item }">
        <ev-input-number
          v-model="item.data[item.fieldName]"
          :max="100"
          :min="0"
          @click.stop="onInputNumberClick"
          @dblclick.stop=""
        />
      </template>
    </ev-tree-grid>
  </div>
</template>
<script>
import { ref, computed } from 'vue';

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
        click: () => console.log(`[Menu1] Selected Row Data: ${JSON.stringify(selected.value.data)}`),
      }, {
        text: 'Menu2',
        click: () => console.log('[Menu2]'),
      },
    ]);
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
        check: true,
        slide: [33.33, 66.66],
        inputNumber: 10,
        custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
        expand: true,
        children: [{
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          expand: false,
          children: [{
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
            expand: false,
            children: [{
              check: true,
              slide: [33.33, 66.66],
              inputNumber: 10,
              custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
              children: [{
                check: true,
                slide: [33.33, 66.66],
                inputNumber: 10,
                custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
                children: [{
                  check: true,
                  slide: [33.33, 66.66],
                  inputNumber: 10,
                  custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
                }],
              }],
            }, {
              check: true,
              slide: [33.33, 66.66],
              inputNumber: 10,
              custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
            }],
          }],
        }, {
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          children: [{
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }, {
            check: true,
            slide: [33.33, 66.66],
            inputNumber: 10,
            custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
          }],
        }, {
          check: true,
          slide: [33.33, 66.66],
          inputNumber: 10,
          custom: Math.floor(Math.random() * (99 - 10 + 1)) + 10,
        }],
      }];
    };
    const columns = ref([
      {
        caption: 'Check',
        field: 'check',
        type: 'boolean',
        width: 170,
      },
      {
        caption: 'Slide',
        field: 'slide',
        type: 'string',
      },
      {
        caption: 'InputNumber',
        field: 'inputNumber',
        type: 'number',
        width: 120,
      },
      {
        caption: 'Custom',
        field: 'custom',
        type: 'string',
        width: 100,
      },
      {
        caption: '',
        field: 'gridButton',
        type: 'boolean',
        width: 120,
      },
    ]);
    const onInputNumberClick = () => {
      console.log('On click InputNumber');
    };
    const onRowDelete = () => {
      console.log('On click Delete');
    };
    const onRowEdit = () => {
      console.log('On click RowEdit');
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
      borderItems,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      iconMV,
      iconItems,
      expandIconMV,
      collapseIconMV,
      dataIconMV,
      dataIconItems,
      parentIconMV,
      childIconMV,
      onInputNumberClick,
      onRowDelete,
      onRowEdit,
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
