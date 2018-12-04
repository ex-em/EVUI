<template>
  <div>
    <div class="article-title">
      <h2> Check Box </h2>
    </div>
    <br>
    <div
      v-for="item in checkList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :height="item.height"
          :is-bottom="item.isBottom"
          :description="item.description"
        >
          <component :is="item.component"/>
        </code-view>
      </div>
      <br>
    </div>
    <div class="split"/>
    <div class="article-title">
      <h2> Check Box Group </h2>
    </div>
    <br>
    <div
      v-for="item in checkGroupList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
          :height="item.height"
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
  import checkboxDefault from './checkbox-default';
  import checkboxGroupDefault from './checkbox-group-default';
  import checkboxGroupAllCheck from './checkbox-group-all-check';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        checkList: [
          {
            url: './guide/views/examples/checkbox/checkbox-default.vue',
            component: checkboxDefault,
            title: 'Default',
            description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
          },
        ],
        checkGroupList: [
          {
            url: './guide/views/examples/checkbox/checkbox-group-default.vue',
            component: checkboxGroupDefault,
            title: 'Default',
            description: '체크 박스 그룹에 묶인 여러 개의 선택 사항 중 원하는 항목을 선택합니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-all-check.vue',
            component: checkboxGroupAllCheck,
            title: 'All Check',
            description: '체크 박스 그룹을 한꺼번에 선택합니다.',
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
