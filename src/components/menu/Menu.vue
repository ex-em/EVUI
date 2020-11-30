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
    },
    expandable: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const prevMenu = ref(props.modelValue);
    const clickMenu = (newMenu) => {
      emit('update:modelValue', newMenu);
      emit('change', newMenu, prevMenu.value);
      prevMenu.value = newMenu;
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
