<template>
  <li
    v-if="!item.hidden"
    :class="[
      'ev-menu-item',
       `depth${depth}`,
      { active: item.text === selectedItem },
    ]">
    <div
      :class="[
        'ev-menu-title',
      { active: item.text === selectedItem },
        { 'expandable': hasChild && expandable },
      ]"
      @click="clickMenu(item.text, depth)"
    >
      <i
        v-if="!!item.iconClass"
        :class="['front-icon', item.iconClass]"
      />
      <span class="text">
        {{ item.text }}
      </span>
      <span
        v-if="expandable && hasChild"
        :class="[
          'list-expend-icon',
          { 'expend': expandable && isExpend }
        ]"
        >
        <i class="ev-icon-s-arrow-up" />
      </span>
    </div>
    <template v-if="hasChild">
      <ol
        v-show="isExpend"
        :class="['ev-menu-sub', `depth${depth}`]"
      >
        <template
          v-for="(menuItem, index) in item.children"
          :key="menuItem.text + index"
        >
          <menu-item
            :depth="depth + 1"
            :item="menuItem"
            :selected-item="selectedItem"
            :expandable="expandable"
            @click-menu="clickMenu"
          />
        </template>
      </ol>
    </template>
  </li>
</template>

<script>
import { ref, computed } from 'vue';
import MenuItem from './MenuItem';

export default {
  name: 'MenuItem',
  components: {
    MenuItem,
  },
  props: {
    selectedItem: {
      type: [String, Number],
      default: '',
    },
    item: {
      type: Object,
      default: () => {},
    },
    depth: {
      type: Number,
      default: 1,
    },
    expandable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['click-menu'],
  setup(props, { emit }) {
    const isExpend = ref(true);
    const hasChild = computed(() => !!props.item.children && !!props.item.children.length);

    const clickMenu = (menuName, depth) => {
      if (hasChild.value && depth === props.depth) {
        if (props.expandable) {
          isExpend.value = !isExpend.value;
        }
      } else {
        emit('click-menu', menuName, props.depth);
      }
    };

    return {
      isExpend,
      hasChild,
      clickMenu,
    };
  },
};
</script>
<style lang="scss">
@import '../../style/index.scss';

.ev-menu-item {
  line-height: 1.3em;
  &:not(.depth1) {
    padding-left: 10px;
  }
}
.ev-menu-title {
  display: flex;
  padding: 3px 7px;
  margin-bottom: 6px;
  cursor: pointer;
  align-items: center;
  line-height: 1.5em;
  word-break: break-all;

  &.active,
  &:hover:not(.expandable) {
    @include evThemify() {
      color: evThemed('primary') !important;
    }
  }
  &.expandable {
    position: relative;
    padding-right: 27px;
  }

  .list-expend-icon {
    position: absolute;
    top: 50%;
    right: 7px;
    transform: translateY(-50%);
    transition: transform $animate-fast;
    &.expend {
      transform: translateY(-50%) rotate(180deg);
    }
  }
  .text {
    display: inline-block;
    margin-left: 4px;
    flex: 1;
  }
}

</style>
