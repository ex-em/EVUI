<template>
  <div
    v-if="$slots.toolbar || useGridSetting"
    ref="toolbarRef"
    class="toolbar-wrapper"
    :style="`width: ${gridWidth};`"
  >
    <!-- Toolbar -->
    <toolbar>
      <template #toolbarWrapper>
        <!-- Filtering Items -->
        <div
          class="filtering"
          :style="{ width: `${filteringItemsWidth}px` }"
        >
          <div
            v-if="isFiltering && !Object.keys(filteringItemsByColumn).length"
            class="filtering-items filtering-items--used"
          >
            <ev-icon icon="ev-icon-filter-list" />
            <span>Filter</span>
          </div>
          <div
            v-if="isFiltering && Object.keys(filteringItemsByColumn).length"
            ref="filteringItemsRef"
            class="filtering-items"
          >
            <template
              v-for="(field, idx) in Object.keys(filteringItemsByColumn)"
              :key="idx"
            >
              <template v-if="idx === 0">
                <div
                  class="filtering-items__item filtering-items__item--filter"
                  @click.stop="onExpandFilteringItems"
                >
                  <ev-icon
                    icon="ev-icon-filter-list"
                    class="filtering-items-expand"
                  />
                  <span>
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
                :items="operatorItems"
                class="filtering-items__item--operator"
                @change="onChangeOperator"
              />
              <div
                class="filtering-items__item non-display"
                :data-field="field"
                @click.stop="onClickFilteringItem({
                  caption: getFilteringItemByField(field)?.caption,
                  field: field,
                },
                filteringItemsByColumn[field])"
              >
                <span class="filtering-items__item--title">
                  {{ getFilteringItemByField(field)?.caption }}
                  {{ getFilteringItemByField(field)?.comparison }}
                </span>
                <span
                  v-if="filteringItemsByColumn[field].length < 2"
                  class="filtering-items__item--value"
                  :title="getFilteringItemByField(field)?.value"
                >
                  {{ getFilteringItemByField(field)?.value }}
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
                  @click="onApplyFilter(field, [])"
                />
              </div>
            </template>
            <!-- +N Count-->
            <div
              v-if="isShowColumnFilteringItems && Object.keys(filteringItemsByColumn).length
                && hiddenFilteringItemsCount > 0"
              class="filtering-items__item filtering-items__item--count"
              @click="onExpandFilteringItems"
            >
              + {{ hiddenFilteringItemsCount }}
            </div>
          </div>
          <div
            v-if="!isShowColumnFilteringItems && Object.keys(hiddenFilteringItemsByColumn).length"
            ref="hiddenFilteringItemsRef"
            v-clickoutside="() => { if (!isShowColumnFilteringItems) onExpandFilteringItems(); }"
            class="filtering-items filtering-items__hidden-items"
            :style="filteringItemsStyle"
          >
            <template
              v-for="(field, idx) in Object.keys(hiddenFilteringItemsByColumn)"
              :key="idx"
            >
              <div
                class="filtering-items__item"
                @click.stop="onClickFilteringItem({
                  caption: getFilteringItemByField(field)?.caption,
                  field: field,
                },
                hiddenFilteringItemsByColumn[field])"
              >
                <span class="filtering-items__item--title">
                  {{ getFilteringItemByField(field)?.caption }}
                  {{ getFilteringItemByField(field)?.comparison }}
                </span>
                <span
                  v-if="hiddenFilteringItemsByColumn[field].length < 2"
                  class="filtering-items__item--value"
                  :title="getFilteringItemByField(field)?.value"
                >
                  {{ getFilteringItemByField(field)?.value }}
                </span>
                <span
                  v-else
                  class="filtering-items__item--value"
                >
                  + {{ hiddenFilteringItemsByColumn[field].length }}
                </span>
                <ev-icon
                  class="filtering-items__item--remove"
                  icon="ev-icon-s-close"
                  @click="onApplyFilter(field, [], true)"
                />
              </div>
            </template>
          </div>
        </div>
        <grid-option-button
          v-if="useGridSetting"
          class="grid-setting__icon"
          @click="setGridSetting($event)"
        />
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
              'checkbox-all': true,
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
              :disabled="isHeaderUncheckable"
              @change="onCheckAll"
            />
          </li>
          <li
            v-if="useRowDetail"
            :class="{
              'column': true,
              'non-border': !!borderStyle,
            }"
            :style="{
              width: `${minWidth}px`,
              'border-right': '1px solid #CFCFCF'
            }"
          />
          <!-- Column List -->
          <template
            v-for="(column, index) in orderedColumns"
            :key="index"
          >
            <!-- Header -->
            <li
              v-if="!column.hide && !column.hiddenDisplay"
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
      >
        <!-- vScroll Top -->
        <div
          :style="`height: ${vScrollTopHeight}px;`"
          class="vscroll-spacer"
        />
        <table ref="table">
          <tbody>
            <!-- Row List -->
            <template
              v-for="(row, rowIndex) in viewStore"
              :key="rowIndex"
            >
              <tr
                :data-index="row[0]"
                :class="{
                  row: true,
                  selected: row[3],
                  highlight: row[0] === highlightIdx,
                  'non-border': !!borderStyle && borderStyle !== 'rows',
                }"
                @click="onRowClick($event, row)"
                @contextmenu="onRowClick($event, row, true)"
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
                    :disabled="row[5]"
                    @change="onCheck($event, row)"
                  />
                </td>
                <!-- Row Detail toggle -->
                <td
                  v-if="useRowDetail"
                  :class="{
                    cell: true,
                    'row-detail-toggle': true,
                    'non-border': !!borderStyle,
                    'row-detail-toggle--expanded': row[4],
                  }"
                  :style="{
                    width: `${minWidth}px`,
                    height: `${rowHeight}px`,
                    'border-right': '1px solid #CFCFCF',
                  }"
                >
                  <ev-icon
                    v-model="row[4]"
                    icon="ev-icon-s-play"
                    class="row-detail-toggle-icon"
                    @click.stop="onExpanded($event, row)"
                  />
                </td>
                <!-- Cell -->
                <template
                  v-for="(column, cellIndex) in orderedColumns"
                  :key="cellIndex"
                >
                  <td
                    v-if="!column.hide && !column.hiddenDisplay"
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
                    >
                      <slot name="contextmenuIcon"></slot>
                    </span>
                  </template>
                  <template v-else>
                    <grid-option-button
                      icon="ev-icon-warning2"
                      class="row-contextmenu__btn"
                      @click="onContextMenu($event)"
                    />
                  </template>
                </td>
              </tr>
              <tr
                v-if="useRowDetail && $slots?.rowDetail && row[4]"
              >
                <slot
                  name="rowDetail"
                  :item="{ row }"
                />
              </tr>
             </template>
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
        <ev-context-menu
          ref="gridSettingMenu"
          :items="gridSettingContextMenuItems"
          :is-show-menu-on-click="isShowMenuOnClick"
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
  <!-- Filter Setting -->
  <filter-setting
    v-model:is-show="isShowFilterSetting"
    v-model:items="filteringItemsByColumn"
    :column="filteringColumn"
    :position="filterSettingPosition"
    @apply-filtering="onApplyFilter"
  />
  <!-- Column Setting -->
  <column-setting
    v-model:is-show="isShowColumnSetting"
    v-model:is-show-menu-on-click="isShowMenuOnClick"
    :columns="$props.columns"
    :hidden-column="hiddenColumn"
    :position="columnSettingPosition"
    @apply-column="onApplyColumn"
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
  onBeforeMount, onUnmounted,
} from 'vue';
import { clickoutside } from '@/directives/clickoutside';
import { cloneDeep } from 'lodash-es';
import Toolbar from './GridToolbar';
import GridPagination from './GridPagination';
import GridSummary from './GridSummary';
import ColumnSetting from './GridColumnSetting.vue';
import FilterSetting from './GridFilterSetting.vue';
import GridSortButton from './icon/icon-sort-button';
import GridOptionButton from './icon/icon-option-button.vue';
import {
  commonFunctions,
  scrollEvent,
  resizeEvent,
  clickEvent,
  checkEvent,
  expandEvent,
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
    FilterSetting,
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
    uncheckable: {
      type: [Array],
      default: () => [],
    },
    expanded: {
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
    'sort-column': null,
    'expand-row': null,
    'update:expanded': null,
  },
  setup(props) {
    // const ROW_INDEX = 0;
    const ROW_CHECK_INDEX = 1;
    const ROW_DATA_INDEX = 2;
    const ROW_SELECT_INDEX = 3;
    const ROW_EXPAND_INDEX = 4;
    const {
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
    } = commonFunctions();
    const toolbarRef = ref(null);
    const useGridSetting = computed(() => (props.option?.useGridSetting?.use || false));
    const showHeader = computed(() => (props.option.showHeader ?? true));
    const useSummary = computed(() => (props.option?.useSummary || false));
    const stripeStyle = computed(() => (props.option.style?.stripe || false));
    const borderStyle = computed(() => (props.option.style?.border || ''));
    const highlightIdx = computed(() => (props.option.style?.highlight ?? -1));
    const rowMinHeight = props.option.rowMinHeight || 35;
    const filteringItemsWidth = ref(0);
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
      columnSettingPosition: {
        top: 0,
        left: 0,
        columnListMenuWidth: 0,
      },
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
        const columns = stores.movedColumns.length
          ? stores.movedColumns : stores.originColumns;
        return stores.filteredColumns.length ? stores.filteredColumns : columns;
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
      isHeaderUncheckable: false,
      checkedRows: props.checked,
      useCheckbox: computed(() => (props.option.useCheckbox || {})),
    });
    const expandedInfo = reactive({
      expandedRows: props.expanded,
      useRowDetail: computed(() => props.option?.rowDetail?.use ?? false),
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
      sortColumn: {},
    });
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      columnMenu: null,
      columnMenuItems: [],
      hiddenColumnMenuItem: props.option.hiddenColumnMenuItem || {},
      customContextMenu: props.option.customContextMenu || [],
      gridSettingMenu: null,
      gridSettingContextMenuItems: [],
      customGridSettingContextMenu: computed(
        () => props.option?.useGridSetting?.customContextMenu || [],
      ),
      isShowMenuOnClick: false,
    });
    const resizeInfo = reactive({
      minWidth: 40,
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
    const clearExpandedInfo = () => {
      stores.store.forEach((row) => {
        row[ROW_EXPAND_INDEX] = false;
      });
      expandedInfo.expandedRows = [];
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
      expandedInfo,
      getPagingData,
      updatePagingInfo,
    });

    const {
      onCheck,
      onCheckAll,
    } = checkEvent({ checkInfo, stores, pageInfo, getPagingData, updatePagingInfo });

    const {
      onExpanded,
    } = expandEvent({
      expandedInfo,
      stores,
    });

    const {
      onSort,
      setSort,
    } = sortEvent({ sortInfo, stores, updatePagingInfo });

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
      expandedInfo,
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
      expandedInfo,
      stores,
      filterInfo,
      isRenderer,
      updateVScroll,
      updateHScroll,
      contextInfo,
    });

    const {
      setPositionColumnSetting,
      initColumnSettingInfo,
      onApplyColumn,
      setColumnHidden,
    } = columnSettingEvent({
      stores,
      columnSettingInfo,
      contextInfo,
      onSearch,
      onResize,
    });

    const {
      setContextMenu,
      onContextMenu,
      onColumnContextMenu,
      onGridSettingContextMenu,
    } = contextMenuEvent({
      contextInfo,
      stores,
      selectInfo,
      useGridSetting,
      filterInfo,
      columnSettingInfo,
      setColumnHidden,
      onSort,
    });

    const {
      onRowClick,
      onRowDblClick,
    } = clickEvent({ selectInfo, stores });

    const {
      onDragStart,
      onDragOver,
      onDrop,
    } = dragEvent({ stores });

    const setGridSetting = (e) => {
      contextInfo.gridSettingContextMenuItems.length = 0;
      if (contextInfo.customGridSettingContextMenu.length) {
        onGridSettingContextMenu(e);
      } else {
        columnSettingInfo.isShowColumnSetting = true;
      }
    };

    const onMouseWheel = (e) => {
      if (e.type === 'wheel') {
        contextInfo.menu?.hide(e);
      }
      if (e.type === 'scroll' && !e.target.classList?.contains('table-body')
      && !e.target.offsetParent?.classList?.contains('ev-select-dropbox')
      && !e.target.offsetParent?.classList?.contains('ev-grid-column-setting')
      && !e.target.offsetParent?.classList?.contains('ev-text-field-wrapper')) {
        filterInfo.isShowFilterSetting = false;
        columnSettingInfo.isShowColumnSetting = false;
        contextInfo.isShowMenuOnClick = false;
        contextInfo.columnMenu?.hide(e);
        contextInfo.gridSettingMenu?.hide();
      }
    };

    onMounted(() => {
      calculatedColumn();
      setStore(props.rows);
      document.addEventListener('wheel', onMouseWheel, { capture: false });
      document.addEventListener('scroll', onMouseWheel, { capture: true });
    });

    onUnmounted(() => {
      document.removeEventListener('wheel', onMouseWheel);
      document.removeEventListener('scroll', onMouseWheel);
    });

    onActivated(() => {
      onResize();
    });

    onUpdated(() => {
      filteringItemsWidth.value = elementInfo['grid-wrapper']?.offsetWidth / 1.5 || 0;
    });

    watch(() => columnSettingInfo.isShowColumnSetting, (isShowColumnSetting) => {
      if (!isShowColumnSetting) {
        contextInfo.gridSettingMenu?.hide();
        return;
      }
      setPositionColumnSetting(toolbarRef.value);
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
    watch(() => props.uncheckable,
      () => {
      setStore(props.rows);
      }, { deep: true });
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
      () => props.expanded.length,
      (expendedSize) => {
        if (!expendedSize) {
          clearExpandedInfo();
        }
      },
    );
    watch(
      () => [props.option.columnWidth, resizeInfo.gridWidth],
      async () => {
        await nextTick();
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
    const hiddenFilteringItemsRef = ref(null);
    const hiddenFilteringItemsByColumn = ref({});
    const selectedFilteringColumn = reactive({
      caption: '',
      field: '',
    });
    const selectedFilteringItems = ref([]);
    const operatorItems = [
      { name: 'AND', value: 'and' },
      { name: 'OR', value: 'or' },
    ];
    const hiddenFilteringItemsCount = ref(0);

    const onClickFilteringItem = ({ caption, field }, filters) => {
      selectedFilteringColumn.caption = caption;
      selectedFilteringColumn.field = field;
      selectedFilteringItems.value = filters;
      if (filters?.length > 1) { // open filtering items box
        isShowFilteringItemsBox.value = true;
        const x = filteringItemsRef.value.getBoundingClientRect().left;
        const y = window.pageYOffset + filteringItemsRef.value.getBoundingClientRect().top
          + filteringItemsRef.value.getBoundingClientRect().height;
        filteringItemsBoxPosition.boxTop = `${y}px`;
        filteringItemsBoxPosition.boxLeft = `${x}px`;
      }
    };

    const onChangeOperator = () => {
      stores.filterStore = [];
      setStore([], false);
    };

    const setColumnFilteringItems = async (isInit) => {
      if (isInit && isShowColumnFilteringItems.value) {
        hiddenFilteringItemsCount.value = 0;
      }
      const conditionItems = filteringItemsRef.value
        ?.getElementsByClassName('filtering-items__item');
      const hiddenItemList = [];
      let sumWidth = 0;
      if (conditionItems) {
        for (let i = 0; i < conditionItems.length; i++) {
          const itemEl = conditionItems[i];
          itemEl.classList.remove('non-display');
          const boxWidth = filteringItemsRef.value.getBoundingClientRect()?.width;
          const { width } = itemEl.getBoundingClientRect();
          sumWidth += width + 10;
          if (boxWidth - 150 <= sumWidth
            && !itemEl.classList.contains('filtering-items__item--count')) {
            hiddenFilteringItemsCount.value++;
            hiddenItemList.push(itemEl);
            hiddenFilteringItemsByColumn.value = {
              ...hiddenFilteringItemsByColumn.value,
              [itemEl.dataset.field]:
                cloneDeep(filterInfo.filteringItemsByColumn[itemEl.dataset.field]),
            };
          } else {
            delete hiddenFilteringItemsByColumn.value[itemEl.dataset.field];
          }
        }
        conditionItems.forEach((item) => {
          const isHidden = hiddenItemList.includes(item);
          item.classList.toggle('non-display', isHidden);
        });
      }
    };

    const onApplyFilter = async (field, list) => {
      if (!list?.length) {
        delete hiddenFilteringItemsByColumn.value[field];
        delete filterInfo.filteringItemsByColumn[field];
      } else {
        filterInfo.filteringItemsByColumn[field] = list;
        isShowColumnFilteringItems.value = true;
      }
      await nextTick();
      setColumnFilteringItems(true);
      filterInfo.isShowFilterSetting = false; // filter setting close
      stores.filterStore = [];
      setStore([], false);
    };

    let expandTimer = null;
    const onExpandFilteringItems = () => {
      if (expandTimer) {
        clearTimeout(expandTimer);
      }
      expandTimer = setTimeout(() => {
        isShowColumnFilteringItems.value = !isShowColumnFilteringItems.value;
        setColumnFilteringItems(isShowColumnFilteringItems.value);
      }, 150);
    };

    const removeAllFiltering = () => {
      filterInfo.filteringColumn = null;
      filterInfo.filteringItemsByColumn = {};
      hiddenFilteringItemsByColumn.value = {};
      stores.filterStore = [];
      setStore([], false);
    };

    const filteringItemsStyle = computed(() => ({
      width: `${filteringItemsWidth.value}px`,
      top: `${filteringItemsRef.value?.getBoundingClientRect().height || 0}px`,
    }));

    const getFilteringItemByField = (field) => {
      const filteringFieldInfo = filterInfo.filteringItemsByColumn[field];
      return filteringFieldInfo?.[filteringFieldInfo.length - 1];
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

    const getWidth = (w) => {
      console.log(w);
      return w;
    };

    return {
      getWidth,
      summaryScroll,
      showHeader,
      stripeStyle,
      borderStyle,
      highlightIdx,
      useSummary,
      useGridSetting,
      toolbarRef,
      stores,
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(filterInfo),
      ...toRefs(scrollInfo),
      ...toRefs(pageInfo),
      ...toRefs(resizeInfo),
      ...toRefs(selectInfo),
      ...toRefs(checkInfo),
      ...toRefs(expandedInfo),
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
      onExpanded,
      onSort,
      setSort,
      setStore,
      setContextMenu,
      onContextMenu,
      onSearch,
      setGridSetting,
      onApplyColumn,
      onColumnContextMenu,
      // filtering
      filteringItemsWidth,
      isShowColumnFilteringItems,
      operatorItems,
      selectedFilteringItems,
      selectedFilteringColumn,
      filteringItemsRef,
      isShowFilteringItemsBox,
      filteringItemsStyle,
      hiddenFilteringItemsCount,
      ...toRefs(filteringItemsBoxPosition),
      hiddenFilteringItemsRef,
      hiddenFilteringItemsByColumn,
      removeAllFiltering,
      onExpandFilteringItems,
      setColumnFilteringItems,
      onChangeOperator,
      onApplyFilter,
      onClickFilteringItem,
      getFilteringItemByField,
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
