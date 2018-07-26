<template>
  <div>
    <div class="article-title">
      <h2> Input Number </h2>
    </div>
    <br>
    <div
      v-for="item in inputList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :description="item.description"
          :is-bottom="true"
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
  import inputNumberDefault from './input-number-default';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        inputList: [
          {
            url: './guide/views/examples/inputnumber/input-number-default.vue',
            component: inputNumberDefault,
            description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
                          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                          culpa qui officia deserunt mollit anim id est laborum.`,
            isBottom: true,
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
