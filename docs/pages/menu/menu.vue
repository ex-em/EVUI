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
        title: 'Menu',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/menu/examples/default.vue',
          description: '사이트의 안내를 위한 메뉴입니다. 서브메뉴도 존재합니다.',
          descriptionEng: 'Menu that provides navigation for your website. Vertical NavMenu with sub-menus',
        }],
      };
    },
  };
</script>
