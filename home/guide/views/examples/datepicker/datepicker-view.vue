<template>
  <div>
    <div class="article-title">
      <h2> Datepicker </h2>
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
  import datepickerDefault from './datepicker-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/datepicker/datepicker-default.vue',
            component: datepickerDefault,
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
