<template>
  <div
    :style="contextChildrenStyle"
    :class="prefixEvui"
  >
    <div
      :class="bodyCls"
      @mouseout="onMouseOut"
    >
      <div
        v-for="(item, rowIdx) in items"
        :key="`${item.text}_${depth}_${rowIdx}`"
        :class="`${prefixEvui}-row`"
        @click="onRowClick(item, depth, rowIdx)"
        @mouseover="onMouseOver(item.text, depth, rowIdx)"
      >
        <div
          :class="{ 'no-children': !item.items }"
          class="menu-name"
        >
          {{ item.text }}
        </div>
        <ev-icon
          v-if="item.items"
          :cls="'ei-arrow-right2 menu-arrow'"
        />
      </div>
    </div>
    <ev-context-menu-children
      v-for="(item, rowIdx) in items"
      v-if="item.items"
      v-show="getSubMenuKey(item.text, depth, rowIdx) === subMenuKey"
      :key="getSubMenuKey(item.text, depth, rowIdx)"
      :parent-row-idx="rowIdx"
      :depth="depth + 1"
      :items="item.items"
      @click="onClick"
    />
  </div>
</template>

<script>
  const prefixEvui = 'ev-contextmenu-children';

  export default {
    props: {
      depth: {
        type: Number,
        default: 0,
      },
      parentRowIdx: {
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
        contextChildrenStyle: '',
        bodyCls: '',
        subMenuKey: '',
        nextDepth: 1,
      };
    },
    created() {
      this.contextChildrenStyle = this.getContextChildrenStyle();
      this.bodyCls = this.getBodyClasses();
      this.nextDepth = this.depth + 1;
    },
    methods: {
      onRowClick(item, depth, rowIdx) {
        this.$emit('click', { ...item, depth, rowIdx, parentRowIdx: this.parentRowIdx });
      },
      onClick(item) {
        this.$emit('click', item);
      },
      onMouseOver(text, depth, rowIdx) {
        this.subMenuKey = this.getSubMenuKey(text, depth, rowIdx);
      },
      onMouseOut() {
        event.stopPropagation();
        this.clearSubMenuKey(this.$children);
      },
      getSubMenuKey(text, depth, rowIdx) {
        return `menu_sub_${text}_${depth}_${rowIdx}`;
      },
      getContextChildrenStyle() {
        return this.depth === 0 ? '' : `margin-top: ${29 * this.parentRowIdx}px; left: 1px;`;
      },
      getBodyClasses() {
        return [
          `${prefixEvui}-body`,
          {
            [`${prefixEvui}-box-style`]: this.depth !== 0,
          },
        ];
      },
      clearSubMenuKey(children) {
        if (!children || children.constructor !== Array) {
          return;
        }

        let cmp;

        for (let ix = 0, ixLen = children.length; ix < ixLen; ix++) {
          cmp = children[ix];

          if (cmp.subMenuKey) {
            cmp.subMenuKey = '';
          }

          this.clearSubMenuKey(cmp.$children);
        }
      },
    },
  };
</script>

<style lang="scss">
  @import '~@/styles/default';

  .ev-contextmenu-children {
    position: relative;
    float: left;
  }

  .ev-contextmenu-children-body {
    float: left;
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
    padding: 2px 0;
    line-height: 25px;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;

    & .menu-name {
      float: left;
      padding: 0 5px 0 16px;

      &.no-children {
        padding-right: 16px;
      }
    }

    & .menu-arrow {
      float: right;
      line-height: 25px;
      padding-right: 4px;
    }

    &:last-child {
      border-bottom: 0;
    }

    @include evThemify() {
      border-bottom: 1px solid evThemed('contextmenu-row-border');
    }
  }

  .ev-contextmenu-children-row:hover{
    opacity: 0.6;

    @include evThemify() {
      background-color: evThemed('contextmenu-row-border');
    }
  }
</style>
