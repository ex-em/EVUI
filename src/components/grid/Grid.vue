<template>
  <div
    v-if="$slots.toolbar || useColumnSetting"
    ref="toolbarWrapper"
    class="toolbar-wrapper"
    :style="`width: ${gridWidth};`"
  >
    <!-- Toolbar -->
    <toolbar>
      <template #toolbarWrapper>
        <!-- Filtering Column Items -->
        <div
          v-if="isFiltering && Object.keys(filteringItemsByColumn).length"
          ref="filteringItemsRef"
          class="filtering-items"
          :style="{
            width: `${filteringItemsWidth}px`,
            background: !isShowColumnFilteringItems && isExpandColumnFilteringItems
              ? '#FFFFFF' : 'none',
            border: !isShowColumnFilteringItems && isExpandColumnFilteringItems
              ? '1px solid #CED4DA' : 'none',
          }"
        >
          <template
            v-for="(field, idx) in Object.keys(filteringItemsByColumn)"
            :key="idx"
          >
            <template v-if="idx === 0">
              <div
                class="filtering-items__item filtering-items__item--filter"
                @click="onExpandFilteringItems"
              >
                <ev-icon
                  icon="ev-icon-filter-list"
                  class="filtering-items-expand"
                />
                <span class="filtering-items__item--title">
                   Filter ({{ Object.keys(filteringItemsByColumn).length }})
                </span>
                <ev-icon
                  class="filtering-items__item--remove"
                  icon="ev-icon-s-close"
                  style="margin-left: 0;"
                  @click.stop="removeAllFiltering"
                />
              </div>
            </template>
            <ev-select
              v-if="idx === 1"
              v-model="columnOperator"
              class="ev-grid-filter-setting__row--operator"
              :items="operatorItems"
              @change="onChangeOperator"
            />
            <div
              class="filtering-items__item"
              @click="onClickFilteringItem(
                filteringItemsByColumn[field]?.[0].caption,
                filteringItemsByColumn[field]
                )"
            >
              <span class="filtering-items__item--title">
                {{ filteringItemsByColumn[field]?.[0].caption }}
              </span>
              <span
                v-if="filteringItemsByColumn[field].length < 2"
                class="filtering-items__item--value"
                :title="`${filteringItemsByColumn[field][0].value}`"
              >
                {{ filteringItemsByColumn[field]?.[0].comparison }}
                {{ filteringItemsByColumn[field]?.[0].value }}
              </span>
              <span
                v-else
                class="filtering-items__item--value"
              >
                + {{ filteringItemsByColumn[field].length }}
              </span>
              <ev-icon
                class="filtering-items__item--remove"
                icon="ev-icon-s-close"
                @click="removeColumnFiltering(field)"
              />
            </div>
          </template>
        </div>
        <!-- Filtering Items Box -->
        <template v-if="isFiltering && isShowFilteringItemsBox">
          <teleport to="#ev-grid-filtering-items-modal">
            <section
              v-clickoutside="() => { isShowFilteringItemsBox = false }"
              class="ev-grid-filtering-items"
              :style="{
                top: boxTop,
                left: boxLeft,
              }"
            >
              <template
                v-for="(field, idx) in selectedFilteringItems"
                :key="idx"
              >
                <ev-select
                  v-if="idx === 1"
                  v-model="field.operator"
                  class="ev-grid-filter-setting__row--operator"
                  disabled
                  :items="operatorItems"
                />
                <div class="filtering-items__item">
                  <span class="filtering-items__item--title">
                    {{ selectedFilteringFiled }}
                  </span>
                  <span class="filtering-items__item--value">
                    {{ field.comparison }}
                    {{ field.value }}
                  </span>
                  <ev-icon
                    class="filtering-items__item--remove"
                    icon="ev-icon-s-close"
                    @click="removeFiltering({field: selectedFilteringFiled, idx})"
                  />
                </div>
              </template>
            </section>
          </teleport>
        </template>
        <grid-option-button
          v-if="useColumnSetting"
          class="column-setting__icon"
          @click="setColumnSetting"
        />
        <slot
          name="toolbar"
          :item="{ onSearch: onSearch }"
        />
      </template>
    </toolbar>
    <column-setting
      v-model:is-show="isShowColumnSetting"
      :columns="$props.columns"
      :hidden-column="hiddenColumn"
      @apply-column="onApplyColumn"
    />
    <filter-setting
      v-model:is-show="isShowFilterSetting"
      v-model:items="filteringItemsByColumn"
      :column="filteringColumn"
      :position="filterSettingPosition"
      @apply-filtering="onApplyFilter"
    />
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
        table: true,
        adjust: adjust,
        'ev-grid': true,
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
            :style="{
              width: `${minWidth}px`,
              'border-right': '1px solid #CFCFCF'
            }"
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
            <!-- Header -->
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
                'margin-right': orderedColumns.length - 1 === index && (hasVerticalScrollBar
                  || hasHorizontalScrollBar) ? `${scrollWidth}px` : '0px',
                'border-right': orderedColumns.length - 1 === index ? 'none' : '1px solid #CFCFCF',
              }"
              :draggable="true"
              @dragstart="onDragStart"
              @dragover="onDragOver"
              @drop="onDrop"
            >
              <!-- Column Name -->
              <span
                :title="column.caption"
                class="column-name"
                @click="onColumnContextMenu($event, column)"
                @click.prevent="columnMenu.show"
              >
                {{ column.caption }}
                <!-- Sort Icon -->
                <span @click.stop="onSort(column)">
                  <template v-if="!!$slots.sortIcon">
                    <span
                      v-if="column.sortable === undefined ? true : column.sortable"
                      class="column-sort__icon column-sort__icon--basic"
                      :style="{
                        height: `${rowHeight}px`,
                        'line-height': `${rowHeight}px`,
                      }"
                    >
                      <slot name="sortIcon" />
                    </span>
                    <span
                      v-if="sortField === column.field"
                      :class="[{
                        'column-sort__icon': true,
                        'column-sort__icon--asc': sortOrder === 'asc',
                        'column-sort__icon--desc': sortOrder === 'desc',
                      }]"
                      :style="{
                        height: `${rowHeight}px`,
                        'line-height': `${rowHeight}px`,
                      }"
                    >
                      <slot :name="`sortIcon_${sortOrder}`" />
                    </span>
                  </template>
                  <template v-else>
                    <grid-sort-button
                      v-if="column.sortable === undefined ? true : column.sortable"
                      class="column-sort__icon column-sort__icon--basic"
                      :icon="'basic'"
                      :style="{
                        height: `${rowHeight}px`,
                        'line-height': `${rowHeight}px`,
                      }"
                    />
                    <grid-sort-button
                      v-if="sortField === column.field"
                      :class="[{
                        'column-sort__icon': true,
                        'column-sort__icon--asc': sortOrder === 'asc',
                        'column-sort__icon--desc': sortOrder === 'desc',
                      }]"
                      :icon="sortOrder"
                      :style="{
                        height: `${rowHeight}px`,
                        'line-height': `${rowHeight}px`,
                        visibility: !!sortOrder ? column.hidden : true,
                      }"
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
          <!-- Row Contextmenu Column -->
          <li
            v-if="$props.option.customContextMenu?.length"
            :class="{
              column: true,
              'non-border': !!borderStyle,
            }"
            :style="{
              width: '30px',
              'min-width': '30px',
              'margin-right': (hasVerticalScrollBar || hasHorizontalScrollBar)
                ? `${scrollWidth}px` : '0px',
            }"
          >
          </li>
        </ul>
      </div>
      <!-- Body -->
      <div
        ref="body"
        :class="{
          stripe: stripeStyle,
          'table-body': true,
          'bottom-border': !!viewStore.length,
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
                highlight: row[0] === highlightIdx,
                'non-border': !!borderStyle && borderStyle !== 'rows',
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
                :style="{
                  width: `${minWidth}px`,
                  height: `${rowHeight}px`,
                  'border-right': '1px solid #CFCFCF',
                }"
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
                    render: isRenderer(column),
                    [column.type]: column.type,
                    [column.align]: column.align,
                    [column.field]: column.field,
                    'non-border': !!borderStyle,
                  }"
                  :style="{
                    width: `${column.width}px`,
                    height: `${rowHeight}px`,
                    'line-height': `${rowHeight}px`,
                    'min-width': `${isRenderer(column) ? rendererMinWidth : minWidth}px`,
                    'border-right': orderedColumns.length - 1 === cellIndex
                      ? 'none' : '1px solid #CFCFCF',
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
              <!-- Row Contextmenu Button -->
              <td
                v-if="$props.option.customContextMenu?.length"
                :class="{
                  'row-contextmenu': true,
                  'non-border': !!borderStyle,
                }"
                :style="{
                  position: 'sticky',
                  right: 0,
                  width: '30px',
                  height: `${rowHeight}px`,
                  'min-width': '30px',
                  'line-height': `${rowHeight}px`,
                }"
              >
                <template v-if="$slots.contextmenuIcon">
                  <span
                    class="row-contextmenu__btn"
                    @click="onContextMenu($event)"
                    @click.prevent="menu.show"
                  >
                    <slot name="contextmenuIcon"></slot>
                  </span>
                </template>
                <template v-else>
                  <grid-option-button
                    icon="ev-icon-warning2"
                    class="row-contextmenu__btn"
                    @click="onContextMenu($event)"
                    @click.prevent="menu.show"
                  />
                </template>
              </td>
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
        <ev-context-menu
          ref="columnMenu"
          :items="columnMenuItems"
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
import {
  reactive,
  toRefs,
  computed,
  watch,
  onMounted,
  onUpdated,
  onActivated,
  nextTick,
  ref,
  provide,
  onBeforeMount,
} from 'vue';
import { clickoutside } from '@/directives/clickoutside';
import Toolbar from './grid.toolbar';
import GridPagination from './grid.pagination';
import GridSummary from './grid.summary';
import ColumnSetting from './grid.columnSetting.vue';
import filterSetting from './grid.filterSetting.vue';
import GridSortButton from './grid.sortButton';
import GridOptionButton from './grid.optionButton.vue';
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
  columnSettingEvent,
  dragEvent,
} from './uses';

