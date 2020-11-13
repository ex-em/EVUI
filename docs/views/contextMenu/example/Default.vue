<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div
      class="sample-context"
      @contextmenu.prevent="openContextMenu"
    >
      컨텍스트 메뉴 우클릭 영역
      <ev-context-menu
        ref="menu"
        :items="menuItems"
      />
    </div>
    <div class="description">
      <span class="badge">
        CLICK RIGHT
      </span>
    </div>

  </div>
  <div class="case">
    <p class="case-title">Custom</p>
    <div
      class="sample-context"
      @contextmenu.prevent="menu2.show"
    >
      <ev-context-menu
        ref="menu2"
        :items="menuItems2"
      />
      컨텍스트 메뉴 우클릭 영역
    </div>
    <div class="description">
      <span
        class="badge"
        @click="addChild"
      >
        ADD CHILD
      </span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const menu = ref(null);
    const menuItems = ref([
      {
        text: 11111,
        cls: 'ev-icon-s-panel-out',
        click: () => console.log('CLICK text1'),
      },
      {
        text: 'TEXT22222222222222',
        cls: 'ev-icon-s-pause',
        children: [
          {
            text: 'TEXT2-111111111111111',
            cls: 'ev-icon-server2',
            click: () => console.log('CLICK TEXT2-111111111111111'),
          },
          {
            text: 'TEXT2-2',
            value: 'value22',
            cls: 'ev-icon-server',
          },
          {
            text: 'TEXT2-3',
            cls: 'ev-icon-compress',
            children: [
              {
                text: 'TEXT2-3-1',
                cls: 'ev-icon-bell-warning',
                click: () => console.log('CLICK TEXT2-3-1'),
              },
              {
                text: 'TEXT2-3-2',
                cls: 'ev-icon-expand2',
              },
            ],
          },
        ],
      },
      {
        text: 'TEXT3',
        click: () => console.log('CLICK TEXT3'),
      },
      {
        text: 'TEXT4',
        click: () => console.log('CLICK TEXT4'),
      },
      {
        text: 'TEXT5',
        children: [
          {
            text: 'TEXT5-1',
            click: () => console.log('CLICK TEXT5-1'),
          },
          {
            text: 'TEXT5-2',
            cls: 'ev-icon-expand',
          },
        ],
      },
    ]);
    const openContextMenu = (e) => {
      menu.value.show(e);
    };

    const menu2 = ref(null);
    const menuItems2 = ref([
      {
        text: 'TEXT1',
        cls: 'ev-icon-s-panel-out',
        disabled: true,
        click: () => console.log('CLICK text1'),
      },
      {
        text: 'TEXT2',
        disabled: true,
        cls: 'ev-icon-s-pause',
        children: [
          {
            text: 'TEXT2-1',
            cls: 'ev-icon-server2',
            click: () => console.log('CLICK text2-1'),
          },
          {
            text: 'TEXT2-2',
            disabled: true,
            cls: 'ev-icon-server',
          },
        ],
      },
      {
        text: 'TEXT3',
      },
    ]);

    const addChild = () => {
      menuItems2.value.push({
        text: 'TEXT4',
        cls: 'ev-icon-bell-warning',
        click: () => { console.log('CLICK TEXT4'); },
      });
    };

    return {
      menu,
      menuItems,
      openContextMenu,
      menu2,
      menuItems2,
      addChild,
    };
  },
};
</script>

<style>
.sample-context {
  width: 400px;
  height: 400px;
  max-width: 400px;
  max-height: 400px;
  background: #8D99A7;
}
</style>
