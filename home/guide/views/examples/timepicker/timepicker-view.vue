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
            title: 'Timepicker Default',
            height: 400,
          },
          {
            url: './guide/views/examples/timepicker/timepicker-init.vue',
            component: timepickerInit,
            title: 'Timepicker Setting Init Values',
            height: 400,
          },
        ],
      };
    },
  };
</script>
