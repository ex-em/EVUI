<template>
  <div>
    <div class="article-title">
      <h2> Loadingmask </h2>
    </div>
    <br>
    <div
      v-for="item in componentList"
      :key="item.id"
    >
      <div class="inner-article">
        <h4># {{ item.title }}</h4>
        <code-view
          :code-url="item.url"
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
  import loadingmaskDefault from './loadingmask-default';
  import loadingmaskCustom from './loadingmask-custom';

  export default {
    components: {
      codeView,
      loadingmaskDefault,
      loadingmaskCustom,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/loadingmask/loadingmask-default.vue',
            component: loadingmaskDefault,
            description: `페이지의 일부분에서 동기화된 데이터를 기다리거나 프로세스를 렌더링하는 동안
            적절한 로딩 애니메이션은 사용자의 불안을 효과적으로 해소할 수 있습니다.`,
            descriptionEng: `When part of the page is waiting for asynchronous data or during a rendering process,
            an appropriate loading animation can effectively alleviate users' inquietude.`,
            title: 'Default',
          },
          {
            url: './guide/views/examples/loadingmask/loadingmask-custom.vue',
            component: loadingmaskCustom,
            description: '스타일 커스텀 로딩마스크 입니다.',
            title: 'Custom',
          },
        ],
      };
    },
  };
</script>
