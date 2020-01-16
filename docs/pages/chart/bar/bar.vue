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
  import Time from './examples/time';

  export default {
    data() {
      return {
        title: 'Bar Chart',
        components: [{
          title: 'Time',
          component: Time,
          url: './docs/pages/chart/bar/examples/time.vue',
          description: 'RealTime 처리를 위한 차트입니다.',
        }],
      };
    },
  };
</script>
