<template>
  <div style="width:100%">
    <ev-tree
      :data="data"
      @on-toggle-expand="onExpand"
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
      };
    },
    methods: {
      onExpand(node) {
        console.log('Expand', node);
      },
    },
  };
</script>
