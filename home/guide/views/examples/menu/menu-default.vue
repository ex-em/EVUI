<template>
  <div>
    <ev-nav-menu
      :store="menuStore"
    />
    <br>
  </div>
</template>

<script>
  import '@/styles/evui.css';

  export default {
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
        ],
      };
    },
    methods: {
    },
  };
</script>
