<template>
  <div>
    <div class="article-title">
      <h2> Toggle </h2>
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
          :height="item.height"
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
  import toggleDefault from './toggle-default';
  import toggleCustom from './toggle-custom';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/toggle/toggle-default.vue',
            component: toggleDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/toggle/toggle-custom.vue',
            component: toggleCustom,
            title: 'Custom',
          },
        ],
      };
    },
  };
</script>
