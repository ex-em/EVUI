<template>
  <div
    :style="contextChildrenStyle"
    :class="prefixEvui"
    @mouseout="onMouseOut"
  >
    <div
      :class="bodyCls"
    >
      <div :class="`${prefixEvui}-separator`"/>
      <div
        v-for="(item, rowIdx) in items"
        :key="`${item.text}_${depth}_${rowIdx}`"
        :class="`${prefixEvui}-row`"
        @click="onRowClick(item, depth, rowIdx)"
        @mouseover="onMouseOver(item.text, depth, rowIdx)"
      >
        {{ item.text }}
        <i
          v-if="item.items"
          :class="`${prefixEvui}-right-arrow`"
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
  import '@/styles/all.css';
  import '@/styles/evui.css';

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
        return this.depth === 0 ? '' : `margin-top: ${26 * this.parentRowIdx}px; left: -2px;`;
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

<style>
  .ev-contextmenu-children{
    position: relative;
    float: left;
    z-index: 9999;
  }
  .ev-contextmenu-children-body{
    float: left;
    position: relative;
    border: 1px solid #d0d0d0;
    font-size: 12px;
    background: #f0f0f0;
    color: #222222;
  }
  .ev-contextmenu-children-box-style{
    border-radius: 3px 0 0 3px;
    box-shadow: 2px 2px #9c9c9c;
  }
  .ev-contextmenu-children-separator {
    position: absolute;
    top: 0;
    left: 20px;
    width: 2px;
    height: 100%;
    background-color: white;
    border-left: solid 1px #e0e0e0;
    overflow: hidden;
  }
  .ev-contextmenu-children-row{
    position: relative;
    padding: 2px 22px 2px 30px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .ev-contextmenu-children-row:hover{
    margin: 0 2px 0 2px;
    padding: 1px 19px 1px 27px;
    background-color: #e6e6e6;
    border: 1px solid #9d9d9d;
    border-radius: 3px;
  }
  .ev-contextmenu-children-right-arrow{
    position: absolute;
  }
  .ev-contextmenu-children-right-arrow:after{
    padding-left: 8px;
    vertical-align: middle;
    font: bold 16px "Font Awesome\ 5 Free";
    color: #9c9c9c;
    background: -webkit-linear-gradient(#eee, #333);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    content: "\f0da";
  }
  .ev-contextmenu-children-sub-row{
    position: relative;
    padding: 2px 24px 2px 34px;
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .ev-contextmenu-children-sub-row:hover{
    padding: 1px 11px 1px 33px;
    background-color: #e6e6e6;
    border: 1px solid #9d9d9d;
    border-radius: 3px;
  }
</style>
