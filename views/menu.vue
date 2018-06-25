<template>
  <div class="evui-left-navigation">
    <ul class="evui-menu">
      <li
        v-for="(menu, index) in store"
        :key="menu.name + index"
        class="evui-menu-group"
      >
        <router-link
          v-if="menu.routerLink"
          :to="menu.routerLink"
        >
          <div
            class="evui-menu-group-title"
            @click="initSelectedMenu"
          >
              <i
                v-show="menu.cls"
                :class="menu.cls"
              /> {{ menu.name }}
          </div>
        </router-link>
        <div
          v-else
          class="evui-menu-group-title"
        >
          <i
            v-show="menu.cls"
            :class="menu.cls"
          /> {{ menu.name }}
        </div>
        <ul
          v-for="(submenu, index) in menu.children"
          v-show="menu.children"
          :key="submenu.name + index"
        >
          <router-link :to="submenu.routerLink">
            <li
              :class="selectedMenu.name === submenu.name ? 'active' : ''"
              class="evui-menu-item"
              @click="setSelectedMenu(menu.name, submenu.name, index)"
            >
              {{ submenu.name }}
            </li>
          </router-link>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script>
  export default {
    model: {
    },
    props: {
      store: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        selectedMenu: {
          parentName: '',
          name: '',
          index: '',
        },
      };
    },
    computed: {
    },
    methods: {
      initSelectedMenu() {
        this.selectedMenu.parentName = '';
        this.selectedMenu.name = '';
        this.selectedMenu.index = '';
      },
      setSelectedMenu(parentMenu, childMenu, childIndex) {
        this.selectedMenu.parentName = parentMenu;
        this.selectedMenu.name = childMenu;
        this.selectedMenu.index = childIndex;
      },
    },
  };
</script>

<style scoped>
  .evui-left-navigation {
    width: 240px;
    border-right: 1px solid #dddee0;
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
