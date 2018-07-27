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
        checkList: [
          {
            url: './guide/views/examples/checkbox/checkbox-default.vue',
            component: checkboxDefault,
            title: 'Default',
            description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-status.vue',
            component: checkboxStatus,
            title: 'Status',
            description: '단일 체크 박스가 제공하는 상태 종류 입니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-event.vue',
            component: checkboxEvent,
            title: 'Bind Custom Event',
            description: '단일 체크 박스에 직접 제작한 이벤트를 추가하는 방법입니다.',
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
            url: './guide/views/examples/checkbox/checkbox-group-status.vue',
            component: checkboxGroupStatus,
            title: 'Status',
            description: '체크 박스 그룹에서 제공하는 상태 종류 입니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-list-handling.vue',
            component: checkboxGroupList,
            title: 'List Handling',
            description: '체크 박스 그룹을 묶는 2가지 방법 입니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-align.vue',
            component: checkboxGroupAlign,
            title: 'Align',
            description: '체크 박스 그룹에서 제공하는 정렬 방법 입니다.',
          },
          {
            url: './guide/views/examples/checkbox/checkbox-group-event.vue',
            component: checkboxGroupEvent,
            title: 'Bind Custom Event',
            description: '체크 박스 그룹에 직접 제작한 이벤트를 추가하는 방법입니다.',
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
