<template>
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
        'ev-grid--empty': !viewStore.length,
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
                'margin-right': (orderedColumns.length - 1 === index
                && hasVerticalScrollBar && hasHorizontalScrollBar) ? `${scrollWidth}px` : '0px',
              }"
            >
              <!-- Column Name -->
              <span
                :title="column.caption"
                class="column-name"
              >
                {{ column.caption }}
                <!-- Sort Icon -->
                <span @click.stop="onSort(column)">
                  <span
                    class="icon-sort icon-sort--basic"
                  />
                  <template v-if="sortField === column.field">
                    <span
                      :class="[
                        'icon-sort',
                        { 'icon-sort--desc': sortOrder === 'desc' },
                        { 'icon-sort--asc': sortOrder === 'asc' },
                      ]"
                    />
                  </template>
                </span>
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
        <table ref="table">
          <tbody>
            <!-- Row List -->
            <tr
              v-for="(row, rowIndex) in viewStore"
              :key="rowIndex"
              :data-index="row[0]"
              :class="{
                row: true,
                selected: row[3],
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
                  <div v-if="!!$slots[column.field]">
                    <slot
                      :name="column.field"
                      :item="{ row, column }"
                    />
                  </div>
                  <!-- Cell Value -->
                  <template v-else>
                    <div :title="getConvertValue(column, row[2][column.index])">
                      {{ getConvertValue(column, row[2][column.index]) }}
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
    </div>
  </div>
  <!-- Summary -->
  <grid-summary
    v-if="useSummary"
    :ordered-columns="orderedColumns"
    :stores="stores"
    :use-checkbox="useCheckbox.use"
    :style-option="{
      borderStyle,
      minWidth,
      rowHeight,
    }"
    :scroll-left="summaryScroll"
  />
  <!-- Pagination -->
  <grid-pagination
    v-if="usePage && !isInfinite"
    v-model="currentPage"
    :total="pageTotal"
    :per-page="perPage"
    :visible-page="visiblePage"
    :show-page-info="showPageInfo"
    :order="order"
  />
</template>

