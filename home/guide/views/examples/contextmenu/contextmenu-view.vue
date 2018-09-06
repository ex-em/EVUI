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
  import ContextMenuDefault from './contextmenu-default';

  export default {
    components: {
      codeView,
      ContextMenuDefault,
    },
    data() {
      return {
        title: 'Window',
        buttonComponentList: [
          {
            title: 'Default',
            component: ContextMenuDefault,
            url: './guide/views/examples/contextmenu/contextmenu-default.vue',
            description: '컨텍스트 메뉴',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
