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
      :url="'./pages/chart/api/chart.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';
  import Doughnut from './examples/doughnut';
  import Sunburst from './examples/sunburst';

  export default {
    data() {
      return {
        title: 'Pie Chart',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/chart/pie/examples/default.vue',
          description: `Pie Chart는 데이터의 전체 데이터를 기준으로 한 계열의 상대적 크기를 표시합니다.
                        Pie Chart는 각 Depth별로 12시 방향을 기준으로 데이터가 큰 계열의 순서에 맞춰 시계방향으로 그려집니다.`,
        }, {
          title: 'Doughnut',
          component: Doughnut,
          url: './pages/chart/pie/examples/doughnut.vue',
          description: 'Doughnut Chart는 Pie Chart의 중심을 비워 내부 공간을 만듭니다.',
        }, {
          title: 'Sunburst',
          component: Sunburst,
          url: './pages/chart/pie/examples/sunburst.vue',
          description: 'SunburstChart',
        }],
      };
    },
  };
</script>
