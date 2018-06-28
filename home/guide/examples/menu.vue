<template>
  <div>
    <menu-nav
      :store="menuStore"
    />
  </div>
</template>
<script>
  import menuNav from '@/components/menu';

  export default {
    components: {
      menuNav,
    },
    data() {
      return {
        menuStore: [
          {
            name: 'Menu1',
            cls: 'far fa-clone',
            children: [
              {
                name: 'SubMenu1-1',
              },
              {
                name: 'SubMenu1-2',
              },
            ],
          },
          {
            name: 'Menu2',
            cls: 'fab fa-elementor',
            children: [
              {
                name: 'SubMenu2-1',
              },
              {
                name: 'SubMenu2-2',
              },
              {
                name: 'SubMenu2-3',
              },
            ],
          },
          {
            name: 'Menu3',
            cls: 'fas fa-chart-bar',
            children: [
              {
                name: 'SubMenu3-1',
              },
              {
                name: 'SubMenu3-2',
              },
            ],
          },
          {
            name: 'Menu4',
            cls: 'fas fa-bars',
            children: [
              {
                name: 'SubMenu4-1',
              },
              {
                name: 'SubMenu4-2',
              },
            ],
          },
        ],
      };
    },
    computed: {
    },
    methods: {
    },
  };
</script>
