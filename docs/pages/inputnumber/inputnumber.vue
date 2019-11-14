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
        title: 'Input Number',
        components: [
          {
            title: 'Default',
            component: Default,
            url: './docs/pages/inputnumber/examples/default.vue',
            description: '마우스나 키보드를 이용해서 숫자를 입력할 수 있습니다.',
          },
        ],
      };
    },
  };
</script>
