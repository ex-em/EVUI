<template>
  <div class="evui-left-navigation">
    <ul class="evui-menu">
      <li
        v-for="(menu, index) in store"
        :key="menu.name + index"
        class="evui-menu-group"
      >
        <router-link
          v-if="menu.routerLink === '/'"
          :to="{ path: menu.routerLink }"
        >
          <div
            class="evui-menu-group-title"
            @click="initSelectedMenu"
          >
            <i
              v-show="menu.cls"
              :class="menu.cls"
            />
            {{ menu.name }}
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
          class="evui-menu-group-sub"
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
  a, span {
    text-decoration: none !important;
  }
  a:hover {
    color: #2D89EF;
  }
  a:visited {
    color: #000;
  }
  .evui-left-navigation {
    position: absolute;
    left: 0;
    width: 240px;
    border-right: 1px solid #DDDEE0;
  }
  .evui-menu {
    display: block;
    width: 100%;
    background: #fff;
    z-index: 900;
  }
  .evui-menu-group {
    list-style-type: none;
  }
  .evui-menu-group-sub {
    list-style-type: none;
  }
  .evui-menu-group-title {
    height: 40px;
    line-height: 40px;
    padding-left: 20px;
    font-weight: bold;
    user-select: none;
  }
  .evui-menu-group-title > i {
    margin-right: 10px;
  }
  .evui-menu-item {
    height: 35px;
    line-height: 35px;
    padding-left: 30px;
    border-right: 2px solid transparent;
    color: #888888;
    background-color: #FFFFFF;
    z-index: 1;
    cursor: pointer;
  }
  .evui-menu-item:hover {
    border-right: 4px solid #2D89EF;
    color: #2D8CF0;
  }
  .evui-menu-item.active {
    border-right: 4px solid #2D89EF;
    color: #F1F1F1;
    background-color: #2D89EF;
    transition: background-color 600ms ease;
    z-index: 2;
  }
</style>
