<template>
  <ul :class="classes">
    <li>
      <span :class="[`${prefixCls}-arrow`,
       {[`${prefixCls}-arrow-disabled`]: data.disabled}]" @click="handleExpand">
        <ev-icon v-if="showArrow" :cls="arrowClasses"></ev-icon>
        <ev-loading-mask v-if="showLoading"></ev-loading-mask>
      </span>
      <ev-checkbox
        v-if="showCheckbox"
        v-model="data.checked"
        type="square"
        size="small"
        after-type="check"
        :indeterminate="data.indeterminate"
        :disabled="data.disabled || data.disableCheckbox"
        @on-click="handleCheck"
      ></ev-checkbox>
      <Render v-if="data.render" :render="data.render" :data="data" :node="node"></Render>
      <Render v-else-if="isParentRender" :render="parentRender" :data="data" :node="node"></Render>
      <span v-else :class="titleClasses" @click="handleSelect">{{ data.title }}</span>
      <Tree-node
        v-for="(item, i) in children"
        v-if="data.expand"
        :key="i"
        :data="item"
        :multiple="multiple"
        :show-checkbox="showCheckbox"
        :children-key="childrenKey">
      </Tree-node>
    </li>
  </ul>
</template>

<script>
import { findComponentUpward } from '@/common/utils.tree';
import Emitter from '@/common/emitter';
import Render from './render';

const prefixCls = 'ev-tree';

export default {
  name: 'TreeNode',
  components: {
    Render,
  },
  mixins: [Emitter],
  props: {
    data: {
      type: Object,
      default() {
        return {};
      },
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    childrenKey: {
      type: String,
      default: 'children',
    },
    showCheckbox: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      prefixCls,
    };
  },
  computed: {
    classes() {
      return [
        `${prefixCls}-children`,
      ];
    },
    selectedCls() {
      return [
        {
          [`${prefixCls}-node-selected`]: this.data.selected,
        },
      ];
    },
    arrowClasses() {
      return this.data.expand ? 'ei-arrow-down' : 'ei-arrow-right';
    },
    titleClasses() {
      return [
        `${prefixCls}-title`,
        {
          [`${prefixCls}-title-selected`]: this.data.selected,
        },
      ];
    },
    showArrow() {
      return (this.data[this.childrenKey] && this.data[this.childrenKey].length) || ('loading' in this.data && !this.data.loading);
    },
    showLoading() {
      return 'loading' in this.data && this.data.loading;
    },
    isParentRender() {
      const Tree = findComponentUpward(this, 'Tree');
      return Tree && Tree.render;
    },
    parentRender() {
      const Tree = findComponentUpward(this, 'Tree');
      if (Tree && Tree.render) {
        return Tree.render;
      }
      return null;
    },
    node() {
      const Tree = findComponentUpward(this, 'Tree');
      if (Tree) {
        return [Tree.flatState, Tree.flatState.find(item => item.nodeKey === this.data.nodeKey)];
      }
      return [];
    },
    children() {
      return this.data[this.childrenKey];
    },
  },
  methods: {
    handleExpand() {
      const item = this.data;
      if (item.disabled) return;
      // async loading
      if (!item[this.childrenKey].length) {
        const tree = findComponentUpward(this, 'Tree');
        if (tree && tree.loadData) {
          this.$set(this.data, 'loading', true);
          tree.loadData(item, (children) => {
            this.$set(this.data, 'loading', false);
            if (children.length) {
              this.$set(this.data, this.childrenKey, children);
              this.$nextTick(() => this.handleExpand());
            }
          });
          return;
        }
      }
      if (item[this.childrenKey] && item[this.childrenKey].length) {
        this.$set(this.data, 'expand', !this.data.expand);
        this.dispatch('Tree', 'toggle-expand', this.data);
      }
    },
    handleSelect() {
      if (this.data.disabled) return;
      this.dispatch('Tree', 'on-selected', this.data.nodeKey);
    },
    handleCheck() {
      if (this.data.disabled) return;
      const changes = {
        checked: this.data.checked && !this.data.indeterminate,
        nodeKey: this.data.nodeKey,
      };
      this.dispatch('Tree', 'on-click-checkbox', changes);
    },
  },
};
</script>

<style scoped>

</style>
