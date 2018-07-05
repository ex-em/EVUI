<template>
  <div>
    <div class="article-title">
      <h2> Radio </h2>
    </div>
    <div
      v-for="item in radioList"
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
      v-for="item in radioGroupList"
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
  import radioStatus from './radio-status';
  import radioGroupDefault from './radio-group-default';
  import radioGroupStatus from './radio-group-status';
  import radioGroupList from './radio-group-list-handling';
  import radioGroupAlign from './radio-group-align';
  import radioGroupEvent from './radio-group-event';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        radioList: [
          {
            url: './guide/views/examples/radio/radio-default.vue',
            component: radioDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/radio/radio-status.vue',
            component: radioStatus,
            title: 'Status',
          },
        ],
        radioGroupList: [
          {
            url: './guide/views/examples/radio/radio-group-default.vue',
            component: radioGroupDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/radio/radio-group-status.vue',
            component: radioGroupStatus,
            title: 'Status',
          },
          {
            url: './guide/views/examples/radio/radio-group-list-handling.vue',
            component: radioGroupList,
            title: 'List Handling',
          },
          {
            url: './guide/views/examples/radio/radio-group-align.vue',
            component: radioGroupAlign,
            title: 'Align',
          },
          {
            url: './guide/views/examples/radio/radio-group-event.vue',
            component: radioGroupEvent,
            title: 'Bind Custom Event',
          },
        ],
      };
    },
  };
</script>

<style scoped>
  .split {
    margin: 40px;
  }
</style>
