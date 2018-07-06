<template>
  <div>
    <div class="article-title">
      <h2> Timepicker </h2>
    </div>
    <br>
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
      <br>
    </div>
  </div>
</template>

<script>
  import codeView from '@/components/codeview/code';
  import timepickerDefault from './timepicker-default';
  import timepickerInit from './timepicker-init';

  export default {
    components: {
      codeView,
      timepickerDefault,
      timepickerInit,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/timepicker/timepicker-default.vue',
            component: timepickerDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/timepicker/timepicker-init.vue',
            component: timepickerInit,
            title: 'Init Value',
          },
        ],
      };
    },
  };
</script>
