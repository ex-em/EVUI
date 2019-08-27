<template>
  <div
    v-cloak
    :class="getTableClass"
  >
    <div
      ref="header"
      class="table-header"
    >
      <ul class="column-list">
        <li
          v-for="(column, index) in orderedColumns"
          :key="index"
          :style="`width: ${column.width}px;`"
          class="column"
          @click="onSort(column.field)"
        >
          <span class="column-name">{{ column.caption }}</span>
          <ev-icon
            :cls="'ei-s ei-s-arrow-down'"
            style="margin: 3px 0 0 0; font-size: 12px;"
          />
          <span
            class="column-option"
            @click.stop.prevent="onClickOption($event, column.field, index)"
          >
            <ev-icon
              :cls="'ei-s ei-s-arrow-down'"
              style="margin: 3px 0 0 0; font-size: 12px;"
            />
          </span>
        </li>
        <div class="column dummy"/>
      </ul>
    </div>
    <div
      ref="body"
      class="table-body"
      @scroll="onScroll"
    >
      <div
        :style="`height: ${vScrollTopHeight}px;`"
        class="vscroll-spacer"
      />
      <table>
        <tbody>
          <tr
            v-for="(row, rowIndex) in viewStore"
            :key="rowIndex"
          >
            <td
              v-for="(column, viewIndex) in orderedColumns"
              :key="viewIndex"
              :style="`width: ${column.width}px; height: ${rowHeight}px;`"
            >
              {{ row[column.index] }}
            </td>
          </tr>
        </tbody>
      </table>
      <div
        :style="`height: ${vScrollBottomHeight}px;`"
        class="vscroll-spacer"
      />
    </div>
    <TableFilter
      v-if="showColumnOption"
      v-model="filterCondition"
      :show.sync="showColumnOption"
      @sort="onSort"
    />
  </div>
