<template>
  <ul
    :style="`width: ${width}`"
  >
    <li
      v-for="menuItem in menu"
      :key="menuItem.name"
      class="ev-menu-item"
    >
      <menu-item
        v-bind="menuItem"
        :depth="1"
        :selected-name="value"
        @menu-click="onClick"
      />
    </li>
  </ul>
</template>
<script>
  export default {
    components: {
      MenuItem: () => import('./menu.nav.item.vue'),
    },
    props: {
      menu: {
        type: Array,
        default: () => [],
      },
      value: {
        type: String,
        default: '',
      },
      width: {
        type: String,
        default: '240px',
      },
    },
    data() {
      return {};
    },
    methods: {
      onClick(selectedName) {
        this.$emit('input', selectedName);
      },
    },
  };
</script>
<style>
  .ev-menu-item {
    list-style-type: none;
  }
  div.ev-menu-item {
    padding: 8px 18px;

  }
</style>
