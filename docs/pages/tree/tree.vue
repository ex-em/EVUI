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
      :url="'./docs/pages/tree/api/tree.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/tree-default';
  import CheckBox from './examples/tree-checkbox';

  export default {
    data() {
      return {
        title: 'Tree',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/tree/examples/tree-default.vue',
          description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
        }, {
          title: 'Checkbox',
          component: CheckBox,
          url: './docs/pages/tree/examples/tree-checkbox.vue',
          description: '테이블은 여러 데이터를 보여주는 기본 컴포넌트입니다.',
        }],
      };
    },
  };
</script>