export default {
  name: 'EvGrid',
  directives: {
    clickoutside,
  },
  components: {
    Toolbar,
    GridPagination,
    GridSummary,
    ColumnSetting,
    filterSetting,
    GridSortButton,
    GridOptionButton,
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
    const toolbarWrapper = ref(null);
    const showHeader = computed(() => (props.option.showHeader ?? true));
    const useColumnSetting = computed(() => (props.option?.useColumnSetting || false));
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
      isFiltering: computed(() => (props.option.useFilter ?? false)),
      isShowFilterSetting: false,
      filterSettingPosition: {
        left: 0,
        top: 0,
      },
      filteringColumn: null,
      filteringItemsByColumn: {},
      columnOperator: 'and',
    });
    const columnSettingInfo = reactive({
      isShowColumnSetting: false,
      isFilteringColumn: false, // hide된 컬럼이 있는지
      visibleColumnIdx: [], // 보여지는 컬럼의 인덱스 목록
      hiddenColumn: '',
    });
    const stores = reactive({
      viewStore: [],
      originStore: [],
      pagingStore: [],
      searchStore: [],
      filterStore: [],
      store: computed(() => {
        const store = filterInfo.isFiltering ? stores.filterStore : stores.originStore;
        return filterInfo.isSearch ? stores.searchStore : store;
      }),
      filteredColumns: [],
      movedColumns: [],
      originColumns: computed(() => props.columns.map((column, index) => ({ index, ...column }))),
      orderedColumns: computed(() => {
        const columns = stores.filteredColumns.length
          ? stores.filteredColumns : stores.originColumns;
        return stores.movedColumns.length ? stores.movedColumns : columns;
      }),
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
      contextmenuInfo: props.contextmenuInfo,
      selectedRow: props.selected,
      useSelect: computed(() => props.option?.useSelection?.use ?? true),
      multiple: computed(() => props.option?.useSelection?.multiple ?? false),
    });
    const sortInfo = reactive({
      isSorting: false,
      sortField: '',
      sortOrder: '',
    });
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      columnMenu: null,
      columnMenuItems: [],
      customContextMenu: props.option.customContextMenu || [],
    });
    const resizeInfo = reactive({
      minWidth: 80,
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
    } = clickEvent({ selectInfo, stores });

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
      setFilter,
    } = filterEvent({
      columnSettingInfo,
      filterInfo,
      stores,
      checkInfo,
      pageInfo,
      getConvertValue,
      updateVScroll,
      getPagingData,
      updatePagingInfo,
      getColumnIndex,
    });

    const {
      setStore,
    } = storeEvent({
      selectInfo,
      checkInfo,
      stores,
      sortInfo,
      elementInfo,
      filterInfo,
      setSort,
      updateVScroll,
      setFilter,
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
      contextInfo,
    });

    const {
      setColumnSetting,
      initColumnSettingInfo,
      onApplyColumn,
      setColumnHidden,
    } = columnSettingEvent({
      stores,
      columnSettingInfo,
      onSearch,
      onResize,
    });

    const {
      setContextMenu,
      onContextMenu,
      onColumnContextMenu,
    } = contextMenuEvent({
      contextInfo,
      stores,
      selectInfo,
      onSort,
      setColumnHidden,
      useColumnSetting,
      filterInfo,
    });

    const {
      onDragStart,
      onDragOver,
      onDrop,
    } = dragEvent({ stores });

    provide('toolbarWrapper', toolbarWrapper);

    const filteringItemsWidth = ref(0);
    onMounted(() => {
      calculatedColumn();
      setStore(props.rows);
    });
    onActivated(() => {
      onResize();
    });
    onUpdated(() => {
      filteringItemsWidth.value = elementInfo['grid-wrapper']?.offsetWidth / 1.5 || 0;
    });
    watch(
      () => props.columns,
      () => {
        sortInfo.isSorting = false;
        sortInfo.sortField = '';
        filterInfo.filteringColumn = null;
        filterInfo.filteringItemsByColumn = {};
        stores.filterStore = [];
        setStore([], false);
        initColumnSettingInfo();
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
    const filteringItemsBoxPosition = reactive({
      boxTop: 0,
      boxLeft: 0,
    });
    const filteringItemsRef = ref(null);
    const isShowFilteringItemsBox = ref(false);
    const isShowColumnFilteringItems = ref(false);
    const selectedFilteringFiled = ref('');
    const selectedFilteringItems = ref([]);
    const operatorItems = [
      { name: 'AND', value: 'and' },
      { name: 'OR', value: 'or' },
    ];
    const isExpandColumnFilteringItems = ref(false);

    const onClickFilteringItem = (field, filters) => {
      selectedFilteringFiled.value = field;
      selectedFilteringItems.value = filters;
      if (filters?.length > 1) { // open filtering items box
        isShowFilteringItemsBox.value = true;
        const x = filteringItemsRef.value.getBoundingClientRect().left;
        const y = filteringItemsRef.value.getBoundingClientRect().top
          + filteringItemsRef.value.getBoundingClientRect().height;
        filteringItemsBoxPosition.boxTop = `${y}px`;
        filteringItemsBoxPosition.boxLeft = `${x}px`;
      }
    };

    const onChangeOperator = () => {
      stores.filterStore = [];
      setStore([], false);
    };

    const setColumnFilteringItems = () => {
      isExpandColumnFilteringItems.value = true;
      const conditionItems = filteringItemsRef.value
        .getElementsByClassName('filtering-items__item');
      let hasHiddenElement = false;

      for (let i = 0; i < conditionItems.length; i++) {
        const itemEl = conditionItems[i];
        itemEl.classList.remove('non-display');
        const filteringBoxTop = filteringItemsRef.value.getBoundingClientRect()?.top;
        const { top } = itemEl.getBoundingClientRect(); // rect height: 27
        if (isShowColumnFilteringItems.value && (top - filteringBoxTop > 27)) {
          isExpandColumnFilteringItems.value = false;
          hasHiddenElement = true;
        }

        itemEl.classList.toggle('non-display', hasHiddenElement);
      }
    };

    const onApplyFilter = async (field, list) => {
      if (!list?.length) {
        delete filterInfo.filteringItemsByColumn[field];
      } else {
        filterInfo.filteringItemsByColumn[field] = list;
        isShowColumnFilteringItems.value = true;
        await nextTick();
        setColumnFilteringItems();
      }
      filterInfo.isShowFilterSetting = false; // filter setting close
      stores.filterStore = [];
      setStore([], false);
    };

    const onExpandFilteringItems = () => {
      isShowColumnFilteringItems.value = !isShowColumnFilteringItems.value;
      setColumnFilteringItems();
    };

    const removeColumnFiltering = (field) => {
      delete filterInfo.filteringItemsByColumn[field];
      stores.filterStore = [];
      setStore([], false);
    };
    const removeFiltering = ({ field, idx }) => {
      filterInfo.filteringItemsByColumn[field].splice(idx, 1);
      if (!filterInfo.filteringItemsByColumn[field].length) {
        delete filterInfo.filteringItemsByColumn[field];
      }
      stores.filterStore = [];
      setStore([], false);
    };

    const removeAllFiltering = () => {
      filterInfo.filteringColumn = null;
      filterInfo.filteringItemsByColumn = {};
      stores.filterStore = [];
      setStore([], false);
    };

    const initWrapperDiv = () => {
      const root = document.createElement('div');
      root.id = 'ev-grid-filtering-items-modal';
      root.setAttribute('style', 'position: absolute; top: 0; left: 0;');
      const hasRoot = document.getElementById('ev-grid-filtering-items-modal');
      if (!hasRoot) {
        document.body.appendChild(root);
      }
    };

    onBeforeMount(() => initWrapperDiv());

    return {
      summaryScroll,
      showHeader,
      stripeStyle,
      borderStyle,
      highlightIdx,
      useSummary,
      useColumnSetting,
      toolbarWrapper,
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
      ...toRefs(columnSettingInfo),
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
      setColumnSetting,
      onApplyColumn,
      onColumnContextMenu,
      // filtering
      filteringItemsWidth,
      isExpandColumnFilteringItems,
      isShowColumnFilteringItems,
      operatorItems,
      selectedFilteringItems,
      selectedFilteringFiled,
      filteringItemsRef,
      isShowFilteringItemsBox,
      ...toRefs(filteringItemsBoxPosition),
      removeFiltering,
      removeColumnFiltering,
      removeAllFiltering,
      onExpandFilteringItems,
      setColumnFilteringItems,
      onChangeOperator,
      onApplyFilter,
      onClickFilteringItem,
      // drag
      onDragStart,
      onDragOver,
      onDrop,
    };
  },
};
</script>

<style lang="scss" scoped>
@import 'style/grid.scss';
</style>
