<template>
  <div
    :style="`left: ${getLeft}px; top: ${getTop}px; width: ${getWidth}px; height: ${getHeight}px;`"
    class="dock-window"
  >
    <div
      class="header"
    >
      <div
        class="title"
        @mousedown="onMouseDown"
        @dblclick="onRestore"
      >{{ id }}</div>
      <div
        class="window-icon maximize"
      />
      <div
        class="window-icon close"
        @click.stop="onClose"
      />
    </div>
    <div
      class="body"
    >
      <component
        :is="contents"
      />
    </div>
  </div>
</template>
<script>
  import { mapGetters, mapActions } from 'vuex';

  export default {
    name: 'DockWindow',
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
        contents: this.options.contents,
        isMouseDown: false,
        mousePos: { x: 0, y: 0 },
        nodeIdInTheMouse: '',
      };
    },
    computed: {
      ...mapGetters({
        getNodeIdInTheMouse: 'nodes/getItemIdInTheMouse',
      }),
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
    },
    methods: {
      ...mapActions({
        updateWindow: 'windows/updateWindow',
        removeWindow: 'windows/removeWindow',
      }),
      onMouseDown({ pageX: xPos, pageY: yPos }) {
        const nodeId = this.getNodeIdInTheMouse(xPos, yPos);

        this.mousePos.x = xPos;
        this.mousePos.y = yPos;

        this.updateWindow({
          id: this.id,
          item: {},
        });

        if (nodeId) {
          this.nodeIdInTheMouse = nodeId;
        }

        this.isMouseDown = true;
        // event.stopPropagation();
        // event.preventDefault();
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mouseup', this.onMouseUp);
      },
      onMouseMove({ pageX: xPos, pageY: yPos }) {
        if (!this.isMouseDown || (this.mousePos.x === xPos && this.mousePos.y === yPos)) {
          return;
        }

        const dockWindow = this.$el;
        const diffTop = yPos - this.mousePos.y;
        const diffLeft = xPos - this.mousePos.x;
        const nodeId = this.getNodeIdInTheMouse(xPos, yPos,
          this.getLeftPadding, this.getTopPadding);

        if (nodeId !== this.nodeIdInTheMouse) {
          this.$dockBus.$emit('hideDockIcon', this.nodeIdInTheMouse);
          this.$dockBus.$emit('showDockIcon', nodeId);
          this.nodeIdInTheMouse = nodeId;
        } else {
          this.$dockBus.$emit('showDockIcon', this.nodeIdInTheMouse);
        }

        this.$emit('drag', xPos, yPos);
        dockWindow.style.cssText = `top: ${this.getTop + diffTop}px; left: ${this.getLeft + diffLeft}px;
        width: ${this.getWidth}px; height: ${this.getHeight}px;`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const top = this.getTop + (yPos - this.mousePos.y);
        const left = this.getLeft + (xPos - this.mousePos.x);

        this.updateWindow({
          id: this.id,
          item: { top, left },
        });

        this.isMouseDown = false;
        this.$emit('drop');
        if (this.nodeIdInTheMouse) {
          this.$dockBus.$emit('hideDockIcon', this.nodeIdInTheMouse);
          this.nodeIdInTheMouse = '';
        }

        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
      },
      onRestore() {
        const windowRs = this.options.rs;

        if (!windowRs) {
          return;
        }

        this.$dockBus.$emit('restore', windowRs.id, windowRs.type);
      },
      onClose() {
        this.removeWindow(this.id);
      },
    },
  };
</script>
<style scoped src="./docking.css">
</style>
