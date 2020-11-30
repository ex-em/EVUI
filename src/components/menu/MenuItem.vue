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
          { 'expend': expandable && isExpand }
        ]"
      >
        <i class="ev-icon-s-arrow-up" />
      </span>
    </div>
    <template v-if="hasChild">
      <ol
        v-show="isExpand"
        :class="['ev-menu-sub', `depth${depth}`]"
      >
        <menu-item
          v-for="(menuItem, index) in item.children"
          :key="`${menuItem.text}_${index}_${depth + 1}`"
          :depth="depth + 1"
          :item="menuItem"
          :selected-item="selectedItem"
          :expandable="expandable"
          @click="clickMenu"
        />
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
      validator: (obj) => {
        if (obj.children !== undefined && !Array.isArray(obj.children)) {
          console.warn('[EVUI][Menu] children attribute must be \'Array\' type.');
          return false;
        } else if (obj.expand !== undefined && typeof obj.expand !== 'boolean') {
          console.warn('[EVUI][Menu] expand attribute must be \'Boolean\' type.');
          return false;
        } else if (obj.hidden !== undefined && typeof obj.hidden !== 'boolean') {
          console.warn('[EVUI][Menu] hidden attribute must be \'Boolean\' type.');
          return false;
        }
        return true;
      },
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
  emits: ['click'],
  setup(props, { emit }) {
    const defaultExpand = (props.expandable && props.item.expand !== undefined && typeof props.item.expand === 'boolean') ? props.item.expand : true;
    const isExpand = ref(defaultExpand);
    const hasChild = computed(() => !!props.item.children && !!props.item.children.length);

    const clickMenu = (menuName, depth) => {
      if (hasChild.value && depth === props.depth) {
        if (props.expandable) {
          isExpand.value = !isExpand.value;
        }
      } else {
        emit('click', menuName, props.depth);
      }
    };

    return {
      isExpand,
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
