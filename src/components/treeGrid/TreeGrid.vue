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
          :item="{
            onSearch,
          }"
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
    :style="gridStyle"
  >
    <!--Table-->
    <div
      v-cloak
      ref="grid"
      :class="gridClass"
    >
      <!--Header-->
      <div
        v-show="showHeader"
        ref="header"
        :class="headerClass"
      >
        <ul class="column-list">
          <!--Header Checkbox-->
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
          <!--Column List-->
          <template
            v-for="(column, index) in orderedColumns"
            :key="index"
          >
            <li
              v-if="!column.hide"
              :data-index="index"
              :class="getColumnClass(column)"
              :style="getColumnStyle(column)"
            >
              <!--Column Name-->
              <span
                :title="column.caption"
                class="column-name"
              >
                {{ column.caption }}
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
        :class="bodyStyle"
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
              <!-- cell renderer -->
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
                  <span :title="node[column.field]">{{node[column.field]}}</span>
                </template>
              </template>
            </tree-grid-node>
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
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed, watch } from 'vue';
import treeGridNode from './TreeGridNode';
import Toolbar from './treeGrid.toolbar';
import {
  commonFunctions,
  scrollEvent,
  resizeEvent,
  clickEvent,
  checkEvent,
  contextMenuEvent,
  treeEvent,
  filterEvent,
} from './uses';

export default {
  name: 'EvTreeGrid',
  components: {
    treeGridNode,
    Toolbar,
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
      type: [Array, Object],
      default: null,
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
  },
  setup(props) {
    const {
      isRenderer,
      getComponentName,
      getConvertValue,
      getColumnIndex,
      setPixelUnit,
    } = commonFunctions();
    const elementInfo = reactive({
      body: null,
      header: null,
      resizeLine: null,
      'grid-wrapper': null,
    });
    const stores = reactive({
      treeStore: [],
      viewStore: [],
      filterStore: [],
      treeRows: props.rows,
      showTreeStore: computed(() => stores.treeStore.filter(item => item.show)),
      orderedColumns: computed(() =>
        props.columns.map((column, index) => ({ index, ...column }))),
    });
    const checkInfo = reactive({
      prevCheckedRow: [],
      isHeaderChecked: false,
      checkedRows: props.checked,
      useCheckbox: computed(() => props.option.useCheckbox || {}),
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
    const contextInfo = reactive({
      menu: null,
      contextMenuItems: [],
      customContextMenu: props.option.customContextMenu || [],
    });
    const resizeInfo = reactive({
      minWidth: 40,
      rendererMinWidth: 80,
      showResizeLine: false,
      adjust: computed(() => props.option.adjust || false),
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
      highlightIdx: computed(() => props.option.style?.highlight),
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
    } = checkEvent({ checkInfo, stores });

    const {
      calculatedColumn,
      onResize,
      onShow,
      onColumnResize,
    } = resizeEvent({ resizeInfo, elementInfo, checkInfo, stores, isRenderer, updateVScroll });

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
    } = filterEvent({ stores, getConvertValue, calculatedColumn, updateVScroll });

    watch(
      () => props.checked,
      (value) => {
        const store = stores.treeStore;
        checkInfo.isHeaderChecked = false;
        checkInfo.checkedRows = value;
        for (let ix = 0; ix < store.length; ix++) {
          store[ix].checked = value.includes(store[ix]);
        }
        if (value.length && store.length === value.length) {
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
    stores.treeStore = setTreeNodeStore();

    watch(
      () => props.rows,
      (newData) => {
        stores.treeRows = newData;
        stores.treeStore = setTreeNodeStore();
        onResize();
        updateVScroll();
      }, { deep: true },
    );
    watch(
      () => [props.width, props.height, resizeInfo.adjust, props.option.columnWidth],
      (value) => {
        // columnWidth computed readonly
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
      adjust: resizeInfo.adjust,
      'non-header': !styleInfo.showHeader,
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
    const getColumnStyle = (column) => {
      const render = isRenderer(column);
      return {
        width: `${column.width}px`,
        'min-width': render ? `${resizeInfo.rendererMinWidth}px;` : `${resizeInfo.minWidth}px`,
      };
    };
    const getSlotName = column => `${column}Node`;

    return {
      ...toRefs(styleInfo),
      ...toRefs(elementInfo),
      ...toRefs(stores),
      ...toRefs(scrollInfo),
      ...toRefs(resizeInfo),
      ...toRefs(selectInfo),
      ...toRefs(checkInfo),
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
      setContextMenu,
      onContextMenu,
      onSearch,
      handleExpand,
      gridStyle,
      gridClass,
      headerClass,
      headerCheckboxClass,
      isHeaderCheckbox,
      getColumnClass,
      getColumnStyle,
      getSlotName,
      bodyStyle,
    };
  },
};
</script>

<style lang="scss" scoped>
@import './style/treeGrid.scss';
</style>
