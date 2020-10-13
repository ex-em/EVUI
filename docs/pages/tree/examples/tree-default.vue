<template>
  <div style="width:100%">
    <ev-tree
      :data="data"
      :menu-items="menuItems"
      expand-icon="ei-square-plus"
      collapse-icon="ei-square-minus"
      @on-toggle-expand="onExpand"
      @before-contextmenu="beforeContext"
      @select-contextmenu="selectContext"
    />
  </div>
</template>

<script>
  export default {
    data() {
      return {
        data: [
          {
            title: 'parent 1',
            expand: true,
            children: [
              {
                title: 'parent 1-1',
                expand: true,
                icon: 'ei-trash3',
                children: [
                  {
                    title: 'leaf 1-1-1',
                  },
                  {
                    title: 'leaf 1-1-2',
                    icon: 'ei-trash2',
                  },
                ],
              },
              {
                title: 'parent 1-2',
                expand: true,
                children: [
                  {
                    title: 'leaf 1-2-1',
                  },
                  {
                    title: 'leaf 1-2-1',
                  },
                ],
              },
            ],
          },
        ],
        menuItems: [
          {
            text: '테스트1',
            itemId: 'test1',
          },
        ],
      };
    },
    methods: {
      onExpand(node) {
        console.log('Expand', node);
      },
      beforeContext() {
        this.menuItems = [
          {
            text: '테스트2',
            itemId: 'test2',
          },
        ];
      },
      selectContext(item) {
        console.log(item);
      },
    },
  };
</script>
