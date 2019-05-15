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
  </div>
</template>

<script>
  import Default from './examples/default';
  import Custom from './examples/custom';

  export default {
    data() {
      return {
        title: 'LoadingMask',
        components: [{
          title: 'Default',
          component: Default,
          url: './pages/loadingmask/examples/default.vue',
          description: `페이지의 일부분에서 동기화된 데이터를 기다리거나 프로세스를 렌더링하는 동안
          적절한 로딩 애니메이션은 사용자의 불안을 효과적으로 해소할 수 있습니다.`,
          descriptionEng: `When part of the page is waiting for asynchronous data or during a rendering process,
          an appropriate loading animation can effectively alleviate users' inquietude.`,
        }, {
          title: 'Custom',
          component: Custom,
          url: './pages/loadingmask/examples/custom.vue',
          description: '스타일 커스텀 로딩마스크 입니다.',
        }],
      };
    },
  };
</script>
