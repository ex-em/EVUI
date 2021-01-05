<template>
  <ul class="ev-menu">
    <menu-item
      v-for="(menuItem, index) in items"
      :key="`${menuItem.text}_${index}_0`"
      :item="menuItem"
      :selected-item="modelValue"
      :expandable="expandable"
      @click="clickMenu"
    />
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
    },
    expandable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const prevMenuItem = ref(props.items.filter(item => props.modelValue === item.value));
    const clickMenu = (newMenuItem) => {
      emit('update:modelValue', newMenuItem.value);
      emit('change', newMenuItem, prevMenuItem.value);
      prevMenuItem.value = newMenuItem;
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
