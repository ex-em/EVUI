<template>
  <nav class="evui-navigation">
    <ul>
      <li
        v-for="(menu, index) in store"
        :key="menu.name + index"
        class="evui-navigation-item"
        @click="clickMenu(menu.routerLink)"
      >
       {{ menu.name }}
      </li>
    </ul>
  </nav>
</template>

<script>
import router from '../router';

export default {
  setup() {
    const store = [
      {
        name: 'Introduce',
        cls: 'fas fa-th-large',
        routerLink: '/',
      },
      {
        name: 'Tab',
        routerLink: '/tab',
        content: '탭 패널 샘플',
      },
      {
        name: 'ContextMenu',
        routerLink: '/contextMenu',
        content: '컨텍스트 메뉴',
      },
      {
        name: 'Button',
        routerLink: '/button',
        content: '버튼',
      },
      {
        name: 'CheckBox',
        routerLink: '/checkbox',
        content: '체크박스',
      },
      {
        name: 'RadioButton',
        routerLink: '/radio',
        content: '라디오버튼',
      },
      {
        name: 'InputNumber',
        routerLink: '/inputNumber',
        content: '숫자입력',
      },
      {
        name: 'SelectBox',
        routerLink: '/select',
        content: '셀렉트 박스',
      },
      {
        name: 'Slider',
        routerLink: '/slider',
        content: '슬라이더',
      },
      {
        name: 'Grid',
        routerLink: '/grid',
        content: '테이블 - 그리드',
      },
      {
        name: 'Tree',
        routerLink: '/tree',
        content: '트리',
      },
      {
        name: 'Tree Table',
        routerLink: '/treeTable',
        content: '트리 테이블',
      },
      {
        name: 'Date Picker',
        routerLink: '/datePicker',
        content: '데이트 피커',
      },
      {
        name: 'Toggle',
        routerLink: '/toggle',
        content: '토글',
      },
      {
        name: 'TextField',
        routerLink: '/textField',
        content: '텍스트 필드',
      },
      {
        name: 'Bar Chart',
        routerLink: '/barchart',
        content: '바 차트',
      },
      {
        name: 'Line Chart',
        routerLink: '/lineChart',
        content: '라인 차트',
      },
      {
        name: 'Scatter Chart',
        routerLink: '/scatterChart',
        content: '점 차트',
      },
      {
        name: 'Pie Chart',
        routerLink: '/pieChart',
        content: '파이 차트',
      },
      {
        name: 'Combo Chart',
        routerLink: '/comboChart',
        content: '복합 차트',
      },
      {
        name: 'Reactivity Chart',
        routerLink: '/reactivityChart',
        content: '실시간 차트',
      },
    ];

    const clickMenu = (routerLink) => {
      router.push({ path: routerLink });
    };

    return {
      store,
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
  height: 100%;
  padding: 25px 12px;
  overflow: auto;

  @include themify() {
    border-right: 1px solid themed('border-color-base');
  }

  ul, li {
    list-style: none;
  }

  &-item {
    padding: 5px 3px;
    font-size: $font-size-medium;
    cursor: pointer;

    &:hover {
      color: $color-blue;
    }
  }
}
</style>
