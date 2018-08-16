<template>
  <div
    class="dock-container"
  >
    <dock-frame
      v-for="node in nodes"
      :key="node.id"
      :options="node"
      :padding="padding"
    />
    <splitter
      v-for="split in splitters"
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
      class="guideline-for-split"
    />
    <div v-show="showDockIcon">
      <div
        :style="getDockIconStyle('top')"
        class="root-docking-icon top"
        data-direction="top"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        :style="getDockIconStyle('right')"
        class="root-docking-icon right"
        data-direction="right"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        :style="getDockIconStyle('left')"
        class="root-docking-icon left"
        data-direction="left"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
      <div
        :style="getDockIconStyle('bottom')"
        class="root-docking-icon bottom"
        data-direction="bottom"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onMouseUp"
      />
    </div>
    <div
      v-show="showPreview"
      :style="getPreviewStyle('area')"
      class="preview"
    />
    <div
      v-show="showPreview"
      :style="getPreviewStyle('guideline')"
      class="preview-guide"
    />
  </div>
</template>
<script>
  import Vuex from 'vuex';
  import nodes from './store/modules/nodes';
  import windows from './store/modules/windows';
  import splitters from './store/modules/splitters';
  import DockWindow from './docking.window';
  import DockFrame from './docking.frame';
  import Splitter from './docking.splitter';

  export default {
    name: 'DockContainer',
    components: {
      DockWindow, DockFrame, Splitter,
    },
    props: {
      dockingList: {
        type: Object,
        default: null,
      },
      bounds: {
        type: Object,
        default: null,
      },
    },
    data() {
      return {
        padding: {},
        showDockIcon: false,
        showPreview: false,
        previewDirection: '',
      };
    },
    computed: {
      ...Vuex.mapState({
        nodes: state => state.nodes.items,
        splitters: state => state.splitters.items,
        windows: state => state.windows.items,
      }),
      ...Vuex.mapGetters({
        getAllMapItem: 'nodes/getAllMapItems',
        getDockWindow: 'windows/getActiveItem',
        getMaxIdSeqForNode: 'nodes/getMaxIdSeq',
        getMaxIdSeqForSplit: 'splitters/getMaxIdSeq',
      }),
      getWidth() {
        return this.bounds.width;
      },
      getHeight() {
        return this.bounds.height;
      },
      getPadding() {
        return this.padding;
      },
    },
    beforeCreate() {
      if (!this.$store) {
        this.$store = new Vuex.Store({});
      }

      const store = this.$store;

      if (!store.state.nodes) {
        store.registerModule('nodes', nodes);
      }

      if (!store.state.splitters) {
        store.registerModule('splitters', splitters);
      }

      if (!store.state.windows) {
        store.registerModule('windows', windows);
      }
    },
    created() {
      if (this.dockingList.nodes) {
        this.$store.commit('nodes/setItems', { items: this.dockingList.nodes });
        this.$store.commit('nodes/setMaps', { maps: this.dockingList.nodeMap });
        this.$store.commit('splitters/setItems', { items: this.dockingList.splitters });
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
        addNode: 'nodes/addNode',
        addMapItem: 'nodes/addMapItem',
        addSplit: 'splitters/addSplitter',
        removeWindow: 'windows/removeWindow',
      }),
      getDockIconStyle(position) {
        const bounds = this.bounds;
        let top = bounds.top;
        let left = bounds.left;

        if (position === 'top') {
          top += 5;
          left += (bounds.width / 2);
        } else if (position === 'bottom') {
          top += bounds.height - 40;
          left += (bounds.width / 2);
        } else if (position === 'left') {
          left += 5;
          top += (bounds.height / 2);
        } else if (position === 'right') {
          left += bounds.width - 40;
          top += (bounds.height / 2);
        }

        return `top: ${top}px; left: ${left}px;`;
      },
      getPreviewStyle(type) {
        const nodeMaps = this.getAllMapItem();
        const bounds = this.bounds;
        let width = bounds.width;
        let height = bounds.height;
        let top = bounds.top;
        let left = bounds.left;

        if (nodeMaps[0] && type === 'area') {
          const position = this.previewDirection;

          if (position === 'top') {
            height /= 2;
          } else if (position === 'bottom') {
            height /= 2;
            top += height;
          } else if (position === 'left') {
            width /= 2;
          } else if (position === 'right') {
            width /= 2;
            left += width;
          }
        }

        return `top: ${top}px; left: ${left}px; width: ${width}px; height: ${height}px;`;
      },
      onDrag(xPos, yPos) {
        const bounds = this.bounds;
        const startX = bounds.left;
        const startY = bounds.top;
        const endX = startX + bounds.width;
        const endY = startY + bounds.height;

        if ((startX < xPos && endX > xPos) && (startY < yPos && endY > yPos)) {
          this.showDockIcon = true;
        } else {
          this.showDockIcon = false;
        }
      },
      onDrop() {
        this.showDockIcon = false;
      },
      onMouseUp() {
        const nodeMaps = this.getAllMapItem();
        const window = this.getDockWindow();
        let addNode;

        if (!nodeMaps[0]) {
          addNode = {
            id: `node-${this.getMaxIdSeqForNode() + 1}`,
            top: 0,
            left: 0,
            width: this.width,
            height: this.height,
            level: 0,
            contents: window.contents,
          };

          this.removeWindow(window.id);
          this.addNode(addNode);
          this.addMapItem({
            level: 0,
            newItem: addNode.id,
          });
        }
      },
      onMouseOver({ target }) {
        this.showPreview = true;
        this.previewDirection = target.dataset.direction;
      },
      onMouseOut() {
        this.showPreview = false;
        this.previewDirection = '';
      },
    },
  };
</script>
<style scoped src="./docking.css">
</style>
