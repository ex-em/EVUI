<template>
  <div>
    <div class="article-title">
      <h2> Icon </h2>
    </div>
    <br>
    <div
      v-for="item in componentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
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
  import iconDefault from './icon-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/icon/icon-default.vue',
            component: iconDefault,
            description: 'ei [ei-s, ei-m, ei-l] ei-check-on 이런 식으로 사용하면 됩니다.',
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
