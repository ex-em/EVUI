<template>
  <ul
    :style="`width: ${width}`"
    class="ev-menu"
  >
    <li
      v-for="menuItem in menu"
      :key="menuItem.name"
      :class="{split: menuItem.hidden === true ? false : true}"
      class="ev-menu-sub"
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
<style lang="scss">
  @import '~@/styles/default';

  .ev-menu {
    @include evThemify() {
      color: evThemed('menu-color');
    }
  }

  .ev-menu-sub {
    list-style-type: none;

    @include evThemify() {
      color: evThemed('menu-color');
    }

    &.split:not(:first-child) {
      @include evThemify() {
        padding-top: 18px;
        border-top: 1px solid evThemed('menu-sub-split');
      }
    }

    & > .first {
      padding: 0 18px;
    }
  }

  .ev-menu-item {
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
    list-style-type: none;
    padding-bottom: 18px;
    font-size: 13px;

    &.first {
      font-size: 16px;
    }

    &.selected {
      @include evThemify() {
        color: evThemed('menu-selected-bg');
      }
    }
  }
</style>
