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
  import tableDefault from './table-default';
  import tablePage from './table-page';
  import tableBuffer from './table-buffer';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/table/table-default.vue',
            component: tableDefault,
            title: 'Default',
          },
          {
            url: './guide/views/examples/table/table-page.vue',
            component: tablePage,
            title: 'Page',
          },
          {
            url: './guide/views/examples/table/table-buffer.vue',
            component: tableBuffer,
            title: 'Buffer(Virtual Scroll)',
          },
        ],
      };
    },
  };
</script>
