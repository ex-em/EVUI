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
            description: '라디오 그룹의 단일 라디오 버튼의 기능입니다. (하나 선택은 라디오의 기능이 아니므로 사용 안함) ',
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
