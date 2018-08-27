<template>
  <div
    class="ev-docking-container"
  >
    <dock-frame
      v-for="node in nodes"
      :key="node.id"
      :options="node"
      :padding="padding"
    />
    <splitter
      v-for="split in splits"
      :key="split.id"
      :options="split"
      :padding="padding"
    />
    <dock-window
      v-for="window in windows"
      :key="window.id"
      :options="window"
      :padding="padding"
      @drag="onDrag"
      @drop="onDrop"
    />
    <div
      ref="guideline"
      class="ev-docking-guideline-for-split"
    />
    <div v-show="showDockIcon">
      <div
        class="ev-docking-container-icon top"
        data-position="top"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        class="ev-docking-container-icon right"
        data-position="right"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        class="ev-docking-container-icon left"
        data-position="left"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        class="ev-docking-container-icon bottom"
        data-position="bottom"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
    </div>
    <div
      v-show="showPreview"
      :class="showPreview ? previewDirection : ''"
      class="preview"
    />
    <div
      v-show="showPreview"
      class="preview-guide"
    />
  </div>
</template>
<script>
  import _ from 'lodash';
  import Vue from 'vue';
  import Vuex from 'vuex';
  import { convertToPercent } from '@/common/utils';
  import DockingStore from '@/components/dock/store';
  import DockWindow from './docking.window';
  import DockFrame from './docking.frame';
  import Splitter from './docking.splitter';

  export default {
    name: 'DockContainer',
    components: {
      DockWindow, DockFrame, Splitter,
    },
    props: {
      dockingTree: {
        type: Object,
        default() {
          return {};
        },
      },
    },
    data() {
      return {
        padding: {},
        loadNodes: [],
        loadSplitters: [],
        loadMaxIdSeq: null,
        showDockIcon: false,
        showPreview: false,
        previewDirection: '',
      };
    },
    computed: {
      ...Vuex.mapState({
        nodes: state => state.dockingStore.nodes,
        splits: state => state.dockingStore.splits,
        windows: state => state.dockingStore.windows,
      }),
      ...Vuex.mapGetters({
        getMaxIdSeq: 'getMaxIdSeq',
        getActiveWindow: 'getActiveWindow',
        getDockingTree: 'getDockingTree',
        getDefaultItem: 'getDefaultItem',
      }),
    },
    beforeCreate() {
      if (!this.$store) {
        this.$store = new Vuex.Store({});
      }

      if (!this.$dockBus) {
        this.$dockBus = new Vue();
      }

      const store = this.$store;

      if (!store.state.dockingStore) {
        store.registerModule('dockingStore', DockingStore);
      }
    },
    created() {
      if (this.dockingTree.id) {
        this.loadDockingTree();
        this.$store.commit('setDockingData', {
          dockingTree: this.dockingTree,
          nodes: this.loadNodes,
          splitters: this.loadSplitters,
          maxIdSeq: this.loadMaxIdSeq,
        });
      }
    },
    mounted() {
      const bounds = this.$el.getBoundingClientRect();

      this.width = bounds.width;
      this.height = bounds.height;
      this.padding.top = bounds.top;
      this.padding.left = bounds.left;
    },
    methods: {
      ...Vuex.mapActions({
        resize: 'resize',
        addItem: 'addItem',
        getNewId: 'getNewId',
        removeItem: 'removeItem',
        increaseIdSeq: 'increaseIdSeq',
        updateTreeItem: 'updateTreeItem',
      }),
      getLayout() {
        return this.getDockingTree();
      },
      addWindow(contents) {
        const width = 500;
        const height = 400;
        const dockWindow = {
          id: this.getNewId('window'),
          top: ((this.height / 2) - (height / 2)),
          left: ((this.width / 2) - (width / 2)),
          width,
          height,
          contents,
        };

        this.addItem(dockWindow);
      },
      getNewId(type) {
        this.increaseIdSeq(type);

        return `${type}-${this.getMaxIdSeq(type)}`;
      },
      setLoadItem(items, maxIdSeq) {
        let maxNodeIdSeq = maxIdSeq;
        let item;
        let itemIdSeq;
        let tempNodeIdSeq;

        for (let ix = 0, ixLen = items.length; ix < ixLen; ix++) {
          item = items[ix];
          if (item.id.includes('node')) {
            itemIdSeq = +String.prototype.split.call(item.id, '-')[1];
            if (item.items.length) {
              tempNodeIdSeq = this.setLoadItem(item.items, maxNodeIdSeq);
              if (itemIdSeq < tempNodeIdSeq) {
                itemIdSeq = tempNodeIdSeq;
              }
            } else {
              this.loadNodes.push(item);
            }

            if (maxNodeIdSeq < itemIdSeq) {
              maxNodeIdSeq = itemIdSeq;
            }
          } else {
            this.loadSplitters.push(item);
          }
        }

        return maxNodeIdSeq;
      },
      loadDockingTree() {
        const dockingTree = this.dockingTree;
        let maxNodeIdSeq = +String.prototype.split.call(dockingTree.id, '-')[1];
        let maxSplitterIdSeq = 0;
        let tempNodeIdSeq;
        let item;
        let itemIdSeq;

        if (dockingTree.items.length) {
          tempNodeIdSeq = this.setLoadItem(dockingTree.items, maxNodeIdSeq);
        } else {
          this.loadNodes.push(dockingTree);
        }

        if (maxNodeIdSeq < tempNodeIdSeq) {
          maxNodeIdSeq = tempNodeIdSeq;
        }

        if (this.loadSplitters.length) {
          for (let ix = 0, ixLen = this.loadSplitters.length; ix < ixLen; ix++) {
            item = this.loadSplitters[ix];
            itemIdSeq = +String.prototype.split.call(item.id, '-')[1];
            if (maxSplitterIdSeq < itemIdSeq) {
              maxSplitterIdSeq = itemIdSeq;
            }
          }
        }

        this.loadMaxIdSeq = {
          node: maxNodeIdSeq,
          split: maxSplitterIdSeq,
          window: 0,
        };
      },
      onDrag(xPos, yPos) {
        const startX = this.padding.left;
        const startY = this.padding.top;
        const endX = startX + this.width;
        const endY = startY + this.height;

        if ((startX < xPos && endX > xPos) && (startY < yPos && endY > yPos)) {
          this.showDockIcon = true;
        } else {
          this.showDockIcon = false;
        }
      },
      onDrop() {
        this.showDockIcon = false;
      },
      onMouseUp({ target }) {
        const window = this.getActiveWindow();
        const dockingTree = this.getDockingTree();
        const dockingPosition = target.dataset.position;
        let width = 100;
        let height = 100;
        let direction;
        let remainValue;

        if (dockingTree.id) {
          const splitItem = this.getDefaultItem('split');
          let isNeedResize = false;
          let isLeftResize = false;
          let leftItem;
          let rightItem;
          let splitHeight;
          let splitWidth;

          if (dockingPosition === 'top' || dockingPosition === 'left') {
            leftItem = _.cloneDeep(dockingTree);
            rightItem = _.cloneDeep(dockingTree);
            leftItem.items.length = 0;
            rightItem.items.length = 0;
            leftItem.contents = window.contents;
            if (dockingTree.items.length) {
              rightItem.items = _.cloneDeep(dockingTree.items);
              isNeedResize = true;
            }
          } else {
            leftItem = _.cloneDeep(dockingTree);
            rightItem = _.cloneDeep(dockingTree);
            rightItem.items.length = 0;
            leftItem.items.length = 0;
            rightItem.contents = window.contents;
            if (dockingTree.items.length) {
              leftItem.items = _.cloneDeep(dockingTree.items);
              isNeedResize = true;
              isLeftResize = true;
            }
          }

          dockingTree.items.length = 0;

          leftItem.id = this.getNewId('node');
          leftItem.width = width;
          leftItem.height = height;

          rightItem.id = this.getNewId('node');
          rightItem.width = width;
          rightItem.height = height;

          splitItem.id = this.getNewId('split');
          splitItem.top = dockingTree.top;
          splitItem.left = dockingTree.left;
          splitItem.width = width;
          splitItem.height = height;

          if (dockingPosition === 'top' || dockingPosition === 'bottom') {
            splitHeight = convertToPercent(4, this.height);
            height = +((100 - splitHeight) / 2).toFixed(3);
            remainValue = +(height - (Math.floor(height * 100) / 100)).toFixed(3);
            height = Math.floor(height * 100) / 100;
            remainValue = !remainValue ? 0 : 0.01;
            direction = 'vbox';

            leftItem.height = height;
            splitItem.top = leftItem.top + height;
            splitItem.height = splitHeight;
            rightItem.top = splitItem.top + splitHeight;
            rightItem.height = height + remainValue;
          } else {
            splitWidth = convertToPercent(4, this.width);
            width = +((100 - splitWidth) / 2).toFixed(3);
            remainValue = +(width - (Math.floor(width * 100) / 100)).toFixed(3);
            width = Math.floor(width * 100) / 100;
            remainValue = !remainValue ? 0 : 0.01;
            direction = 'hbox';

            leftItem.width = width;
            splitItem.left = leftItem.left + width;
            splitItem.width = splitWidth;
            rightItem.left = splitItem.left + splitWidth;
            rightItem.width = width;
          }

          splitItem.direction = direction;
          dockingTree.direction = direction;
          dockingTree.items.push(leftItem, splitItem, rightItem);

          this.updateTreeItem({ newItem: dockingTree });
          if (isNeedResize) {
            if (isLeftResize) {
              this.resize({ id: leftItem.id, item: leftItem });
              this.addItem(splitItem);
              this.addItem(rightItem);
            } else {
              this.resize({ id: rightItem.id, item: rightItem });
              this.addItem(leftItem);
              this.addItem(splitItem);
            }
          } else {
            this.addItem(leftItem);
            this.addItem(splitItem);
            this.addItem(rightItem);
          }

          this.removeItem(dockingTree.id);
        } else {
          const rootItem = this.getDefaultItem('node');
          rootItem.id = this.getNewId('node');
          rootItem.width = width;
          rootItem.height = height;
          rootItem.contents = window.contents;

          this.updateTreeItem({ newItem: rootItem });
          this.addItem(rootItem);
        }

        this.removeItem(window.id);
      },
      onMouseOver({ target }) {
        this.showPreview = true;
        if (!this.nodes.length) {
          this.previewDirection = 'center';
        } else {
          this.previewDirection = target.dataset.position;
        }
      },
      onMouseOut() {
        this.showPreview = false;
        this.previewDirection = '';
      },
    },
  };
