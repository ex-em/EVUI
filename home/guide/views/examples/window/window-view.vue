<template>
  <div>
    <div class="article-title">
      <h2> {{ title }} </h2>
    </div>
    <br>
    <div
      v-for="item in buttonComponentList"
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
  import WindowDefault from './window-default';

  export default {
    components: {
      codeView,
      WindowDefault,
    },
    data() {
      return {
        title: 'Window',
        buttonComponentList: [
          {
            title: 'Default',
            component: WindowDefault,
            url: './guide/views/examples/window/window-default.vue',
            description: '윈도우',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
