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
            url: './guide/views/examples/radio/radio-default.vue',
            component: '',
            title: 'Default',
          },
          {
            url: './guide/views/examples/radio/radio-status.vue',
            component: '',
            title: 'Status',
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
