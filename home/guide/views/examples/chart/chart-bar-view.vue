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
            description: `Bar Chart는 Category 기반의 데이터를 표현하는 차트로, 각 Category에 대한 Bar의 높이가 나타내는 값에 비례합니다.
                          계열이 여러개가 존재할 경우 동일한 넓이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.`,
            isBottom: true,
            title: 'Default',
          },
          {
            url: './guide/views/examples/chart/chart.bar.stack.vue',
            component: StackBarChart,
            description: 'Category 기반의 막대 데이터를 누적하여 표현합니다.',
            isBottom: true,
            title: 'Stack',
          },
          {
            url: './guide/views/examples/chart/chart.bar.horizontal.vue',
            component: HorizontalBarChart,
            description: `Horizontal Bar Chart는 각 Category에 대한 Bar의 널이가 나타내는 값에 비례합니다.
                          계열이 여러개가 존재할 경우 동일한 높이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.`,
            isBottom: true,
            title: 'Horizontal',
          },
        ],
      };
    },
  };
</script>
