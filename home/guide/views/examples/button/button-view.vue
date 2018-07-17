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
  import buttonType from './button-type';
  import buttonSize from './button-size';
  import buttonShape from './button-shape';
  import buttonHighPriority from './button-high-priority';
  import buttonDisabled from './button-disabled';
  import buttonLoading from './button-loading';

  export default {
    components: {
      codeView,
      buttonType,
      buttonSize,
      buttonShape,
      buttonHighPriority,
      buttonDisabled,
      buttonLoading,
    },
    data() {
      return {
        title: 'Button',
        buttonComponentList: [
          {
            title: 'Type',
            component: buttonType,
            url: './guide/views/examples/button/button-type.vue',
          },
          {
            title: 'Size',
            component: buttonSize,
            url: './guide/views/examples/button/button-size.vue',
          },
          {
            title: 'Shape',
            component: buttonShape,
            url: './guide/views/examples/button/button-shape.vue',
          },
          {
            title: 'High Priority',
            component: buttonHighPriority,
            url: './guide/views/examples/button/button-high-priority.vue',
          },
          {
            title: 'Disabled',
            component: buttonDisabled,
            url: './guide/views/examples/button/button-disabled.vue',
          },
          {
            title: 'Loading',
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
