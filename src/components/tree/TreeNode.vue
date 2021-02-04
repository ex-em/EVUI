<template>
  <ul
    v-show="treeData.visible"
    class="ev-tree-children"
  >
    <li>
      <span
        :class="{ expand: treeData.expand }"
        class="ev-tree-toggle"
      >
        <ev-icon
          v-if="showExpandIcon"
          :icon="expandIconClasses"
          @click="handleExpand"
        />
      </span>
      <div class="ev-tree-node">
        <ev-checkbox
          v-if="useCheckbox"
          v-model="treeData.checked"
          :indeterminate="treeData.indeterminate"
          :disabled="treeData.disabled"
          @change="handleCheck(treeData.checked, treeData.nodeKey)"
        />
        <ev-icon
          v-if="treeData.iconClass"
          :icon="treeData.iconClass"
          class="ev-tree-icon"
        />
        <span
          :class="{
            'ev-tree-title-selected': treeData.selected,
            'ev-tree-title-disabled': treeData.disabled,
          }"
          class="ev-tree-title"
          @contextmenu="handleContextmenu"
          @click="clickTreeContent"
          @dblclick="dblClickTreeContent"
        >
          {{ treeData.title }}
        </span>
      </div>
      <transition-group name="fade">
        <tree-node
          v-for="(child, i) in childrenInfo"
          v-if="treeData.expand"
          :key="`${child.value}-${i}`"
          :data="child"
          :use-checkbox="useCheckbox"
          :expand-icon="expandIcon"
          :collapse-icon="collapseIcon"
          @update-checked-info="emitCheckedInfo"
          @click-node="emitClickedContent"
          @dblclick-node="emitDblClickedContent"
          @show-context-menu="emitContextMenuFlag"
        />
      </transition-group>
    </li>
  </ul>
</template>

<script>
import { reactive, computed } from 'vue';

export default {
  name: 'TreeNode',
  props: {
    data: {
      type: Object,
      require: true,
      default: () => ({}),
    },
    useCheckbox: {
      type: Boolean,
      default: false,
    },
    expandIcon: {
      type: String,
      default: '',
    },
    collapseIcon: {
      type: String,
      default: '',
    },
  },
  emits: {
    'update-checked-info': null,
    'click-node': null,
    'dblclick-node': null,
    'show-context-menu': null,
  },
  setup(props, { emit }) {
    const treeData = reactive(props.data);
    const showExpandIcon = computed(() =>
      (props.data.children && props.data.children.length));

    const expandIconClasses = computed(() => {
      const expandIcon = props.expandIcon ? props.expandIcon : 'ev-icon-s-play';
      const collapseIcon = props.expandIcon ? props.collapseIcon : 'ev-icon-s-play';
      return props.data.expand ? collapseIcon : expandIcon;
    });

    const childrenInfo = computed(() => props.data.children);

    function handleCheck(isChecked, nodeKey) {
      emit('update-checked-info', { nodeKey, isChecked });
    }

    function emitCheckedInfo({ nodeKey, isChecked }) {
      emit('update-checked-info', { nodeKey, isChecked });
    }

    function handleExpand() {
      treeData.expand = !treeData.expand;
    }

    function clickTreeContent() {
      if (treeData.disabled) {
        return;
      }
      treeData.selected = !treeData.selected; // for highlighting clicked title
      emit('click-node', treeData.nodeKey);
    }

    function emitClickedContent(nodeKey) {
      emit('click-node', nodeKey);
    }

    function dblClickTreeContent() {
      if (treeData.disabled) {
        return;
      }
      emit('dblclick-node', treeData.nodeKey);
    }

    function emitDblClickedContent(nodeKey) {
      emit('dblclick-node', nodeKey);
    }

    function handleContextmenu(e) {
      emit('show-context-menu', true, e);
    }

    const emitContextMenuFlag = (isShow, e) => {
      emit('show-context-menu', isShow, e);
    };

    return {
      expandIconClasses,
      showExpandIcon,
      treeData,
      childrenInfo,
      handleCheck,
      emitCheckedInfo,
      handleExpand,
      clickTreeContent,
      emitClickedContent,
      dblClickTreeContent,
      emitDblClickedContent,
      handleContextmenu,
      emitContextMenuFlag,
    };
  },
};
</script>

<style lang="scss">
$expand-toggle-icon-size: 13px;

@import '../../style/index.scss';

.ev-tree-view {
  li {
    ul {
      padding: 0 0 0 18px;
      margin: 0;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    font-size: 12px;

    li {
      list-style: none;
      padding: 3px 0;
      margin: 0;
      text-align: start;
      white-space: nowrap;
    }
  }
}

.ev-tree-toggle {
  display: inline-block;
  width: $expand-toggle-icon-size; // icon font size와 동일
  margin-right: 2px;
  text-align: center;
  vertical-align: middle;

  .ev-icon-s-play {
    transition-property: transform;
    transition-duration: 0.4s;
  }

  &.expand > .ev-icon-s-play {
    transform: rotate(90deg);
  }

  i {
    display: inline-block;
    position: relative;
    cursor: pointer;
    font-size: $expand-toggle-icon-size;
    vertical-align: middle;
  }
}

.ev-tree-title {
  cursor: pointer;
  vertical-align: middle;

  &:hover, &-selected {
    @include evThemify() {
      color: evThemed('primary') !important;
    }
  }

  &-disabled, &-disabled:hover {
    cursor: not-allowed;
    user-select: none;

    @include evThemify() {
      color: evThemed('disabled') !important;
    }
  }
}

.ev-tree-icon {
  margin: 0 5px;
  font-size: 16px;
  vertical-align: middle;
}

.ev-tree-node {
  display: inline-block;
  width: calc(100% - (#{$expand-toggle-icon-size} + 3px * 2));
  padding: 7px 0;
  vertical-align: middle;

  .ev-checkbox {
    display: inline-block;
    padding: 5px 5px 0;
    margin: 0;
    vertical-align: middle;
  }
}

.fade {
  &-enter-active {
    animation: fade 0.3s ease-in-out;
  }

  &-leave-active {
    animation: fade 0.3s ease-in-out reverse;
  }

  @keyframes fade {
    0% {
      opacity: 0;
      height: 0;
    }

    50% {
      opacity: 0.3;
      height: 20%;
    }

    100% {
      opacity: 1;
    }
  }
}

</style>
