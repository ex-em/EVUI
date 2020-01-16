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
  import Default from './examples/default';
  import Stack from './examples/stack';
  import Horizontal from './examples/horizontal';
  import Time from './examples/time';
  import Range from './examples/range';

  export default {
    data() {
      return {
        title: 'Bar Chart',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/chart/bar/examples/default.vue',
          description: `Bar Chart는 Category 기반의 데이터를 표현하는 차트로, 각 Category에 대한 Bar의 높이가 나타내는 값에 비례합니다.
                        계열이 여러개가 존재할 경우 동일한 넓이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.`,
        }, {
          title: 'Stack',
          component: Stack,
          url: './docs/pages/chart/bar/examples/stack.vue',
          description: 'Category 기반의 막대 데이터를 누적하여 표현합니다.',
        }, {
          title: 'Horizontal',
          component: Horizontal,
          url: './docs/pages/chart/bar/examples/horizontal.vue',
          description: `Horizontal Bar Chart는 각 Category에 대한 Bar의 널이가 나타내는 값에 비례합니다.
                        계열이 여러개가 존재할 경우 동일한 높이의 Bar를 생성하여 Category 기준으로 각 계열을 표현합니다.`,
        }, {
          title: 'Time',
          component: Time,
          url: './docs/pages/chart/bar/examples/time.vue',
          description: 'RealTime 처리를 위한 차트입니다.',
        }, {
          title: 'Range',
          component: Range,
          url: './docs/pages/chart/bar/examples/range.vue',
          description: 'RealTime 처리를 위한 차트입니다.',
        }],
      };
    },
  };
</script>
