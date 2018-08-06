<template>
  <div>
    <div class="article-title">
      <h2> Pie Chart </h2>
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
  import DefaultPieChart from './chart.pie.default';
  import DoughnutChart from './chart.pie.doughnut';
  // import SunburstChart from './chart.pie.sunburst';

  export default {
    components: {
      CodeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart.pie.default.vue',
            component: DefaultPieChart,
            description: `Pie Chart는 데이터의 전체 데이터를 기준으로 한 계열의 상대적 크기를 표시합니다.
                          Pie Chart는 각 Depth별로 12시 방향을 기준으로 데이터가 큰 계열의 순서에 맞춰 시계방향으로 그려집니다.`,
            isBottom: true,
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.pie.doughnut.vue',
            component: DoughnutChart,
            description: 'Doughnut Chart는 Pie Chart의 중심을 비워 내부 공간을 만듭니다.',
            isBottom: true,
            title: 'Doughnut',
          },
          // {
          //   url: './guide/views/examples/chart/chart.pie.sunburst.vue',
          //   component: SunburstChart,
          //   title: 'Sunburst',
          // },
        ],
      };
    },
  };
</script>
