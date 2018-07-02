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
//            openFlag: true,
          },
          {
            name: 'Component',
            cls: 'far fa-clone',
//            openFlag: true,
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
//            openFlag: true,
            children: [
              {
                name: 'Checkbox',
                routerLink: '/checkbox',
                content: '체크박스',
                imgUrl: `${this.imgUrl}/checkbox.png`,
              },
              {
                name: 'Selectbox',
                routerLink: '/selectbox',
                content: '셀렉트 박스',
                imgUrl: `${this.imgUrl}/selectbox.png`,
              },
              {
                name: 'Table(page)',
                routerLink: '/table',
                content: 'table(page)',
                imgUrl: `${this.imgUrl}/tablePage.png`,
              },
              {
                name: 'Timepicker',
                routerLink: '',
                content: 'timepicker',
                imgUrl: `${this.imgUrl}/timepicker.png`,
              },
            ],
          },
          {
            name: 'Chart',
            cls: 'fas fa-chart-bar',
//            openFlag: true,
            children: [
              {
                name: 'Chart',
                routerLink: '/chart',
                content: 'chart',
                imgUrl: `${this.imgUrl}/chart.png`,
              },
            ],
          },
          {
            name: 'Navigation',
            cls: 'fas fa-bars',
//            openFlag: true,
            children: [
              {
                name: 'Menu',
                routerLink: '/menu',
                content: 'menu',
                imgUrl: `${this.imgUrl}/menu.png`,
              },
              {
                name: 'Summary',
                routerLink: '',
                content: 'summary',
              },
            ],
          },
          {
            name: 'Other',
            cls: 'fas fa-ellipsis-h',
//            openFlag: true,
            children: [
              {
                name: 'Loadingmask',
                routerLink: '',
                content: 'loadingmask',
                imgUrl: `${this.imgUrl}/loadingmask.png`,
              },
              {
                name: 'Code',
                routerLink: '',
                content: 'codeView',
                imgUrl: `${this.imgUrl}/code.png`,
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
    width: 100%;
    margin-top: 55px;
  }
  .evui-right-content {
    margin: 20px;
    flex: 1;
  }
</style>
