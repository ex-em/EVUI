<template>
  <div
    v-cloak
    v-resize.debounce="onResize"
    v-observe-visibility="useVisibleObserve ? {
      callback: onShow,
      once: true,
    } : false"
    :class="getTableClass"
  >
    <div
      v-show="showHeader"
      ref="header"
      class="table-header"
    >
      <ul class="column-list">
        <li
          v-if="useCheckbox.use"
          style="width: 40px;"
          class="column"
        >
          <ev-checkbox
            v-if="isHeaderCheckBox"
            v-model="isHeaderChecked"
            :type="`square`"
            :after-type="`check`"
            @on-click="onCheckAll"
          />
        </li><li
          v-for="(column, index) in orderedColumns"
          v-if="!column.hide"
          :key="index"
          :data-index="index"
          :style="`width: ${column.width}px;`"
          :class="{
            column: true,
            render: isRenderer(column),
          }"
        >
          <span
            v-if="isFiltering &&
            filterList[column.field] &&
            filterList[column.field].find(item => item.use)"
            class="column-filter-status"
          >
            <ev-icon :cls="'ei-filter'"/>
          </span>
          <span
            :title="column.caption"
            class="column-name"
            @click.stop="onSort(column.field)"
          >{{ column.caption }}</span>
          <ev-icon
            v-if="sortField === column.field"
            :cls="`${sortOrder === 'desc' ? 'ei-text-vertical' : 'ei-text-up'} sort-icon`"
          />
          <span
            v-if="isFiltering"
            class="column-filter"
            @click.stop.prevent="onClickFilter(column)"
          >
            <ev-icon :cls="'ei-filter-list set-filter-icon'"/>
          </span>
          <span
            class="column-resize"
            @mousedown.stop.left="onColumnResize(index, $event)"
          />
        </li>
        <li
          :style="`width: ${hasVerticalScrollBar ? scrollWidth : 0}px;`"
          class="column-dummy"
        />
      </ul>
    </div>
    <div
      ref="body"
      :class="{
        'table-body': true,
        stripe: stripeRows
      }"
      @scroll="onScroll"
      @contextmenu="onContextMenu($event)"
    >
      <div
        :style="`height: ${vScrollTopHeight}px;`"
        class="vscroll-spacer"
      />
      <table>
        <tbody>
          <tr
            v-if="!viewStore.length"
            class="dummy"
          >
            <td
              v-if="useCheckbox.use"
              :style="`width: 40px; height: ${rowHeight}px; line-height: ${rowHeight}px`"
            />
            <td
              v-for="(column, cellIndex) in orderedColumns"
              v-show="!column.hide"
              :key="cellIndex"
              :style="`
                width: ${column.width}px; height: ${rowHeight}px; line-height: ${rowHeight}px`"
            />
          </tr>
          <tr
            v-for="(row, rowIndex) in viewStore"
            :key="rowIndex"
            :data-index="rowIndex"
            :class="{
              selected: row[2] === selectedRow,
            }"
            @click="onRowClick($event, row)"
            @dblclick="onRowDblClick($event, row)"
          >
            <td
              v-if="useCheckbox.use"
              :style="`width: 40px; height: ${rowHeight}px;`"
              class="row-checkbox"
            >
              <ev-checkbox
                v-model="row[1]"
                :type="`square`"
                :after-type="`check`"
                @on-click="onCheck($event, row)"
                @click.native.stop=""
              />
            </td>
            <td
              v-for="(column, cellIndex) in orderedColumns"
              v-if="!column.hide"
              :key="cellIndex"
              :data-name="column.field"
              :data-index="column.index"
              :class="{
                [column.type]: column.type,
                [column.align]: column.align,
                render: isRenderer(column),
              }"
              :style="
                `width: ${column.width}px; height: ${rowHeight}px; line-height: ${rowHeight}px`"
            >
              <Renderer
                v-if="isRenderer(column)"
                :name="column.field"
                :item="{
                  row: row[2],
                  rowIndex: row[0],
                  cellIndex: column.index,
                  value: row[2][column.index],
                  props: column.render.props,
                }"
              />
              <span
                v-else
                :title="getConvertValue(column.type, row[2][column.index])"
              >{{ getConvertValue(column.type, row[2][column.index]) }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        :style="`height: ${vScrollBottomHeight}px;`"
        class="vscroll-spacer"
      />
      <ev-context-menu
        v-show="showContextMenu"
        :items="contextMenuItems"
        @click="onClickCtxMenu"
      />
    </div>
    <div
      v-show="showResizeLine"
      ref="resizeLine"
      class="table-resize-line"
    />
    <filter-window
      v-show="showFilterWindow"
      :is-show="showFilterWindow"
      :target-column="currentFilter.column"
      :filter-items="currentFilter.items"
      @apply-filter="onApplyFilter"
      @before-close="onCloseFilterWindow"
    />
  </div>
</template>
<script>
  import resize from 'vue-resize-directive';
  import { ObserveVisibility } from 'vue-observe-visibility';
  import { uniqBy, isEqual } from 'lodash-es';
  import { numberWithComma } from '@/common/utils';
  import FilterWindow from './grid.filter.window';
  import Renderer from './grid.render';

  const ROW_INDEX = 0;
  const ROW_CHECK_INDEX = 1;
  const ROW_DATA_INDEX = 2;

  export default {
    name: 'EvGrid',
    directives: {
      resize,
      ObserveVisibility,
    },
    components: {
      FilterWindow,
      Renderer,
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
      selected: {
        type: Array,
        default: () => [],
      },
      checked: {
        type: Array,
        default: () => [],
      },
      option: {
        type: Object,
        default: () => {},
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
        adjust: this.option.adjust || false,
        stripeRows: this.option.stripeRows || false,
        showHeader: this.option.showHeader === undefined ? true : this.option.showHeader,
        useSelect: this.option.useSelect === undefined ? true : this.option.useSelect,
        useVisibleObserve:
          this.option.useVisibleObserve === undefined ? false : this.option.useVisibleObserve,
        useCheckbox: this.option.useCheckbox || {},
        customContextMenu: this.option.customContextMenu || [],
        useFilter: this.option.useFilter === undefined ? true : this.option.useFilter,
        rowHeight: this.option.rowHeight || 32,
        columnWidth: this.option.columnWidth || 80,
        scrollWidth: this.option.scrollWidth || 16,
        lastScroll: {},
        vScrollTopHeight: 0,
        vScrollBottomHeight: 0,
        hasVerticalScrollBar: false,
        showColumnOption: false,
        showResizeLine: false,
        showFilterWindow: false,
        contextMenuItems: [],
        currentFilter: { column: {}, items: [] },
        sortList: {},
        filterList: {},
        selectedRow: this.selected,
        checkedRows: this.checked,
        prevCheckedRow: [],
        isHeaderChecked: false,
        isClickedCtxMenu: false,
        isFiltering: false,
      };
    },
    computed: {
      getTableClass() {
        return {
          table: true,
          adjust: this.adjust,
          'v-scroll': this.hasVerticalScrollBar,
          'non-header': !this.showHeader,
        };
      },
      isHeaderCheckBox() {
        const option = this.useCheckbox;

        return option.use && option.headerCheck && option.mode !== 'single';
      },
      showContextMenu() {
        return !!(this.contextMenuItems.length && this.isClickedCtxMenu);
      },
    },
    watch: {
      rows(value) {
        this.setStore(value);
      },
      selected(value) {
        this.selectedRow = value;
      },
      checked(value) {
        const store = this.originStore;

        this.checkedRows = value;
        for (let ix = 0; ix < store.length; ix++) {
          store[ix][ROW_CHECK_INDEX] = value.includes(store[ix][ROW_DATA_INDEX]);
        }
      },
      hasVerticalScrollBar() {
        this.onResize();
      },
    },
    created() {
      this.orderedColumns = this.columns.map((column, index) => ({ index, ...column }));
    },
    mounted() {
      this.calculatedColumn();
      this.setStore(this.rows);
      this.$forceUpdate();
    },
    methods: {
      isRenderer(column = {}) {
        return column.render && column.render.use;
      },
      isLastColumn(index) {
        const columns = this.orderedColumns;
        let lastIndex = -1;

        for (let ix = columns.length - 1; ix >= 0; ix--) {
          if (!columns[ix].hide) {
            lastIndex = ix;
            break;
          }
        }

        return lastIndex === index;
      },
      getColumnIndex(field) {
        return this.columns.findIndex(column => column.field === field);
      },
      getConvertValue(type, value) {
        let convertValue;

        if (type === 'number') {
          convertValue = numberWithComma(value);
          convertValue = convertValue === false ? value : convertValue;
        } else if (type === 'float') {
          convertValue = value.toFixed(3);
        } else {
          convertValue = value;
        }

        return convertValue;
      },
      calculatedColumn() {
        let columnWidth = this.columnWidth;
        let remainWidth = 0;
        if (this.adjust) {
          const el = this.$refs.body;
          let elWidth = el.offsetWidth;
          const elHeight = el.offsetHeight;
          const result = this.orderedColumns.reduce((acc, column) => {
            if (column.hide) {
              return acc;
            }

            if (column.width) {
              acc.totalWidth += column.width;
            } else {
              acc.emptyCount++;
            }

            return acc;
          }, { totalWidth: 0, emptyCount: 0 });

          if (this.rowHeight * this.rows.length > elHeight) {
            elWidth -= this.scrollWidth;
          }

          if (this.useCheckbox.use) {
            elWidth -= 40;
          }

          // 1을 빼주는 이유는 돔에서는 소수점까지 너비를 취급하나 offsetWidth 같은 속성값은 반올림되어 저장되어 있음
          columnWidth = elWidth - result.totalWidth - 1;
          if (columnWidth > 0) {
            remainWidth = columnWidth
              - (Math.floor(columnWidth / result.emptyCount) * result.emptyCount);
            columnWidth = Math.floor(columnWidth / result.emptyCount);
          } else {
            columnWidth = this.columnWidth;
          }

          columnWidth = columnWidth < 40 ? 40 : columnWidth;
          this.columnWidth = columnWidth;
        }

        this.orderedColumns.map((column) => {
          const item = column;
          if (!item.width && !item.hide) {
            item.width = columnWidth;
          }
          return item;
        });

        if (remainWidth) {
          this.orderedColumns[this.orderedColumns.length - 1].width += remainWidth;
        }
      },
      setContextMenu(useCustom = true) {
        const menuItems = [];

        if (useCustom && this.customContextMenu.length) {
          const row = this.selectedRow;
          const customItems = this.customContextMenu.map(
            (item) => {
              const menuItem = item;
              if (menuItem.validate) {
                menuItem.disabled = !menuItem.validate(menuItem.itemId, row);
              }

              return menuItem;
            });

          menuItems.push(...customItems);
        }

        if (this.useFilter) {
          menuItems.push({
            text: this.isFiltering ? 'Filter Off' : 'Filter On',
            itemId: 'set_filter',
            callback: () => {
              this.isFiltering = !this.isFiltering;
              this.filteredStore = [];

              this.setStore([], false);
            },
          });
        }

        this.contextMenuItems = menuItems;
      },
      setSort() {
        const index = this.getColumnIndex(this.sortField);
        const desc = (a, b) => (a > b ? -1 : 1);
        const asc = (a, b) => (a < b ? -1 : 1);
        const type = this.columns[index].type || 'string';
        const sortFn = this.sortOrder === 'desc' ? desc : asc;
        const store = this.isFiltering ? this.filteredStore : this.originStore;

        if (type === 'string') {
          store.sort((a, b) => sortFn(a[ROW_DATA_INDEX][index].toLowerCase(),
            b[ROW_DATA_INDEX][index].toLowerCase()));
        } else {
          store.sort((a, b) => sortFn(a[ROW_DATA_INDEX][index],
            b[ROW_DATA_INDEX][index]));
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
        const comparison = condition.comparison;
        const value = condition.value;
        const index = condition.index;
        let result;

        if (comparison === 'Equal') {
          result = item[ROW_DATA_INDEX][index] === value;
        } else if (comparison === 'Not Equal') {
          result = item[ROW_DATA_INDEX][index] !== value;
        } else if (comparison === 'Like') {
          result = this.likeSearch(`%${value}%`, item[ROW_DATA_INDEX][index]);
        } else if (comparison === 'Not Like') {
          result = !this.likeSearch(`%${value}%`, item[ROW_DATA_INDEX][index]);
        }

        return result;
      },
      numberFilter(item, condition) {
        const comparison = condition.comparison;
        const value = condition.value;
        const index = condition.index;
        let result;

        if (comparison === '=') {
          result = item[ROW_DATA_INDEX][index] === value;
        } else if (comparison === '>') {
          result = item[ROW_DATA_INDEX][index] > value;
        } else if (comparison === '<') {
          result = item[ROW_DATA_INDEX][index] < value;
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
        let field;
        let index;
        let filters;
        let columnType;
        let filteredStore = [];
        let isAppliedFilter = false;
        const filterByColumn = this.filterList;
        const fields = Object.keys(filterByColumn || {});
        const store = this.originStore;

        for (let ix = 0; ix < fields.length; ix++) {
          field = fields[ix];
          filters = filterByColumn[field];
          index = this.getColumnIndex(field);
          columnType = this.columns[index].type;
          for (let jx = 0; jx < filters.length; jx++) {
            const filterItem = filters[jx];
            if (filterItem.use) {
              isAppliedFilter = true;
              if (!filteredStore.length) {
                filteredStore = this.getFilteredData(store, columnType, {
                  ...filterItem,
                  index,
                });
              } else if (filterItem.type === 'OR') {
                filteredStore.push(...this.getFilteredData(store, columnType, {
                  ...filterItem,
                  index,
                }));
              } else {
                filteredStore = this.getFilteredData(filteredStore, columnType, {
                  ...filterItem,
                  index,
                });
              }
            }
          }
        }

        if (!isAppliedFilter) {
          this.filteredStore = store;
        } else {
          this.filteredStore = uniqBy(filteredStore, JSON.stringify);
        }
      },
      setStore(value, makeIndex = true) {
        const store = [];
        let checked;
        let selected = false;

        if (makeIndex) {
          let hasUnChecked = false;

          for (let ix = 0; ix < value.length; ix++) {
            checked = this.checked.includes(value[ix]);
            if (!checked) {
              hasUnChecked = true;
            }

            if (!selected && isEqual(this.selectedRow, value[ix])) {
              this.selectedRow = value[ix];
              selected = true;
            }

            store.push([ix, checked, value[ix]]);
          }

          if (!selected) {
            this.selectedRow = [];
          }

          this.isHeaderChecked = value.length > 0 ? !hasUnChecked : false;
          this.originStore = store;
        }

        if (this.isFiltering) {
          this.setFilter();
        }

        if (this.sortField) {
          this.setSort();
        }

        this.updateVScroll();
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
        const store = this.isFiltering ? this.filteredStore : this.originStore;
        const rowCount = el.clientHeight > rowHeight
          ? Math.ceil(el.clientHeight / rowHeight) : store.length;
        const totalScrollHeight = store.length * rowHeight;
        let firstVisibleIndex = Math.floor(el.scrollTop / rowHeight);
        if (firstVisibleIndex > store.length - 1) {
          firstVisibleIndex = 0;
        }

        const lastVisibleIndex = firstVisibleIndex + rowCount;
        const firstIndex = Math.max(firstVisibleIndex - offset, 0);
        const lastIndex = lastVisibleIndex + offset;

        this.hasVerticalScrollBar = rowCount < store.length;
        this.viewStore = store.slice(firstIndex, lastIndex);

        this.vScrollTopHeight = firstIndex * rowHeight;
        this.vScrollBottomHeight = totalScrollHeight - (this.viewStore.length * rowHeight)
          - this.vScrollTopHeight;
      },
      unCheckedRow(row) {
        const index = this.originStore.findIndex(
          item => item[ROW_DATA_INDEX] === row[ROW_DATA_INDEX]);

        if (index !== -1) {
          this.$set(this.originStore[index], ROW_CHECK_INDEX, row[ROW_CHECK_INDEX]);
        }
      },
      onSort(field) {
        if (this.sortField === field) {
          this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        } else {
          this.sortField = field;
          this.sortOrder = 'desc';
        }

        this.setStore(this.originStore, false);
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
      onCloseFilterWindow() {
        this.currentFilter = {
          column: {},
          items: [],
        };
        this.showFilterWindow = false;
      },
      onApplyFilter(columnField, filters) {
        this.$set(this.filterList, columnField, filters);
        this.filteredStore = [];

        this.setStore([], false);
      },
      onClickFilter(column) {
        const filter = {
          column,
          items: [],
        };
        const filterItems = this.filterList[column.field];

        if (filterItems) {
          filter.items = filterItems;
        }

        this.currentFilter = filter;
        this.showFilterWindow = true;
      },
      onClickCtxMenu(item) {
        if (item && item.callback) {
          item.callback(item.itemId, this.selectedRow);
        }

        this.isClickedCtxMenu = false;
      },
      onContextMenu(event) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        let rowIndex;

        if (tagName === 'td') {
          rowIndex = target.parentElement.dataset.index;
        } else {
          rowIndex = target.parentElement.parentElement.dataset.index;
        }

        this.isClickedCtxMenu = true;
        if (rowIndex) {
          const rowData = this.viewStore[+rowIndex][ROW_DATA_INDEX];
          this.selectedRow = rowData;
          this.setContextMenu();
          this.$emit('update:selected', rowData);
        } else {
          this.selectedRow = [];
          this.setContextMenu(false);
          this.$emit('update:selected', []);
        }
      },
      onRowClick(event, row) {
        if (!this.useSelect) {
          return;
        }

        const cellInfo = event.target.dataset;
        const rowData = row[ROW_DATA_INDEX];
        const rowIndex = row[ROW_INDEX];

        this.selectedRow = rowData;
        this.$emit('update:selected', rowData);
        this.$emit('click-row', event, rowIndex, cellInfo.name, cellInfo.index, rowData);
      },
      onRowDblClick(event, row) {
        const cellInfo = event.target.dataset;
        const rowData = row[ROW_DATA_INDEX];
        const rowIndex = row[ROW_INDEX];

        this.$emit('dblclick-row', {
          event,
          rowData,
          rowIndex,
          cellName: cellInfo.name,
          cellIndex: cellInfo.index,
        });
      },
      onCheck(event, row) {
        if (this.useCheckbox.mode === 'single' && this.prevCheckedRow.length) {
          this.prevCheckedRow[1] = false;
          this.unCheckedRow(this.prevCheckedRow);
        }

        if (row[ROW_CHECK_INDEX]) {
          if (this.useCheckbox.mode === 'single') {
            this.checkedRows = [row[ROW_DATA_INDEX]];
          } else {
            this.checkedRows.push(row[ROW_DATA_INDEX]);
          }

          if (this.checkedRows.length === this.originStore.length) {
            this.isHeaderChecked = true;
          }
        } else {
          if (this.isHeaderChecked) {
            this.isHeaderChecked = false;
          }

          if (this.useCheckbox.mode === 'single') {
            this.checkedRows = [];
          } else {
            this.checkedRows.splice(this.checkedRows.indexOf(row[ROW_DATA_INDEX]), 1);
          }
        }

        this.prevCheckedRow = row.slice();
        this.$emit('update:checked', this.checkedRows);
        this.$emit('check-one', event, row[ROW_INDEX], row[ROW_DATA_INDEX]);
      },
      onCheckAll(event) {
        const status = this.isHeaderChecked;
        const checked = [];
        let item;

        for (let ix = 0; ix < this.originStore.length; ix++) {
          item = this.originStore[ix];
          if (status) {
            checked.push(item[ROW_DATA_INDEX]);
          }

          item[ROW_CHECK_INDEX] = status;
        }

        this.checkedRows = checked;
        this.$emit('update:checked', checked);
        this.$emit('check-all', event, checked);
        this.$forceUpdate();
      },
      onResize() {
        if (this.adjust) {
          // return 값을 고려하면 forEach가 맞으나 성능를 고려하여 map을 사용하도록 함
          this.orderedColumns.map((column) => {
            const item = column;

            if (!this.columns[column.index].width && !item.resized) {
              item.width = 0;
            }

            return item;
          }, this);
        }

        this.calculatedColumn();
        this.$forceUpdate();
      },
      onShow(isVisible) {
        if (isVisible) {
          this.onResize();
        }
      },
      onColumnResize(columnIndex, event) {
        if (this.isLastColumn(columnIndex)) {
          return;
        }

        const nextColumnIndex = columnIndex + 1;
        const headerEl = this.$refs.header;
        const headerLeft = headerEl.getBoundingClientRect().left;
        const columnEl = headerEl.querySelector(`li[data-index="${columnIndex}"]`);
        const nextColumnEl = headerEl.querySelector(`li[data-index="${nextColumnIndex}"]`);
        const columnRect = columnEl.getBoundingClientRect();
        const maxRight = nextColumnEl.getBoundingClientRect().right - headerLeft - 40;
        const resizeLineEl = this.$refs.resizeLine;
        const minLeft = columnRect.left - headerLeft + 40;
        const startLeft = columnRect.right - headerLeft;
        const startMouseLeft = event.clientX;
        const startColumnLeft = columnRect.left - headerLeft;

        resizeLineEl.style.left = `${startLeft}px`;

        this.showResizeLine = true;

        const handleMouseMove = (evt) => {
          const deltaLeft = evt.clientX - startMouseLeft;
          const proxyLeft = startLeft + deltaLeft;
          let resizeWidth = Math.max(minLeft, proxyLeft);

          resizeWidth = Math.min(maxRight, resizeWidth);

          resizeLineEl.style.left = `${resizeWidth}px`;
        };

        const handleMouseUp = () => {
          const destLeft = parseInt(resizeLineEl.style.left, 10);
          const changedWidth = destLeft - startColumnLeft;

          if (this.orderedColumns[columnIndex]) {
            const columnWidth = this.orderedColumns[columnIndex].width;
            this.orderedColumns[columnIndex].width = changedWidth;
            this.orderedColumns[columnIndex].resized = true;
            this.orderedColumns[nextColumnIndex].width += (columnWidth - changedWidth);
            this.orderedColumns[nextColumnIndex].resized = true;
          }

          this.showResizeLine = false;
          document.removeEventListener('mousemove', handleMouseMove);
          this.onResize();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp, { once: true });
      },
    },
  };
</script>
<style lang="scss" scoped>
  @import '~@/styles/default';

  $header-height: 33px;

  .table {
    position: relative;
    width: 100%;
    height: 100%;
    padding-top: $header-height;

    &.non-header {
      padding-top: 0;
    }
  }

  .table-header {
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    height: $header-height;

    @include evThemify() {
      border-top: 2px solid evThemed('grid-header-border');
      border-bottom: $border-solid evThemed('grid-bottom-border');
    }
  }

  .column-list {
    position: relative;
    width: 100%;
    height: 100%;
    white-space: nowrap;
    list-style-type: none;

    .column-dummy {
      position: relative;
      display: inline-block;
      width: 0;
      height: 30px;
      padding: 0;
      user-select: none;
    }
  }

  .column {
    position: relative;
    display: inline-flex;
    min-width: 40px;
    height: 100%;
    padding: 0 10px;
    line-height: 30px;
    justify-content: center;
    align-items: center;
    text-align: center;
    vertical-align: top;
    user-select: none;

    @include evThemify() {
      border-right: $border-solid evThemed('grid-bottom-border');
    }

    &:nth-last-child(2) {
      border-right: 0;

      .column-resize {
        cursor: default !important;
      }
    }

    .sort-icon {
      display: inline-block;
      float: right;
      font-size: 14px;
      line-height: 30px;

      @include evThemify() {
        color: evThemed('font-color-base');
      }
    }
  }

  .column-name {
    display: inline-block;
    float: left;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: bold;
    font-size: 14px;

    @include evThemify() {
      color: evThemed('font-color-base');
    }
  }

  .column-filter {
    position: absolute;
    right: 0;
    background-color: transparent;
    display: none;

    .set-filter-icon {
      margin-right: 2px;
      font-size: 14px;
      vertical-align: middle;

      @include evThemify() {
        color: evThemed('font-color-base');
      }
    }
  }

  .column:hover .column-filter {
    display: block;
  }

  .column-filter-status {
    position: absolute;
    top: 3px;
    left: 0;
    background-color: transparent;

    .ei {
      font-size: 10px;
      vertical-align: top;

      @include evThemify() {
        color: evThemed('color-primary');
      }
    }
  }

  .column-resize {
    position: absolute;
    width: 10px;
    height: 100%;
    right: -5px;
    bottom: 0;

    &:hover {
      cursor: col-resize;
    }
  }

  .v-scroll .dummy {
    width: 16px;
  }

  .table-body {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: auto;
    overflow-anchor: none;

    @include evThemify() {
      border-bottom: $border-solid evThemed('grid-bottom-border');
    }

    table {
      clear: both;
      border-spacing: 0;
      border-collapse: collapse;
    }

    &.stripe tr:nth-child(even) {
      @include evThemify() {
        background-color: evThemed('grid-row-stripe');
      }
    }

    tr {
      white-space: nowrap;

      @include evThemify() {
        border-bottom: $border-solid evThemed('grid-bottom-border');
      }

      /* stylelint-disable */
      &.selected {
        @include evThemify() {
          background-color: evThemed('grid-row-selected') !important;
        }
      }

      &.dummy {
        border-bottom: none;
        background: transparent;
      }
      /* stylelint-enable */
    }

    td {
      display: inline-block;
      padding: 0 10px;
      text-align: center;

      @include truncate(100%);
      @include evThemify() {
        color: evThemed('grid-cell-text');
        border-right: $border-solid evThemed('grid-bottom-border');
      }

      &.row-checkbox {
        display: inline-flex;
        justify-content: center;
        align-items: center;
      }
      &.render {
        overflow: initial;
      }

      &.number,
      &.float {
        text-align: right;
      }

      &.string,
      &.stringnumber {
        text-align: left;
      }

      &.center {
        text-align: center;
      }
      &.left {
        text-align: left;
        .wrap {
          justify-content: flex-start;
        }
      }
      &.right {
        text-align: right;
        .wrap {
          justify-content: flex-end;
        }
      }

      &:last-child {
        border-right: 0;
      }
    }

    tr.dummy td {
      border-right: 0;
    }
  }

  .table-resize-line {
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;

    @include evThemify() {
      border-right: $border-solid evThemed('grid-bottom-border');
    }
  }

  .vscroll-spacer {
    opacity: 0;
    clear: both;
  }

  [v-cloak] {
    display: none;
  }
</style>