</template>
<script>
  import _ from 'lodash-es';
  import TableFilter from './grid.filter';

  export default {
    name: 'EvTableNew',
    components: {
      TableFilter,
    },
    props: {
      columns: {
        type: Array,
        default: () => [],
      },
      rows: {
        type: Array,
        default: () => [],
      },
      adjust: {
        type: Boolean,
        default: true,
      },
    },
    data() {
      return {
        originStore: [],
        filteredStore: [],
        viewStore: [],
        orderedColumns: [],
        sortOrder: 'desc',
        sortField: '',
        rowHeight: 24,
        columnWidth: 80,
        lastScroll: {},
        vScrollTopHeight: 0,
        vScrollBottomHeight: 0,
        hasVerticalScrollBar: false,
        showColumnOption: false,
        sortList: {},
        filterList: {},
        filterCondition: {},
      };
    },
    computed: {
      getTableClass() {
        return {
          table: true,
          adjust: this.adjust,
          'v-scroll': this.hasVerticalScrollBar,
        };
      },
      useFilter() {
        let result = false;
        const columns = Object.keys(this.filterList);

        for (let ix = 0; ix < columns.length; ix++) {
            if (this.filterList[columns[ix]].use) {
                result = true;
                break;
            }
        }

        return result;
      },
    },
    watch: {
      rows(value) {
        this.setStore(value);
      },
      filterCondition: {
        deep: true,
        handler(value) {
          this.$set(this.filterList, value.field, value);
          this.filteredStore.length = 0;

          if (this.useFilter) {
            this.setFilter();
          }

          this.updateVScroll();
        },
      },
    },
    created() {
      this.orderedColumns = this.columns.map((column, index) => ({ index, ...column }));
    },
    mounted() {
      let columnWidth = this.columnWidth;
      if (this.adjust) {
        const el = this.$refs.body;
        const elWidth = el.clientWidth;
        const result = this.orderedColumns.reduce((acc, column) => {
          if (column.width) {
            acc.totalWidth += column.width;
          } else {
            acc.emptyCount++;
          }

          return acc;
        }, { totalWidth: 0, emptyCount: 0 });

        columnWidth = elWidth - result.totalWidth;
        columnWidth = columnWidth > -1 ? columnWidth / result.emptyCount : this.columnWidth;
        columnWidth = columnWidth < 100 ? 100 : columnWidth;

        this.columnWidth = columnWidth;
      }

      this.orderedColumns.map((column) => {
        const item = column;
        if (!item.width) {
          item.width = columnWidth;
        }
        return item;
      });

      this.$forceUpdate();
    },
    methods: {
      getColumnName(field) {
        return this.columns.find(column => column.field === field).caption;
      },
      getColumnIndex(field) {
        return this.columns.findIndex(column => column.field === field);
      },
      setSort() {
        const index = this.getColumnIndex(this.sortField);
        const desc = (a, b) => (a > b ? -1 : 1);
        const asc = (a, b) => (a < b ? -1 : 1);
        const type = this.columns[index].type || 'string';
        const sortFn = this.sortOrder === 'desc' ? desc : asc;

        if (type === 'string') {
            this.originStore.sort((a, b) => sortFn(a[index].toLowerCase(), b[index].toLowerCase()));
        } else {
            this.originStore.sort((a, b) => sortFn(a[index], b[index]));
        }
      },
      likeSearch(search, origin) {
        if (typeof search !== 'string' || origin === null) {
            return false;
        }

        let regx = search.replace(new RegExp('([\\.\\\\\\+\\*\\?\\[\\^\\]\\$\\(\\)\\{\\}\\=\\!\\<\\>\\|\\:\\-])', 'g'), '\\$1');
        regx = regx.replace(/%/g, '.*').replace(/_/g, '.');

        return RegExp(`^${regx}$`, 'gi').test(origin);
      },
      stringFilter(item, condition) {
        const type = condition.type;
        const value = condition.value;
        const index = condition.index;
        let result;

        if (type === 'equal') {
            result = item[index] === value;
        } else if (type === 'notEqual') {
            result = item[index] !== value;
        } else if (type === 'like') {
            result = this.likeSearch(`%${value}%`, item[index]);
        } else if (type === 'notLike') {
            result = !this.likeSearch(`%${value}%`, item[index]);
        }

        return result;
      },
      numberFilter(item, condition) {
        const type = condition.type;
        const value = condition.value;
        const index = condition.index;
        let result;

        if (type === 'equal') {
            result = item[index] === value;
        } else if (type === 'greaterThan') {
            result = item[index] > value;
        } else if (type === 'lessThan') {
            result = item[index] < value;
        }

        return result;
      },
      getFilteredData(data, filterType, condition) {
        const filterFn = filterType === 'string' ? this.stringFilter : this.numberFilter;
        const filteredData = [];

        for (let ix = 0; ix < data.length; ix++) {
            if (filterFn(data[ix], condition)) {
                filteredData.push(data[ix]);
            }
        }

        return filteredData;
      },
      setFilter() {
        let filteredStore = [];
        let field;
        let index;
        let filter;
        let columnType;
        const fields = Object.keys(this.filterList);
        const store = _.cloneDeep(this.originStore);

        for (let ix = 0; ix < fields.length; ix++) {
          field = fields[ix];
          filter = this.filterList[field];
          index = this.getColumnIndex(field);
          columnType = this.columns[index].type;
          if (filter.use && filter.conditions.length) {
            for (let jx = 0; jx < filter.conditions.length; jx++) {
              if (filter.conditions[jx].use) {
                if (!filteredStore.length) {
                    filteredStore = this.getFilteredData(store, columnType, {
                        ...filter.conditions[jx],
                        index,
                    });
                } else if (filter.method === 'or') {
                    filteredStore.push(...this.getFilteredData(store, columnType, {
                        ...filter.conditions[jx],
                        index,
                    }));
                } else {
                    filteredStore = this.getFilteredData(filteredStore, columnType, {
                        ...filter.conditions[jx],
                        index,
                    });
                }
              }
            }
          }
        }

        this.filteredStore = _.uniqBy(filteredStore, JSON.stringify);
      },
      setStore(value) {
        this.originStore = _.cloneDeep(value);

        if (this.sortField) {
          this.setSort();
        }

        if (this.useFilter) {
          this.setFilter();
        }

        this.updateVScroll();

        Object.freeze(this.originStore);
      },
      onSort(field) {
        if (this.sortField === field) {
          this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        } else {
          this.sortField = field;
          this.sortOrder = 'desc';
        }

        this.setStore(this.originStore);
      },
      onScroll() {
        const el = this.$refs.body;
        const scrollTop = el.scrollTop;
        const scrollLeft = el.scrollLeft;
        const lastTop = this.lastScroll.top;
        const lastLeft = this.lastScroll.left;
        const isHorizontal = !(scrollLeft === lastLeft);
        const isVertical = !(scrollTop === lastTop);

        if (isVertical) {
          this.updateVScroll();
        }

        if (isHorizontal) {
          this.updateHScroll();
        }

        this.lastScroll.top = scrollTop;
        this.lastScroll.left = scrollLeft;
      },
      updateHScroll() {
        const headerEl = this.$refs.header;
        const bodyEl = this.$refs.body;

        headerEl.scrollLeft = bodyEl.scrollLeft;
      },
      updateVScroll() {
        const el = this.$refs.body;
        const offset = 5;
        const rowHeight = this.rowHeight;
        const rowCount = Math.ceil(el.clientHeight / rowHeight);
        const store = this.useFilter ? this.filteredStore : this.originStore;
        const totalScrollHeight = store.length * rowHeight;
        const firstVisibleIndex = Math.floor(el.scrollTop / rowHeight);
        const lastVisibleIndex = firstVisibleIndex + rowCount;
        const firstIndex = Math.max(firstVisibleIndex - offset, 0);
        const lastIndex = lastVisibleIndex + offset;

        this.hasVerticalScrollBar = rowCount < this.originStore.length;
        this.viewStore = store.slice(firstIndex, lastIndex);

        this.vScrollTopHeight = firstIndex * rowHeight;
        this.vScrollBottomHeight = totalScrollHeight - (this.viewStore.length * rowHeight)
          - this.vScrollTopHeight;
      },
      onClickOption(e, field, index) {
        if (this.showColumnOption) {
            this.showColumnOption = false;
            return;
        }

        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        const top = rect.height;
        const left = (rect.width * (index + 1)) - 12;
        let condition = this.filterList[field];

        if (!condition) {
          condition = {
            use: false,
            method: 'or',
            type: this.orderedColumns[index].type || 'string',
            conditions: [],
            field,
          };
        }

        condition.field = field;
        condition.top = top;
        condition.left = left;

        this.filterCondition = condition;
        this.showColumnOption = true;
      },
    },
  };
