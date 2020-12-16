<template>
  <div class="ev-tree-view">
    <tree-node
      v-for="(item, i) in treeNodeData"
      :key="i"
      :data="item"
      :use-checkbox="useCheckbox"
      :expand-icon="expandIcon"
      :collapse-icon="collapseIcon"
      @update-checked-info="updateCheckedInfo"
      @click-content="clickContent"
      @dblclick-content="dblClickContent"
      @show-context-menu="getContextMenuFlag"
      @contextmenu.prevent="showContextMenu"
    />
    <div v-if="!treeNodeData.length">No data</div>
    <ev-context-menu
      v-if="contextMenuItems.length"
      ref="contextMenu"
      :items="contextMenuItems"
    />
  </div>
</template>

<script>
import { ref, reactive, watch } from 'vue';
import TreeNode from './TreeNode';

export default {
  name: 'EvTree',
  components: { TreeNode },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
    useCheckbox: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: 'No Data',
    },
    expandIcon: {
      type: String,
      default: '',
    },
    collapseIcon: {
      type: String,
      default: '',
    },
    contextMenuItems: {
      type: Array,
      default: () => [],
    },
  },
  emits: {
    'click-content': null,
    'dblclick-content': null,
    'change-checked-node': Array,
  },
  setup(props, { emit }) {
    let treeNodeData = reactive(props.data);
    let allNodeInfo = [];
    const contextMenu = ref(null);
    let contextMenuFlag = false; // flag for showing contextMenu or not

    function updateTreeUp(nodeKey) {
      const parentKey = allNodeInfo[nodeKey].parent;
      if (typeof parentKey === 'undefined') {
        return;
      }
      const node = allNodeInfo[nodeKey].node;
      const parent = allNodeInfo[parentKey].node;
      if (node.checked === parent.checked && node.indeterminate === parent.indeterminate) {
        return; // no need to update upwards
      }

      if (node.checked) {
        parent.checked = parent.children.every(n => n.checked);
        parent.indeterminate = !parent.checked;
      } else {
        const fn = n => n.checked || node.indeterminate;
        parent.checked = false;
        parent.indeterminate = parent.children.some(fn);
      }
      updateTreeUp(parentKey);
    }

    function updateTreeDown(node, changes = {}) {
      /* eslint-disable */
      for (const key in changes) {
        node[key] = changes[key];
      }
      if (node.children) {
        node.children.forEach((child) => {
          updateTreeDown(child, changes);
        });
      }
    }

    function getAllNodeInfo() { // return the array to easily search parents and children
      let keyCounter = 0;
      const flatTree = [];

      function flattenChildren(n, parent) {
        const node = n;
        node.nodeKey = keyCounter++;

        // add 'selected' property for highlighting clicked node
        if ('selected' in node) {
          node.selected = node.selected;
        } else {
          node.selected = false;
        }

        flatTree[node.nodeKey] = { node, nodeKey: node.nodeKey };
        if (typeof parent !== 'undefined') {
          flatTree[node.nodeKey].parent = parent.nodeKey;
          flatTree[parent.nodeKey].children.push(node.nodeKey);
        }
        if (node.children) {
          flatTree[node.nodeKey].children = [];
          node.children.forEach(child => flattenChildren(child, node));
        }
      }

      flattenChildren(treeNodeData[0]);
      return flatTree;
    }

    allNodeInfo = getAllNodeInfo();

    function getCheckedNodes() {
      return allNodeInfo.filter(obj => obj.node.checked).map(obj => obj.node);
    };

    function rebuildTree() { // rebuild the tree through checked nodes
      const checkedNodes = getCheckedNodes();
      checkedNodes.forEach((node) => {
        updateTreeDown(node, { checked: true });
        // propagate upwards
        const parentKey = allNodeInfo[node.nodeKey].parent;
        if (!parentKey && parentKey !== 0) {
          return;
        }
        const parent = allNodeInfo[parentKey].node;
        const childHasCheckSetter = typeof node.checked !== 'undefined' && node.checked;
        if (childHasCheckSetter && parent.checked !== node.checked) {
          updateTreeUp(node.nodeKey); // update tree upwards
        }
      });
    }

    function updateCheckedInfo({ nodeKey, isChecked }) {
      const node = allNodeInfo[nodeKey].node;
      node.checked = isChecked;
      node.indeterminate = false;
      updateTreeUp(nodeKey); // propagate up
      updateTreeDown(node, { checked: isChecked, indeterminate: false }); // reset `indeterminate`
      emit('change-checked-node', getCheckedNodes());
      rebuildTree();
    }

    function clickContent(nodeKey) {
      const clickedNode = allNodeInfo[nodeKey];
      // reset other selected node to false
      allNodeInfo.forEach(item => {
        if (item.node.nodeKey !== nodeKey) {
          item.node.selected = false;
        }
      })
      emit('click-content', clickedNode);
    }

    function dblClickContent(nodeKey) {
      const dbClickedContent = allNodeInfo[nodeKey];
      emit('dblclick-content', dbClickedContent);
    }

    const showContextMenu = (e) => {
      if (props.contextMenuItems.length && contextMenuFlag) {
        contextMenu.value.show(e);
        contextMenuFlag = false; // reset contextmenuFlag
      }
    };

    const getContextMenuFlag = (isShow, e) => {
      contextMenuFlag = isShow;
      showContextMenu(e);
    };

    watch(props.data, (newData) => {
      treeNodeData = newData;
      allNodeInfo = getAllNodeInfo();
    });

    return {
      treeNodeData,
      contextMenu,
      updateCheckedInfo,
      clickContent,
      dblClickContent,
      showContextMenu,
      getContextMenuFlag,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>
