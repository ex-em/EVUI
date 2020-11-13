<template>
  <nav class="evui-navigation">
    <ul>
      <li
        v-for="(menu, index) in store"
        :key="menu.name + index"
        class="evui-navigation-item"
        :class="{ active: menu.name === currentMenu }"
        @click="clickMenu(menu.path)"
      >
       {{ menu.name }}
      </li>
    </ul>
  </nav>
</template>

<script>
import { computed, onActivated } from 'vue';
import router from '../router';

export default {
  setup() {
    const currentMenu = computed(() => router.currentRoute?.value.name);
    const store = router.getRoutes().filter(item => item.name !== 'PageNotFound');
    const clickMenu = (routerLink) => {
      router.push({ path: routerLink });
    };

    onActivated(() => {
      document.documentElement.scrollTop = 0;
    });
    return {
      store,
      currentMenu,
      clickMenu,
    };
  },
};
</script>

<style lang="scss" scoped>
@import '../style/index.scss';

.evui-navigation {
  position: fixed;
  top: $header-height;
  left: 0;
  width: $nav-width;
  height: calc(100% - #{$header-height});
  padding: 17px 0;
  box-sizing: border-box;
  overflow-y: auto;

  @include themify() {
    border-right: 1px solid themed('border-color-base');
    background-color: themed('background-color-base');
  }
  ul, li {
    list-style: none;
  }
  &-item {
    padding: 3px 24px;
    margin-bottom: 3px;
    font-size: $font-size-base;
    line-height: 1.7em;
    cursor: pointer;
    border-left: 5px solid transparent;
    transition: all $animate-base;

    @include themify() {
      color: themed('font-color-nav');
    }
    &:hover {
      color: $color-blue;
    }
    &.active {
      border-left: 5px solid $color-blue;
      color: $color-blue;
    }
  }
  .evui-link {
    display: flex;
    padding: 20px;

    @include themify() {
      background-color: themed('background-color-lighten');
    }
  }
}
</style>
