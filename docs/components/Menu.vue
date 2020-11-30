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

    const menu = (() => {
      const store = router.getRoutes().filter(item => item.name !== 'PageNotFound');
      const list = [];
      const tempListObj = {};

      store.forEach((item) => {
        const category = item.meta.category;
        if (category) {
          if (!tempListObj[category]) {
            tempListObj[category] = [];
          }
          tempListObj[category].push({ text: item.name });
        }
      });

      const tempListKeys = Object.keys(tempListObj);
      for (let ix = 0; ix < tempListKeys.length; ix++) {
        const text = tempListKeys[ix];
        list.push({
          text,
          children: tempListObj[text],
        });
      }

      return list;
    })();

    const changeMenu = (newVal) => {
      router.push({ name: newVal });
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