</script>
<style scoped>
  .table {
    position: relative;
    width: 100%;
    height: 100%;
    border: 1px solid black;
    padding-top: 30px;
  }
  .table-header {
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    height: 30px;
    background-color: darkgray;
    border-bottom: 1px solid black;
  }
  .column-list {
    white-space: nowrap;
    width: 100%;
  }
  .column {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 30px;
    line-height: 30px;
    vertical-align: top;
    border-right: 1px solid black;
    padding: 0 3px;
    user-select: none;
  }
  .adjust .column:last-child {
    border-right: 0;
  }
  .column.dummy {
    width: 0px;
  }
  .column-name {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .column-option {
    position: absolute;
    right: 0;
    height: 100%;
    background-color: transparent;
    box-shadow: inset 0 0 3px #000000;
  }
  .v-scroll .dummy {
    width: 17px;
  }
  .table-body {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    overflow-anchor: none;
    background-color: lightgray;
  }
  .table-body table {
    clear: both;
    margin: 0 auto;
    border-spacing: 0;
    border-collapse: collapse;
  }
  .table-body tr {
    white-space: nowrap;
    border-bottom: 1px solid black;
  }
  .table-body td {
    display: inline-block;
    padding: 0 3px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .table-body td:last-child {
    border-right: 0;
  }
  .vscroll-spacer {
    opacity: 0;
    clear: both;
  }
  [v-cloak] {
    display: none;
  }
</style>
