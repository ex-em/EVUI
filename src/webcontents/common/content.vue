<template>
  <div class="evui-main-content">
    <div class="evui-left-navigation">
      <ul class="evui-menu">
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">Form</div>
          <ul>
            <li class="evui-menu-item active">
              <router-link to="/container">Container</router-link>
            </li>
            <li class="evui-menu-item">
              <router-link to="/dock/dockframeSample">dockframeSample</router-link>
            </li>
            <li class="evui-menu-item">
              <router-link to="/checkbox">Checkbox</router-link>
            </li>
            <li class="evui-menu-item">
              <router-link to="/selectbox">Selectbox</router-link>
            </li>
            <li class="evui-menu-item">
              <router-link to="/table">Table(page)</router-link>
            </li>
            <li class="evui-menu-item">
              <router-link to="/table2">Table(virtualScroll)</router-link>
            </li>
          </ul>
        </li>
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">
            <router-link to="/chart">Chart</router-link>
          </div>
          <ul>
            <li class="evui-menu-item">
              <router-link to="/chart">Chart</router-link>
            </li>
          </ul>
        </li>
        <li class="evui-menu-group">
          <div class="evui-menu-group-title">group</div>
          <ul>
            <li class="evui-menu-item">7</li>
            <li class="evui-menu-item">8</li>
            <li class="evui-menu-item">9</li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="evui-right-content">
      main content
      <router-view/>
    </div>
  </div>
</template>

<script>
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
  .evui-menu-item {
    height: 48px;
    line-height: 48px;
    cursor: pointer;
    z-index: 1;
    padding-left: 35px;
    color: #c5c5c5;
    border-right: 2px solid transparent;
  }
  .evui-menu-item:hover {
    border-right: 2px solid #2d8cf0;
    background: #f3f3f3;
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
