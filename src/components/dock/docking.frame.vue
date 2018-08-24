<template>
  <div
    :style="`left: ${getLeft}%; top: ${getTop}%; width: ${getWidth}%; height: ${getHeight}%;`"
    class="ev-docking-frame"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      style="overflow: auto; position: absolute; width: 100%; height: 100%;"
    >
      <component
        :is="getContents"
      />
    </div>
    <div
      v-show="showDockIcon"
      class="ev-docking-frame-icon-wrap"
    >
      <div class="ev-docking-frame-icon background"/>
      <div
        class="ev-docking-frame-icon top"
        data-position="top"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="ev-docking-frame-icon right"
        data-position="right"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="ev-docking-frame-icon left"
        data-position="left"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="ev-docking-frame-icon center"
        data-position="center"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut"
        @mouseup="onAttach"
      />
      <div
        class="ev-docking-frame-icon bottom"
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
      class="ev-docking-frame-option-icon-wrap"
    >
      <div
        ref="detachIcon"
        class="ev-docking-frame-option-icon detach"
        data-icon="detach"
        @click="onDetach"
      />
      <div
        ref="closeIcon"
        class="ev-docking-frame-option-icon close"
        data-icon="close"
        @click="onClose"
      />
    </div>
  </div>
</template>
<script>
  import _ from 'lodash';
  import { mapGetters, mapActions } from 'vuex';
  import { convertToValue, convertToPercent } from '@/common/utils';

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
        getMaxIdSeq: 'getMaxIdSeq',
        getItemsById: 'getItemsById',
        getActiveWindow: 'getActiveWindow',
        getDefaultItem: 'getDefaultItem',
      }),
      getContents() {
        return this.options.contents;
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
    },
    created() {
      this.$dockBus = this.$parent.$dockBus;
      this.$dockBus.$on('showDockIcon', this.onShowDockIcon.bind(this));
      this.$dockBus.$on('hideDockIcon', this.onHideDockIcon.bind(this));
    },
    mounted() {
      const bounds = this.$el.getBoundingClientRect();

      this.width = bounds.width;
      this.height = bounds.height;
      this.top = bounds.top;
      this.left = bounds.left;
    },
    methods: {
      ...mapActions({
        resize: 'resize',
        addItem: 'addItem',
        removeItem: 'removeItem',
        increaseIdSeq: 'increaseIdSeq',
        updateTreeItem: 'updateTreeItem',
      }),
      getNewId(type) {
        this.increaseIdSeq(type);

        return `${type}-${this.getMaxIdSeq(type)}`;
      },
      onShowDockIcon(xPos, yPos) {
        const parentWidth = this.$parent.width;
        const parentHeight = this.$parent.height;
        const startX = this.getLeftPadding + convertToValue(this.getLeft, parentWidth);
        const startY = this.getTopPadding + convertToValue(this.getTop, parentHeight);
        const endX = startX + convertToValue(this.getWidth, parentWidth);
        const endY = startY + convertToValue(this.getHeight, parentHeight);

        if ((startX < xPos && endX > xPos) && (startY < yPos && endY > yPos)) {
          this.showDockIcon = true;
        } else {
          this.showDockIcon = false;
        }
      },
      onHideDockIcon() {
        this.showDockIcon = false;
      },
      onAttach() {
        const window = this.getActiveWindow();
        const position = this.dockingPosition;
        const baseItem = _.cloneDeep(this.options);
        const leftItem = _.cloneDeep(baseItem);
        const rightItem = _.cloneDeep(baseItem);
        const splitItem = this.getDefaultItem('split');
        let width = baseItem.width;
        let height = baseItem.height;
        let direction;
        let splitHeight;
        let splitWidth;
        let remainValue;

        splitItem.id = this.getNewId('split');
        splitItem.top = baseItem.top;
        splitItem.left = baseItem.left;
        splitItem.width = baseItem.width;
        splitItem.height = baseItem.height;

        leftItem.id = this.getNewId('node');
        rightItem.id = this.getNewId('node');
        leftItem.items = [];
        rightItem.items = [];

        if (position === 'top' || position === 'bottom') {
          splitHeight = convertToPercent(4, this.$parent.height);
          height = +((height - splitHeight) / 2).toFixed(3);
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
          splitWidth = convertToPercent(4, this.$parent.width);
          width = +((width - splitWidth) / 2).toFixed(3);
          remainValue = +(width - (Math.floor(width * 100) / 100)).toFixed(3);
          width = Math.floor(width * 100) / 100;
          remainValue = !remainValue ? 0 : 0.01;
          direction = 'hbox';

          leftItem.width = width;
          splitItem.left = leftItem.left + width;
          splitItem.width = splitWidth;
          rightItem.left = splitItem.left + splitWidth;
          rightItem.width = width + remainValue;
        }

        if (position === 'top' || position === 'left') {
          leftItem.contents = window.contents;
        } else {
          rightItem.contents = window.contents;
        }

        splitItem.direction = direction;
        baseItem.direction = direction;
        baseItem.items.push(leftItem, splitItem, rightItem);

        this.removeItem(baseItem.id);
        this.removeItem(window.id);
        this.addItem(leftItem);
        this.addItem(rightItem);
        this.addItem(splitItem);
        this.updateTreeItem({ newItem: baseItem });
      },
      onClose() {
        const parentItem = _.cloneDeep(this.getItemsById(null, this.id, 'parent'));
        const isExistParent = !!parentItem;
        const childItems = isExistParent ? _.cloneDeep(parentItem.items) : [];
        let position = 'right';
        let restoreInfo;

        if (isExistParent) {
          const splitItem = childItems[1];
          const direction = splitItem.direction;
          const targetItem = _.cloneDeep(this.options);
          let otherItem = childItems[0];
          let parentValue;
          let ratio;

          if (childItems[0].id === targetItem.id) {
            otherItem = childItems[2];
            position = 'left';
          }

          if (direction === 'hbox') {
            parentValue = targetItem.width + splitItem.width + otherItem.width;
            ratio = convertToPercent(targetItem.width, parentValue);
          } else {
            parentValue = targetItem.height + splitItem.height + otherItem.height;
            ratio = convertToPercent(targetItem.height, parentValue);
          }

          this.removeItem(targetItem.id);
          this.removeItem(splitItem.id);

          parentItem.contents = otherItem.contents;
          if (otherItem.items.length) {
            parentItem.items = otherItem.items;
            parentItem.direction = otherItem.direction;
            this.updateTreeItem({ newItem: parentItem });
            this.resize({ id: parentItem.id, item: parentItem });
          } else {
            parentItem.items.length = 0;
            this.updateTreeItem({ newItem: parentItem });
            this.removeItem(otherItem.id);
            this.addItem(parentItem);
          }

          restoreInfo = {
            id: parentItem.id,
            position,
            contents: targetItem.contents,
            ratio,
            direction,
          };
        } else {
          this.removeItem(this.id);
          this.updateTreeItem({ newItem: {} });

          restoreInfo = {
            id: '',
            position: '',
            contents: this.getContents,
            ratio: 100,
            direction: '',
          };
        }

        return restoreInfo;
      },
      onDetach() {
        const restoreInfo = this.onClose();
        const parentBounds = this.$parent.$el.getBoundingClientRect();
        const newWindow = {
          id: this.getNewId('window'),
          top: parentBounds.top + ((parentBounds.height / 2) - 200),
          left: parentBounds.left + ((parentBounds.width / 2) - 250),
          width: 500,
          height: 400,
          contents: restoreInfo.contents,
          restoreInfo,
        };

        this.addItem(newWindow);
      },
      onMouseOver({ target }) {
        this.showPreview = true;
        this.dockingPosition = target.dataset.position;
      },
      onMouseOut() {
        this.showPreview = false;
      },
      onMouseEnter() {
        this.showOptionIcon = true;
      },
      onMouseLeave() {
        this.showOptionIcon = false;
      },
    },
  };
</script>
<style>
</style>
