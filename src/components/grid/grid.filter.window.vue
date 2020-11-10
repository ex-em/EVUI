<template>
  <ev-window
    :modal="true"
    :width="500"
    :height="516"
    :title="title"
    :maximizable="false"
    :resizable="false"
    :is-show.sync="showWindow"
    close-type="destroy"
    @before-close="onCloseWindow"
  >
    <div class="grid-filter">
      <div class="grid-filter-header">
        <ev-button
          :size="'small'"
          @click="onAdd"
        >Add</ev-button>
        <ev-button
          :size="'small'"
          :disabled="!checked.length"
          @click="onDelete"
        >Delete</ev-button>
      </div>
      <div class="grid-filter-body">
        <div
          v-if="showAddForm"
          class="grid-filter-add-wrap"
        >
          <div class="grid-filter-add-item">
            <ul class="item-labels">
              <li
                v-for="(value, key) in addInfo"
                :key="key"
              >{{ key | capitalize }}</li>
            </ul>
            <div class="item-inputs">
              <ev-selectbox
                v-model="addInfo.type"
                :items="types"
                class="item-input"
              />
              <ev-selectbox
                v-model="addInfo.comparison"
                :items="getList(targetColumn.type)"
                class="item-input"
              />
              <ev-text-field
                v-model.trim="addInfo.value"
                :type="'text'"
                class="item-input"
              />
            </div>
          </div>
          <div class="split-line"/>
          <div class="confirm-wrap">
            <ev-button
              :size="'small'"
              @click="onSave"
            >Save</ev-button>
            <ev-button
              :size="'small'"
              @click="showAddForm = false"
            >Cancel</ev-button>
          </div>
        </div>
        <ev-grid
          :rows="rows"
          :columns="columns"
          :checked.sync="checked"
          :option="{
            adjust: true,
            useFilter: false,
            useSelect: false,
            useCheckbox: {
              use: true,
              mode: 'multi',
              headerCheck: true,
            }
          }"
        />
        <ev-button @click="onApply">Apply</ev-button>
      </div>
    </div>
  </ev-window>
</template>

<script>
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
    data() {
      return {
        showWindow: this.isShow,
        showAddForm: false,
        rows: [],
        columns: [
          { caption: 'Type', field: 'type', type: 'String', width: 60 },
          { caption: 'Comparison', field: 'comparison', type: 'String', width: 120 },
          { caption: 'Value', field: 'value', type: 'String' },
        ],
        checked: [],
        addInfo: {
          type: 'AND',
          comparison: this.targetColumn.type === 'string' ? 'Equal' : '>',
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
      };
    },
    computed: {
      title() {
        return `Setting Filter(${this.targetColumn.caption})`;
      },
    },
    watch: {
      isShow(value) {
        this.showWindow = value;
      },
      filterItems(items) {
        const columns = this.columns;
        const rows = [];
        const checked = [];

        for (let ix = 0; ix < items.length; ix++) {
          const item = items[ix];
          const value = columns.reduce((acc, column) => {
            acc.push(item[column.field]);
            return acc;
          }, []);

          if (item.use) {
            checked.push(value);
          }

          rows.push(value);
        }

        this.checked = checked;
        this.rows = rows;
      },
    },
    methods: {
      /**
       * 데이터 유형에 맞는 필터 목록을 반환한다.
       *
       * @param {string} type - 데이터 유형
       * @returns {array} 필터 목록
       */
      getList(type) {
        let result = this.defaultComparison[type];

        if (!result) {
          result = this.defaultComparison.string;
        }

        return result;
      },
      /**
       * 선택한 필터를 테이블에 적용하도록 요청한다.
       */
      onApply() {
        const filterItems = [];
        const rows = this.rows;
        const columns = this.columns;
        const checkedItems = this.checked;

        for (let ix = 0; ix < rows.length; ix++) {
          const row = rows[ix];
          const item = columns.reduce((acc, column, index) => {
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
        this.$emit('apply-filter', this.targetColumn.field, filterItems);
        /**
         * 필터 팝업 종료 전 이벤트
         */
        this.$emit('before-close');
      },
      /**
       * 작성한 필터 정보를 저장한다.
       */
      onSave() {
        const item = this.addInfo;
        this.rows.push(this.columns.reduce((acc, column) => {
          acc.push(item[column.field]);
          return acc;
        }, []));
        this.showAddForm = false;
      },
      /**
       * 새로운 필터 추가 팝업을 표시한다.
       */
      onAdd() {
        this.showAddForm = true;
        this.addInfo = {
          type: 'AND',
          comparison: this.targetColumn.type === 'string' ? 'Equal' : '>',
          value: '',
        };
      },
      /**
       * 선택한 필터를 필터 목록에서 삭제한다.
       */
      onDelete() {
        if (!this.checked.length) {
          return;
        }

        const checked = this.checked;
        const rows = this.rows;
        const tempRows = [];
        for (let ix = 0; ix < rows.length; ix++) {
          const row = rows[ix];
          if (checked.indexOf(row) === -1) {
            tempRows.push(row);
          }
        }

        this.checked.length = 0;
        this.rows = tempRows;
      },
      /**
       * 필터 팝업을 종료한다.
       */
      onCloseWindow() {
        this.checked.length = 0;
        this.rows.length = 0;
        this.showAddForm = false;
        /**
         * 필터 팝업 종료 전 이벤트
         */
        this.$emit('before-close');
      },
    },
  };
</script>

<style lang="scss" scoped>
  @import '~@/styles/default';

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

      .ev-btn {
        width: 70px;
        padding: 4px 10px;
        border-radius: 2px;
      }
    }
  }

  .grid-filter-body {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    align-items: center;

    .ev-btn {
      width: 100px;
      margin-top: 11px;
      padding: 4px 10px;
      border-radius: 2px;
    }
  }

  .grid-filter-add-wrap {
    display: flex;
    width: 100%;
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

      .ev-btn {
        width: 70px;
        padding: 4px 10px;
        border-radius: 2px;
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
  }
</style>
