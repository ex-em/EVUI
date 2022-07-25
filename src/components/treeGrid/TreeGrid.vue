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
            :style="`width: ${minWidth}px;`"
          >
            <ev-checkbox
              v-if="isHeaderCheckbox"
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
              :class="getColumnClass(column)"
              :style="getColumnStyle(column, index)"
            >
              <!-- Column Name -->
              <span
                :title="column.caption"
                class="column-name"
              >
                {{ column.caption }}
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
        <table ref="grid-table">
          <tbody>
            <tree-grid-node
              v-for="(node, idx) in viewStore"
              :key="idx"
              :selected-data="selectedRow"
              :node-data="node"
              :use-checkbox="useCheckbox"
              :ordered-columns="orderedColumns"
              :expand-icon="option.expandIcon"
              :collapse-icon="option.collapseIcon"
              :parent-icon="option.parentIcon"
              :child-icon="option.childIcon"
              :is-resize="isResize"
              :row-height="rowHeight"
              :min-width="minWidth"
              :highlight-index="highlightIdx"
              :border-style="borderStyle"
              @check-tree-data="onCheck"
              @expand-tree-data="handleExpand"
              @click-tree-data="onRowClick"
              @dbl-click-tree-data="onRowDblClick"
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
            </tree-grid-node>
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
</template>

<script>
import { reactive, toRefs, computed, watch, onMounted, onActivated, nextTick, ref } from 'vue';
import treeGridNode from './TreeGridNode';
import Toolbar from './treeGrid.toolbar';
import GridPagination from '../grid/grid.pagination';
import GridSummary from '../grid/grid.summary';
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
} from './uses';

export default {
  name: 'EvTreeGrid',
  components: {
    treeGridNode,
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
    'click-row': null,
    'dblclick-row': null,
    'update:checked': null,
    'check-row': null,
    'check-all': null,
    'page-change': null,
  },
  setup(props) {
    const useSummary = computed(() => (props.option?.useSummary || false));
    const elementInfo = reactive({
      body: null,
      header: null,
      resizeLine: null,
      'grid-wrapper': null,
      'grid-table': null,
    });
    const filterInfo = reactive({
      isSearch: false,
      searchWord: '',
    });
    const stores = reactive({
      treeStore: [],
      viewStore: [],
      filterStore: [],
      pagingStore: [],
      treeRows: props.rows,
      searchStore: computed(() => stores.treeStore.filter(item => item.isFilter)),
      showTreeStore: computed(() => stores.treeStore.filter(item => item.show)),
      orderedColumns: computed(() =>
        props.columns.map((column, index) => ({ index, ...column }))),
      store: computed(() => (filterInfo.isSearch ? stores.searchStore : stores.treeStore)),
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
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      customContextMenu: props.option.customContextMenu || [],
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
      checkInfo.checkedRows.length = 0;
      stores.store.forEach((row) => {
        row.checked = false;
      });
    };
    const {
      getPagingData,
      updatePagingInfo,
      changePage,
    } = pagingEvent({
      stores,
      pageInfo,
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
    });

    const {
      setContextMenu,
      onContextMenu,
    } = contextMenuEvent({ contextInfo, stores, selectInfo });

    const {
      setTreeNodeStore,
      handleExpand,
    } = treeEvent({ stores, onResize });

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

    onMounted(() => {
      stores.treeStore = setTreeNodeStore();
    });
    onActivated(() => {
      onResize();
    });

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
      stores,
      ...toRefs(styleInfo),
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(filterInfo),
      ...toRefs(scrollInfo),
      ...toRefs(resizeInfo),
      ...toRefs(selectInfo),
      ...toRefs(checkInfo),
      ...toRefs(contextInfo),
      ...toRefs(pageInfo),
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
    };
  },
};
</script>

<style lang="scss" scoped>
@import './style/treeGrid.scss';
</style>
