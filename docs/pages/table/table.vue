<template>
  <div>
    <div class="article-title">
      <h1> {{ title }} </h1>
    </div>
    <br>
    <Example
      v-for="(item, index) in components"
      :key="index"
      :title="item.title"
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
  </div>
</template>

<script>
  import Default from './examples/default';
  import Page from './examples/page';
  import Buffer from './examples/buffer';

  export default {
    data() {
      return {
        title: 'Table',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/table/examples/default.vue',
          description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
        }, {
          title: 'Page',
          component: Page,
          url: './pages/table/examples/page.vue',
          description: '기본 테이블에 페이지 기능을 이용하여 대용량 데이터를 보여줄 수 있습니다.',
        }, {
          title: 'Buffer(Virtual Scroll)',
          component: Buffer,
          url: './pages/table/examples/buffer.vue',
          description: '기본 테이블에 가상 스크롤 기능을 이용하여 대용량 데이터를 끊김 없이 보여줄 수 있습니다.',
        }],
      };
    },
  };
</script>
