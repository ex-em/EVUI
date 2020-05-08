<template>
  <div
    :style="ctxMenuStyle"
    :class="prefixEvui"
    @mouseout="onMouseOut"
  >
    <div
      :class="bodyCls"
    >
      <div
        v-for="(item, rowIdx) in items"
        :key="getRowKey(depth, rowIdx, item.text)"
        :class="getRowCls(item)"
        :disabled="item.disabled"
        @click="onRowClick(item, depth, rowIdx)"
        @mouseover="onMouseOver(depth, rowIdx, item)"
      >
        {{ item.text }}
        <ev-icon
          v-if="item.items"
          :cls="'ei-arrow-right2 menu-arrow'"
        />
      </div>
    </div>
    <ev-context-menu-children
      v-for="(item, rowIdx) in items"
      v-if="item.items"
      :key="`children_menu_${item.text}_${depth}_${rowIdx}`"
      :visibility="getRowKey(depth, rowIdx, item.text) === focusedRowKey ? 'visible' : 'hidden'"
      :depth="depth + 1"
      :row-index="rowIdx"
      :items="item.items"
      @click="onClick"
    />
  </div>
</template>

<script>
  const prefixEvui = 'ev-contextmenu-children';

  export default {
    props: {
      visibility: {
        type: String,
        default: 'hidden',
        validator(value) {
          const list = ['visible', 'hidden', 'collapse', 'inherit', 'initial', 'unset'];
          return list.indexOf(value) > -1;
        },
      },
      depth: {
        type: Number,
        default: 0,
      },
      rowIndex: {
        type: Number,
        default: 0,
      },
      items: {
        type: Array,
        default() {
          return [];
        },
        validator(value) {
          return value != null && value.constructor === Array;
        },
      },
      click: {
        type: Function,
        default: () => {},
      },
    },
    data() {
      return {
        prefixEvui,
        bodyCls: '',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        clientRectLeft: 0,
        directionToShow: 'right',
        focusedRowKey: '',
        nextDepth: 1,
        rowHeight: 29,
        scrollbarSize: 16,
        clientRect: null,
        isHScroll: false,
        isVScroll: false,
      };
    },
    computed: {
      ctxMenuStyle() {
        return this.depth === 0 ? '' : `
            visibility: ${this.visibility};
            top: ${this.top}px;
            left: ${this.left}px;
          `;
      },
    },
    watch: {
      visibility(state) {
        if (state === 'visible') {
          this.setPosition();
        }
      },
    },
    created() {
      this.bodyCls = this.getBodyClasses();
      this.nextDepth = this.depth + 1;
    },
    methods: {
      onRowClick(item, depth, rowIdx) {
        if (!item.disabled) {
          this.$emit('click', {
            ...item,
            depth,
            rowIdx,
            scope: this,
          });
        }
      },
      onClick(item) {
        if (!item.disabled) {
          this.$emit('click', item);
        }
      },
      onMouseOver(depth, rowIdx, item) {
        this.hide(this.$children);

        if (!item.disabled) {
          this.focusedRowKey = this.getRowKey(depth, rowIdx, item.text);
        }
      },
      onMouseOut() {
        event.stopPropagation();
        this.hide(this.$children);
      },
      setPosition() {
        if (!this.clientRect) {
          this.clientRect = this.getClientRect() || {};

          if (this.clientRect) {
            this.isHScroll = window.innerWidth < document.scrollingElement.scrollWidth;
            this.isVScroll = window.innerHeight < document.scrollingElement.scrollHeight;
            this.width = this.clientRect.width || 0;
            this.height = this.clientRect.height || 0;
            this.top = this.rowIndex * this.rowHeight;
          }
        }

        if (this.clientRect) {
          // const firstChild = document.body.firstChild;
          const parent = this.$parent;
          let top = this.top;
          let left = 0;
          let width;
          let clientRectLeft;

          if (this.depth === 1) {
            const parentClientRect = this.getParentClientRect();
            clientRectLeft = parentClientRect.left;
            width = parentClientRect.width;
          } else {
            clientRectLeft = parent.clientRectLeft + parent.width;
            width = parent.width;
          }

          const remainingHeight = (window.innerHeight - top)
            - (this.isHScroll ? this.scrollbarSize : 0);
          const remainingWidth = (window.innerWidth - (clientRectLeft + width))
            - (this.isVScroll ? this.scrollbarSize : 0);

          if (this.height > remainingHeight) {
            top -= (this.height - remainingHeight);
          }

          if (parent.directionToShow === 'left'
            || this.width > remainingWidth) {
            left = -this.width;
            this.directionToShow = 'left';
          } else {
            left = width;
            this.directionToShow = 'right';
          }

          this.clientRectLeft = clientRectLeft;
          // this.top = firstChild.scrollTop + top;
          // this.left = firstChild.scrollLeft + left;
          this.top = top;
          this.left = left;
        }
      },
      getBodyClasses() {
        return [
          `${prefixEvui}-body`,
          {
            [`${prefixEvui}-box-style`]: this.depth !== 0,
          },
        ];
      },
      getRowCls(item) {
        return {
          [`${prefixEvui}-row`]: true,
          'exist-arrow': !!item.items,
          disabled: !!item.disabled,
        };
      },
      getRowKey(depth, rowIndex, text) {
        return `rowKey_${depth}_${rowIndex}_${text}`;
      },
      getClientRect() {
        return this.$el && (this.$el.firstElementChild.getClientRects() || {})[0];
      },
      getParentClientRect() {
        return this.$el && (this.$el.parentElement.getClientRects() || {})[0];
      },
      hide(children) {
        if (!children || children.constructor !== Array) {
          return;
        }

        let cmp;

        for (let ix = 0, ixLen = children.length; ix < ixLen; ix++) {
          cmp = children[ix];

          if (cmp.focusedRowKey) {
            cmp.focusedRowKey = '';
          }

          this.hide(cmp.$children);
        }
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-contextmenu-children {
    position: absolute;
    z-index: 850;
  }

  .ev-contextmenu-children-body {
    position: relative;
    font-size: 12px;

    @include evThemify() {
      background: evThemed('contextmenu-wrap-bg');
      color: evThemed('contextmenu-color');
      border: 1px solid evThemed('contextmenu-wrap-border');
      box-shadow: 0 7px 15px 0 evThemed('contextmenu-wrap-boxshadow');
    }
  }

  .ev-contextmenu-children-row {
    position: relative;
    height: 29px;
    padding: 2px 16px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;

    &:hover {
      @include evThemify() {
        background-color: evThemed('contextmenu-row-border');
      }
    }

    &.disabled {
      opacity: 0.5;
    }

    &:not(.disabled) {
      cursor: pointer;
    }

    &.exist-arrow {
      padding: 2px 21px 2px 16px;
    }

    .menu-arrow {
      position: absolute;
      top: 8px;
      right: 4px;
    }

    &:last-child {
      border-bottom: 0;
    }

    @include evThemify() {
      border-bottom: 1px solid evThemed('contextmenu-row-border');
    }
  }
</style>
