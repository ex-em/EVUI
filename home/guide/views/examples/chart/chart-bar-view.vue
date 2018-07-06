<template>
  <div>
    <div class="article-title">
      <h2> Bar Chart </h2>
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
  import DefaultBarChart from './chart.bar.default';
  import StackBarChart from './chart.bar.stack';
  import HorizontalBarChart from './chart.bar.horizontal';

  export default {
    components: {
      CodeView,
      DefaultBarChart,
      StackBarChart,
      HorizontalBarChart,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart.bar.default.vue',
            component: DefaultBarChart,
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.bar.stack.vue',
            component: StackBarChart,
            title: 'Stack',
          },
          {
            url: './guide/views/examples/chart/chart.bar.horizontal.vue',
            component: HorizontalBarChart,
            title: 'Horizontal',
          },
        ],
      };
    },
  };
</script>
