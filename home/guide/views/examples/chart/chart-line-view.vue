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
  import codeView from '@/components/codeview/code';
  import chartBarDefault from './chart-bar-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/chart/chart-bar-default.vue',
            component: chartBarDefault,
            title: 'Line Chart Default',
          },
        ],
      };
    },
  };
</script>
