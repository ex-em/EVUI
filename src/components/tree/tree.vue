<template>
  <div :class="prefixCls">
    <tree-node
      v-for="(item, i) in stateTree"
      :key="i"
      :data="item"
      :use-checkbox="useCheckbox"
      :children-key="childrenKey"
      :title-key="titleKey"
      :expand-icon="expandIcon"
      :collapse-icon="collapseIcon"
    />
    <div v-if="!stateTree.length" :class="[prefixCls + '-empty']">
      {{ emptyText }}
    </div>
    <ev-context-menu
      ref="contextmenu"
      :is-use="showContextmenu"
      :items="menuItems"
      @click="selectContextmenu"
      @on-context-menu="initShowContextmenu"
    />
  </div>
</template>
<script>
import TreeNode from './tree-node';

const prefixCls = 'ev-tree';

export default {
  name: 'Tree',
  components: {
    TreeNode,
  },
  props: {
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    useCheckbox: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: 'No Data',
    },
    childrenKey: {
      type: String,
      default: 'children',
    },
    loadData: {
      type: Function,
      default: null,
    },
    render: {
      type: Function,
      default: null,
    },
    menuItems: {
      type: Array,
      default() {
         return [];
      },
    },
    titleKey: {
      type: String,
      default: 'title',
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
  data() {
    return {
      prefixCls,
      stateTree: this.data,
      flatState: [],
      showContextmenu: false,
    };
  },
  watch: {
    data: {
      deep: true,
      handler() {
        this.stateTree = this.data;
        this.flatState = this.compileFlatState();
        this.rebuildTree();
      },
    },
  },
  created() {
    this.flatState = this.compileFlatState();
    this.rebuildTree();
  },
  mounted() {
    this.$on('on-click-checkbox', this.handleCheck);
    this.$on('on-selected', this.handleSelect);
    this.$on('on-dbl-click', this.handleDblclick);
    this.$on('on-context-menu', this.handleContextmenu);
    this.$on('toggle-expand', node => this.$emit('on-toggle-expand', node));
  },
  methods: {
    compileFlatState() { // so we have always a relation parent/children of each node
      let keyCounter = 0;
      const childrenKey = this.childrenKey;
      const flatTree = [];
      function flattenChildren(n, parent) {
        const node = n;
        node.nodeKey = keyCounter++;
        flatTree[node.nodeKey] = { node, nodeKey: node.nodeKey };
        if (typeof parent !== 'undefined') {
          flatTree[node.nodeKey].parent = parent.nodeKey;
          flatTree[parent.nodeKey][childrenKey].push(node.nodeKey);
        }
        if (node[childrenKey]) {
          flatTree[node.nodeKey][childrenKey] = [];
          node[childrenKey].forEach(child => flattenChildren(child, node));
        }
      }
      this.stateTree.forEach((rootNode) => {
        flattenChildren(rootNode);
      });
      return flatTree;
    },
    rebuildTree() { // only called when `data` prop changes
      const checkedNodes = this.getCheckedNodes();
      checkedNodes.forEach((node) => {
        this.updateTreeDown(node, { checked: true });
        // propagate upwards
        const parentKey = this.flatState[node.nodeKey].parent;
        if (!parentKey && parentKey !== 0) {
          return;
        }
        const parent = this.flatState[parentKey].node;
        const childHasCheckSetter = typeof node.checked !== 'undefined' && node.checked;
        if (childHasCheckSetter && parent.checked !== node.checked) {
          this.updateTreeUp(node.nodeKey); // update tree upwards
        }
      });
    },
    updateTreeUp(nodeKey) {
      const parentKey = this.flatState[nodeKey].parent;
      if (typeof parentKey === 'undefined') {
        return;
      }
      const node = this.flatState[nodeKey].node;
      const parent = this.flatState[parentKey].node;
      if (node.checked === parent.checked && node.indeterminate === parent.indeterminate) {
        return; // no need to update upwards
      }
      if (node.checked === true) {
        this.$set(parent, 'checked', parent[this.childrenKey].every(n => n.checked));
        this.$set(parent, 'indeterminate', !parent.checked);
      } else {
        this.$set(parent, 'checked', false);
        this.$set(parent, 'indeterminate', parent[this.childrenKey].some(n => n.checked || node.indeterminate));
      }
      this.updateTreeUp(parentKey);
    },
    updateTreeDown(node, changes = {}) {
      /* eslint-disable */
      for (const key in changes) {
        this.$set(node, key, changes[key]);
      }
      /* eslint-enable */
      if (node[this.childrenKey]) {
        node[this.childrenKey].forEach((child) => {
          this.updateTreeDown(child, changes);
        });
      }
    },
    getSelectedNodes() {
      /* public API */
      return this.flatState.filter(obj => obj.node.selected).map(obj => obj.node);
    },
    getCheckedNodes() {
      /* public API */
      return this.flatState.filter(obj => obj.node.checked).map(obj => obj.node);
    },
    handleSelect(nodeKey) {
      const node = this.flatState[nodeKey].node;
      const currentSelectedKey = this.flatState.findIndex(obj => obj.node.selected);
      let beforeSelectedNode = null;
      if (currentSelectedKey >= 0 && currentSelectedKey !== nodeKey) {
        beforeSelectedNode = this.flatState[currentSelectedKey].node;
        this.$set(beforeSelectedNode, 'selected', false);
      }
      this.$set(node, 'selected', !node.selected);
      this.$emit('on-select', this.getSelectedNodes(), beforeSelectedNode);
      this.$emit('on-click', node);
    },
    handleDblclick(nodeKey) {
      const node = this.flatState[nodeKey].node;
      this.$emit('on-dblclick', node);
    },
    handleCheck({ checked, nodeKey }) {
      const node = this.flatState[nodeKey].node;
      this.$set(node, 'checked', checked);
      this.$set(node, 'indeterminate', false);
      this.updateTreeUp(nodeKey); // propagate up
      this.updateTreeDown(node, { checked, indeterminate: false }); // reset `indeterminate`
      this.$emit('on-check-change', this.getCheckedNodes());
    },
    handleContextmenu(nodeKey) {
      const node = this.flatState[nodeKey].node;
      this.$emit('before-contextmenu', node);
      this.showContextmenu = true;
    },
    selectContextmenu(item) {
      this.$emit('select-contextmenu', item);
      this.$refs.contextmenu.hide();
    },
    initShowContextmenu() {
      this.showContextmenu = false;
    },
  },
};
</script>
<style lang="scss">
.ev-tree {
  li {
    ul {
      margin: 0;
      padding: 0 0 0 18px;
    }
  }
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 12px;
    li {
      list-style: none;
      margin: 8px 0;
      padding: 0;
      white-space: nowrap;
      outline: 0;
      text-align: start;
    }
  }
}
.ev-tree-arrow {
  float: left;
  cursor: pointer;
  width: 12px;
  height: 12px;
  text-align: center;
  display: inline-block;
  margin-right: 5px;
  i {
    transition: all .2s ease-in-out;
    font-size: 12px;
    vertical-align: middle;
  }
}
.ev-tree-title {
  border-radius: 3px;
  cursor: pointer;
  vertical-align: middle;
  padding: 0 4px;
  user-select: none;
  &:hover {
    background-color: #eaf4fe;
  }
}
.ev-tree-title-selected, .ev-tree-title-selected:hover {
  background-color: #d5e8fc;
}
.ev-tree-icon {
  vertical-align: middle;
}
</style>
