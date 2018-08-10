<template>
  <div>
    <div class="article-title">
      <h2> Text Field </h2>
    </div>
    <br>
    <div
      v-for="item in textfieldList"
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
  import textFieldDefault from './textfield-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        textfieldList: [
          {
            url: './guide/views/examples/textfield/textfield-default.vue',
            component: textFieldDefault,
            title: 'Default',
          },
        ],
      };
    },
  };
</script>

<style scoped>
  .split {
    margin: 40px;
  }
</style>
