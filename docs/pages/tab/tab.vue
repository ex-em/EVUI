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
      :url="'./pages/tab/api/tab.md'"
    />
  </div>
</template>


<script>
  import Default from './examples/default';

  export default {
    data() {
      return {
        title: 'Tab',
        components: [{
          title: 'Tab Panel',
          component: Default,
          url: './pages/tab/examples/default.vue',
          description: '',
        }],
      };
    },
  };
</script>