<script>
import { reactive, toRefs, computed, watch, onMounted, onActivated, nextTick, ref } from 'vue';
import Toolbar from './grid.toolbar';
import GridPagination from './grid.pagination';
import GridSummary from './grid.summary';
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
    GridPagination,
    GridSummary,
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
    // const ROW_INDEX = 0;
    const ROW_CHECK_INDEX = 1;
    const ROW_DATA_INDEX = 2;
    const ROW_SELECT_INDEX = 3;
    const {
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
    } = commonFunctions();
    const showHeader = computed(() => (props.option.showHeader ?? true));
    const useSummary = computed(() => (props.option?.useSummary || false));
    const stripeStyle = computed(() => (props.option.style?.stripe || false));
    const borderStyle = computed(() => (props.option.style?.border || ''));
    const highlightIdx = computed(() => (props.option.style?.highlight ?? -1));
    const rowMinHeight = props.option.rowMinHeight || 35;
    const elementInfo = reactive({
      body: null,
      header: null,
      table: null,
      resizeLine: null,
      'grid-wrapper': null,
    });
    const filterInfo = reactive({
      isSearch: false,
      searchWord: '',
    });
    const stores = reactive({
      viewStore: [],
      originStore: [],
      pagingStore: [],
      store: computed(() => (filterInfo.isSearch ? stores.searchStore : stores.originStore)),
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
      pageTotal: computed(() =>
        (props.option.page?.useClient ? stores.store.length : props.option.page?.total)),
      perPage: computed(() => (props.option.page?.perPage || 20)),
      visiblePage: computed(() => (props.option.page?.visiblePage || 8)),
      order: computed(() => (props.option.page?.order || 'center')),
      showPageInfo: computed(() => (props.option.page?.showPageInfo || false)),
      isClientPaging: computed(() =>
        pageInfo.useClient && pageInfo.usePage && !pageInfo.isInfinite),
      isHighlight: false,
      highlightPage: 0,
    });
    const checkInfo = reactive({
      prevCheckedRow: [],
      isHeaderChecked: false,
      checkedRows: props.checked,
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
      hasHorizontalScrollBar: false,
    });
    const selectInfo = reactive({
      selectedRow: props.selected,
      useSelect: computed(() => props.option?.useSelection?.use ?? true),
      limitCount: computed(() => {
        let limit = props.option?.useSelection?.limitCount;
        limit = !!limit && limit >= 2 ? limit : 0;
        return limit;
      }),
      multiple: computed(() => props.option?.useSelection?.multiple ?? false),
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
      minWidth: 60,
      rendererMinWidth: 80,
      iconWidth: 42,
      showResizeLine: false,
      adjust: props.option.adjust || false,
      columnWidth: props.option.columnWidth || 80,
      scrollWidth: props.option.scrollWidth || 17,
      rowHeight: computed(() =>
        (props.option.rowHeight > rowMinHeight ? props.option.rowHeight : rowMinHeight)),
      gridWidth: computed(() => (props.width ? setPixelUnit(props.width) : '100%')),
      gridHeight: computed(() => (props.height ? setPixelUnit(props.height) : '100%')),
    });
    const clearCheckInfo = () => {
      checkInfo.checkedRows = [];
      checkInfo.isHeaderChecked = false;
      stores.store.forEach((row) => {
        row[ROW_CHECK_INDEX] = false;
      });
    };
    const clearSelectInfo = () => {
      selectInfo.selectedRow = [];
      stores.store.forEach((row) => {
        row[ROW_SELECT_INDEX] = false;
      });
    };
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
      clearCheckInfo,
    });
    const summaryScroll = ref(0);
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
      summaryScroll,
      getPagingData,
      updatePagingInfo,
    });

    const {
      onRowClick,
      onRowDblClick,
    } = clickEvent({ selectInfo });

    const {
      onCheck,
      onCheckAll,
    } = checkEvent({ checkInfo, stores, pageInfo, getPagingData, updatePagingInfo });

    const {
      onSort,
      setSort,
    } = sortEvent({ sortInfo, stores, getColumnIndex, updatePagingInfo });

    const {
      onSearch,
    } = filterEvent({
      filterInfo,
      stores,
      checkInfo,
      pageInfo,
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
      elementInfo,
      setSort,
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
      updateHScroll,
    });

    const {
      setContextMenu,
      onContextMenu,
    } = contextMenuEvent({
      contextInfo,
      stores,
      selectInfo,
    });

    onMounted(() => {
      calculatedColumn();
      setStore(props.rows);
    });
    onActivated(() => {
      onResize();
    });
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
          if (pageInfo.isClientPaging) {
            pageInfo.currentPage = 1;
            stores.pagingStore = getPagingData();
            clearCheckInfo();
          }
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
        onResize();
      }, { deep: true },
    );
    watch(
      () => props.checked,
      (value) => {
        checkInfo.checkedRows = value;
      },
    );
    watch(
      () => checkInfo.checkedRows,
      (value) => {
        checkInfo.isHeaderChecked = false;
        let store = stores.store;
        if (pageInfo.isClientPaging) {
          store = getPagingData();
        }
        if (store.length) {
          store.forEach((row) => {
            row[ROW_CHECK_INDEX] = value.includes(row[ROW_DATA_INDEX]);
          });
          checkInfo.isHeaderChecked = value.length === store.length;
        }
        updateVScroll();
      },
    );
    watch(
      () => props.selected,
      (value) => {
        if (selectInfo.useSelect) {
          selectInfo.selectedRow = value;
        }
      },
    );
    watch(
      () => selectInfo.selectedRow,
      (value) => {
        if (selectInfo.useSelect) {
          stores.store.forEach((row) => {
            row[ROW_SELECT_INDEX] = value.includes(row[ROW_DATA_INDEX]);
          });
          updateVScroll();
        }
      },
    );
    watch(
      () => highlightIdx.value,
      async (index) => {
        await nextTick();
        if (index >= 0) {
          if (pageInfo.usePage && !pageInfo.isInfinite) {
            pageInfo.highlightPage = Math.ceil(index / pageInfo.perPage) || 1;
            if (pageInfo.highlightPage !== pageInfo.currentPage) {
              pageInfo.currentPage = pageInfo.highlightPage;
              pageInfo.isHighlight = true;
              return;
            }
          }
          elementInfo.body.scrollTop = resizeInfo.rowHeight * highlightIdx.value;
        }
      },
    );
    watch(
      () => checkInfo.useCheckbox.mode,
      () => {
        clearCheckInfo();
      },
    );
    watch(
      () => selectInfo.useSelect,
      () => {
        clearSelectInfo();
      },
    );
    watch(
      () => selectInfo.multiple,
      () => {
        clearSelectInfo();
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
      () => [props.option.columnWidth, resizeInfo.gridWidth],
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
      () => props.option.searchValue,
      (value) => {
        if (value !== undefined) {
          onSearch(value?.value ?? value);
          if (pageInfo.isClientPaging) {
            clearCheckInfo();
            clearSelectInfo();
          }
        }
      }, { immediate: true },
    );
    watch(
      () => props.option.page?.currentPage,
      (value) => {
        const current = !value ? 1 : value;
        pageInfo.currentPage = !props.option.page?.isInfinite ? current : 1;
      }, { immediate: true },
    );
    watch(
      () => pageInfo.currentPage,
      (current, before) => {
        nextTick(() => {
          changePage(before);
          if (pageInfo.isClientPaging && current !== before) {
            clearCheckInfo();
            clearSelectInfo();
          }
          updateVScroll();
          if (current === pageInfo.highlightPage && pageInfo.isHighlight) {
            elementInfo.body.scrollTop = resizeInfo.rowHeight * highlightIdx.value;
            pageInfo.isHighlight = !pageInfo.isHighlight;
          }
        });
      },
    );
    return {
      summaryScroll,
      showHeader,
      stripeStyle,
      borderStyle,
      highlightIdx,
      useSummary,
      stores,
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
      setStore,
      setContextMenu,
      onContextMenu,
      onSearch,
    };
  },
};
</script>

<style lang="scss" scoped>
  @import 'style/grid.scss';
  .icon-sort {
    position: absolute;
    top: 50%;
    width: 24px;
    height: 24px;
    background-size: contain;
    transform: translateY(-50%);
    &:hover {
      cursor: pointer;
    }
    &--basic {
      visibility: hidden;
      background: url('~docs/assets/images/icon-sort.svg') no-repeat center center;
    }
    &--asc {
      background: url('~docs/assets/images/icon-sort-asc.svg') no-repeat center center;
    }
    &--desc {
      background: url('~docs/assets/images/icon-sort-desc.svg') no-repeat center center;
    }
  }
  .column:hover {
    .icon-sort--basic {
      visibility: visible;
    }
  }
</style>
