<template>
  <div>
    <div class="article-title">
      <h2> Input Number </h2>
    </div>
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
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import inputNumberDefault from './input-number-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        inputList: [
          {
            url: './guide/views/examples/inputnumber/input-number-default.vue',
            component: inputNumberDefault,
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
