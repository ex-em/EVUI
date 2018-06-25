<template>
  <div class="evui-main-content">
    <menuNav
      :store="menuStore"
    />
    <div class="evui-right-content">
      <router-view/>
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
          },
          {
            name: 'Form',
            cls: 'far fa-clone',
            children: [
              {
                name: 'Container',
                routerLink: '/container',
                content: 'Container',
              },
              {
                name: 'Docking',
                routerLink: '/dock/dockframeSample',
                content: 'docking',
              },
              {
                name: 'Checkbox',
                routerLink: '/checkbox',
                content: 'checkbox',
              },
              {
                name: 'Selectbox',
                routerLink: '/selectbox',
                content: 'selectbox',
              },
              {
                name: 'Table(page)',
                routerLink: '/table',
                content: 'table(page)',
              },
              {
                name: 'Table(virtualScroll)',
                routerLink: '/table2',
                content: 'Table(virtualScroll)',
              },
            ],
          },
          {
            name: 'Chart',
            cls: 'fas fa-chart-bar',
            children: [
              {
                name: 'Chart',
                routerLink: '/chart',
                content: 'chart',
              },
            ],
          },
          {
            name: 'Navigation',
            cls: 'fas fa-bars',
            children: [
              {
                name: 'Menu',
                routerLink: '',
                content: 'menu',
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
            children: [
              {
                name: 'spin',
                routerLink: '',
                content: 'spin',
              },
            ],
          },
        ],
      };
    },
    created() {
    },
    methods: {
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
