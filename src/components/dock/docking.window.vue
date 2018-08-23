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
  import _ from 'lodash';
  import { mapActions, mapGetters } from 'vuex';
  import { convertToValue, convertToPercent } from '@/common/utils';

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
        getMaxIdSeq: 'getMaxIdSeq',
        getItemsById: 'getItemsById',
        getDefaultItem: 'getDefaultItem',
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
    created() {
      this.$dockBus = this.$parent.$dockBus;
    },
    methods: {
      ...mapActions({
        resize: 'resize',
        addItem: 'addItem',
        removeItem: 'removeItem',
        updateItem: 'updateItem',
        increaseIdSeq: 'increaseIdSeq',
        updateTreeItem: 'updateTreeItem',
      }),
      getNewId(type) {
        this.increaseIdSeq(type);

        return `${type}-${this.getMaxIdSeq(type)}`;
      },
      onMouseDown({ pageX: xPos, pageY: yPos }) {
        this.mousePos.x = xPos;
        this.mousePos.y = yPos;
        this.updateItem({ id: this.id });
        this.isMouseDown = true;

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

        this.$dockBus.$emit('showDockIcon', xPos, yPos);
        this.$emit('drag', xPos, yPos);

        dockWindow.style.cssText = `top: ${this.getTop + diffTop}px; left: ${this.getLeft + diffLeft}px;
        width: ${this.getWidth}px; height: ${this.getHeight}px;`;
      },
      onMouseUp({ pageX: xPos, pageY: yPos }) {
        const top = this.getTop + (yPos - this.mousePos.y);
        const left = this.getLeft + (xPos - this.mousePos.x);

        this.updateItem({ id: this.id, top, left });

        this.isMouseDown = false;
        this.$emit('drop');
        this.$dockBus.$emit('hideDockIcon');

        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mouseup', this.onMouseUp);
      },
      onRestore() {
        const restoreInfo = this.options.restoreInfo;

        if (!restoreInfo) {
          return;
        }

        if (restoreInfo.ratio === 100) {
          const rootItem = this.getDefaultItem('node');
          rootItem.id = this.getNewId('node');
          rootItem.width = 100;
          rootItem.height = 100;
          rootItem.contents = restoreInfo.contents;

          this.removeItem(this.id);
          this.updateTreeItem({ newItem: rootItem });
          this.addItem(rootItem);

          return;
        }

        const parentItem = this.getItemsById(null, restoreInfo.id, 'exactly');
        const leftItem = _.cloneDeep(parentItem);
        const rightItem = _.cloneDeep(parentItem);
        const splitItem = this.getDefaultItem('split');
        const direction = restoreInfo.direction;
        const parentWidth = parentItem.width;
        const parentHeight = parentItem.height;
        let restoreWidth;
        let restoreHeight;
        let splitWidth;
        let splitHeight;
        let remainValue;

        parentItem.items.length = 0;
        parentItem.direction = direction;
        leftItem.id = this.getNewId('node');
        rightItem.id = this.getNewId('node');
        splitItem.id = this.getNewId('split');
        splitItem.top = parentItem.top;
        splitItem.left = parentItem.left;
        splitItem.width = parentWidth;
        splitItem.height = parentHeight;
        splitItem.direction = direction;

        if (direction === 'hbox') {
          splitWidth = convertToPercent(4, this.$parent.width);
          restoreWidth = convertToValue(restoreInfo.ratio, parentWidth);
          remainValue = parentWidth - splitWidth - restoreWidth;

          if (restoreInfo.position === 'left') {
            leftItem.items.length = 0;
            leftItem.contents = this.contents;

            leftItem.width = restoreWidth;
            splitItem.left = leftItem.left + restoreWidth;
            splitItem.width = splitWidth;
            rightItem.left = splitItem.left + splitWidth;
            rightItem.width = remainValue;
          } else {
            rightItem.items.length = 0;
            rightItem.width = restoreWidth;
            rightItem.contents = this.contents;

            leftItem.width = remainValue;
            splitItem.left = leftItem.left + remainValue;
            splitItem.width = splitWidth;
            rightItem.left = splitItem.left + splitWidth;
            rightItem.width = restoreWidth;
          }
        } else {
          splitHeight = convertToPercent(4, this.$parent.height);
          restoreHeight = convertToValue(restoreInfo.ratio, parentHeight);
          remainValue = parentHeight - splitHeight - restoreHeight;

          if (restoreInfo.position === 'left') {
            leftItem.items.length = 0;
            leftItem.contents = this.contents;

            leftItem.height = restoreHeight;
            splitItem.top = leftItem.top + restoreHeight;
            splitItem.height = splitHeight;
            rightItem.top = splitItem.top + splitHeight;
            rightItem.height = remainValue;
          } else {
            rightItem.items.length = 0;
            rightItem.contents = this.contents;

            leftItem.height = remainValue;
            splitItem.top = leftItem.top + remainValue;
            splitItem.height = splitHeight;
            rightItem.top = splitItem.top + splitHeight;
            rightItem.height = restoreHeight;
          }
        }

        parentItem.items.push(leftItem, splitItem, rightItem);

        this.removeItem(this.id);
        this.removeItem(parentItem.id);
        this.updateTreeItem({ newItem: parentItem });
        this.addItem(splitItem);
        if (restoreInfo.position === 'left') {
          this.addItem(leftItem);
          if (rightItem.items.length) {
            this.resize({ id: rightItem.id, item: rightItem });
          } else {
            this.addItem(rightItem);
          }
        } else {
          this.addItem(rightItem);
          if (leftItem.items.length) {
            this.resize({ id: leftItem.id, item: leftItem });
          } else {
            this.addItem(leftItem);
          }
        }
      },
      onClose() {
        this.removeItem(this.id);
      },
    },
  };
</script>
<style>
</style>
