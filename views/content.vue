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
  import menuNav from '../views/menu';

  export default {
    components: {
      menuNav,
    },
    model: {
    },
    props: {
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
                imgUrl: '../static/images/container.png',
              },
              {
                name: 'Docking',
                routerLink: '/dock/dockframeSample',
                content: '닥 컨테이너 샘플',
                imgUrl: '../static/images/dockContainer.png',
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
              },
              {
                name: 'Selectbox',
                routerLink: '/selectbox',
                content: '셀렉트 박스',
              },
              {
                name: 'Table(page)',
                routerLink: '/table',
                content: 'table(page)',
                imgUrl: '../static/images/tablePage.png',
              },
              {
                name: 'Table(virtualScroll)',
                routerLink: '/table2',
                content: 'Table(virtualScroll)',
                imgUrl: '../static/images/tableVirtualscroll.png',
              },
              {
                name: 'Timepicker',
                routerLink: '',
                content: 'timepicker',
                imgUrl: '../static/images/timepicker.png',
              },
              {
                name: 'Codebox',
                routerLink: '/codebox',
                content: 'codebox',
                imgUrl: '',
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
                imgUrl: '../static/images/chart.png',
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
                imgUrl: '../static/images/menu.png',
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
                imgUrl: '../static/images/loadingmask.png',
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
    display: flex;
    margin-top: 70px;
  }
  .evui-right-content {
    margin: 20px;
    flex: 1;
  }
</style>
