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
      :url="'./docs/pages/window/api/window.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';

  export default {
    data() {
      return {
        title: 'Window',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/window/examples/default.vue',
          description: '윈도우',
        }],
      };
    },
  };
</script>
