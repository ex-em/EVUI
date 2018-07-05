<template>
  <div>
    <div class="article-title">
      <h2> Radio </h2>
    </div>
    <div
      v-for="item in checkList"
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
    <div class="split"/>
    <div class="article-title">
      <h2> Radio Group </h2>
    </div>
    <div
      v-for="item in checkGroupList"
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
        checkList: [
          {
            url: './guide/views/examples/radio/radio-default.vue',
            component: radioDefault,
            title: 'Default',
          },
        ],
        checkGroupList: [
        ],
      };
    },
    methods: {
      onChange(value) {
        this.valueData = value;
      },
    },
  };
</script>

<style scoped>
  .article-title {
    color: #0055aa;
    padding: 4px 0px 8px 0px;
  }
  .split {
    margin: 40px;
  }
</style>
