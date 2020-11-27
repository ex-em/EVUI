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
    const urlArr = window.location.href.split('/');
    const menuName = urlArr[urlArr.length - 1];
    const currentMenu = ref(menuName.charAt(0).toUpperCase() + menuName.slice(1));

    const getCategoryMenu = (category) => {
      const store = router.getRoutes().filter(item => item.name !== 'PageNotFound');
      const layoutList = ['Tab', 'Window', 'Menu', 'ContextMenu', 'Button', 'Icon'];
      const formList = ['Checkbox', 'Radio', 'Select', 'Toggle', 'TextField', 'InputNumber', 'Slider', 'Calendar', 'DatePicker', 'Scheduler'];
      const tableList = ['Grid', 'Tree', 'TreeTable'];
      const chartList = ['BarChart', 'LineChart', 'ScatterChart', 'PieChart', 'ComboChart', 'ReactivityChart'];
      const noticeList = ['Message', 'MessageBox', 'Notification', 'Loading', 'Progress'];

      let list;
      switch (category) {
        case 'layout':
          list = layoutList;
          break;
        case 'form':
          list = formList;
          break;
        case 'table':
          list = tableList;
          break;
        case 'chart':
          list = chartList;
          break;
        case 'notice':
          list = noticeList;
          break;
        default:
          break;
      }

      return list ? store.reduce((pre, item) => {
        if (list.includes(item.name)) {
          pre.push({ text: item.name });
        }
        return pre;
      }, []) : [];
    };

    const menu = [
      {
        text: 'Layout',
        children: getCategoryMenu('layout'),
      },
      {
        text: 'Form',
        children: getCategoryMenu('form'),
      },
      {
        text: 'Table',
        children: getCategoryMenu('table'),
      },
      {
        text: 'Chart',
        children: getCategoryMenu('chart'),
      },
      {
        text: 'Notice',
        children: getCategoryMenu('notice'),
      },
    ];

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
