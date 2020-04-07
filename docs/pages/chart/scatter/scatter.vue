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
      :vertical="false"
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
    <ApiView
      :url="'./docs/pages/chart/api/chart.md'"
    />
  </div>
</template>

<script>
  import Scatter from './examples/scatter';

  export default {
    data() {
      return {
        title: 'Scatter Chart',
        components: [{
          title: 'Scatter',
          component: Scatter,
          url: './docs/pages/chart/scatter/examples/scatter.vue',
          description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
        }],
      };
    },
  };
</script>
