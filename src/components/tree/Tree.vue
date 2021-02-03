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
      @click-node="clickContent"
      @dblclick-node="dblClickContent"
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
import { ref, reactive, watch, onMounted } from 'vue';
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
    searchWord: {
      type: String,
      default: '',
    },
  },
  emits: {
    'click-node': null,
    'dblclick-node': null,
    check: Array,
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
      const keys = Object.keys(changes);
      for (let ix = 0; ix < keys.length; ix++) {
        node[keys[ix]] = changes[keys[ix]]; // eslint-disable-line no-param-reassign
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
      const valueArr = [];

      function flattenChildren(n, parent) {
        const node = n;
        node.nodeKey = keyCounter++;

        // add 'selected' property for highlighting clicked node
        if (!('selected' in node)) {
          node.selected = false;
        }

        // add 'visible' property for filtering node
        if (!('visible' in node)) {
          node.visible = true;
        }

        // check 'value' property and add nodeKey if same value already exists
        if ('value' in node && valueArr.includes(node.value)) {
          console.warn('The \'value\' of data should be unique.');
          node.value += node.nodeKey;
        } else if (!('value' in node)) {
          node.value = node.title + node.nodeKey;
        }
        valueArr.push(node.value);

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
    }

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
      const checkedNodes = allNodeInfo.filter(obj => obj.node.checked)
        .map(obj => ({
            title: obj.node.title,
            value: obj.node.value,
          }));
      emit('check', checkedNodes);
      rebuildTree();
    }

    function clickContent(nodeKey) {
      const clickedNode = allNodeInfo[nodeKey].node;
      // reset other selected node to false
      for (let ix = 0; ix < allNodeInfo.length; ix++) {
        if (allNodeInfo[ix].node.nodeKey !== nodeKey) {
          allNodeInfo[ix].node.selected = false;
        }
      }
      emit('click-node', { title: clickedNode.title, value: clickedNode.value });
    }

    function dblClickContent(nodeKey) {
      const dbClickedContent = allNodeInfo[nodeKey].node;
      emit('dblclick-node', { title: dbClickedContent.title, value: dbClickedContent.value });
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

    function makeChildrenInvisible(node) {
      if (node.children) {
        node.children.forEach((child) => {
          child.visible = false; // eslint-disable-line no-param-reassign
          makeChildrenInvisible(child);
        });
      }
    }

    function makeParentVisible(parentKey) {
      if (!parentKey && parentKey !== 0) {
        return;
      }

      const parent = allNodeInfo[parentKey];
      parent.node.visible = true;
      if (parent.parent !== undefined) {
        makeParentVisible(parent.parent);
      }
    }

    function filterNode(value) {
      allNodeInfo.forEach((nodeObj) => {
        const node = nodeObj.node;
        node.visible = false;
      });

      const filteredNodes = allNodeInfo.filter(nodeObj => nodeObj.node.title.includes(value));

      filteredNodes.forEach((nodeObj) => {
        const node = nodeObj.node;
        node.visible = true;
        // make children invisible, traverse down
        makeChildrenInvisible(node);
        // make parent visible, traverse up
        const parentKey = allNodeInfo[node.nodeKey].parent;
        makeParentVisible(parentKey);
      });
    }

    watch(props.data, (newData) => {
      treeNodeData = newData;
      allNodeInfo = getAllNodeInfo();
    });


    watch(() => props.searchWord, (newSearchWord) => {
      if (newSearchWord) {
        filterNode(newSearchWord);
      } else {
        allNodeInfo.forEach((nodeObj) => {
          const node = nodeObj.node;
          node.visible = true;
        });
      }
    });

    onMounted(() => {
      rebuildTree();
      const checkedNodes = getCheckedNodes();
      if (checkedNodes.length) {
        emit('check', checkedNodes.map(node => ({
          title: node.title,
          value: node.value,
        })));
      }
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

<style lang="scss">
</style>
