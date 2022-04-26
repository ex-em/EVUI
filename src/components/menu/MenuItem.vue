<template>
  <li
    v-if="!item.hidden"
    :class="[
      'ev-menu-item',
       `depth${depth}`,
      { active: !item.disabled && item.value === selectedItem },
    ]">
    <div
      :class="[
        'ev-menu-title',
        {
          'expandable': hasChild && expandable,
          'disabled': item.disabled,
        },
      ]"
      @click="clickMenu({item, depth, disabled: item.disabled})"
    >
      <i
        v-if="!!item.iconClass"
        :class="['front-icon', item.iconClass]"
      />
      <span class="text">
        {{ item.text || item.value }}
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
        <component
          :is="comp"
          v-for="(menu, index) in item.children"
          :key="`${menu.value}_${index}_${depth + 1}`"
          :depth="depth + 1"
          :item="menu"
          :selected-item="selectedItem"
          :expandable="expandable"
          :disabled="disabled"
          :comp="comp"
          @click="clickMenu"
        />
      </ol>
    </template>
  </li>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'MenuItem',
  props: {
    selectedItem: {
      type: [String, Number],
      default: '',
    },
    item: {
      type: Object,
      default: () => {},
      validator: (obj) => {
        if (!obj.value) {
          console.warn('[EVUI][Menu] value attribute is required.');
          return false;
        } else if (obj.children !== undefined && !Array.isArray(obj.children)) {
          console.warn('[EVUI][Menu] children attribute must be \'Array\' type.');
          return false;
        } else if (obj.expand !== undefined && typeof obj.expand !== 'boolean') {
          console.warn('[EVUI][Menu] expand attribute must be \'Boolean\' type.');
          return false;
        } else if (obj.hidden !== undefined && typeof obj.hidden !== 'boolean') {
          console.warn('[EVUI][Menu] hidden attribute must be \'Boolean\' type.');
          return false;
        } else if (obj.disabled !== undefined && typeof obj.disabled !== 'boolean') {
          console.warn('[EVUI][Menu] disabled attribute must be \'Boolean\' type.');
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
    comp: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const defaultExpand = (props.expandable && props.item.expand !== undefined && typeof props.item.expand === 'boolean') ? props.item.expand : true;
    const isExpand = ref(defaultExpand);
    const hasChild = computed(() => !!props.item.children && !!props.item.children.length);

    const clickMenu = (params) => {
      if (hasChild.value && params.depth === props.depth) {
        if (props.expandable) {
          isExpand.value = !isExpand.value;
        }
      } else {
        emit('click', params);
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
  &.active > .ev-menu-title {
    @include evThemify() {
      color: evThemed('primary') !important;
    }
  }
}
.ev-menu-title {
  display: flex;
  position: relative;
  padding: 3px 7px;
  margin-bottom: 6px;
  cursor: pointer;
  align-items: center;
  line-height: 1.5em;
  word-break: break-all;
  &:hover:not(.expandable) {
    @include evThemify() {
      color: evThemed('primary') !important;
    }
  }
  &.expandable {
    padding-right: 27px;
  }
  &.disabled {
    color: #848484 !important;
    &:hover {
      cursor: not-allowed;
      color: #848484 !important;
    }
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
