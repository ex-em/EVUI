<template>
  <div>
    <div class="article-title">
      <h2> {{ title }} </h2>
    </div>
    <br>
    <div
      v-for="item in buttonComponentList"
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
  import buttonCustom from './button-custom';
  import buttonPrimary from './button-primary';
  import buttonCircle from './button-circle';
  import buttonDisabled from './button-disabled';
  import buttonText from './button-text';
  import buttonLoading from './button-loading';

  export default {
    components: {
      codeView,
      buttonCustom,
      buttonPrimary,
      buttonCircle,
      buttonDisabled,
      buttonText,
      buttonLoading,
    },
    data() {
      return {
        title: 'Button',
        buttonComponentList: [
          {
            title: 'Custom Button',
            component: buttonCustom,
            url: './guide/views/examples/button/button-custom.vue',
          },
          {
            title: 'Primary Button',
            component: buttonPrimary,
            url: './guide/views/examples/button/button-primary.vue',
          },
          {
            title: 'Circle Button',
            component: buttonCircle,
            url: './guide/views/examples/button/button-circle.vue',
          },
          {
            title: 'Disabled Button',
            component: buttonDisabled,
            url: './guide/views/examples/button/button-disabled.vue',
          },
          {
            title: 'Text Button',
            component: buttonText,
            url: './guide/views/examples/button/button-text.vue',
          },
          {
            title: 'Loading Button',
            component: buttonLoading,
            url: './guide/views/examples/button/button-loading.vue',
          },
        ],
      };
    },
    methods: {
    },
  };
</script>
