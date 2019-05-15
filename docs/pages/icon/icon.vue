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
        title: 'Icon',
        components: [
          {
            title: 'Default',
            component: Default,
            url: './docs/pages/icon/examples/default.vue',
            description: 'ei [ei-s, ei-m, ei-l] ei-check-on 이런 식으로 사용하면 됩니다.',
          },
        ],
      };
    },
  };
</script>
