<template>
  <tr
    :data-index="node.index"
    :class="getRowClass(node)"
    @click="onClick($event, node)"
    @dblclick="onDblClick($event, node)"
  >
    <td
      v-if="useCheckbox.use"
      :class="checkboxClass"
      :style="{
        width: `${minWidth}px`,
        height: `${rowHeight}px`,
        'border-right': '1px solid #CFCFCF',
      }"
    >
      <ev-checkbox
        v-model="node.checked"
        :disabled="node.uncheckable"
        :indeterminate="node.indeterminate"
        class="row-checkbox-input"
        @change="onCheck($event, node)"
      />
    </td>
    <template
      v-for="(column, cellIndex) in orderedColumns"
      :key="cellIndex"
    >
      <td
        v-if="!column.hide && !column.hiddenDisplay"
        :data-name="column.field"
        :data-index="node.index"
        :class="getColumnClass(column, cellIndex)"
        :style="getColumnStyle(column, cellIndex)"
      >
        <div class="td-content__wrapper">
          <!--Level Depth-->
          <span
            v-if="cellIndex === expandColumnIdx"
            :style="getDepthStyle(node.level)"
          >
          </span>
          <!--Expand Icon-->
          <span
            v-if="cellIndex === expandColumnIdx"
            :class="{
              expand: node.expand,
              'ev-tree-toggle': true
            }"
          >
            <template v-if="node.hasChild">
              <ev-icon
                v-if="expandIconClasses(node)"
                :icon="expandIconClasses(node)"
                style="display: block;"
                @click="onExpand(node)"
              />
              <button
                v-else
                class="tree-expand-icon"
                @click="onExpand(node)"
              >
                <i></i>
              </button>
            </template>
          </span>
          <!--Data Icon-->
          <span
            v-if="cellIndex === expandColumnIdx && isDataIcon"
            :title="node[column.field]"
            :class="{
              expand: node.expand,
              'ev-tree-toggle': true,
            }"
          >
            <span
              :class="node.hasChild ? parentIconMV : childIconMV"
            >
              <i></i>
            </span>
          </span>
          <div class="td-content">
          <!-- cell renderer -->
          <template v-if="!!$slots[column.field + 'Node']">
            <slot
              :name="column.field + 'Node'"
              :item="{
                data: node.data,
              }"
            />
          </template>
          </div>
        </div>
      </td>
    </template>
    <!-- Row Contextmenu Button -->
    <td
      v-if="customContextMenu?.length"
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
      <template v-if="$slots.contextmenuIconNode">
        <span
          class="row-contextmenu__btn"
          @click="onContextMenu($event)"
          @click.prevent="menuRef.show"
        >
          <slot
            name="contextmenuIconNode"
          />
        </span>
      </template>
      <template v-else>
        <grid-option-button
          icon="ev-icon-warning2"
          class="row-contextmenu__btn"
          @click="onContextMenu($event)"
          @click.prevent="menuRef.show"
        />
      </template>
    </td>
  </tr>
</template>

<script>
import { computed } from 'vue';
import GridOptionButton from '@/components/grid/icon/icon-option-button.vue';

