<template>
  <div>
    <div class="article-title">
      <h2> Select Box </h2>
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
  import selectboxDefault from './selectbox-default';
  import selectboxMultiple from './selectbox-multiple';
  import selectboxGroup from './selectbox-group';

  export default {
    components: {
      codeView,
      selectboxDefault,
      selectboxMultiple,
      selectboxGroup,
    },
    data() {
      return {
        componentList: [
          {
            title: 'Default',
            component: selectboxDefault,
            url: './guide/views/examples/selectbox/selectbox-default.vue',
          },
          {
            title: 'Multiple',
            component: selectboxMultiple,
            url: './guide/views/examples/selectbox/selectbox-multiple.vue',
          },
          {
            title: 'Group',
            component: selectboxGroup,
            url: './guide/views/examples/selectbox/selectbox-group.vue',
          },
        ],
      };
    },
  };
</script>
