<template>
  <div>
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
            title: 'Menu Default',
            height: 500,
          },
        ],
      };
    },
  };
</script>
