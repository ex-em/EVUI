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
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.line.fill.vue',
            component: FillLineChart,
            title: 'Fill',
          },
          {
            url: './guide/views/examples/chart/chart.line.fill.vue',
            component: StackLinechart,
            title: 'Stack',
          },
          {
            url: './guide/views/examples/chart/chart.line.scatter.vue',
            component: ScatterChart,
            title: 'Scatter',
          },
        ],
      };
    },
  };
</script>
