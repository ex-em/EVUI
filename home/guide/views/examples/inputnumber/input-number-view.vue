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
          :is-bottom="item.isBottom"
          :description="item.description"
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
            description: '마우스나 키보드를 이용해서 숫자를 입력할 수 있습니다.',
            title: 'Default',
          },
        ],
      };
    },
  };
</script>
