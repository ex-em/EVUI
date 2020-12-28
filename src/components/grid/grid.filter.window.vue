<template>
  <ev-window
      v-model:visible="showWindow"
      @update:visible="onCloseWindow"
      :width="'500px'"
      :height="'510px'"
      :title="`Setting Filter(${targetColumn.caption})`"
  >
    <!--Contents-->
    <div class="grid-filter">
      <div class="grid-filter-header">
        <!--Add Button-->
        <ev-button size="small" @click="onAdd">Add</ev-button>
        <ev-button size="small" @click="onDelete" :disabled="!checked.length">Delete</ev-button>
      </div>
      <div class="grid-filter-body">
        <!--Add Form-->
        <div
            v-if="showAddForm"
            class="grid-filter-add-wrap"
        >
          <div class="grid-filter-add-item">
            <div class="form-row-contents">
              <div class="form-row">
                <span class="form-row-title wide">Type</span>
                <div class="form-row-contents">
                  <ev-select
                      v-model="addInfo.type"
                      :items="types"
                      class="item-input"
                  />
                </div>
              </div>
              <div class="form-row">
                <span class="form-row-title wide">Comparison</span>
                <div class="form-row-contents">
                  <ev-select
                      v-model="addInfo.comparison"
                      :items="getList(targetColumn.type)"
                      class="item-input"
                  />
                </div>
              </div>
              <div class="form-row">
                <span class="form-row-title wide">Value</span>
                <div class="form-row-contents">
                  <ev-text-field
                      v-model.trim="addInfo.value"
                      type="text"
                      placeholder="Please enter the content"
                      class="item-input"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="split-line"/>
          <div class="confirm-wrap">
            <!--Save Button-->
            <ev-button size="small" @click="onSave">Save</ev-button>
            <ev-button size="small" @click="onCancel">Cancel</ev-button>
          </div>
        </div>
        <!--Grid-->
        <ev-grid
            v-model:checked="checked"
            :rows="tableData"
            :columns="columns"
            :option="{
              width: '100%',
              height: gridHeight,
              adjust: true,
              useFilter: false,
              useCheckbox: {
                use: true,
                mode: 'multi',
                headerCheck: true,
              }
            }"
        />
        <!--Apply Button-->
        <ev-button class="applyBtn" @click="onApply" type="primary">Apply</ev-button>
      </div>
    </div>
  </ev-window>
</template>

<script>
import { ref, reactive, toRefs, watch, computed } from 'vue';

