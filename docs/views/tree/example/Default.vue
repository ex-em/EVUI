<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-tree
      :data="commonData"
      @click-node="getClickedNode"
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
      @check="getCheckedNode"
    />
    <div class="description">
      <div class="badge yellow">
        체크박스 선택된 노드들
      </div>
      {{ checkedNodeInfo }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Dblclick-node</p>
    <ev-tree
      :data="commonData"
      @dblclick-node="getDblClickedNode"
    />
    <div class="description">
      <div class="badge yellow">
        더블 클릭된 노드
      </div>
      {{ dbclickedNodeInfo }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Disabled</p>
    <ev-tree :data="disableExData"/>
    <div class="description">
      'disabled' 속성 추가 시 클릭이 불가 합니다.
    </div>
  </div>
  <div class="case">
    <p class="case-title">ContextMenu</p>
    <ev-tree
      :data="contextmenuExData"
      :context-menu-items="menuItems"
    />
    <div class="description">
      <div class="badge yellow">
        클릭한 컨텍스메뉴명
      </div>
      {{ contextMenuInfo }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Custom Expand/Collapse Icon</p>
    <ev-tree
      :data="commonData"
      expand-icon="ev-icon-square-plus"
      collapse-icon="ev-icon-square-minus"
    />
    <div class="description">
      'expand-icon'과 'collapse-icon' 속성을 통해 아이콘을 변경할 수 있습니다.
    </div>
  </div>
  <div class="case">
    <p class="case-title">IconClass</p>
    <ev-tree :data="iconClassExData"/>
    <div class="description">
      'iconClass'속성을 사용하면 트리 노드 내부에 아이콘을 추가 수 있습니다.
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
            children: [
              {
                title: 'Leaf AA',
                expand: true,
                children: [
                  {
                    title: 'Leaf AAA',
                  },
                ],
              },
              {
                title: 'Leaf AB',
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
    const disableExData = ref([
      {
        title: 'Root',
        expand: true,
        children: [
          {
            title: 'Parent A',
            expand: true,
            disabled: true,
          },
          {
            title: 'Parent B',
            expand: true,
            children: [
              {
                title: 'Leaf BA',
                disabled: true,
              },
              {
                title: 'Leaf BB',
              },
            ],
          },
        ],
      },
    ]);
    const contextmenuExData = ref([
      {
        title: 'Root',
        expand: true,
        children: [
          {
            title: 'Parent A',
            expand: true,
          },
          {
            title: 'Parent B',
            expand: true,
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
    const iconClassExData = ref([
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

    const clickedNodeInfo = ref({});
    const checkedNodeInfo = ref({});
    const dbclickedNodeInfo = ref({});
    const contextMenuInfo = ref('');

    const menuItems = ref([
      {
        text: 'ContextMenu1',
        click: () => { contextMenuInfo.value = 'ContextMenu1'; },
      },
      {
        text: 'ContextMenu2',
        click: () => { contextMenuInfo.value = 'ContextMenu2'; },
      },
    ]);

    const getCheckedNode = (checkedNode) => {
      checkedNodeInfo.value = checkedNode;
    };

    const getClickedNode = (clickedNode) => {
      clickedNodeInfo.value = clickedNode;
    };

    const getDblClickedNode = (clickedNode) => {
      dbclickedNodeInfo.value = clickedNode;
    };

    return {
      commonData,
      checkboxExampleData,
      disableExData,
      contextmenuExData,
      iconClassExData,
      menuItems,
      clickedNodeInfo,
      dbclickedNodeInfo,
      checkedNodeInfo,
      contextMenuInfo,
      getCheckedNode,
      getClickedNode,
      getDblClickedNode,
    };
  },
};
</script>

<style lang="scss">
</style>
