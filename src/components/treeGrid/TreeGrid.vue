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
        <grid-option-button
          v-if="useGridSetting"
          class="grid-setting__icon"
          @click="setGridSetting"
        />
        <slot
          name="toolbar"
          :item="{
            onSearch,
          }"
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
    :style="gridStyle"
  >
    <!-- Table -->
    <div
      v-cloak
      ref="grid"
      :class="gridClass"
    >
      <!-- Header -->
      <div
        v-show="showHeader"
        ref="header"
        :class="headerClass"
      >
        <ul class="column-list">
          <!-- Header Checkbox -->
          <li
            v-if="useCheckbox.use"
            :class="headerCheckboxClass"
            :style="{
              width: `${minWidth}px`,
              'border-right': '1px solid #CFCFCF',
            }"
          >
            <ev-checkbox
              v-if="isHeaderCheckbox"
              v-model="isHeaderChecked"
              :disabled="isHeaderUncheckable"
              :indeterminate="isHeaderIndeterminate"
              @change="onCheckAll"
            />
          </li>
          <!-- Column List -->
          <template
            v-for="(column, index) in orderedColumns"
            :key="index"
          >
            <li
              v-if="!column.hide && !column.hiddenDisplay"
              :data-index="index"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column, index)"
            >
              <!-- Custom Header -->
              <template v-if="column.customHeader && !!$slots.customHeader">
                <slot name="customHeader" />
              </template>
              <template v-else>
                <!-- Column Name -->
                <span
                  :title="column.caption"
                  :class="[
                    'column-name',
                    { 'column-name--click' : useGridSetting }
                  ]"
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
                            v-if="isSortedColumn(column)"
                            :class="sortIconClass(column)"
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
                            v-if="isSortedColumn(column)"
                            :class="sortIconClass(column)"
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
              </template>
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
        :class="bodyStyle"
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
            <tree-grid-node
              v-for="(node, idx) in viewStore"
              :key="node['id'] || idx"
              :selected-data="selectedRow"
              :node-data="node"
              :use-checkbox="useCheckbox"
              :ordered-columns="orderedColumns"
              :expand-icon="option.expandIcon"
              :collapse-icon="option.collapseIcon"
              :parent-icon="option.parentIcon"
              :child-icon="option.childIcon"
              :custom-context-menu="customContextMenu"
              :menu-ref="menu"
              :is-resize="isResize"
              :row-height="rowHeight"
              :min-width="minWidth"
              :highlight-index="highlightIdx"
              :border-style="borderStyle"
              @check-tree-data="onCheck"
              @expand-tree-data="handleExpand"
              @click-tree-data="onRowClick"
              @dbl-click-tree-data="onRowDblClick"
              @context-menu="onContextMenu"
            >
              <!-- Cell Renderer -->
              <template
                v-for="(column, cellIndex) in orderedColumns"
                :key="cellIndex"
                v-slot:[getSlotName(column.field)] = "{ item }"
              >
                <template v-if="!!$slots[column.field]">
                  <slot
                    :name="column.field"
                    :item="{
                       data: item.data,
                       fieldName: column.field
                    }"
                  >
                  </slot>
                </template>
                <template v-else>
                  <span :title="getConvertValue(column, node[column.field])">
                    {{ getConvertValue(column, node[column.field]) }}
                  </span>
                </template>
              </template>
              <template
                v-if="$slots.contextmenuIcon"
                #contextmenuIconNode
              >
                <slot
                  name="contextmenuIcon"
                />
              </template>
            </tree-grid-node>
            <tr v-if="!viewStore.length">
              <td class="is-empty">{{ emptyText }}</td>
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
          :custom-class="contextMenuClass"
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
    :is-tree="true"
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
    :total="showTreeStore.length"
    :per-page="perPage"
    :visible-page="visiblePage"
    :show-page-info="showPageInfo"
    :order="order"
  />
  <!-- Column Setting -->
  <column-setting
    v-model:is-show="isShowColumnSetting"
    v-model:is-show-menu-on-click="isShowMenuOnClick"
    :columns="updatedColumns"
    :hidden-column="hiddenColumn"
    :position="columnSettingPosition"
    :text-info="columnSettingTextInfo"
    @apply-column="onApplyColumn"
  />
</template>

