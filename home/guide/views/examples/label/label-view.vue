<template>
  <div>
    <div class="article-title">
      <h2> Label </h2>
    </div>
    <br>
    <div
      v-for="item in inputList"
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
      <br>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import labelDefault from './label-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        inputList: [
          {
            url: './guide/views/examples/label/label-default.vue',
            component: labelDefault,
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
