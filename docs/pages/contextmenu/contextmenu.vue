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
  </div>
</template>

<script>
  import Default from './examples/default';

  export default {
    data() {
      return {
        title: 'Context Menu',
        components: [
          {
            title: 'Default',
            component: Default,
            url: './docs/pages/contextmenu/examples/default.vue',
            description: '컨텍스트 메뉴',
          },
        ],
      };
    },
  };
</script>