</script>
<style>
  /******************** docking **********************/
  .ev-docking-container {
    position: relative;
    width: 100%;
    height: 100%;
    background: #212227;
  }

  .ev-docking-frame {
    position: absolute;
    background: #30333A;
  }

  .ev-docking-splitter {
    position: absolute;
    background: #212227;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .ev-docking-guideline-for-split {
    display: none;
    position: absolute;
    z-index: 10000;
    background: #ABAEB5;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .hbox.ev-docking-splitter,
  .hbox.ev-docking-guideline-for-split {
    cursor: col-resize;
  }

  .vbox.ev-docking-splitter,
  .vbox.ev-docking-guideline-for-split {
    cursor: row-resize;
  }

  /*.hbox > .splitter,*/
  /*.hbox > .guidelines-for-split {*/
  /*cursor: col-resize;*/
  /*}*/

  /*.vbox > .splitter,*/
  /*.vbox > .guidelines-for-split {*/
  /*cursor: row-resize;*/
  /*}*/

  /*.hbox > .splitter:hover,*/
  /*.vbox > .splitter:hover,*/
  /*.hbox > .splitter:active,*/
  /*.vbox > .splitter:active {*/
  /*background-color: #e4e4e4;*/
  /*}*/

  /******************** docking icon for dock frame **********************/
  .ev-docking-frame-icon-wrap {
    position: absolute;
    z-index: 20000;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    margin: -50px 0 0 -50px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .ev-docking-frame-icon {
    position: absolute;
    width: 35px;
    height: 35px;
    background-image: url(./docking.image.png);
  }

  .ev-docking-frame-icon.background {
    position: absolute;
    z-index: -1;
    top: 15px;
    left: 15px;
    width: 76px;
    height: 74px;
    background-position: -286px -185px;
  }

  .ev-docking-frame-icon.top {
    left: 35px;
    background-position: -286px -5px;
  }

  .ev-docking-frame-icon.left {
    top: 35px;
    background-position: -286px -113px;
  }

  .ev-docking-frame-icon.center {
    top: 35px;
    left: 35px;
    background-position: -286px -77px;
  }

  .ev-docking-frame-icon.right {
    top: 35px;
    left: 70px;
    background-position: -286px -149px;
  }

  .ev-docking-frame-icon.bottom {
    top: 70px;
    left: 35px;
    background-position: -286px -41px;
  }

  .ev-docking-frame-icon.top:hover {
    background-position: -322px -5px;
  }

  .ev-docking-frame-icon.left:hover {
    background-position: -322px -113px;
  }

  .ev-docking-frame-icon.center:hover {
    background-position: -322px -77px;
  }

  .ev-docking-frame-icon.right:hover {
    background-position: -322px -149px;
  }

  .ev-docking-frame-icon.bottom:hover {
    background-position: -322px -41px;
  }

  /******************** docking icon for dock container **********************/
  .ev-docking-container-icon {
    position: absolute;
    z-index: 30000;
    width: 35px;
    height: 35px;
    background-image: url(./docking.image.png);
  }

  .ev-docking-container-icon.top {
    top: 5px;
    left: 50%;
    margin: 0 0 0 -18px;
    background-position: -286px -5px;
  }

  .ev-docking-container-icon.left {
    top: 50%;
    left: 5px;
    margin: -18px 0 0 0;
    background-position: -286px -113px;
  }

  .ev-docking-container-icon.bottom {
    left: 50%;
    bottom: 5px;
    margin: 0 0 0 -18px;
    background-position: -286px -41px;
  }

  .ev-docking-container-icon.right {
    top: 50%;
    right: 5px;
    margin: -18px 0 0 0;
    background-position: -286px -149px;
  }

  .ev-docking-container-icon.top:hover {
    background-position: -322px -5px;
  }

  .ev-docking-container-icon.left:hover {
    background-position: -322px -113px;
  }

  .ev-docking-container-icon.bottom:hover {
    background-position: -322px -41px;
  }

  .ev-docking-container-icon.right:hover {
    background-position: -322px -149px;
  }

  /******************** docking preview **********************/
  .ev-docking-container > .preview,
  .ev-docking-frame > .preview {
    position: absolute;
    z-index: 10000;
    background: #448CCB;
    opacity: 0.45;
  }

  .ev-docking-container > .preview.top,
  .ev-docking-frame > .preview.top {
    top: 0;
    left: 0;
    width: 100%;
    height: 50%;
  }

  .ev-docking-container > .preview.left,
  .ev-docking-frame > .preview.left {
    top: 0;
    left: 0;
    width: 50%;
    height: 100%;
  }

  .ev-docking-container > .preview.center,
  .ev-docking-frame > .preview.center {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .ev-docking-container > .preview.right,
  .ev-docking-frame > .preview.right {
    top: 0;
    left: 50%;
    width: 50%;
    height: 100%;
  }

  .ev-docking-container > .preview.bottom,
  .ev-docking-frame > .preview.bottom {
    top: 50%;
    left: 0;
    width: 100%;
    height: 50%;
  }

  .ev-docking-container > .preview-guide,
  .ev-docking-frame > .preview-guide {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: transparent;
    border: 5px dashed #3b5a82;
  }

  /******************** docking window **********************/
  .ev-docking-window {
    position: absolute;
    overflow: auto;
    background: #30333A;
    border: 6px solid #474a53;
    border-radius: 6px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .ev-docking-window > .header {
    display: flex;
    align-items: center;
    width: 100%;
    height: 30px;
    background: #212227;
  }

  .ev-docking-window > .header > .title {
    flex: auto;
    margin: 0 0 0 10px;
    color: #ABAEB5;
  }

  .ev-docking-window-icon {
    width: 17px;
    height: 17px;
    background-image: url(./docking.image.png);
  }

  .ev-docking-window-icon.maximize {
    margin: 0 7px 0 0;
    background-position: -70px -131px;
  }

  .ev-docking-window-icon.close {
    margin: 0 7px 0 0;
    background-position: -70px -51px;
  }

  .ev-docking-window-icon.maximize:hover {
    background-position: -70px -151px;
  }

  .ev-docking-window-icon.close:hover {
    background-position: -70px -71px;
  }

  .ev-docking-window > .body {
    width: 100%;
    background: transparent;
  }

  /******************** dock frame option icon **********************/
  .ev-docking-frame-option-icon-wrap {
    position: absolute;
    display: flex;
    z-index: 50000;
    top: -25px;
    right: 0;
    width: 116px;
    height: 25px;
  }

  .ev-docking-frame-option-icon {
    width: 58px;
    height: 25px;
    background-image: url(./docking.image.png);
    cursor: pointer;
  }

  .ev-docking-frame-option-icon.close {
    background-position: -1px -225px;
  }

  .ev-docking-frame-option-icon.detach {
    background-position: -62px -225px;
  }
</style>
