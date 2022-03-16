<template>
  <div>
    <div
      v-if="$slots.toolbar"
      class="toolbar-wrapper"
      :style="`width: ${gridWidth};`"
    >
      <!-- Toolbar -->
      <toolbar>
        <template #toolbarWrapper>
          <slot
            name="toolbar"
            :item="{ onSearch: onSearch }"
          />
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
      <!-- Table -->
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
        <!-- Header -->
        <div
          v-show="showHeader"
          ref="header"
          :class="{
            'table-header': true,
            'non-border': !!borderStyle,
          }"
        >
          <ul class="column-list">
            <!-- Header Checkbox -->
            <li
              v-if="useCheckbox.use"
              :class="{
                'column': true,
                'non-border': !!borderStyle,
              }"
              :style="`width: ${minWidth}px;`"
            >
              <ev-checkbox
                v-if="useCheckbox.use && useCheckbox.headerCheck && useCheckbox.mode !== 'single'"
                v-model="isHeaderChecked"
                @change="onCheckAll"
              />
            </li>
            <!-- Column List -->
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
                :style="{
                  width: `${column.width}px`,
                  'min-width': `${isRenderer(column) ? rendererMinWidth : minWidth}px`,
                }"
              >
                <!-- Filter Status -->
                <span
                  v-if="isFiltering && filterList[column.field]?.find(item => item.use)"
                  class="column-filter-status"
                >
                  <ev-icon icon="ev-icon-filter"/>
                </span>
                <!-- Column Name -->
                <span
                  :title="column.caption"
                  class="column-name"
                  @click.stop="onSort(column)"
                >
                  {{ column.caption }}
                </span>
                <!-- Sort Icon -->
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
                <!-- Filter Button -->
                <span
                  v-if="isFilterButton(column.field)"
                  class="column-filter"
                  @click.capture="onClickFilter(column)"
                >
                  <ev-icon icon="ev-icon-hamburger2"/>
                </span>
                <!-- Column Resize -->
                <span
                  class="column-resize"
                  @mousedown.stop.left="onColumnResize(index, $event)"
                />
              </li>
            </template>
          </ul>
        </div>
        <!-- Body -->
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
          <!-- vScroll Top -->
          <div
            :style="`height: ${vScrollTopHeight}px;`"
            class="vscroll-spacer"
          />
          <table>
            <tbody>
              <!-- Row List -->
              <tr
                v-for="(row, rowIndex) in viewStore"
                :key="rowIndex"
                :data-index="row[0]"
                :class="{
                  row: true,
                  selected: row[2] === selectedRow,
                  'non-border': !!borderStyle && borderStyle !== 'rows',
                  highlight: row[0] === highlightIdx,
                }"
                @click="onRowClick($event, row)"
                @dblclick="onRowDblClick($event, row)"
              >
                <!-- Row Checkbox -->
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
                <!-- Cell -->
                <template
                  v-for="(column, cellIndex) in orderedColumns"
                  :key="cellIndex"
                >
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
                    :style="{
                      width: `${column.width}px`,
                      height: `${rowHeight}px`,
                      'line-height': `${rowHeight}px`,
                      'min-width': `${isRenderer(column) ? rendererMinWidth : minWidth}px`,
                    }"
                  >
                    <!-- Cell Renderer -->
                    <template v-if="!!$slots[column.field]">
                      <slot
                        :name="column.field"
                        :item="{ row, column }"
                      />
                    </template>
                    <!-- Cell Value -->
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
          <!-- vScroll Bottom -->
          <div
            :style="`height: ${vScrollBottomHeight}px;`"
            class="vscroll-spacer"
          />
          <!-- Context Menu -->
          <ev-context-menu
            ref="menu"
            :items="contextMenuItems"
          />
        </div>
        <!-- Resize Line -->
        <div
          v-show="showResizeLine"
          ref="resizeLine"
          class="table-resize-line"
        />
        <!-- Filter Window -->
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
    <pagination
      v-if="usePage && !isInfinite"
      v-model="currentPage"
      :total="store.length"
      :per-page="perPage"
      :visible-page="visiblePage"
      :show-page-info="showPageInfo"
      :order="order"
    >
    </pagination>
  </div>
</template>

<script>
import { reactive, toRefs, computed, watch, onMounted, onActivated, nextTick } from 'vue';
import Toolbar from './grid.toolbar';
import Pagination from './grid.pagination';
import FilterWindow from './grid.filter.window';
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
  pagingEvent,
} from './uses';

