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
  import Fill from './examples/fill';
  import Stack from './examples/stack';
  import Scatter from './examples/scatter';

  export default {
    data() {
      return {
        title: 'Line Chart',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/chart/line/examples/default.vue',
          description: 'Line Chart는 각각의 데이터를 선으로 연결하여 추이를 시각적으로 인지하는 차트입니다.',
        }, {
          title: 'Fill',
          component: Fill,
          url: './pages/chart/line/examples/fill.vue',
          description: 'Line Chart의 Fill 옵션을 이용하여 각 계열 데이터의 양을 좀 더 쉽게 인지할 수 있도록 합니다.',
        }, {
          title: 'Stack',
          component: Stack,
          url: './pages/chart/line/examples/stack.vue',
          description: 'Stack Line Chart는 계열의 순서에 맞춰 데이터를 누적하여 각 계열의 데이터 비교를 시각적으로 판단하는데 도움을 줍니다.',
        }, {
          title: 'Scatter',
          component: Scatter,
          url: './pages/chart/line/examples/scatter.vue',
          description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
        }],
      };
    },
  };
</script>
