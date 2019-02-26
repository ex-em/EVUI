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
  import LineBarCombo from './chart.combo.line.bar';
  import LineStackBarCombo from './chart.combo.line.stackbar';
  import StackLineBarCombo from './chart.combo.stackline.bar';
  import StackLineStackBarCombo from './chart.combo.stackline.stackbar';

  export default {
    components: {
      CodeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart.combo.line.bar.vue',
            component: LineBarCombo,
            description: `Line과 Bar를 조합하여 2가지 계열을 나타냅니다.
                          Bar 차트가 들어가므로 Step Axis의 TimeMode를 사용하여 구현합니다.`,
            isBottom: true,
            title: 'Line-Bar',
          },
          {
            url: './guide/views/examples/chart/chart.combo.line.stackbar.vue',
            component: LineStackBarCombo,
            description: 'Line과 StackBar를 조합하여 2가지 계열을 나타냅니다.',
            isBottom: true,
            title: 'Line-StackBar',
          },
          {
            url: './guide/views/examples/chart/chart.combo.stackline.bar.vue',
            component: StackLineBarCombo,
            description: 'StackLine과 Bar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
            isBottom: true,
            title: 'StackLine-Bar',
          },
          {
            url: './guide/views/examples/chart/chart.combo.stackline.stackbar.vue',
            component: StackLineStackBarCombo,
            description: 'StackLine과 StackBar를 조합하여 2가지 계열을 나타냅니다. Stack-Line은 null을 받지 않으므로 0으로 기본데이터 세팅이 필요합니다.',
            isBottom: true,
            title: 'StackLine-StackBar',
          },
        ],
      };
    },
  };
</script>
