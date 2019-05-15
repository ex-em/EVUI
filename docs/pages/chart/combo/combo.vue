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
  import LineBar from './examples/line.bar';
  import LineStackBar from './examples/line.stackbar';
  import StackLineBar from './examples/stackline.bar';
  import StackLineStackBar from './examples/stackline.stackbar';

  export default {
    data() {
      return {
        title: 'Combo Chart',
        components: [{
          title: 'Line-Bar',
          component: LineBar,
          url: './pages/chart/line/examples/line.bar.vue',
          description: `Line과 Bar를 조합하여 2가지 계열을 나타냅니다.
                        Bar 차트가 들어가므로 Step Axis의 TimeMode를 사용하여 구현합니다.`,
        }, {
          title: 'Line-StackBar',
          component: LineStackBar,
          url: './pages/chart/line/examples/line.stackbar.vue',
          description: 'Line과 StackBar를 조합하여 2가지 계열을 나타냅니다.',
        }, {
          title: 'StackLine-Bar',
          component: StackLineBar,
          url: './pages/chart/line/examples/stackline.bar.vue',
          description: 'StackLine과 Bar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
        }, {
          title: 'StackLine-StackBar',
          component: StackLineStackBar,
          url: './pages/chart/line/examples/stackline.stackbar.vue',
          description: 'StackLine과 StackBar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
        }],
      };
    },
  };
</script>
