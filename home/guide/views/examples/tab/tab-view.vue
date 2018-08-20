<template>
  <div>
    <div class="article-title">
      <h2> Tab </h2>
    </div>
    <br>
    <div
      v-for="item in tabList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :height="item.height"
          :is-bottom="item.isBottom"
          :description="item.description"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import tabDefault from './tab-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        tabList: [
          {
            url: './guide/views/examples/tab/tab-default.vue',
            component: tabDefault,
            title: 'Tab Panel',
            description: '',
          },
        ],
      };
    },
  };
</script>

<style scoped>
  .split {
    margin: 40px;
  }
</style>
