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
        >
          <component :is="item.component"/>
        </code-view>
      </div>
    </div>
  </div>
</template>

<script>
  import '@/styles/evui.css';
  import codeView from '@/components/codeview/code';
  import radioDefault from './radio-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        visible: true,
        label: 'test',
        valueData: null,
        buttonLabel: 'visible',
        componentList: [
          {
            url: './guide/views/examples/radio/radio-default.vue',
            component: radioDefault,
            title: 'Radio Default',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
<style scoped>
  div {
    font-family: 'NanumGothic', Helvetica
  }
</style>
