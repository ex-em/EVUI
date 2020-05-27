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
    <ApiView
      :url="'./docs/pages/grid/api/grid.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';

  export default {
    data() {
      return {
        title: 'Grid',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/grid/examples/default.vue',
          description: '그리드는 여러 데이터를 보여주는 컴포넌트입니다.',
        }],
      };
    },
  };
</script>
