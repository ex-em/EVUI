<template>
  <ul class="ev-menu">
    <template
      v-for="(menuItem, index) in items"
      :key="menuItem.text + index"
    >
      <menu-item
        :item="menuItem"
        :selected-item="modelValue"
        :expandable="expandable"
        @click-menu="clickMenu"
      />
    </template>
  </ul>
</template>

<script>
import { ref } from 'vue';
import MenuItem from './MenuItem';

export default {
  name: 'EvMenu',
  components: {
    MenuItem,
  },
  props: {
    modelValue: {
      type: [String, Number],
      default: '',
    },
    items: {
      type: Array,
      default: () => [],
      validator: (list) => {
        if (list.filter(v => v.children).some(v => !Array.isArray(v.children))) {
          console.warn('[EVUI][Menu] children attribute must be \'Array\' type.');
          return false;
        } else if (list.filter(v => v.click).some(v => typeof v.click !== 'function')) {
          console.warn('[EVUI][Menu] click attribute must be \'Function\' type.');
          return false;
        }
        return true;
      },
    },
    expandable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const prevMenu = ref(props.modelValue);
    const clickMenu = ({ menuName, item }) => {
      emit('update:modelValue', menuName);
      emit('change', menuName, prevMenu.value, item);
      prevMenu.value = menuName;
    };
    return {
      clickMenu,
    };
  },
};
</script>
<style lang="scss">
.ev-menu {
  ul, ol, li {
    list-style: none;
  }
}
</style>
