<template>
  <div>
    <div class="article-title">
      <h2> Menu </h2>
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
  import menuDefault from './menu-default';

  export default {
    components: {
      codeView,
      menuDefault,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/menu/menu-default.vue',
            component: menuDefault,
            description: '사이트의 안내를 위한 메뉴입니다. 서브메뉴도 존재합니다.',
            descriptionEng: 'Menu that provides navigation for your website. Vertical NavMenu with sub-menus',
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
