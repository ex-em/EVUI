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
  import loadingmaskDefault from './loadingmask-default';
  import loadingmaskCustom from './loadingmask-custom';

  export default {
    components: {
      codeView,
      loadingmaskDefault,
      loadingmaskCustom,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/loadingmask/loadingmask-default.vue',
            component: loadingmaskDefault,
            title: 'Loadingmask Default',
          },
          {
            url: './guide/views/examples/loadingmask/loadingmask-custom.vue',
            component: loadingmaskCustom,
            title: 'Loadingmask Custom Setting',
          },
        ],
      };
    },
  };
</script>
