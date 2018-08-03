<template>
  <div>
    <div class="article-title">
      <h2> Table </h2>
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
  import tableDefault from './table-default';
  import tablePage from './table-page';
  import tableBuffer from './table-buffer';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/table/table-default.vue',
            component: tableDefault,
            title: 'Default',
            description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
          },
          {
            url: './guide/views/examples/table/table-page.vue',
            component: tablePage,
            title: 'Page',
            description: '기본 테이블에 페이지 기능을 이용하여 대용량 데이터를 보여줄 수 있습니다.',
          },
          {
            url: './guide/views/examples/table/table-buffer.vue',
            component: tableBuffer,
            title: 'Buffer(Virtual Scroll)',
            description: '기본 테이블에 가상 스크롤 기능을 이용하여 대용량 데이터를 끊김 없이 보여줄 수 있습니다.',
          },
        ],
      };
    },
  };
</script>
