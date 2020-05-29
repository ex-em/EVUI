<template>
  <div
    :style="ctxMenuStyle"
    :class="prefixEvui"
    @mouseleave="onMouseLeave"
  >
    <div
      class="contextmenu-body"
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
    <context-menu-child
      v-for="(item, rowIdx) in items"
      v-if="item.items"
      :key="`children_menu_${item.text}_${depth}_${rowIdx}`"
      :depth="depth + 1"
      :row-index="rowIdx"
      :row-key="getRowKey(depth, rowIdx, item.text)"
      :focused-row-key="focusedRowKey"
      :items="item.items"
      @click="onClick"
    />
  </div>
</template>

<script>
  export default {
    components: {
      ContextMenuChild: () => import('./contextmenu.child'),
    },
    props: {
      visibility: {
        type: String,
        default: 'visible',
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
    },
    data() {
      return {
        prefixEvui: 'contextmenu',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        clientRect: null,
        clientRectLeft: 0,
        isHScroll: false,
        isVScroll: false,
        scrollbarSize: 16,
        directionToShow: 'right',
        rowHeight: 29,
        focusedRowKey: '',
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
      visibility(value) {
        if (value === 'visible') {
          this.setPosition();
        }
      },
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
        if (item.disabled) {
          this.focusedRowKey = '';
        } else {
          this.focusedRowKey = this.getRowKey(depth, rowIdx, item.text);
        }
      },
      onMouseLeave() {
        this.focusedRowKey = '';
      },
      setPosition() {
        const parent = this.$parent.$parent;

        if (!this.clientRect) {
          this.clientRect = this.getClientRect();

          if (this.clientRect) {
            const scrollEl = document.scrollingElement
              || document.documentElement || document.body;
            this.isHScroll = window.innerWidth < scrollEl.scrollWidth;
            this.isVScroll = window.innerHeight < scrollEl.scrollHeight;
            this.width = this.clientRect.width || 0;
            this.height = this.clientRect.height || 0;
            this.top = this.rowIndex * this.rowHeight;
          }
        }

        if (this.clientRect && parent) {
          const parentClientRect = parent.getClientRect();
          const parentClientRectLeft = parent.clientRectLeft;
          const parentWidth = parentClientRect.width || 0;
          const parentDirectionToShow = parent.directionToShow;
          let top = this.top;
          let left = 0;
          let clientRectLeft;

          if (this.depth === 1) {
            clientRectLeft = parentWidth;
          } else {
            clientRectLeft = parentWidth + parentClientRectLeft;
          }

          const remainingHeight = (window.innerHeight - top)
            - (this.isHScroll ? this.scrollbarSize : 0);
          const remainingWidth = (window.innerWidth - (clientRectLeft + parentWidth))
            - (this.isVScroll ? this.scrollbarSize : 0);

          if (this.height > remainingHeight) {
            top -= (this.height - remainingHeight);
          }

          if (parentDirectionToShow === 'left'
            || this.width > remainingWidth) {
            left = -this.width;
            this.directionToShow = 'left';
          } else {
            left = parentWidth;
            this.directionToShow = 'right';
          }

          this.clientRectLeft = clientRectLeft;
          this.top = top;
          this.left = left;
        }
      },
      getClientRect() {
        return (
          this.$el
          && this.$el.firstElementChild
          && this.$el.firstElementChild.getClientRects()[0]
        ) || {};
      },
      getRowCls(item) {
        return {
          'contextmenu-row': true,
          'exist-arrow': !!item.items,
          disabled: !!item.disabled,
        };
      },
      getRowKey(depth, rowIndex, text) {
        return `rowKey_${depth}_${rowIndex}_${text}`;
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .contextmenu {
    position: absolute;
    z-index: 850;

    .contextmenu-body {
      position: relative;
      font-size: 12px;

      @include evThemify() {
        background: evThemed('contextmenu-wrap-bg');
        color: evThemed('contextmenu-color');
        border: 1px solid evThemed('contextmenu-wrap-border');
        box-shadow: 0 7px 15px 0 evThemed('contextmenu-wrap-boxshadow');
      }
    }

    .contextmenu-row {
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
        pointer-events: none;
      }

      &:last-child {
        border-bottom: 0;
      }

      @include evThemify() {
        border-bottom: 1px solid evThemed('contextmenu-row-border');
      }
    }
  }
</style>
