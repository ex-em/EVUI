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
          :height="item.height"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import chartBarDefault from './chart-bar-default';
  import chartBarStackDefault from './chart-bar-stack-default';

  export default {
    components: {
      codeView,
      chartBarDefault,
      chartBarStackDefault,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart-bar-default.vue',
            component: chartBarDefault,
            title: 'Bar Chart Default',
            height: 500,
          },
          {
            url: './guide/views/examples/chart/chart-bar-stack-default.vue',
            component: chartBarStackDefault,
            title: 'Stack Bar Chart',
            height: 500,
          },
        ],
      };
    },
  };
</script>