export default {
  name: 'TreeGridNode',
  components: { GridOptionButton },
  props: {
    dataIndex: {
      type: Number,
      default: 0,
    },
    nodeData: {
      type: Object,
      default: () => ({}),
    },
    selectedData: {
      type: Object,
      default: () => ({}),
    },
    useCheckbox: {
      type: Object,
      default: () => ({}),
    },
    orderedColumns: {
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
    parentIcon: {
      type: String,
      default: '',
    },
    childIcon: {
      type: String,
      default: '',
    },
    customContextMenu: {
      type: [Array],
      default: () => [],
    },
    menuRef: {
      type: Object,
      default: null,
    },
    rowHeight: {
      type: Number,
      default: 35,
    },
    minWidth: {
      type: Number,
      default: 40,
    },
    borderStyle: {
      type: String,
      default: '',
    },
    highlightIndex: {
      type: Number,
      default: -1,
    },
  },
  emits: {
    'check-tree-data': null,
    'expand-tree-data': null,
    'click-tree-data': null,
    'dbl-click-tree-data': null,
    'context-menu': null,
  },
  setup(props, { emit }) {
    const onCheck = ($event, data) => {
      emit('check-tree-data', $event, data);
    };
    const onExpand = (data) => {
      emit('expand-tree-data', data);
    };
    const onClick = ($event, data) => {
      emit('click-tree-data', $event, data);
    };
    const onDblClick = ($event, data) => {
      emit('dbl-click-tree-data', $event, data);
    };
    const onContextMenu = ($event) => {
      emit('context-menu', $event);
    };
    const expandIconClasses = (node) => {
      const expandIcon = props.expandIcon ? props.expandIcon : '';
      const collapseIcon = props.expandIcon ? props.collapseIcon : '';
      return node.expand ? collapseIcon : expandIcon;
    };
    const node = computed(() => (props.nodeData || {}));
    const parentIconMV = computed(() => (props.parentIcon || 'tree-parent-icon'));
    const childIconMV = computed(() => (props.childIcon || 'tree-child-icon'));
    const isDataIcon = computed(() => ((parentIconMV.value !== 'none' || childIconMV.value !== 'none')));

    const expandColumnIdx = computed(() => {
      const expandColumnIndex = props.orderedColumns.findIndex(v => v.expandColumn);
      return expandColumnIndex > 0 ? expandColumnIndex : 0;
    });
    const getRowClass = nodeInfo => ({
      row: true,
      'tree-row': true,
      [`tree-row--level-${nodeInfo?.level}`]: true,
      highlight: nodeInfo?.index === props.highlightIndex,
      selected: nodeInfo.selected,
      'non-border': !!props.borderStyle && props.borderStyle !== 'rows',
    });
    const checkboxClass = computed(() => ({
      cell: true,
      'row-checkbox': true,
      'non-border': !!props.borderStyle,
    }));
    const getColumnClass = (column, cellIndex) => ({
      cell: true,
      'tree-td': cellIndex === 0,
      [column.type]: column.type,
      [column.align]: column.align,
      'non-border': !!props.borderStyle,
    });
    const getColumnStyle = (column, cellIndex) => ({
      width: `${column.width}px`,
      height: `${props.rowHeight}px`,
      'line-height': `${props.rowHeight}px`,
      'min-width': `${props.minWidth}px`,
      'border-right': props.orderedColumns.length - 1 === cellIndex
        ? 'none' : '1px solid #CFCFCF',
    });
    const getDepthStyle = (nodeLevel) => {
      const depthSize = nodeLevel * 13;
      return {
        'margin-left': `${depthSize}px`,
      };
    };
    return {
      parentIconMV,
      childIconMV,
      node,
      isDataIcon,
      checkboxClass,
      expandColumnIdx,
      onCheck,
      onExpand,
      onClick,
      onDblClick,
      onContextMenu,
      expandIconClasses,
      getRowClass,
      getColumnClass,
      getColumnStyle,
      getDepthStyle,
    };
  },
};
</script>

<style lang="scss" scoped>
@import './style/treeGrid.scss';
.ev-tree-toggle {
  display: inline-block;
  width: 13px;
  margin-right: 4px;
  text-align: center;
  vertical-align: middle;
  .tree-expand-icon {
    border: none;
    background: transparent;
    outline: none;
    cursor: pointer;
  }
  .tree-expand-icon i {
    display: inline-block;
    top: -3px;
    width: 11px;
    height: 10px;
    background: url('icon/icon-tree.png') no-repeat -43px -61px;
  }
  &.expand > .tree-expand-icon i {
    height: 8px;
    background-position: -15px -63px;
  }
  .tree-parent-icon i, .tree-child-icon i {
    display: inline-block;
    top: -3px;
    width: 14px;
    height: 14px;
  }
  .tree-parent-icon i {
    background: url('icon/icon-tree.png') no-repeat -39px -35px;
  }
  &.expand > .tree-parent-icon i {
    background-position: -65px -35px;
  }
  .tree-child-icon i {
    background: url('icon/icon-tree.png') no-repeat -14px -35px;
  }
}
.td-content {
  position: relative;
  flex: 1;
}
</style>
