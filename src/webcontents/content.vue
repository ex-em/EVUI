<template>
  <div class="evui-main-content">
    <div class="evui-left-navigation">
      <ul class="evui-menu">
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">
            <i class="fas fa-th-large"/> Form
          </div>
          <ul>
            <router-link to="/container">
              <li class="evui-menu-item active">
                Container
              </li>
            </router-link>
            <router-link to="/dock/dockframeSample">
              <li class="evui-menu-item">
                Docking
              </li>
            </router-link>
            <router-link to="/checkbox">
              <li class="evui-menu-item">
                Checkbox
              </li>
            </router-link>
            <router-link to="/selectbox">
              <li class="evui-menu-item">
                Selectbox
              </li>
            </router-link>
            <router-link to="/table">
              <li class="evui-menu-item">
                Table(page)
              </li>
            </router-link>
            <router-link to="/table2">
              <li class="evui-menu-item">
                Table(virtualScroll)
              </li>
            </router-link>
          </ul>
        </li>
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">
            <i class="fas fa-chart-bar"/> Chart
          </div>
          <ul>
            <router-link to="/chart">
              <li class="evui-menu-item">
                Chart
              </li>
            </router-link>
          </ul>
        </li>
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">
            <i class="fas fa-bars"/> Navigation
          </div>
          <ul>
            <li class="evui-menu-item">Menu</li>
          </ul>
        </li>
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">
            <i class="fas fa-ellipsis-h"/> Other
          </div>
          <ul>
            <li class="evui-menu-item">Spin</li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="evui-right-content">
      <router-view/>
    </div>
  </div>
</template>

<script>
  import '@/styles/all.css';

  export default {
    model: {
    },
    props: {
    },
    data() {
      return {
        menuStore: [
          {
            name: 'Form',
            children: [
              {
                name: 'Checkbox',
                content: 'checkbox',
              },
              {
                name: 'Select',
                content: 'select box',
              },
            ],
          },
          {
            name: 'Layer',
          },
          {
            name: 'Chart',
            children: [
              {
                name: 'Line',
                content: 'line chart',
              },
              {
                name: 'Bar',
                content: 'bar chart',
              },
              {
                name: 'Pie',
                content: 'pie chart',
              },
            ],
          },
          {
            name: 'Table',
            children: [
              {
                name: 'Grid1',
                content: 'grid1 content',
              },
              {
                name: 'Grid2',
                content: 'grid1 content',
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
  .evui-left-navigation {
    width: 240px;
    border-right: 1px solid #dddee0;
  }
  .evui-right-content {
    flex: 1;
  }
  .evui-menu {
    width: 100%;
    background: #fff;
    display: block;
    z-index: 900;
  }
  .evui-menu-group-title {
    height: 48px;
    line-height: 48px;
    padding-left: 20px;
  }
  .evui-menu-group-title i {
    margin-right: 10px;
  }
  .evui-menu-item {
    height: 48px;
    line-height: 48px;
    cursor: pointer;
    z-index: 1;
    padding-left: 30px;
    color: #c5c5c5;
    border-right: 2px solid transparent;
  }
  .evui-menu-item:hover {
    border-right: 2px solid #2d8cf0;
    background: #f3f3f3;
    color: #2d8cf0;
  }
  .evui-menu-item.active {
    z-index: 2;
    color: #2d8cf0;
    border-right: 2px solid #2d8cf0;
    background: #f3f3f3;
  }
  a:hover {
    color: #2d8cf0;
  }
</style>
