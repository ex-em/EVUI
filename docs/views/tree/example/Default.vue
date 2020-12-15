<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-tree
      :data="commonData"
      :context-menu-items="menuItems"
      expand-icon="ev-icon-square-plus"
      collapse-icon="ev-icon-square-minus"
      @change-checked-node="getCheckedNode"
      @click-content="getClickedNode"
      @dblclick-content="getDblClickedNode"
    />
  </div>
  <div class="case">
    <p class="case-title">Checkbox</p>
    <ev-tree
      :data="checkboxExampleData"
      :use-checkbox="true"
      expand-icon="ev-icon-square-plus"
      collapse-icon="ev-icon-square-minus"
      @change-checked-node="getCheckedNode"
      @click-content="getClickedNode"
      @dblclick-content="getDblClickedNode"
    />
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const commonData = ref([
      {
        title: 'Root',
        expand: true,
        children: [
          {
            title: 'Parent A',
            expand: true,
            icon: 'ev-icon-folder',
            children: [
              {
                title: 'Leaf AA',
                expand: true,
                icon: 'ev-icon-document-vertically',
              },
              {
                title: 'Leaf AB',
              },
            ],
          },
          {
            title: 'Parent B',
            expand: true,
            icon: 'ev-icon-folder2',
            children: [
              {
                title: 'Leaf BA',
              },
              {
                title: 'Leaf BB',
              },
            ],
          },
        ],
      },
    ]);
    const checkboxExampleData = ref([
      {
        title: 'Root',
        expand: true,
        children: [
          {
            title: 'Parent A',
            expand: true,
            children: [
              {
                title: 'Child AA',
                expand: false,
                children: [
                  {
                    title: 'GrandChild A',
                    disabled: true,
                  },
                ],
              },
              {
                title: 'Child AB',
              },
            ],
          },
          {
            title: 'Parent B',
            expand: true,
            children: [
              {
                title: 'Child BA',
              },
              {
                title: 'Child BB',
              },
            ],
          },
        ],
      },
    ]);
    const menuItems = ref([
      {
        text: 'ContextMenu',
        click: () => console.log('CLICK ContextMenu'),
      },
    ]);

    function getCheckedNode(checkedNode) {
      console.log('getCheckedNode', checkedNode);
    }

    function getClickedNode(clickedNode) {
      console.log('getClickedNode', clickedNode);
    }

    function getDblClickedNode(clickedNode) {
      console.log('getDblClickedNode', clickedNode);
    }

    return {
      commonData,
      checkboxExampleData,
      menuItems,
      getCheckedNode,
      getClickedNode,
      getDblClickedNode,
    };
  },
};
</script>

<style lang="scss">
</style>
