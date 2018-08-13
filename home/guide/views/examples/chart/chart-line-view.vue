<template>
  <div>
    <div class="article-title">
      <h2> Line Chart </h2>
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
          :description="item.description"
          :is-bottom="true"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
  import CodeView from '@/components/codeview/code';
  import DefaultLineChart from './chart.line.default';
  import FillLineChart from './chart.line.fill';
  import StackLinechart from './chart.line.stack';
  import ScatterChart from './chart.line.scatter';

  export default {
    components: {
      CodeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart.line.default.vue',
            component: DefaultLineChart,
            description: 'Line Chart는 각각의 데이터를 선으로 연결하여 추이를 시각적으로 인지하는 차트입니다.',
            isBottom: true,
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.line.fill.vue',
            component: FillLineChart,
            description: 'Line Chart의 Fill 옵션을 이용하여 각 계열 데이터의 양을 좀 더 쉽게 인지할 수 있도록 합니다.',
            isBottom: true,
            title: 'Fill',
          },
          {
            url: './guide/views/examples/chart/chart.line.stack.vue',
            component: StackLinechart,
            description: 'Stack Line Chart는 계열의 순서에 맞춰 데이터를 누적하여 각 계열의 데이터 비교를 시각적으로 판단하는데 도움을 줍니다.',
            isBottom: true,
            title: 'Stack',
          },
          {
            url: './guide/views/examples/chart/chart.line.scatter.vue',
            component: ScatterChart,
            description: 'Scatter Chart는 데이터의 분포를 시각적으로 인지하도록 합니다.',
            isBottom: true,
            title: 'Scatter',
          },
        ],
      };
    },
  };
</script>
