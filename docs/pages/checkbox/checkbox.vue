<template>
  <div>
    <div class="article-title">
      <h1> {{ title }} </h1>
    </div>
    <br>
    <Example
      v-for="(item, index) in components"
      :key="index"
      :title="item.title"
      :description="item.description"
      :contents="item.component"
      :url="item.url"
    />
    <ApiView
      :url="'./pages/checkbox/api/checkbox.md'"
    />
  </div>
</template>

<script>
  import Default from './examples/default';
  import GroupDefault from './examples/group-default';
  import GroupAllCheck from './examples/group-all-check';

  export default {
    data() {
      return {
        title: 'CheckBox',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/checkbox/examples/default.vue',
          description: '여러 개의 선택 사항을 고르기 위한 단일 체크 박스의 기능입니다.',
        }, {
          title: 'Group Default',
          component: GroupDefault,
          url: './pages/checkbox/examples/group-default.vue',
          description: '체크 박스 그룹에 묶인 여러 개의 선택 사항 중 원하는 항목을 선택합니다.',
        }, {
          title: 'Group All Check',
          component: GroupAllCheck,
          url: './pages/checkbox/examples/group-all-check.vue',
          description: '체크 박스 그룹을 한꺼번에 선택합니다.',
        }],
      };
    },
  };
</script>

<style scoped>
  .split {
    margin: 40px;
  }
</style>
