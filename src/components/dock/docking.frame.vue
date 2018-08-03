<template>
  <!-- eslint-disable max-len -->
  <div
    :style="`left: ${getLeft + getLeftPadding}px; top: ${getTop + getTopPadding}px; width: ${getWidth}px; height: ${getHeight}px;`"
    class="dock-frame"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- eslint-enable -->
    <component
      :is="getContents"
    />
    <div
      v-show="showDockIcon"
      class="docking-icon-wrap"
    >
      <div class="docking-icon background"/>
      <div
        class="docking-icon top"
        data-position="top"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="docking-icon right"
        data-position="right"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="docking-icon left"
        data-position="left"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="docking-icon center"
        data-position="center"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="docking-icon bottom"
        data-position="bottom"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
    </div>
    <div
      v-show="showPreview"
      :class="showPreview ? dockingPosition : ''"
      class="preview"
    />
    <div
      v-show="showDockIcon"
      class="preview-guide"
    />
    <div
      v-show="showOptionIcon"
    >
      <div
        ref="detachIcon"
        class="option-icon detach"
        data-icon="detach"
        @click="onDetach"
      />
      <div
        ref="closeIcon"
        class="option-icon close"
        data-icon="close"
        @click="onClose"
      />
    </div>
  </div>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'DockFrame',
    props: {
      options: {
        type: Object,
        default: null,
      },
      padding: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        id: this.options.id,
        dockingPosition: '',
        showPreview: false,
        showDockIcon: false,
        showOptionIcon: false,
      };
    },
    computed: {
      ...mapGetters({
        getNode: 'nodes/getItem',
        getMapData: 'nodes/getMapItem',
        getSplit: 'splitters/getItem',
        getDockWindow: 'windows/getActiveItem',
        getMaxIdSeqForNode: 'nodes/getMaxIdSeq',
        getMaxIdSeqForSplit: 'splitters/getMaxIdSeq',
        getMaxIdSeqForWindow: 'windows/getMaxIdSeq',
      }),
      getContents() {
        return this.options.contents;
      },
      getLevel() {
        return this.options.level;
      },
      getTop() {
        return this.options.top;
      },
      getLeft() {
        return this.options.left;
      },
      getWidth() {
        return this.options.width;
      },
      getHeight() {
        return this.options.height;
      },
      getTopPadding() {
        return this.padding.top;
      },
      getLeftPadding() {
        return this.padding.left;
      },
      getRelationShip() {
        return this.options.rs;
      },
    },
    created() {
      this.$dockBus.$on('restore', (id, type) => {
        if (this.id === id) {
          if (this.options.type !== type) {
            this.onParentAttach();
          } else {
            this.onAttach({ isRestore: true });
          }
        }
      });

      this.$dockBus.$on('showDockIcon', (id) => {
        if (this.id === id) {
          this.showDockIcon = true;
        }
      });

      this.$dockBus.$on('hideDockIcon', (id) => {
        if (this.id === id) {
          this.showDockIcon = false;
        }
      });
    },
    methods: {
      ...mapActions({
        addNode: 'nodes/addNode',
        addMapItem: 'nodes/addMapItem',
        addSplit: 'splitters/addSplitter',
        addWindow: 'windows/addWindow',
        updateSplit: 'splitters/updateSplitter',
        updateSplitRs: 'splitters/updateRelationShip',
        updateNode: 'nodes/updateNode',
        updateMapItem: 'nodes/updateMapItem',
        removeNode: 'nodes/removeNode',
        removeMapItem: 'nodes/removeMapItem',
        removeSplit: 'splitters/removeSplitter',
        removeWindow: 'windows/removeWindow',
      }),
      updateRelationShip(rs, type, position, addRsId) {
        const isNode = String.prototype.split.call(addRsId, '-')[0] === 'node';
        const keys = Object.keys(rs);
        let rsId;
        let key;

        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          key = keys[ix];
          rsId = rs[key];
          if (rsId && isNode) {
            if (type === 'vbox') {
              if (position === 'top') {
                if (key === 'top') {
                  this.updateSplitRs({ id: rsId, rsId: this.id, isRemove: true });
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'left') {
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'right') {
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                }
              } else if (position === 'bottom') {
                if (key === 'left') {
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'right') {
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                } else if (key === 'bottom') {
                  this.updateSplitRs({ id: rsId, rsId: this.id, isRemove: true });
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                }
              }
            } else if (type === 'hbox') {
              if (position === 'left') {
                if (key === 'left') {
                  this.updateSplitRs({ id: rsId, rsId: this.id, isRemove: true });
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'top') {
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'bottom') {
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                }
              } else if (position === 'right') {
                if (key === 'top') {
                  this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
                } else if (key === 'right') {
                  this.updateSplitRs({ id: rsId, rsId: this.id, isRemove: true });
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                } else if (key === 'bottom') {
                  this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
                }
              }
            }
          } else if (rsId && !isNode) {
            if (type === 'vbox') {
              if (key === 'left') {
                this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
              } else if (key === 'right') {
                this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
              }
            } else if (type === 'hbox') {
              if (key === 'top') {
                this.updateSplitRs({ id: rsId, type: 'right', rsId: addRsId });
              } else if (key === 'bottom') {
                this.updateSplitRs({ id: rsId, type: 'left', rsId: addRsId });
              }
            }
          }
        }
      },
      onParentAttach() {
      },
      onAttach({ isRestore }) {
        const window = this.getDockWindow();
        const windowRs = window.rs;
        const position = !isRestore ? this.dockingPosition : windowRs.position;
        const splitId = `split-${this.getMaxIdSeqForSplit() + 1}`;
        let top = this.getTop;
        let left = this.getLeft;
        let width = this.getWidth;
        let height = this.getHeight;
        const level = this.getLevel + 1;
        const rs = this.getRelationShip;
        let splitInfo;
        let type;
        const mapItem = {};
        const addNodeInfo = {
          id: `node-${this.getMaxIdSeqForNode() + 1}`,
          top,
          left,
          width,
          height,
          level,
          contents: window.contents,
          rs: Object.assign({}, rs),
        };

        this.showPreview = false;
        mapItem[addNodeInfo.id] = 'right';
        mapItem[this.id] = 'left';

        if (position === 'top' || position === 'bottom') {
          if (!isRestore) {
            height = (height - 4) / 2;
            addNodeInfo.height = height;
          } else {
            height -= (windowRs.height + 4);
            addNodeInfo.height = windowRs.height;
          }

          type = 'vbox';
          splitInfo = {
            id: splitId,
            top: height + top,
            left,
            width,
            height: 4,
            type,
            rs: {
              left: [],
              right: [],
            },
          };

          this.updateRelationShip(rs, type, position, splitId);
          this.updateRelationShip(rs, type, position, addNodeInfo.id);

          if (position === 'top') {
            top = top + addNodeInfo.height + 4;
            splitInfo.top = top - 4;
            rs.top = splitId;
            addNodeInfo.rs.bottom = splitId;
            splitInfo.rs.left.push(addNodeInfo.id);
            splitInfo.rs.right.push(this.id);
            mapItem[addNodeInfo.id] = 'left';
            mapItem[this.id] = 'right';
          } else {
            addNodeInfo.top = top + height + 4;
            rs.bottom = splitId;
            addNodeInfo.rs.top = splitId;
            splitInfo.rs.left.push(this.id);
            splitInfo.rs.right.push(addNodeInfo.id);
          }
        } else {
          if (!isRestore) {
            width = (width - 4) / 2;
            addNodeInfo.width = width;
          } else {
            width -= (windowRs.width + 4);
            addNodeInfo.width = windowRs.width;
          }

          type = 'hbox';
          splitInfo = {
            id: splitId,
            top,
            left: width + left,
            width: 4,
            height,
            type,
            rs: {
              left: [],
              right: [],
            },
          };

          this.updateRelationShip(rs, type, position, splitId);
          this.updateRelationShip(rs, type, position, addNodeInfo.id);

          if (position === 'left') {
            left = left + addNodeInfo.width + 4;
            splitInfo.left = left - 4;
            rs.left = splitId;
            addNodeInfo.right = splitId;
            splitInfo.rs.left.push(addNodeInfo.id);
            splitInfo.rs.right.push(this.id);
            mapItem[addNodeInfo.id] = 'left';
            mapItem[this.id] = 'right';
          } else {
            addNodeInfo.left = left + width + 4;
            rs.right = splitId;
            addNodeInfo.rs.left = splitId;
            splitInfo.rs.left.push(this.id);
            splitInfo.rs.right.push(addNodeInfo.id);
          }
        }

        addNodeInfo.type = type;
        mapItem.type = type;
        mapItem.splitId = splitId;

        this.removeWindow(window.id);
        this.updateNode({ id: this.id, newItem: { top, left, width, height, type, level, rs } });
        this.addNode(addNodeInfo);
        this.addMapItem({ level, newItem: mapItem });
        this.addSplit(splitInfo);
      },
      onMouseOver({ target }) {
        this.showPreview = true;
        this.dockingPosition = target.dataset.position;
      },
      onMouseOut() {
        this.showPreview = false;
      },
      onMouseEnter() {
        const top = (this.getTop + this.getTopPadding) - 25;
        const left = (this.getLeft + this.getLeftPadding + this.getWidth) - 58;
        const closeIconEl = this.$refs.closeIcon;
        const detachIconiconEl = this.$refs.detachIcon;

        closeIconEl.style.cssText = `top: ${top}px; left: ${left}px;`;
        detachIconiconEl.style.cssText = `top: ${top}px; left: ${left - 60}px;`;

        this.showOptionIcon = true;
      },
      onMouseLeave() {
        this.showOptionIcon = false;
      },
      resizeForRsNodes(parentNode, level, replaceInfo) {
        const childLevel = level + 1;
        const isReplaced = replaceInfo ? replaceInfo.isReplaced : false;
        let childRs = this.getMapData(parentNode.id, childLevel);

        if (!childRs) {
          if (isReplaced) {
            childRs = this.getMapData(replaceInfo.srcId, childLevel);
            if (!childRs) {
              const newItem = Object.assign({}, parentNode);
              if (replaceInfo.srcId === newItem.id) {
                newItem.id = replaceInfo.destId;
              }
              this.updateNode({ id: newItem.id, newItem });
              return;
            }
          } else {
            this.updateNode({ id: parentNode.id, newItem: parentNode });
            return;
          }
        }

        const keys = Object.keys(childRs);
        const type = childRs.type;
        const splitter = this.getSplit(childRs.splitId);
        const top = parentNode.top;
        const left = parentNode.left;
        let width = parentNode.width;
        let height = parentNode.height;
        let leftNode;
        let rightNode;

        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          if (childRs[keys[ix]] === 'left') {
            leftNode = this.getNode(keys[ix]);
          } else if (childRs[keys[ix]] === 'right') {
            rightNode = this.getNode(keys[ix]);
          }
        }

        if (leftNode.left > left || leftNode.left + width > left) {
          leftNode.left = left;
          rightNode.left = left;
        }

        if (leftNode.top > top || leftNode.top + height > top) {
          leftNode.top = top;
          rightNode.top = top;
        }

        if (type === 'hbox') {
          width = (width - 4) / 2;
          splitter.height = height;
          splitter.top = leftNode.top;
          splitter.left = leftNode.left + width;
          rightNode.left = splitter.left + 4;
        } else {
          height = (height - 4) / 2;
          splitter.width = width;
          splitter.left = leftNode.left;
          splitter.top = leftNode.top + height;
          rightNode.top = splitter.top + 4;
        }

        leftNode.level -= 1;
        leftNode.width = width;
        leftNode.height = height;
        rightNode.level -= 1;
        rightNode.width = width;
        rightNode.height = height;

        if (isReplaced) {
          if (leftNode.id === replaceInfo.srcId) {
            this.updateMapItem({
              level: childLevel,
              oldId: leftNode.id,
              newId: replaceInfo.destId,
            });
          } else if (rightNode.id === replaceInfo.srcId) {
            this.updateMapItem({
              level: childLevel,
              oldId: rightNode.id,
              newId: replaceInfo.destId,
            });
          }
        }

        this.updateSplit({ id: splitter.id, newItem: splitter });
        this.resizeForRsNodes(leftNode, childLevel, replaceInfo);
        this.resizeForRsNodes(rightNode, childLevel, replaceInfo);
      },
      onClose() {
        const targetId = this.id;
        const targetLevel = this.getLevel;
        const targetType = this.options.type;
        const targetContents = this.options.contents;
        const targetWidth = this.getWidth;
        const targetHeight = this.getHeight;
        const splitNodeRs = this.getRelationShip;
        const targetNodeRs = this.getMapData(targetId, targetLevel);
        const targetParentNodeRs = this.getMapData(targetId, targetLevel - 1);
        const targetPos = targetNodeRs[targetId];
        const splitterId = targetNodeRs.splitId;
        const removeSplits = [];
        let keys = Object.keys(splitNodeRs || {});
        let otherNodeId;
        let addSplitRs;
        let removeNodeId;
        let targetPosition;
        let replaceInfo = null;
        let key;

        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          key = keys[ix];
          if (splitNodeRs[key]) {
            removeSplits.push(splitNodeRs[key]);
          }
        }

        keys = Object.keys(targetNodeRs || {});
        for (let ix = 0, ixLen = keys.length; ix < ixLen; ix++) {
          key = keys[ix];
          if (key !== targetId && key.includes('node')) {
            otherNodeId = key;
            break;
          }
        }

        const otherNode = this.getNode(otherNodeId);
        const otherParentNodeRs = this.getMapData(otherNodeId, targetLevel - 1);

        if (targetParentNodeRs) {
          otherNode.id = targetId;
          otherNode.type = targetParentNodeRs.type;
          removeNodeId = otherNodeId;
        } else if (otherParentNodeRs) {
          otherNode.type = otherParentNodeRs.type;
          removeNodeId = targetId;
        } else {
          removeNodeId = targetId;
        }

        if (otherNode.left > this.getLeft) {
          otherNode.left = this.getLeft;
        }

        if (otherNode.top > this.getTop) {
          otherNode.top = this.getTop;
        }

        if (targetPos === 'left') {
          addSplitRs = {
            id: '',
            rsId: otherNode.id,
            type: 'right',
          };

          if (targetType === 'hbox') {
            if (otherNode.height < targetHeight) {
              otherNode.height = targetHeight;
            }
            otherNode.width = (targetWidth + otherNode.width) + 4;
            otherNode.rs.left = splitNodeRs.left;
            addSplitRs.id = splitNodeRs.left;
            targetPosition = 'left';
          } else {
            if (otherNode.width < targetWidth) {
              otherNode.width = targetWidth;
            }
            otherNode.height = (targetHeight + otherNode.height) + 4;
            otherNode.rs.top = splitNodeRs.top;
            addSplitRs.id = splitNodeRs.top;
            targetPosition = 'top';
          }
        } else if (targetPos === 'right') {
          addSplitRs = {
            id: '',
            rsId: otherNode.id,
            type: 'left',
          };

          if (targetType === 'hbox') {
            if (otherNode.height < targetHeight) {
              otherNode.height = targetHeight;
            }
            otherNode.width = (targetWidth + otherNode.width) + 4;
            otherNode.rs.right = splitNodeRs.right;
            addSplitRs.id = splitNodeRs.right;
            targetPosition = 'right';
          } else {
            if (otherNode.width < targetWidth) {
              otherNode.width = targetWidth;
            }
            otherNode.height = (targetHeight + otherNode.height) + 4;
            otherNode.rs.bottom = splitNodeRs.bottom;
            addSplitRs.id = splitNodeRs.bottom;
            targetPosition = 'bottom';
          }
        }

        otherNode.level = targetLevel - 1;

        if (targetParentNodeRs) {
          replaceInfo = {
            isReplaced: true,
            srcId: removeNodeId,
            destId: otherNode.id,
          };
        }

        this.resizeForRsNodes(otherNode, targetLevel, replaceInfo);

        if (!targetParentNodeRs && !otherParentNodeRs) {
          this.updateSplitRs(addSplitRs);
        }

        for (let ix = 0, ixLen = removeSplits.length; ix < ixLen; ix++) {
          this.updateSplitRs({ id: removeSplits[ix], rsId: removeNodeId, isRemove: true });
          this.updateSplitRs({ id: removeSplits[ix], rsId: splitterId, isRemove: true });
        }

        this.removeNode(removeNodeId);
        this.removeSplit(splitterId);
        // this.removeMapItem({ id: removeNodeId, level: targetLevel });

        this.$nextTick(() => {
          if (!this.removeMapItem({ id: removeNodeId, level: targetLevel })) {
            this.$nextTick(() => {
              this.removeMapItem({ id: removeNodeId, level: targetLevel });
            });
          }
        });

        return {
          restoreId: otherNode.id,
          restorePosition: targetPosition,
          restoreContents: targetContents,
          restoreWidth: targetWidth,
          restoreHeight: targetHeight,
          restoreType: targetType,
        };
      },
      onDetach() {
        const rsInfo = this.onClose();
        const parentBounds = this.$parent.$el.getBoundingClientRect();
        const newWindow = {
          id: `window-${this.getMaxIdSeqForWindow() + 1}`,
          top: parentBounds.top + ((parentBounds.height / 2) - 200),
          left: parentBounds.left + ((parentBounds.width / 2) - 250),
          width: 500,
          height: 400,
          contents: rsInfo.restoreContents,
          rs: {
            id: rsInfo.restoreId,
            position: rsInfo.restorePosition,
            width: rsInfo.restoreWidth,
            height: rsInfo.restoreHeight,
            type: rsInfo.restoreType,
          },
        };

        this.addWindow(newWindow);
      },
    },
  };
</script>
<style scoped src="./docking.css">
</style>