export default {
  name: 'EvGrid',
  components: {
    Toolbar,
    Pagination,
    FilterWindow,
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
    'page-change': null,
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
      setFiltering: false,
      showFilterWindow: false,
      currentFilter: {
        column: {},
        items: [],
      },
      isSearch: false,
      searchWord: '',
    });
    const stores = reactive({
      viewStore: [],
      originStore: [],
      filterStore: [],
      pagingStore: [],
      store: computed(() => {
        const store = filterInfo.isFiltering ? stores.filterStore : stores.originStore;
        return filterInfo.isSearch ? stores.searchStore : store;
      }),
      orderedColumns: computed(() =>
        (props.columns.map((column, index) => ({ index, ...column })))),
    });
    const pageInfo = reactive({
      usePage: computed(() => (props.option.page?.use || false)),
      useClient: props.option.page?.useClient || false,
      isInfinite: computed(() => (props.option.page?.isInfinite || false)),
      startIndex: 0,
      prevPage: 0,
      currentPage: 0,
      total: computed(() => (props.option.page?.total || 0)),
      perPage: computed(() => (props.option.page?.perPage || 20)),
      visiblePage: computed(() => (props.option.page?.visiblePage || 8)),
      order: computed(() => (props.option.page?.order || 'center')),
      showPageInfo: computed(() => (props.option.page?.showPageInfo || false)),
      isClientPaging: computed(() =>
        pageInfo.useClient && pageInfo.usePage && !pageInfo.isInfinite),
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
      getPagingData,
      updatePagingInfo,
      changePage,
    } = pagingEvent({
      stores,
      pageInfo,
      sortInfo,
      filterInfo,
      elementInfo,
    });

    const {
      updateVScroll,
      updateHScroll,
      onScroll,
    } = scrollEvent({
      scrollInfo,
      stores,
      elementInfo,
      resizeInfo,
      pageInfo,
      getPagingData,
      updatePagingInfo,
    });

    const {
      onRowClick,
      onRowDblClick,
    } = clickEvent(selectInfo);

    const {
      onCheck,
      onCheckAll,
    } = checkEvent({ checkInfo, stores, pageInfo, getPagingData, updatePagingInfo });

    const {
      onSort,
      setSort,
    } = sortEvent({ sortInfo, stores, getColumnIndex, updatePagingInfo });

    const {
      onClickFilter,
      onCloseFilterWindow,
      onApplyFilter,
      setFilter,
      onSearch,
    } = filterEvent({
      filterInfo,
      stores,
      checkInfo,
      pageInfo,
      getColumnIndex,
      getConvertValue,
      updateVScroll,
      getPagingData,
      updatePagingInfo,
    });

    const {
      setStore,
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
    } = resizeEvent({
      resizeInfo,
      elementInfo,
      checkInfo,
      stores,
      filterInfo,
      isRenderer,
      updateVScroll,
    });

    const {
      setContextMenu,
      onContextMenu,
    } = contextMenuEvent({ contextInfo, stores, filterInfo, selectInfo, setStore });

    onMounted(() => {
      calculatedColumn();
      setStore(props.rows);
    });
    onActivated(() => {
      onResize();
    });
    const ROW_INDEX = 0;
    const ROW_CHECK_INDEX = 1;
    const ROW_DATA_INDEX = 2;
    const clearCheckInfo = () => {
      checkInfo.checkedRows = [];
      checkInfo.checkedIndex.clear();
      checkInfo.isHeaderChecked = false;
      stores.store.forEach((row) => {
        row[ROW_CHECK_INDEX] = false;
      });
    };
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
        if (filterInfo.isSearch) {
          onSearch(filterInfo.searchWord);
        }
      }, { deep: true },
    );
    watch(
      () => props.checked,
      (checkedList) => {
        checkInfo.checkedRows = checkedList;
        checkInfo.isHeaderChecked = false;
        checkInfo.checkedIndex.clear();
        let store = stores.store;
        if (pageInfo.isClientPaging) {
          store = getPagingData();
        }
        if (store.length) {
          store.forEach((row) => {
            row[ROW_CHECK_INDEX] = checkedList.includes(row[ROW_DATA_INDEX]);
            if (row[ROW_CHECK_INDEX]) {
              checkInfo.checkedIndex.add(row[ROW_INDEX]);
            }
          });
          checkInfo.isHeaderChecked = checkedList.length === store.length;
        }
        updateVScroll();
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
        clearCheckInfo();
      },
    );
    watch(
      () => props.checked.length,
      (checkedSize) => {
        if (!checkedSize) {
          clearCheckInfo();
        }
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
    watch(
      () => props.option.searchValue,
      (value) => {
        if (value !== undefined) {
          onSearch(value?.value ?? value);
          if (pageInfo.isClientPaging) {
            clearCheckInfo();
          }
        }
      }, { immediate: true },
    );
    const isFilterButton = field => filterInfo.isFiltering
      && field !== 'db-icon'
      && field !== 'user-icon';
    watch(
      () => props.option.page?.currentPage,
      (value) => {
        const current = value <= 0 ? 1 : value;
        pageInfo.currentPage = !props.option.page?.isInfinite ? current : 1;
      }, { immediate: true },
    );
    watch(
      () => [pageInfo.currentPage, pageInfo.perPage],
      (currentVal, beforeVal) => {
        nextTick(() => {
          changePage(beforeVal[0]);
          if (pageInfo.isClientPaging && currentVal[0] !== beforeVal[0]) {
            clearCheckInfo();
          }
          updateVScroll();
        });
      },
    );
    return {
      showHeader,
      stripeStyle,
      borderStyle,
      highlightIdx,
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(filterInfo),
      ...toRefs(scrollInfo),
      ...toRefs(pageInfo),
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
