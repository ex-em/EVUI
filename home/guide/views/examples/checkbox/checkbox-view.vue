<template>
  <div>
    <div class="article-title">
      <h2> Check Box </h2>
    </div>
    <div
      v-for="item in checkList"
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
      <h2> Check Box Group </h2>
    </div>
    <div
      v-for="item in checkGroupList"
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
  import checkboxDefault from './checkbox-default';
  import checkboxStatus from './checkbox-status';
  import checkboxEvent from './checkbox-event';
  import checkboxGroupDefault from './checkbox-group-default';
  import checkboxGroupList from './checkbox-group-list-handling';
  import checkboxGroupAlign from './checkbox-group-align';
  import checkboxGroupEvent from './checkbox-group-event';
  import checkboxGroupStatus from './checkbox-group-status';

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
        checkList: [
          {
            url: './guide/views/examples/checkbox/checkbox-default.vue',
            component: checkboxDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-status.vue',
            component: checkboxStatus,
            title: 'Status',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-event.vue',
            component: checkboxEvent,
            title: 'Bind Custom Event',
          },
        ],
        checkGroupList: [
          {
            url: './guide/views/examples/checkbox/checkbox-group-default.vue',
            component: checkboxGroupDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-status.vue',
            component: checkboxGroupStatus,
            title: 'Status',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-list-handing.vue',
            component: checkboxGroupList,
            title: 'List Handling',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-align.vue',
            component: checkboxGroupAlign,
            title: 'Align',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-event.vue',
            component: checkboxGroupEvent,
            title: 'Bind Custom Event',
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
  .article-title {
    color: #0055aa;
    padding: 4px 0px 8px 0px;
  }
  .split {
    margin: 40px;
  }
</style>
