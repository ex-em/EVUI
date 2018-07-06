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
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.pie.doughnut.vue',
            component: DoughnutChart,
            title: 'Doughnut',
          },
        ],
      };
    },
  };
</script>
