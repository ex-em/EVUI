<template>
  <div>
    <div class="article-title">
      <h2> {{ title }} </h2>
    </div>
    <div
      v-for="item in buttonComponentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        title: 'Button',
        buttonComponentList: [
          {
            url: './guide/views/examples/your-source-code',
            component: 'your-imported-component-object',
            title: 'Default',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
