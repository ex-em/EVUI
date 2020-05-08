<template>
  <div>
    <div class="contextmenu-default">
      컨텍스트 메뉴를 보려면 마우스 우클릭 하세요. (사용 여부 옵션: is-use)<br>
    </div>
    <div class="contextmenu-default-body">
      <ev-context-menu
        :items="items"
        @click="onClick"
      />
    </div>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        items: [],
      };
    },
    created() {
      this.items = this.getItems();
    },
    methods: {
      onClick(item) {
        console.log(`text: ${item.text} / itemId: ${item.itemId} / depth: ${item.depth} / rowIdx: ${item.rowIdx} / parentRowIdx: ${item.parentRowIdx}`);
      },
      getItems() {
        return [
          {
            text: 'menu(1)',
            itemId: 'menu1',
          },
          {
            text: 'menu(2)',
            itemId: 'menu2',
            items: [
              {
                text: 'menu(2-1)',
                itemId: 'menu2_1',
                items: [
                  {
                    text: 'menu(2-1-1)',
                    itemId: 'menu2_1_1',
                  },
                  {
                    text: 'menu(2-1-2)',
                    itemId: 'menu2_1_2',
                    items: [
                      {
                        text: 'menu(2-1-2-1)',
                        itemId: 'menu2_1_2_1',
                      },
                      {
                        text: 'menu(2-1-2-2)',
                        itemId: 'menu2_1_2_2',
                      },
                    ],
                  },
                  {
                    text: 'menu(2-1-3)',
                    itemId: 'menu2_1_3',
                    disabled: true,
                    items: [
                      {
                        text: 'menu(2-1-3-1)',
                        itemId: 'menu2_1_3_1',
                      },
                      {
                        text: 'menu(2-1-3-2)',
                        itemId: 'menu2_1_3_2',
                      },
                    ],
                  },
                ],
              },
              {
                text: 'menu(2-2)',
                itemId: 'menu2_2',
              },
            ],
          },
          {
            text: 'menu(3)',
            itemId: 'menu3',
          },
          {
            text: 'menu(4)',
            itemId: 'menu4',
            items: [
              {
                text: 'menu(4-1)',
                itemId: 'menu4',
              },
            ],
          },
          {
            text: 'menu(5)',
            itemId: 'menu5',
          },
        ];
      },
    },
  };
</script>

<style scoped>
  .contextmenu-default {
    height: 40px;
    margin-top: 20px;
  }
  .contextmenu-default-body {
    width: 800px;
    height: 1000px;
    background: #8D99A7;
  }
</style>
