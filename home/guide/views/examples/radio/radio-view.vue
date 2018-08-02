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
            description: '라디오 그룹의 단일 라디오 버튼의 기능입니다.',
          },
          {
            url: './guide/views/examples/radio/radio-status.vue',
            component: radioStatus,
            title: 'Status',
            description: '단일 라디오 버튼이 제공하는 상태 종류 입니다.',
          },
        ],
        radioGroupList: [
          {
            url: './guide/views/examples/radio/radio-group-default.vue',
            component: radioGroupDefault,
            title: 'Default',
            description: '라디오 그룹에 묶인 여러 개의 선택 사항 중 한 항목을 선택합니다.',
          },
          {
            url: './guide/views/examples/radio/radio-group-status.vue',
            component: radioGroupStatus,
            title: 'Status',
            description: '라디오 버튼 그룹에서 제공하는 상태 종류 입니다.',
          },
          {
            url: './guide/views/examples/radio/radio-group-list-handling.vue',
            component: radioGroupList,
            title: 'List Handling',
            description: '라디오 버튼 그룹을 묶는 2가지 방법 입니다.',
          },
          {
            url: './guide/views/examples/radio/radio-group-align.vue',
            component: radioGroupAlign,
            title: 'Align',
            description: '라디오 버튼 그룹에서 제공하는 정렬 방법 입니다.',
          },
          {
            url: './guide/views/examples/radio/radio-group-event.vue',
            component: radioGroupEvent,
            title: 'Bind Custom Event',
            description: '라디오 버튼 그룹에 직접 제작한 이벤트를 추가하는 방법입니다.',
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
