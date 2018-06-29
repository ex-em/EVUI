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
            url: './guide/views/examples/checkbox/checkbox-default.vue',
            component: checkboxDefault,
            title: 'Check Box Default',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-advanced.vue',
            component: checkboxAdvanced,
            title: 'Check Box Status & Custom Bind Event',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-default.vue',
            component: checkboxGroupDefault,
            title: 'Check Box Group Default',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-advanced.vue',
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
  div {
    font-family: 'NanumGothic', Helvetica
  }
</style>
