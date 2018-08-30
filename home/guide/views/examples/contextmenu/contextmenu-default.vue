<template>
  <div>
    <div style="height: 40px; margin-top: 20px">컨텍스트 메뉴를 보려면 마우스 우클릭 하세요.<br></div>
    <div
      class="menu-context-default"
      @contextmenu="onContextMenu"
    />
    <ev-context-menu
      ref="contextMenu"
      :items="items"
    />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [
          {
            text: 'menu1',
            fn: this.onClickMenu,
          },
          {
            text: 'menu2',
            fn: this.onClickMenu,
          },
          {
            text: 'menu3',
            fn: this.onClickMenu,
          },
          {
            text: 'menu4',
            fn: this.onClickMenu,
          },
          {
            text: 'menu5',
            fn: this.onClickMenu,
          },
        ],
      };
    },
    methods: {
      onContextMenu(e) {
        const contextMenu = this.$refs.contextMenu;
        contextMenu.setPosition(e.pageX, e.pageY);
        contextMenu.show();
        e.preventDefault();
      },
      onClickMenu() {
      },
    },
  };
</script>

<style scoped>
  .menu-context-default{
    width: 800px;
    height: 500px;
    background: #8D99A7;
  }
</style>