<script>
import {
  reactive,
  toRefs,
  computed,
  watch,
  onActivated,
  nextTick,
  ref,
  onMounted,
  onUnmounted,
} from 'vue';
import { cloneDeep } from 'lodash-es';
import TreeGridNode from './TreeGridNode';
import Toolbar from './TreeGridToolbar';
import GridPagination from '../grid/GridPagination';
import GridSummary from '../grid/GridSummary';
import ColumnSetting from '../grid/GridColumnSetting.vue';
import GridSortButton from '../grid/icon/icon-sort-button';
import GridOptionButton from '../grid/icon/icon-option-button.vue';
import {
  commonFunctions,
  scrollEvent,
  resizeEvent,
  clickEvent,
  checkEvent,
  contextMenuEvent,
  treeEvent,
  filterEvent,
  pagingEvent,
  getUpdatedColumns,
  sortEvent,
} from './uses';
import {
  columnSettingEvent,
} from '../grid/uses';

export default {
  name: 'EvTreeGrid',
  components: {
    TreeGridNode,
    Toolbar,
    GridPagination,
    GridSummary,
    ColumnSetting,
    GridSortButton,
    GridOptionButton,
  },
  props: {
    columns: {
      type: [Array],
      default: () => [],
    },
    rows: {
      type: [Array, Object],
      default: () => null,
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
    expandIcon: {
      type: String,
      default: '',
    },
    collapseIcon: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update:selected': null,
    'update:checked': null,
    'click-row': null,
    'dblclick-row': null,
    'check-row': null,
    'check-all': null,
    'page-change': null,
    'sort-column': null,
    'resize-column': ({ column, columns }) => ({ column, columns }),
    'change-column-status': ({ columns }) => ({ columns }),
    'change-column-info': ({ type, columns }) => ({ type, columns }),
  },
  setup(props) {
    const toolbarRef = ref(null);
    const useGridSetting = computed(() => (props.option?.useGridSetting?.use || false));
    const useSummary = computed(() => (props.option?.useSummary || false));
    const emptyText = computed(() => (props.option.emptyText ?? 'No records'));
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
      useDefaultColumnSetting: computed(
        () => props.option?.useGridSetting?.useDefaultColumnSetting ?? true,
      ),
      columnSettingTextInfo: {
        title: props.option?.useGridSetting?.columnMenuText ?? 'Column List',
        search: props.option?.useGridSetting?.searchText ?? 'Search',
        empty: props.option?.useGridSetting?.emptyText ?? 'No records',
        ok: props.option?.useGridSetting?.okBtnText ?? 'OK',
      },
    });
    const stores = reactive({
      treeStore: [],
      viewStore: [],
      filterStore: [],
      pagingStore: [],
      originStore: [],
      showTreeStore: computed(() => stores.treeStore.filter(item => item.show)),
      searchStore: computed(() => stores.treeStore.filter(item => item.isFilter)),
      store: computed(() => (filterInfo.isSearch ? stores.searchStore : stores.treeStore)),
      treeRows: props.rows,
      filteredColumns: [],
      originColumns: computed(() => props.columns.map((column, index) => ({
        index,
        hiddenDisplay: false,
        ...column,
        sortOption: {
           sortType: column?.sortOption?.sortType || 'init',
        },
      }))),
      orderedColumns: computed(() => (stores.filteredColumns.length
        ? stores.filteredColumns : stores.originColumns)),
      updatedColumns: computed(() => getUpdatedColumns(stores)),
    });
    const pageInfo = reactive({
      usePage: computed(() => (props.option.page?.use || false)),
      useClient: props.option.page?.useClient || false,
      isInfinite: computed(() => (props.option.page?.isInfinite || false)),
      startIndex: 0,
      prevPage: 0,
      currentPage: 0,
      pageTotal: computed(() => (props.option.page?.total || 0)),
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
      isHeaderIndeterminate: false,
      checkedRows: props.checked,
      useCheckbox: computed(() => props.option.useCheckbox || {}),
    });
    const {
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
      checkHeader,
    } = commonFunctions({ checkInfo });
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
      sortOrder: '',
      sortColumn: {},
      sortFunction: props.option.customAscFunction ?? {},
    });
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      contextMenuClass: props.option.customContextMenuClass || '',
      columnMenu: null,
      columnMenuItems: [],
      columnMenuTextInfo: props.option.columnMenuText || {},
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
      showResizeLine: false,
      adjust: props.option.adjust || false,
      columnWidth: props.option.columnWidth || 80,
      scrollWidth: props.option.scrollWidth || 17,
      rowHeight: computed(() => props.option.rowHeight || 35),
      gridWidth: computed(() => (props.width ? setPixelUnit(props.width) : '100%')),
      gridHeight: computed(() => (props.height ? setPixelUnit(props.height) : '100%')),
      isResize: false,
    });
    const styleInfo = reactive({
      showHeader: computed(() =>
        (props.option.showHeader === undefined ? true : props.option.showHeader)),
      stripeStyle: computed(() => props.option.style?.stripe || false),
      borderStyle: computed(() => props.option.style?.border || ''),
      highlightIdx: computed(() => props.option.style?.highlight ?? -1),
    });
    const clearSelectInfo = () => {
      selectInfo.selectedRow.length = 0;
      stores.store.forEach((row) => {
        row.selected = false;
      });
    };
    const clearCheckInfo = () => {
      checkInfo.isHeaderChecked = false;
      checkInfo.isHeaderIndeterminate = false;
      checkInfo.checkedRows.length = 0;
      stores.store.forEach((row) => {
        row.checked = false;
        row.indeterminate = false;
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
    } = clickEvent(selectInfo);

    const {
      onCheck,
      onCheckAll,
    } = checkEvent({
      checkInfo,
      stores,
      checkHeader,
      pageInfo,
      getPagingData,
      updatePagingInfo,
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
      isRenderer,
      updateVScroll,
      updateHScroll,
      contextInfo,
    });

    const {
      setTreeNodeStore,
      handleExpand,
    } = treeEvent({ stores, onResize });

    const {
        onSort,
    } = sortEvent({ sortInfo, stores, updatePagingInfo, setTreeNodeStore, onResize });

    const {
      onSearch,
    } = filterEvent({
      stores,
      filterInfo,
      pageInfo,
      getConvertValue,
      onResize,
      checkHeader,
      getPagingData,
      updatePagingInfo,
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
      columnSettingInfo,
      setColumnHidden,
      onSort,
    });

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
        && !e.target.offsetParent?.classList?.contains('ev-grid-column-setting')) {
        columnSettingInfo.isShowColumnSetting = false;
        contextInfo.isShowMenuOnClick = false;
        contextInfo.columnMenu?.hide(e);
        contextInfo.gridSettingMenu?.hide();
      }
    };

    onMounted(() => {
      stores.treeStore = setTreeNodeStore();
      stores.originStore = cloneDeep(stores.treeStore);
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
        initColumnSettingInfo();
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
            row.checked = !!value.find(checkedRow => checkedRow.index === row.index);
          });
          checkHeader(store);
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
            row.selected = !!value.find(selectedRow => selectedRow.index === row.index);
          });
          updateVScroll();
        }
      }, { deep: true },
    );
    watch(
      () => styleInfo.highlightIdx,
      async (index) => {
        await nextTick();
        const setChildShow = (data) => {
          if (!data?.children) {
            return;
          }
          const { children } = data;
          children.forEach((node) => {
            const childNode = node;
            if (childNode.parent.show && childNode.parent.expand) {
              childNode.show = true;
            } else {
              childNode.show = false;
            }
            childNode.isFilter = true;
            if (childNode.hasChild) {
              setChildShow(childNode);
            }
          });
        };
        const setParentShow = (data) => {
          if (!data?.parent) {
            setChildShow(data);
            return;
          }
          const { parent } = data;
          parent.show = true;
          parent.isFilter = true;
          parent.expand = true;
          setChildShow(parent);
          setParentShow(parent);
        };
        if (index >= 0) {
          const highlightNode = stores.store.find(node => node.index === index);
          if (!highlightNode) {
            return;
          }
          // highlightNode parents 자동 펼치기
          highlightNode.show = true;
          highlightNode.isFilter = true;
          setParentShow(highlightNode);
          // tree 에 보여지는 데이터 기준으로 index 다시 구하기
          const highlightIndex = stores.showTreeStore
            .map(node => node.index)
            .indexOf(highlightNode.index);
          if (pageInfo.usePage && !pageInfo.isInfinite) {
            const page = Math.ceil(highlightIndex / pageInfo.perPage);
            pageInfo.highlightPage = highlightIndex === pageInfo.perPage ? page + 1 : page || 1;
            // 페이지 이동
            if (pageInfo.highlightPage !== pageInfo.currentPage) {
              pageInfo.currentPage = pageInfo.highlightPage;
              pageInfo.isHighlight = true;
              return;
            }
          }
          elementInfo.body.scrollTop = resizeInfo.rowHeight * highlightIndex;
        }
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
      () => props.rows,
      (newData) => {
        stores.treeRows = newData;
        stores.treeStore = setTreeNodeStore();
        onResize();
      }, { deep: true },
    );
    watch(
      () => stores.treeStore.length,
      () => {
        checkHeader(stores.store);
      },
    );
    watch(
      () => [props.width, props.height, props.option.columnWidth],
      (value) => {
        resizeInfo.columnWidth = value[3];
        stores.orderedColumns.map((column) => {
          const item = column;

          if (!props.columns[column.index]?.width && !item.resized) {
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
        nextTick(() => {
          if (value !== undefined) {
            onSearch(value?.value ?? value);
            if (pageInfo.isClientPaging) {
              clearCheckInfo();
              clearSelectInfo();
            }
          }
        });
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
            const highlightIndex = stores.pagingStore
              .map(node => node.index)
              .indexOf(styleInfo.highlightIdx);
            elementInfo.body.scrollTop = resizeInfo.rowHeight * highlightIndex;
            pageInfo.isHighlight = !pageInfo.isHighlight;
          }
        });
      },
    );

    const isSortedColumn = column => sortInfo.sortField === column.field;

    const sortIconClass = () => ({
      'column-sort__icon': true,
      'column-sort__icon--asc': sortInfo.sortOrder === 'asc',
      'column-sort__icon--desc': sortInfo.sortOrder === 'desc',
    });

    const gridStyle = computed(() => ({
      width: resizeInfo.gridWidth,
      height: resizeInfo.gridHeight,
    }));
    const bodyStyle = computed(() => ({
      'table-body': true,
      stripe: styleInfo.stripeStyle,
      'bottom-border': !!stores.viewStore.length,
      'non-border': !!styleInfo.borderStyle,
    }));
    const gridClass = computed(() => ({
      table: true,
      'ev-grid': true,
      'ev-tree-grid': true,
      adjust: resizeInfo.adjust,
      'non-header': !styleInfo.showHeader,
      'ev-tree-grid--empty': !stores.viewStore.length,
    }));
    const headerClass = computed(() => ({
      'table-header': true,
      'non-border': !!styleInfo.borderStyle,
    }));
    const headerCheckboxClass = computed(() => ({
      column: true,
      'checkbox-all': true,
      'non-border': !!styleInfo.borderStyle,
    }));
    const isHeaderCheckbox = computed(() => (
      checkInfo.useCheckbox.use
      && checkInfo.useCheckbox.headerCheck
      && checkInfo.useCheckbox.mode !== 'single'
    ));
    const getColumnClass = (column) => {
      const render = isRenderer(column);
      return {
        column: true,
        render,
        'non-border': !!styleInfo.borderStyle,
        [column.field]: column.field,
      };
    };
    const getColumnStyle = (column, index) => {
      const render = isRenderer(column);
      return {
        width: `${column.width}px`,
        'min-width': render ? `${resizeInfo.rendererMinWidth}px;` : `${resizeInfo.minWidth}px`,
        'margin-right': (stores.orderedColumns.length - 1 === index
          && scrollInfo.hasVerticalScrollBar
          && scrollInfo.hasHorizontalScrollBar) ? `${resizeInfo.scrollWidth}px` : '0px',
        'border-right': stores.orderedColumns.length - 1 === index ? 'none' : '1px solid #CFCFCF',
      };
    };
    const getSlotName = column => `${column}Node`;

    return {
      summaryScroll,
      gridStyle,
      gridClass,
      headerClass,
      headerCheckboxClass,
      isHeaderCheckbox,
      bodyStyle,
      useSummary,
      useGridSetting,
      toolbarRef,
      stores,
      emptyText,
      ...toRefs(styleInfo),
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(filterInfo),
      ...toRefs(scrollInfo),
      ...toRefs(resizeInfo),
      ...toRefs(selectInfo),
      ...toRefs(checkInfo),
      ...toRefs(sortInfo),
      ...toRefs(contextInfo),
      ...toRefs(pageInfo),
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
      setContextMenu,
      onContextMenu,
      onSearch,
      handleExpand,
      getColumnClass,
      getColumnStyle,
      getSlotName,
      setGridSetting,
      onApplyColumn,
      onColumnContextMenu,
      onSort,
      isSortedColumn,
      sortIconClass,
    };
  },
};
</script>

<style lang="scss" scoped>
@import './style/treeGrid.scss';
</style>
