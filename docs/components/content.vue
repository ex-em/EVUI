<template>
  <div class="evui-main-content">
    <menuNav
      ref="menuNav"
      :store="menuStore"
    />
    <div class="evui-main-content-body">
      <router-view
        :store="$route.path === '/' ? menuStore : ''"
        @selectedSummary="getSelectedSummary"
      />
    </div>
  </div>
</template>

<script>
  import '@/styles/lib/fontawesome.css';
  import menuNav from './menu';

  export default {
    components: {
      menuNav,
    },
    props: {
      imgUrl: {
        type: String,
        default: './docs/images',
      },
    },
    data() {
      return {
        menuStore: [
          {
            name: 'Introduce',
            cls: 'fas fa-th-large',
            routerLink: '/',
          },
          {
            name: 'Component',
            cls: 'far fa-clone',
            children: [
              {
                name: 'Container',
                routerLink: '/container',
                content: '컨테이너',
                imgUrl: `${this.imgUrl}/container.png`,
              },
              {
                name: 'Tab',
                routerLink: '/tab',
                content: '탭 패널 샘플',
                imgUrl: `${this.imgUrl}/tab.png`,
              },
              {
                name: 'Window',
                routerLink: '/window',
                content: '윈도우',
                imgUrl: `${this.imgUrl}/window.png`,
              },
              {
                name: 'ContextMenu',
                routerLink: '/contextmenu',
                content: '컨텍스트 메뉴',
                imgUrl: `${this.imgUrl}/contextmenu.png`,
              },
            ],
          },
          {
            name: 'Form',
            cls: 'fab fa-elementor',
            children: [
              {
                name: 'Button',
                routerLink: '/button',
                content: '버튼',
                imgUrl: `${this.imgUrl}/button.png`,
              },
              {
                name: 'Checkbox',
                routerLink: '/checkbox',
                content: '체크박스',
                imgUrl: `${this.imgUrl}/checkbox.png`,
              },
              {
                name: 'Radio',
                routerLink: '/radio',
                content: '라디오버튼',
                imgUrl: `${this.imgUrl}/radio.png`,
              },
              {
                name: 'InputNumber',
                routerLink: '/inputnumber',
                content: '숫자입력',
                imgUrl: `${this.imgUrl}/inputnumber.png`,
              },
              {
                name: 'Selectbox',
                routerLink: '/selectbox',
                content: '셀렉트 박스',
                imgUrl: `${this.imgUrl}/selectbox.png`,
              },
              {
                name: 'Slider',
                routerLink: '/slider',
                content: '슬라이더',
                imgUrl: `${this.imgUrl}/slider.png`,
              },
              {
                name: 'Grid',
                routerLink: '/grid',
                content: '테이블 - 그리드',
                imgUrl: `${this.imgUrl}/table.png`,
              },
              {
                name: 'Tree',
                routerLink: '/tree',
                content: '트리',
                imgUrl: `${this.imgUrl}/table.png`,
              },
              {
                name: 'Tree Table',
                routerLink: '/treetable',
                content: '트리 테이블',
                imgUrl: `${this.imgUrl}/table.png`,
              },
              {
                name: 'Timepicker',
                routerLink: '/timepicker',
                content: '타임 피커',
                imgUrl: `${this.imgUrl}/timepicker.png`,
              },
              {
                name: 'Datepicker',
                routerLink: '/datepicker',
                content: '데이트 피커',
                imgUrl: `${this.imgUrl}/datepicker.png`,
              },
              {
                name: 'Toggle',
                routerLink: '/toggle',
                content: '토글',
                imgUrl: `${this.imgUrl}/toggle.png`,
              },
              {
                name: 'Label',
                routerLink: '/label',
                content: '라벨',
                imgUrl: `${this.imgUrl}/label.png`,
              },
              {
                name: 'Textfield',
                routerLink: '/textfield',
                content: '텍스트 필드',
                imgUrl: `${this.imgUrl}/textfield.png`,
              },
            ],
          },
          {
            name: 'Chart',
            cls: 'fas fa-chart-bar',
            children: [
              {
                name: 'Bar Chart',
                routerLink: '/barchart',
                content: '바 차트',
                imgUrl: `${this.imgUrl}/chart-bar.png`,
              },
              {
                name: 'Line Chart',
                routerLink: '/linechart',
                content: '라인 차트',
                imgUrl: `${this.imgUrl}/chart-line.png`,
              },
              {
                name: 'Scatter Chart',
                routerLink: '/scatterchart',
                content: '점 차트',
                imgUrl: `${this.imgUrl}/chart-line.png`,
              },
              {
                name: 'Pie Chart',
                routerLink: '/piechart',
                content: '파이 차트',
                imgUrl: `${this.imgUrl}/chart-pie.png`,
              },
              {
                name: 'Combo Chart',
                routerLink: '/combochart',
                content: '복합 차트',
                imgUrl: `${this.imgUrl}/chart-combo.png`,
              },
              {
                name: 'Reactivity Chart',
                routerLink: '/reactivitychart',
                content: '실시간 차트',
                imgUrl: `${this.imgUrl}/chart-line.png`,
              },
            ],
          },
          {
            name: 'Navigation',
            cls: 'fas fa-bars',
            children: [
              {
                name: 'Menu',
                routerLink: '/menu',
                content: '메뉴',
                imgUrl: `${this.imgUrl}/menu.png`,
              },
            ],
          },
          {
            name: 'Other',
            cls: 'fas fa-ellipsis-h',
            children: [
              {
                name: 'Loadingmask',
                routerLink: '/loadingmask',
                content: '로딩마스크',
                imgUrl: `${this.imgUrl}/loadingmask.png`,
              },
              {
                name: 'Icon',
                routerLink: '/icon',
                content: '아이콘',
                // imgUrl: `${this.imgUrl}/icon.png`,
              },
            ],
          },
        ],
      };
    },
    created() {
    },
    methods: {
      getSelectedSummary(parentMenu, childMenu, childIndex) {
        this.$refs.menuNav.initSelectedMenu();
        this.$refs.menuNav.setSelectedMenu(parentMenu, childMenu, childIndex);
      },
    },
  };
</script>

<style scoped>
  .evui-main-content {
    position: relative;
    width: 100%;
    height: 100%;
    padding: 0 240px;
  }
  .evui-main-content-body {
    padding: 20px;
  }
</style>
