<template>
  <div>
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
            title: 'Default Line Chart',
          },
          {
            url: './guide/views/examples/chart/chart.line.fill.vue',
            component: FillLineChart,
            title: 'Fill Line Chart',
          },
          {
            url: './guide/views/examples/chart/chart.line.fill.vue',
            component: StackLinechart,
            title: 'Stack Line Chart',
          },
          {
            url: './guide/views/examples/chart/chart.line.scatter.vue',
            component: ScatterChart,
            title: 'Scatter Chart',
          },
        ],
      };
    },
  };
</script>
