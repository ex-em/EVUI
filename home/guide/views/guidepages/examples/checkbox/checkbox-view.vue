<template>
  <div>
    <div
      v-for="item in componentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h5># {{ item.title }}</h5>
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
  import '@/styles/evui.css';
  import codeView from '@/components/codeview/code';
  import checkboxDefault from './checkbox-default';
  import checkboxAdvanced from './checkbox-advanced';
  import checkboxGroupDefault from './checkbox-group-default';
  import checkboxGroupAdvanced from './checkbox-group-advanced';

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
            url: './guide/views/guidepages/examples/checkbox/checkbox-default.vue',
            component: checkboxDefault,
            title: 'Check Box Default',
          },
          {
            url: './guide/views/guidepages/examples/checkbox/checkbox-advanced.vue',
            component: checkboxAdvanced,
            title: 'Check Box Status & Custom Bind Event',
          },
          {
            url: './guide/views/guidepages/examples/checkbox/checkbox-group-default.vue',
            component: checkboxGroupDefault,
            title: 'Check Box Group Default',
          },
          {
            url: './guide/views/guidepages/examples/checkbox/checkbox-group-advanced.vue',
            component: checkboxGroupAdvanced,
            title: 'Check Box Group List Handling & Custom Bind Event',
            height: 500,
          },
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
  h5 {
    margin: 10px;
  }

  div {
    font-family: 'NanumGothic', Helvetica
  }

  .inner-article {
    margin: 10px;
  }
</style>
