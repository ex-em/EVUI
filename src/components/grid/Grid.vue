<template>
  <div
    v-if="!!$slots.toolbar"
    class="toolbar-wrapper"
    :style="`width: ${gridWidth};`"
  >
    <!-- Toolbar -->
    <toolbar v-if="!!$slots.toolbar" >
      <template #toolbarWrapper>
        <slot
          name="toolbar"
          :item="{ onSearch: onSearch }"
        >
        </slot>
      </template>
    </toolbar>
  </div>
  <div
    ref="grid-wrapper"
    v-resize="onResize"
    v-observe-visibility="{
      callback: onShow,
      once: true,
    }"
    v-bind="$attrs"
    class="grid-wrapper"
    :style="`width: ${gridWidth}; height: ${gridHeight};`"
  >
    <!--Table-->
    <div
      v-cloak
      ref="grid"
      :class="{
        'ev-grid': true,
        table: true,
        adjust: adjust,
        'non-header': !showHeader,
      }"
    >
      <!--Header-->
      <div
        v-show="showHeader"
        ref="header"
        :class="{
          'table-header': true,
          'non-border': !!borderStyle,
        }"
      >
        <ul class="column-list">
          <!--Header Checkbox-->
          <li
            v-if="useCheckbox.use"
            :class="{
              'column': true,
              'non-border': !!borderStyle,
            }"
            :style="`width: ${minWidth}px;`"
          >
            <ev-checkbox
              v-if="useCheckbox.use
                && useCheckbox.headerCheck
                && useCheckbox.mode !== 'single'"
              v-model="isHeaderChecked"
              @change="onCheckAll"
            />
          </li>
          <!--Column List-->
          <template
            v-for="(column, index) in orderedColumns"
            :key="index"
          >
            <li
              v-if="!column.hide"
              :data-index="index"
              :class="{
                column: true,
                render: isRenderer(column),
                'non-border': !!borderStyle,
                [column.field]: column.field,
              }"
              :style="`
                width: ${column.width}px;
                min-width: ${isRenderer(column) ? rendererMinWidth : minWidth}px;`"
            >
              <!--Filter Status-->
              <span
                v-if="isFiltering && filterList[column.field]?.find(item => item.use)"
                class="column-filter-status"
              >
                <ev-icon icon="ev-icon-filter"/>
              </span>
              <!--Column Name-->
              <span
                :title="column.caption"
                class="column-name"
                @click.stop="onSort(column)"
              >
                {{ column.caption }}
              </span>
              <!--Sort Icon-->
              <template v-if="sortField === column.field">
                <ev-icon
                  v-if="sortOrder === 'desc'"
                  icon="ev-icon-triangle-down"
                />
                <ev-icon
                  v-if="sortOrder === 'asc'"
                  icon="ev-icon-triangle-up"
                />
              </template>
              <!--Filter Button-->
              <span
                v-if="isFilterButton(column.field)"
                class="column-filter"
                @click.capture="onClickFilter(column)"
              >
                <ev-icon icon="ev-icon-hamburger2"/>
              </span>
              <!--Column Resize-->
              <span
                class="column-resize"
                @mousedown.stop.left="onColumnResize(index, $event)"
              />
            </li>
          </template>
        </ul>
      </div>
      <!--Body-->
      <div
        ref="body"
        :class="{
          'table-body': true,
          'bottom-border': !!viewStore.length,
          stripe: stripeStyle,
          'non-border': !!borderStyle,
        }"
        @scroll="onScroll"
        @contextmenu="onContextMenu($event)"
        @contextmenu.prevent="menu.show"
      >
        <!--vScroll Top-->
        <div
          :style="`height: ${vScrollTopHeight}px;`"
          class="vscroll-spacer"
        />
        <table>
          <tbody>
          <!--Row List-->
          <tr
            v-for="(row, rowIndex) in viewStore"
            :key="rowIndex"
            :data-index="rowIndex"
            :class="{
              row: true,
              selected: row[2] === selectedRow,
              'non-border': !!borderStyle && borderStyle !== 'rows',
              highlight: row[0] === highlightIdx,
            }"
            @click="onRowClick($event, row)"
            @dblclick="onRowDblClick($event, row)"
          >
            <!--Row Checkbox-->
            <td
              v-if="useCheckbox.use"
              :class="{
                cell: true,
                'row-checkbox': true,
                'non-border': !!borderStyle,
              }"
              :style="`width: ${minWidth}px; height: ${rowHeight}px;`"
            >
              <ev-checkbox
                v-model="row[1]"
                class="row-checkbox-input"
                @change="onCheck($event, row)"
              />
            </td>
            <!--Cell-->
            <template v-for="(column, cellIndex) in orderedColumns" :key="cellIndex">
              <td
                v-if="!column.hide"
                :data-name="column.field"
                :data-index="column.index"
                :class="{
                  cell: true,
                  [column.type]: column.type,
                  [column.align]: column.align,
                  render: isRenderer(column),
                  'non-border': !!borderStyle,
                  [column.field]: column.field,
                }"
                :style="`
                  width: ${column.width}px;
                  height: ${rowHeight}px;
                  line-height: ${rowHeight}px;
                  min-width: ${isRenderer(column) ? rendererMinWidth : minWidth}px;`"
              >
                <!-- cell renderer -->
                <template v-if="!!$slots[column.field]">
                  <slot
                    :name="column.field"
                    :item="{
                      row,
                      column,
                    }"
                  >
                  </slot>
                </template>
                <!-- cell value -->
                <template v-else>
                  <div :title="getConvertValue(column.type, row[2][column.index])">
                    {{ getConvertValue(column.type, row[2][column.index]) }}
                  </div>
                </template>
              </td>
            </template>
          </tr>
          <tr v-if="!viewStore.length">
            <td class="is-empty">No records</td>
          </tr>
          </tbody>
        </table>
        <!--vScroll Bottom-->
        <div
          :style="`height: ${vScrollBottomHeight}px;`"
          class="vscroll-spacer"
        />
        <!--Context Menu-->
        <ev-context-menu
          ref="menu"
          :items="contextMenuItems"
        />
      </div>
      <!--Resize Line-->
      <div
        v-show="showResizeLine"
        ref="resizeLine"
        class="table-resize-line"
      />
      <!--Filter Window-->
      <filter-window
        v-show="showFilterWindow"
        :is-show="showFilterWindow"
        :target-column="currentFilter.column"
        :filter-items="currentFilter.items"
        @apply-filter="onApplyFilter"
        @before-close="onCloseFilterWindow"
      />
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed, watch, onActivated, onMounted } from 'vue';
import FilterWindow from './grid.filter.window';
import Toolbar from './grid.toolbar';
import {
  commonFunctions,
  scrollEvent,
  resizeEvent,
  clickEvent,
  checkEvent,
  sortEvent,
  filterEvent,
  contextMenuEvent,
  storeEvent,
} from './uses';

export default {
  name: 'EvGrid',
  components: {
    FilterWindow,
    Toolbar,
  },
  props: {
    columns: {
      type: [Array],
      default: () => [],
    },
    rows: {
      type: [Array],
      default: () => [],
    },
    width: {
      type: [String, Number],
      default: '100%',
    },
    height: {
      type: [String, Number],
      default: '100%',
    },
    selected: {
      type: [Array],
      default: () => [],
    },
    checked: {
      type: [Array],
      default: () => [],
    },
    option: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: {
    'update:selected': null,
    'click-row': null,
    'dblclick-row': null,
    'update:checked': null,
    'check-row': null,
    'check-all': null,
  },
  setup(props) {
    const {
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
    } = commonFunctions();
    const showHeader = computed(() =>
      (props.option.showHeader === undefined ? true : props.option.showHeader));
    const stripeStyle = computed(() => (props.option.style?.stripe || false));
    const borderStyle = computed(() => (props.option.style?.border || ''));
    const highlightIdx = computed(() => (props.option.style?.highlight || -1));
    const rowMinHeight = props.option.rowMinHeight || 35;
    const elementInfo = reactive({
      body: null,
      header: null,
      resizeLine: null,
      'grid-wrapper': null,
    });
    const filterInfo = reactive({
      filterList: {},
      isFiltering: computed(() =>
        (props.option.useFilter === undefined ? true : props.option.useFilter)),
      isSearch: false,
      setFiltering: false,
      showFilterWindow: false,
      currentFilter: {
        column: {},
        items: [],
      },
    });
    const stores = reactive({
      viewStore: [],
      originStore: [],
      filterStore: [],
      store: computed(() => {
        let store;
        if (filterInfo.isFiltering) {
          store = stores.filterStore;
        } else {
          store = stores.originStore;
        }
        return filterInfo.isSearch ? stores.searchStore : store;
      }),
      orderedColumns: computed(() =>
        (props.columns.map((column, index) => ({ index, ...column })))),
    });
    const checkInfo = reactive({
      prevCheckedRow: [],
      isHeaderChecked: false,
      checkedRows: props.checked,
      checkedIndex: new Set(),
      useCheckbox: computed(() => (props.option.useCheckbox || {})),
    });
    const scrollInfo = reactive({
      lastScroll: {
        top: 0,
        left: 0,
      },
      vScrollTopHeight: 0,
      vScrollBottomHeight: 0,
      hasVerticalScrollBar: false,
    });
    const selectInfo = reactive({
      useSelect: props.option.useSelect === undefined ? true : props.option.useSelect,
      selectedRow: props.selected,
    });
    const sortInfo = reactive({
      isSorting: false,
      sortField: '',
      sortOrder: 'desc',
    });
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      customContextMenu: props.option.customContextMenu || [],
    });
    const resizeInfo = reactive({
      minWidth: 40,
      rendererMinWidth: 80,
      iconWidth: 42,
      showResizeLine: false,
      adjust: computed(() => (props.option.adjust || false)),
      columnWidth: props.option.columnWidth || 80,
      scrollWidth: props.option.scrollWidth || 17,
      rowHeight: computed(() =>
        (props.option.rowHeight > rowMinHeight ? props.option.rowHeight : rowMinHeight)),
      gridWidth: computed(() => (props.width ? setPixelUnit(props.width) : '100%')),
      gridHeight: computed(() => (props.height ? setPixelUnit(props.height) : '100%')),
    });

    const {
      updateVScroll,
      updateHScroll,
      onScroll,
    } = scrollEvent({ scrollInfo, stores, elementInfo, resizeInfo });

    const {
      onRowClick,
      onRowDblClick,
    } = clickEvent(selectInfo);

    const {
      onCheck,
      onCheckAll,
    } = checkEvent({ checkInfo, stores, filterInfo });

    const {
      onSort,
      setSort,
    } = sortEvent({ sortInfo, stores, getColumnIndex });

    const {
      onClickFilter,
      onCloseFilterWindow,
      onApplyFilter,
      setFilter,
    } = filterEvent({ filterInfo, stores, getColumnIndex });

    const {
      setStore,
      updateData,
    } = storeEvent({
      selectInfo,
      checkInfo,
      stores,
      sortInfo,
      filterInfo,
      elementInfo,
      setSort,
      setFilter,
      updateVScroll,
    });

    const {
      calculatedColumn,
      onResize,
      onShow,
      onColumnResize,
    } = resizeEvent({ resizeInfo, elementInfo, checkInfo, stores, isRenderer, updateVScroll });

    const {
      setContextMenu,
      onContextMenu,
    } = contextMenuEvent({ contextInfo, stores, filterInfo, selectInfo, setStore });

    onMounted(() => {
      calculatedColumn();
      setStore(props.rows);
    });
    onActivated(() => {
      updateVScroll();
    });
    const ROW_INDEX = 0;
    const ROW_CHECK_INDEX = 1;
    const ROW_DATA_INDEX = 2;
    watch(
      () => props.columns,
      () => {
        sortInfo.isSorting = false;
        sortInfo.sortField = '';
        setSort();
      }, { deep: true },
    );
    watch(
      () => sortInfo.isSorting,
      (value) => {
        if (value) {
          setStore(stores.originStore, false);
          sortInfo.isSorting = !value;
        }
      },
    );
    watch(
      () => filterInfo.setFiltering,
      (value) => {
        if (value) {
          setStore([], false);
          filterInfo.setFiltering = !value;
        }
      },
    );
    watch(
      () => props.rows,
      (value) => {
        setStore(value);
      },
    );
    watch(
      () => props.checked,
      (value) => {
        checkInfo.checkedRows = value;
        checkInfo.isHeaderChecked = false;
        let store = stores.originStore;
        if (filterInfo.isSearch && stores.searchStore) {
          store = stores.searchStore;
        }
        store.forEach((row) => {
          row[ROW_CHECK_INDEX] = checkInfo.checkedRows.includes(row[ROW_DATA_INDEX]);
        });
        if (checkInfo.checkedRows.length
          && store.length === checkInfo.checkedRows.length) {
          checkInfo.isHeaderChecked = true;
        }
      },
    );
    watch(
      () => props.selected,
      (value) => {
        selectInfo.selectedRow = value;
      },
    );
    watch(
      () => checkInfo.useCheckbox.mode,
      () => {
        checkInfo.checkedRows = [];
        checkInfo.isHeaderChecked = false;
      },
    );
    watch(
      () => [resizeInfo.adjust, props.option.columnWidth, resizeInfo.gridWidth],
      () => {
        resizeInfo.columnWidth = props.option.columnWidth;
        const gridWrapper = elementInfo['grid-wrapper'];
        gridWrapper.style.width = resizeInfo.gridWidth;
        gridWrapper.style.height = resizeInfo.gridHeight;
        stores.orderedColumns.map((column) => {
          const item = column;

          if (!props.columns[column.index].width && !item.resized) {
            item.width = 0;
          }

          return item;
        });
        onResize();
      },
    );
    watch(
      () => filterInfo.isFiltering,
      () => {
        stores.filterStore = [];
        setStore([], false);
      },
    );
    let timer = null;
    const onSearch = (searchWord) => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        filterInfo.isSearch = false;
        if (searchWord) {
          const filterStores = stores.store.filter((row) => {
            let isShow = false;
            for (let ix = 0; ix < stores.orderedColumns.length; ix++) {
              const column = stores.orderedColumns[ix] || {};
              let columnValue = row[ROW_DATA_INDEX][ix];
              let columnType = column.type;
              if (columnValue) {
                if (typeof columnValue === 'object') {
                  columnValue = columnValue[column.field];
                }
                if (!column.hide && (column?.searchable === undefined || column?.searchable)) {
                  if (!columnType) {
                    columnType = 'string';
                  }
                  columnValue = getConvertValue(columnType, columnValue).toString();
                  isShow = columnValue.toLowerCase().includes(searchWord.toString().toLowerCase());
                  if (isShow) {
                    break;
                  }
                }
              }
            }
            return isShow;
          });
          filterInfo.isSearch = true;
          stores.searchStore = JSON.parse(JSON.stringify(filterStores));
        } else {
          filterInfo.isSearch = false;
        }
        let store = stores.originStore;
        let checkSize = checkInfo.checkedRows.length;
        for (let ix = 0; ix < store.length; ix++) {
          if (checkInfo.checkedIndex.has(store[ix][ROW_INDEX])) {
            store[ix][ROW_CHECK_INDEX] = true;
          } else {
            store[ix][ROW_CHECK_INDEX] = false;
          }
        }
        if (filterInfo.isSearch && stores.searchStore) {
          store = stores.searchStore;
          checkSize = checkInfo.checkedIndex.size;
        }
        if (store.length && checkSize >= store.length) {
          checkInfo.isHeaderChecked = true;
        } else {
          checkInfo.isHeaderChecked = false;
        }
        setStore([], false);
      }, 500);
    };
    const isFilterButton = field => filterInfo.isFiltering && field !== 'db-icon' && field !== 'user-icon';
    return {
      showHeader,
      stripeStyle,
      borderStyle,
      highlightIdx,
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(filterInfo),
      ...toRefs(scrollInfo),
      ...toRefs(resizeInfo),
      ...toRefs(selectInfo),
      ...toRefs(checkInfo),
      ...toRefs(sortInfo),
      ...toRefs(contextInfo),
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
      updateVScroll,
      updateHScroll,
      onScroll,
      calculatedColumn,
      onResize,
      onShow,
      onColumnResize,
      onRowClick,
      onRowDblClick,
      onCheck,
      onCheckAll,
      onSort,
      setSort,
      onClickFilter,
      onCloseFilterWindow,
      onApplyFilter,
      setFilter,
      setStore,
      updateData,
      setContextMenu,
      onContextMenu,
      onSearch,
      isFilterButton,
    };
  },
};
</script>

<style lang="scss" scoped>
  @import 'style/grid.scss';
  .postgresql {
    background: url('../../../docs/assets/images/icon_postgresql.svg') no-repeat center center;
  }

  .oracle {
    background: url('../../../docs/assets/images/icon_oracle.svg') no-repeat center center;
  }

  .mongodb {
    background: url('../../../docs/assets/images/icon_mongodb.svg') no-repeat center center;
  }

  .mysql {
    background: url('../../../docs/assets/images/icon_mysql.svg') no-repeat center center;
  }
</style>
