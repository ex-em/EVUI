<template>
  <ul>
    <li
      v-for="menuItem in menu"
      :key="menuItem.name"
      :style="`margin-left: ${depth * 5}px`"
      class="ev-menu-sub"
    >
      <menu-item
        v-bind="menuItem"
        :selected-name="selectedName"
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
      depth: {
        type: Number,
        default: 1,
      },
      selectedName: {
        type: String,
        default: '',
      },
    },
    methods: {
      onClick(selectedName) {
        this.$emit('menu-click', selectedName);
      },
    },
  };
</script>
