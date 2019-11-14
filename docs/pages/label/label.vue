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
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
    <ApiView
      :url="'./docs/pages/label/api/label.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';

  export default {
    data() {
      return {
        title: 'Label',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/label/examples/default.vue',
          description: '기본적인 라벨입니다.',
        }],
      };
    },
  };
</script>
