<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-tree
      :data="commonData"
      :context-menu-items="menuItems"
      @change-checked-node="getCheckedNode"
      @click-content="getClickedNode"
      @dblclick-content="getDblClickedNode"
    />
    <div class="description">
      <div class="badge yellow">
        클릭된 노드
      </div>
      {{ clickedNodeInfo }}
    </div>
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
    <div class="description">
      <div class="badge yellow">
        체크박스 선택된 노드들
      </div>
      {{ checkedNodeInfo }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-tree
      :data="commonData"
      :context-menu-items="menuItems"
      expand-icon="ev-icon-square-plus"
      collapse-icon="ev-icon-square-minus"
      @change-checked-node="getCheckedNode"
      @click-content="getClickedNode"
      @dblclick-content="getDblClickedNode"
    />
    <div class="description">
      <div class="badge yellow">
        작업해야햄@_@
      </div>
      {{ clickedNodeInfo }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">ContextMenu</p>
    <ev-tree
      :data="commonData"
      :context-menu-items="menuItems"
      expand-icon="ev-icon-square-plus"
      collapse-icon="ev-icon-square-minus"
      @change-checked-node="getCheckedNode"
      @click-content="getClickedNode"
      @dblclick-content="getDblClickedNode"
    />
    <div class="description">
      <div class="badge yellow">
        컨텍스메뉴 클리한거 뜨도록 작업해야 햅햅햅
      </div>
      {{ clickedNodeInfo }}
    </div>
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
            iconClass: 'ev-icon-folder',
            children: [
              {
                title: 'Leaf AA',
                expand: true,
                iconClass: 'ev-icon-document-vertically',
              },
              {
                title: 'Leaf AB',
              },
            ],
          },
          {
            title: 'Parent B',
            expand: true,
            iconClass: 'ev-icon-folder2',
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
                expand: true,
                children: [
                  {
                    title: 'GrandChild A',
                    checked: true,
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
                checked: true,
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

    const clickedNodeInfo = ref({});

    const checkedNodeInfo = ref({});

    function getCheckedNode(checkedNode) {
      console.log('getCheckedNode', checkedNode);
      checkedNodeInfo.value = checkedNode;
    }

    function getClickedNode(clickedNode) {
      console.log('getClickedNode', clickedNode);
      clickedNodeInfo.value = clickedNode;
    }

    function getDblClickedNode(clickedNode) {
      console.log('getDblClickedNode', clickedNode);
    }

    return {
      commonData,
      checkboxExampleData,
      menuItems,
      clickedNodeInfo,
      checkedNodeInfo,
      getCheckedNode,
      getClickedNode,
      getDblClickedNode,
    };
  },
};
</script>

<style lang="scss">
</style>
