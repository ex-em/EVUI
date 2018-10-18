<template>
  <div>
    <div class="article-title">
      <h2> Tree </h2>
    </div>
    <br>
    <div
      v-for="item in componentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :height="item.height"
          :description="item.description"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import treeTable from './tree-table-default';
  import callTree from './tree-table-calltree';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/tree/tree-table-default.vue',
            component: treeTable,
            title: 'Default',
            description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
          },
          {
            url: './guide/views/examples/tree/tree-table-calltree.vue',
            component: callTree,
            title: 'Call Tree',
            description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
          },
        ],
      };
    },
  };
</script>
