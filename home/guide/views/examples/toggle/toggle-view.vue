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
  import toggleDefault from './toggle-default';

  export default {
    components: {
      codeView,
      toggleDefault,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/toggle/toggle-default.vue',
            component: toggleDefault,
            title: 'Toggle Default',
          },
        ],
      };
    },
  };
</script>
