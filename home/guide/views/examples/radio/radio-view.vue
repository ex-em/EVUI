<template>
  <div>
    <div class="article-title">
      <h2> Radio </h2>
    </div>
    <br>
    <div
      v-for="item in radioList"
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
      <h2> Radio Group </h2>
    </div>
    <br>
    <div
      v-for="item in radioGroupList"
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
  import radioDefault from './radio-default';
  import radioGroupDefault from './radio-group-default';

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
            description: '라디오 그룹의 단일 라디오 버튼의 기능입니다.// ' +
            '(1) radio-id(required) : HTML id를 의미합니다.// ' +
            '(2) radio-value(required) : 라디오버튼의 value와 label Text를 의미합니다.// ' +
            '(3) radio-name : 라디오버튼들의 그룹명을 의미합니다. (그룹으로 묶인 라디오 컴포넌트에서 필수)',
          },
        ],
        radioGroupList: [
          {
            url: './guide/views/examples/radio/radio-group-default.vue',
            component: radioGroupDefault,
            title: 'Default',
            description: '라디오 그룹에 묶인 여러 개의 선택 사항 중 한 항목을 선택합니다.',
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
