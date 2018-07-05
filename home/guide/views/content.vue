<template>
  <div class="evui-main-content">
    <menuNav
      ref="menuNav"
      :store="menuStore"
    />
    <div class="evui-right-content">
      <router-view
        :store="$route.path === '/' ? menuStore : ''"
        @selectedSummary="getSelectedSummary"
      />
    </div>
    <div class="evui-page-anchor"/>
  </div>
</template>

<script>
  import '@/styles/all.css';
  import menuNav from './menu';

  export default {
    components: {
      menuNav,
    },
    props: {
      imgUrl: {
        type: String,
        default: './guide/images/',
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
                name: 'Docking',
                routerLink: '/dock',
                content: '닥 컨테이너 샘플',
                imgUrl: `${this.imgUrl}/dockContainer.png`,
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
//                imgUrl: `${this.imgUrl}/selectbox.png`,
              },
              {
                name: 'Table',
                routerLink: '/table',
                content: '테이블 - 그리드',
                imgUrl: `${this.imgUrl}/tablePage.png`,
              },
              {
                name: 'Timepicker',
                routerLink: '/timepicker',
                content: '타임 피커',
                imgUrl: `${this.imgUrl}/timepicker.png`,
              },
              {
                name: 'Toggle',
                routerLink: '/toggle',
                content: '토글',
//                imgUrl: `${this.imgUrl}/timepicker.png`,
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
                content: '차트',
                imgUrl: `${this.imgUrl}/chart-bar.png`,
              },
              {
                name: 'Line Chart',
                routerLink: '/linechart',
                content: '차트',
                imgUrl: `${this.imgUrl}/chart-line.png`,
              },
              {
                name: 'Pie Chart',
                routerLink: '/piechart',
                content: '차트',
                imgUrl: `${this.imgUrl}/chart-pie.png`,
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
    display: inline-flex;
    margin-top: 55px;
    width: 100%;
  }
  .evui-right-content {
    padding: 20px;
    flex: 1;
    border-left: 1px solid #dddee0;
  }
  .evui-page-anchor {
    width: 240px;
  }
</style>