export default {
  filters: {
    capitalize(value) {
      if (!value) {
        return '';
      }
      return value.charAt(0).toUpperCase() + value.slice(1);
    },
  },
  props: {
    /**
     * 필터 팝업 표시 유무
     */
    isShow: {
      type: Boolean,
      default: false,
    },
    /**
     * 필터 대상 컬럼 정보
     */
    targetColumn: {
      type: Object,
      default: () => {},
    },
    /**
     * 설정된 필터 목록
     */
    filterItems: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const showWindow = ref(computed(() => (props.isShow)));
    const showAddForm = ref(false);
    const gridHeight = ref(320);
    const gridInfo = reactive({
      tableData: [],
      checked: [],
      columns: [
        { caption: 'Type', field: 'type', type: 'String', width: 60 },
        { caption: 'Comparison', field: 'comparison', type: 'String', width: 120 },
        { caption: 'Value', field: 'value', type: 'String' },
      ],
      addInfo: {
        type: 'AND',
        comparison: props.targetColumn.type === 'string' ? 'Equal' : '>',
        value: '',
      },
      types: [
        { name: 'OR', value: 'OR' },
        { name: 'AND', value: 'AND' },
      ],
      defaultComparison: {
        string: [
          { name: 'Equal', value: 'Equal' },
          { name: 'Not Equal', value: 'Not Equal' },
          { name: 'Like', value: 'Like' },
          { name: 'Not Like', value: 'Not Like' },
        ],
        number: [
          { name: '>', value: '>' },
          { name: '<', value: '<' },
          { name: '=', value: '=' },
        ],
      },
    });
    /**
     * 데이터 유형에 맞는 필터 목록을 반환한다.
     *
     * @param {string} type - 데이터 유형
     * @returns {array} 필터 목록
     */
    const getList = (type) => {
      let result = gridInfo.defaultComparison[type];

      if (!result) {
        result = gridInfo.defaultComparison.string;
      }

      return result;
    };
    /**
     * 선택한 필터를 테이블에 적용하도록 요청한다.
     */
    const onApply = () => {
      const filterItems = [];
      const rowList = gridInfo.tableData;
      const columnList = gridInfo.columns;
      const checkedItems = gridInfo.checked;

      for (let ix = 0; ix < rowList.length; ix++) {
        const row = rowList[ix];
        const item = columnList.reduce((acc, column, index) => {
          acc[column.field] = row[index];
          return acc;
        }, {});

        item.use = !!checkedItems.find(checkItem => checkItem === row);

        filterItems.push(item);
      }

      /**
       * 필터 적용 요청 이벤트
       *
       * @property {string} field - 컬럼 field
       * @property {array} filterItems - 필터 목록
       */
      if (props.targetColumn.field) {
        emit('apply-filter', props.targetColumn.field, filterItems);
      }
      /**
       * 필터 팝업 종료 전 이벤트
       */
      emit('before-close');
    };
    /**
     * 작성한 필터 정보를 저장한다.
     */
    const onSave = () => {
      const item = gridInfo.addInfo;
      const tempData = JSON.parse(JSON.stringify(gridInfo.tableData));
      tempData.push(gridInfo.columns.reduce((acc, column) => {
        acc.push(item[column.field]);
        return acc;
      }, []));
      gridInfo.tableData = tempData;
      showAddForm.value = false;
      gridHeight.value = 320;
    };
    /**
     * 새로운 필터 추가 양식을 표시한다.
     */
    const onAdd = () => {
      showAddForm.value = true;
      gridHeight.value = 153;
      gridInfo.addInfo = {
        type: 'AND',
        comparison: props.targetColumn.type === 'string' ? 'Equal' : '>',
        value: '',
      };
    };
    /**
     * 선택한 필터를 필터 목록에서 삭제한다.
     */
    const onDelete = () => {
      if (!gridInfo.checked.length) {
        return;
      }

      const checkList = gridInfo.checked;
      const rowList = gridInfo.tableData;
      const tempData = [];
      for (let ix = 0; ix < rowList.length; ix++) {
        const row = rowList[ix];
        if (checkList.indexOf(row) === -1) {
          tempData.push(row);
        }
      }

      gridInfo.checked.length = 0;
      gridInfo.tableData = tempData;
    };
    /**
     * 필터 추가 작성을 취소한다.
     */
    const onCancel = () => {
      showAddForm.value = false;
      gridHeight.value = 320;
    };
    /**
     * 필터 팝업을 종료한다.
     */
    const onCloseWindow = (state) => {
      if (!state) {
        gridInfo.checked.length = 0;
        gridInfo.tableData.length = 0;
        showAddForm.value = false;
        gridHeight.value = 320;
        /**
         * 필터 팝업 종료 전 이벤트
         */
        emit('before-close');
      }
    };
    watch(
        () => props.filterItems,
        (items) => {
          const columns = gridInfo.columns;
          const rowList = [];
          const checkList = [];

          for (let ix = 0; ix < items.length; ix++) {
            const item = items[ix];
            const value = columns.reduce((acc, column) => {
              acc.push(item[column.field]);
              return acc;
            }, []);

            if (item.use) {
              checkList.push(value);
            }

            rowList.push(value);
          }

          gridInfo.checked = checkList;
          gridInfo.tableData = rowList;
        },
    );
    return {
      showWindow,
      showAddForm,
      gridHeight,
      ...toRefs(gridInfo),
      getList,
      onApply,
      onSave,
      onAdd,
      onDelete,
      onCancel,
      onCloseWindow,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/index.scss';

.grid-filter {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  text-align: initial;

  .grid-filter-header {
    height: 24px;
    margin-bottom: 12px;
    text-align: right;

    .ev-button {
      width: 70px;
      margin-left: 5px;
    }
  }
}

.grid-filter-body {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;

  .ev-button {
    width: 100px;
    margin-top: 8px;
  }

  .applyBtn {
    position: absolute;
    bottom: 17px;
  }
}

.grid-filter-add-wrap {
  display: flex;
  width: 100%;
  //height: 100%;
  padding: 10px;
  background-color: lightgray;
  margin-bottom: 10px;

  @include evThemify() {
    background-color: evThemed('grid-filter-add-background');
  }

  .split-line {
    width: 1px;
    margin: 0 20px;

    @include evThemify() {
      background-color: evThemed('grid-filter-add-background');
    }
  }

  .confirm-wrap {
    display: flex;
    width: 70px;
    margin-right: 10px;
    flex-direction: column;
    align-items: center;

    .ev-button {
      width: 70px;
    }
  }
}

.grid-filter-add-item {
  display: flex;
  align-items: center;
  flex: 1;

  .item-labels {
    margin-right: 10px;
    list-style-type: none;

    li {
      height: 24px;
      line-height: 24px;
      margin-bottom: 8px;
      font-size: 13px;

      @include evThemify() {
        color: evThemed('grid-filter-add-label');
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .item-inputs {
    display: flex;
    flex-direction: column;
    flex: 1;

    .item-input {
      width: 100%;
      height: 24px;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .form-row-contents {
    min-height: 35px;
    flex: 1;
  }

  .form-row {
    display: flex;
    width: 100%;
    margin: 8px 0;
  }

  .form-row-title.wide {
    width: 30%;
    line-height: 33px;
    vertical-align: middle;
  }
}
</style>
