<template>
  <ul class="ev-menu">
    <menu-item
      v-for="(menu, index) in items"
      :key="`${menu.text}_${index}_0`"
      :item="menu"
      :selected-item="modelValue"
      :expandable="expandable"
      :comp="component"
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
    const component = MenuItem;
    return {
      clickMenu,
      component,
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
