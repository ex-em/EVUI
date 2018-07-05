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
        inputList: [
          {
            url: './guide/views/examples/your-source-code',
            component: 'your-imported-component-object',
            title: 'Default',
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
