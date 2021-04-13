<template>
  <tr
    :class="{
      'tree-row': true,
      row: true,
      'non-border': !!borderStyle && borderStyle !== 'rows',
    }"
    @click="onClick($event, node)"
    @dblclick="onDblClick($event, node)"
  >
    <td
      v-if="useCheckbox.use"
      :class="{
        'row-checkbox': true,
        'non-border': !!borderStyle,
      }"
      :style="`width: ${minWidth}px; height: ${rowHeight}px;`"
    >
      <ev-checkbox
        v-model="node.checked"
        class="row-checkbox-input"
        @change="onCheck($event, node)"
      />
    </td>
    <template
      v-for="(column, cellIndex) in orderedColumns"
      :key="cellIndex"
    >
      <td
        v-if="!column.hide"
        :data-name="column.field"
        :data-index="column.index"
        :class="{
          'tree-td': cellIndex === 0,
          [column.type]: column.type,
          [column.align]: column.align,
          // render: isRenderer(column),
          'non-border': !!borderStyle,
        }"
        :style="`
          width: ${column.width}px;
          height: ${rowHeight}px;
          line-height: ${rowHeight}px;
          min-width: ${minWidth}px;`"
      >
        <span
          title=""
        >
          <span
            v-if="cellIndex === 0"
            :style="`margin-left: ${node.level * 13}px`"
          >
          </span>
          <span
            v-if="cellIndex === 0"
            :class="{
              expand: node.expand,
              'ev-tree-toggle': true
            }"
          >
            <template v-if="expandIconClasses(node)">
              <ev-icon
                v-if="cellIndex === 0 && node.hasChild"
                :icon="expandIconClasses(node)"
                @click="onExpand(node)"
              />
              <i></i>
            </template>
            <template v-else>
              <button
                v-if="cellIndex === 0 && node.hasChild"
                class="tree-expand-icon"
                @click="onExpand(node)"
              >
                <i></i>
              </button>
            </template>
          </span>
          <span
            v-if="cellIndex === 0 && isDataIcon"
            :class="{
              expand: node.expand,
              'ev-tree-toggle': true,
            }"
          >
            <span
              v-if="cellIndex === 0"
              :class="node.hasChild ? parentIconMV : childIconMV"
            ><i></i></span>
          </span>
          <span style="margin-left: 5px;"></span>{{node[column.field]}}
        </span>
      </td>
    </template>
  </tr>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EvTreeGrid',
  props: {
    treeData: {
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
    isHighlighted: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'check-tree-data': null,
    'expand-tree-data': null,
    'click-tree-data': null,
    'dbl-click-tree-data': null,
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
    const expandIconClasses = (node) => {
      const expandIcon = props.expandIcon ? props.expandIcon : '';
      const collapseIcon = props.expandIcon ? props.collapseIcon : '';
      return node.expand ? collapseIcon : expandIcon;
    };
    const node = computed(() => (props.treeData || {}));
    const parentIconMV = computed(() => (props.parentIcon || 'tree-parent-icon'));
    const childIconMV = computed(() => (props.childIcon || 'tree-child-icon'));
    const isDataIcon = computed(() => ((parentIconMV.value !== 'none' || childIconMV.value !== 'none')));
    return {
      onCheck,
      onExpand,
      onClick,
      onDblClick,
      expandIconClasses,
      parentIconMV,
      childIconMV,
      node,
      isDataIcon,
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
    background: url('../../../docs/views/treeGrid/images/tree_icon.png') no-repeat -43px -61px;
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
    background: url('../../../docs/views/treeGrid/images/tree_icon.png') no-repeat -39px -35px;
  }
  &.expand > .tree-parent-icon i {
    background-position: -65px -35px;
  }
  .tree-child-icon i {
    background: url('../../../docs/views/treeGrid/images/tree_icon.png') no-repeat -14px -35px;
  }
}
</style>
