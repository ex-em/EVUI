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
      :url="'./pages/radio/api/radio.md'"
    />
  </div>
</template>


<script>
  import Default from './examples/default';
  import GroupDefault from './examples/group-default';

  export default {
    data() {
      return {
        title: 'Radio',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/radio/examples/default.vue',
          description: '라디오 그룹의 단일 라디오 버튼의 기능입니다. (하나 선택은 라디오의 기능이 아니므로 사용 안함) ',
        }, {
          title: 'Group Default',
          component: GroupDefault,
          url: './pages/radio/examples/group-default.vue',
          description: '라디오 그룹에 묶인 여러 개의 선택 사항 중 한 항목을 선택합니다.',
        }],
      };
    },
  };
</script>
