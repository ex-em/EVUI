<template>
  <nav class="evui-navigation">
    <ev-menu
      v-model="currentMenu"
      :items="menu"
      @change="changeMenu"
    />
  </nav>
</template>

<script>
import { ref } from 'vue';
import router from '../router';

export default {
  setup() {
    const currentMenu = ref(null);
    router.beforeEach((to, from, next) => {
      if (!from.name) {
        currentMenu.value = to.name;
      }
      next();
    });

    const menu = router.getRoutes().filter(item => item.name !== 'PageNotFound').reduce((acc, cur) => {
      const menuInfoObj = {
        text: cur.name,
        value: cur.name,
      };
      if (!cur.meta.category) {
        acc.push(menuInfoObj);
      } else {
        const idx = acc.findIndex(v => v.text === cur.meta.category);
        if (idx < 0) {
          acc.push({
            text: cur.meta.category,
            value: cur.meta.category,
            children: [menuInfoObj],
          });
        } else {
          acc[idx].children.push(menuInfoObj);
        }
      }
      return acc;
    }, []);

    const changeMenu = (newVal) => {
      router.push({ name: newVal.value });
    };

    return {
      menu,
      currentMenu,
      changeMenu,
    };
  },
};
</script>

<style lang="scss">
@import '../style/index.scss';

.evui-navigation {
  position: fixed;
  top: $header-height;
  left: 0;
  width: $nav-width;
  height: calc(100% - #{$header-height});
  padding-bottom: 17px;
  box-sizing: border-box;
  overflow-y: auto;

  @include themify() {
    border-right: 1px solid themed('border-color-base');
    background-color: themed('background-color-base');
  }
  ul, li {
    list-style: none;
  }

  .ev-menu-item:not(.depth1) {
    border-left: 5px solid transparent;
    &.active {
      border-left: 5px solid $color-blue;
    }
  }
  .ev-menu-title {
    padding: 3px 33px;
    font-size: $font-size-base;
    line-height: 1.7em;

    @include themify() {
      color: themed('font-color-nav');
    }
  }
  .depth1 > .ev-menu-title {
    padding: 0 30px;
    margin: 27px 0 10px;

    @include themify() {
      color: themed('color-disabled');
    }
  }
}
</style>
