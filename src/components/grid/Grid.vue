<template>
  <div
    ref="grid-wrapper"
    v-resize="onResize"
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
                @click.stop="onSort(column.field)"
              >
                {{ column.caption }}
              </span>
              <!--Sort Icon-->
              <ev-icon
                v-if="sortField === column.field"
                :icon="`${sortOrder === 'desc' ? 'ev-icon-triangle-down' : 'ev-icon-triangle-up'}`"
              />
              <!--Filter Button-->
              <span
                v-if="isFiltering"
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
          <template v-if="isTreeGrid">
            <tree-grid
              v-for="(item, idx) in viewStore"
              :key="idx"
              :data-index="idx"
              :tree-data="item"
              :use-checkbox="useCheckbox"
              :ordered-columns="orderedColumns"
              :expand-icon="option.expandIcon"
              :collapse-icon="option.collapseIcon"
              :parent-icon="option.parentIcon"
              :child-icon="option.childIcon"
              :is-resize="isResize"
              :row-height="rowHeight"
              :min-width="minWidth"
              :is-highlighted="idx === highlightIdx"
              :border-style="borderStyle"
              @check-tree-data="onCheck"
              @expand-tree-data="handleExpand"
              @click-tree-data="onRowClick"
              @dbl-click-tree-data="onRowDblClick"
            />
          </template>
          <template v-else>
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
                  [column.type]: column.type,
                  [column.align]: column.align,
                  render: isRenderer(column),
                  'non-border': !!borderStyle,
                }"
                  :style="`
                  width: ${column.width}px;
                  height: ${rowHeight}px;
                  line-height: ${rowHeight}px;
                  min-width: ${isRenderer(column) ? rendererMinWidth : minWidth}px;`"
                >
                  <component
                    :is="getComponentName(column.render.type)"
                    v-if="isRenderer(column)"
                    :item="{
                    row: row[2],
                    rowIndex: row[0],
                    cellIndex: column.index,
                    value: row[2][column.index],
                  }"
                    :option="column.render.option"
                    @change-renderer="updateData"
                  />
                  <span
                    v-else
                    :title="getConvertValue(column.type, row[2][column.index])"
                  >
                  {{ getConvertValue(column.type, row[2][column.index]) }}
                </span>
                </td>
              </template>
            </tr>
          </template>
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
import { reactive, toRefs, computed, watch, onMounted } from 'vue';
import FilterWindow from './grid.filter.window';
import CheckboxRenderer from './renderer/checkbox.renderer';
import ButtonRenderer from './renderer/button.renderer';
import InputNumberRenderer from './renderer/inputNumber.renderer';
import SelectRenderer from './renderer/select.renderer';
import ToggleRenderer from './renderer/toggle.renderer';
import TreeGrid from '../treeGrid/TreeGrid';
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
    CheckboxRenderer,
    ButtonRenderer,
    InputNumberRenderer,
    SelectRenderer,
    ToggleRenderer,
    TreeGrid,
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
    treeData: {
      type: [Array],
      default: () => [],
    },
    expandIcon: {
      type: String,
      default: '',
    },
    collapseIcon: {
      type: String,
      default: '',
    },
    isTreeGrid: {
      type: Boolean,
      default: false,
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
    const highlightIdx = computed(() => (props.option.style?.highlight));
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
    });
    const stores = reactive({
      tableData: props.rows,
      viewStore: [],
      originStore: [],
      filteredStore: [],
      store: computed(() =>
        (filterInfo.isFiltering ? stores.filteredStore : stores.originStore)),
      orderedColumns: computed(() =>
        (props.columns.map((column, index) => ({ index, ...column })))),
      treeData: [],
      treeStore: computed(() => (stores.treeData.filter(item => item.show))),
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
    });
    const selectInfo = reactive({
      useSelect: props.option.useSelect === undefined ? true : props.option.useSelect,
      selectedRow: props.selected,
    });
    const sortInfo = reactive({
      setSorting: false,
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
      showResizeLine: false,
      adjust: computed(() => (props.option.adjust || false)),
      columnWidth: props.option.columnWidth || 80,
      scrollWidth: props.option.scrollWidth || 17,
      rowHeight: computed(() =>
        (props.option.rowHeight > rowMinHeight ? props.option.rowHeight : rowMinHeight)),
      gridWidth: computed(() => (props.width ? setPixelUnit(props.width) : '100%')),
      gridHeight: computed(() => (props.height ? setPixelUnit(props.height) : '100%')),
      isResize: false,
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
      setSort,
      setFilter,
      updateVScroll,
    });

    const {
      calculatedColumn,
      onResize,
      onColumnResize,
    } = resizeEvent({ resizeInfo, elementInfo, checkInfo, stores, isRenderer, updateVScroll });

    const {
      setContextMenu,
      onContextMenu,
    } = contextMenuEvent({ contextInfo, stores, filterInfo, selectInfo, setStore });

    onMounted(() => {
      calculatedColumn();
      const data = props.isTreeGrid ? props.treeData : props.rows;
      setStore(data);
    });
    // tree data init
    let index = 0;
    const setTreeData = (treeData, count, isShow, parent) => {
      treeData.forEach((nodeObj) => {
        const node = nodeObj;
        node.level = count;
        node.expand = node.expand === undefined ? true : node.expand;
        node.show = isShow;
        node.checked = false;
        node.index = index++;
        node.parent = parent;
        node.iconClass = 'ev-icon-document';
        stores.treeData.push(node);

        if (node.children && node.children.length > 0) {
          node.hasChild = true;
          node.iconClass = 'ev-icon-folder';
          setTreeData(node.children, node.level + 1, node.show && node.expand, node);
        }
      });
    };
    const setExpandNode = (children, isShow) => {
      children.forEach((nodeObj) => {
        const node = nodeObj;
        node.show = isShow;

        if (node.hasChild) {
          setExpandNode(node.children, node.show && node.expand);
        }
      });
    };
    const handleExpand = (node) => {
      const data = node;
      data.expand = !data.expand;
      setExpandNode(data.children, data.expand);
      stores.viewStore = stores.treeStore;
    };

    watch(
      () => props.treeData,
      (value) => {
        setTreeData(value, 0, true);
      }, { immediate: true },
    );

    watch(
      () => sortInfo.setSorting,
      (value) => {
        if (value) {
          setStore(stores.originStore, false);
          sortInfo.setSorting = !value;
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
        const data = props.isTreeGrid ? props.treeData : value;
        setStore(data);
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
        stores.filteredStore = [];
        setStore([], false);
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
      handleExpand,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../../style/index.scss';

.table {
  $header-height: 33px;
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: $header-height;

  &.non-header {
    padding-top: 0;
  }

  .table-header {
    overflow: hidden;
    position: absolute;
    top: 0;
    width: 100%;
    height: $header-height;

    @include evThemify() {
      border-top: 2px solid evThemed('grid-header-border');
      border-bottom: 1px solid evThemed('grid-bottom-border');
    }
  }
}

.column-list {
  position: relative;
  width: 100%;
  height: 100%;
  white-space: nowrap;
  list-style-type: none;
}

.column {
  display: inline-flex;
  position: relative;
  height: 100%;
  padding: 0 10px;
  line-height: 30px;
  justify-content: center;
  align-items: center;
  text-align: center;
  vertical-align: top;
  user-select: none;

  @include evThemify() {
    border-right: 1px solid evThemed('grid-bottom-border');
  }

  &:nth-last-child(1) {
    border-right: 0;
    margin-right: 20px;

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
  .ev-icon-filter {
    font-size: 13px;
    color: #005CC8;
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
  display: none;
  position: absolute;
  right: 0;
  background-color: transparent;
  i {
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
  cursor: pointer;
}

.column-filter-status {
  position: absolute;
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
  bottom: 0;
  right: -5px;
  width: 10px;
  height: 100%;

  &:hover {
    cursor: col-resize;
  }
}

.table-body {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  overflow-anchor: none;

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

  &.bottom-border {
    @include evThemify() {
      border-bottom: 1px solid evThemed('grid-bottom-border');
    }
  }

  .row {
    white-space: nowrap;

    @include evThemify() {
      border-bottom: 1px solid evThemed('grid-bottom-border');
    }

    &.selected {
      @include evThemify() {
        background-color: evThemed('grid-row-selected') !important;
      }
    }

    &.highlight {
      background: #5AB7FF;
      color: #FFFFFF;
      font-size: 16px;
    }
  }

  td {
    display: inline-block;
    padding: 0 10px;
    text-align: center;
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include evThemify() {
      border-right: 1px solid evThemed('grid-bottom-border');
    }

    /* stylelint-disable */
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
    &.tree-td {
      text-align: left !important;
    }
    /* stylelint-enable */
  }
}

.table-resize-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;

  @include evThemify() {
    border-right: 1px solid evThemed('grid-bottom-border');
  }
}

.vscroll-spacer {
  opacity: 0;
  clear: both;
}

[v-cloak] {
  display: none;
}

.ev-checkbox {
  margin: 0;
}

.non-border {
  border: none !important;
}
</style>
