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
        customContextMenu: menuItems,
        useCheckbox: {
          use: useCheckboxMV,
          mode: checkboxModeMV,
          headerCheck: headerCheckMV,
        },
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
      <!-- renderer start -->
      <template #user-icon>
        <div class="user-icon"/>
      </template>
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
      <!-- renderer end -->
    </ev-grid>
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
    const rowHeightMV = ref(45);
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
      { caption: '', field: 'user-icon', type: 'string' },
      { caption: 'Name', field: 'userName', type: 'string', width: 80 },
      { caption: 'Role', field: 'role', type: 'string' },
      { caption: 'Phone', field: 'phone', type: 'string', sortable: false },
      { caption: 'Email', field: 'email', type: 'string' },
      { caption: 'Last Login', field: 'lastLogin', type: 'string' },
      { caption: '', field: 'gridButton', width: 120 },
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
      const temp = [];
      for (let ix = startIndex; ix < startIndex + count; ix++) {
        temp.push([
          `user_${ix + 1}`,
          `user_${ix + 1}`,
          'Common',
          '010-0000-0000',
          'kmn0827@ex-em.com',
          '2020.08.04 14:15',
        ]);
      }
      tableData.value = temp;
    };
    const loadImage = (fileName) => {
      /* eslint-disable global-require */
      try {
        // eslint-disable-next-line import/no-dynamic-require
        return require(`../../../assets/images/${fileName}.jpg`);
      } catch (e) {
        return require('../../../assets/images/user_default.png');
      }
      /* eslint-enable global-require */
    };

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
      changeMode,
      onCheckedRow,
      onDoubleClickRow,
      onClickRow,
      resetBorderStyle,
      loadImage,
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
.user-icon {
  width: 30px;
  height: 30px;
  border: 1px solid #FFFFFF;
  border-radius: 20px;
  background: url('../../../assets/images/user_1.jpg') no-repeat center center;
  background-size: 32px 32px;
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
</style>
