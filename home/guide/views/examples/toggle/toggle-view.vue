<template>
  <div>
    <div class="article-title">
      <h2> Toggle </h2>
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
  import toggleDefault from './toggle-default';
  import toggleSize from './toggle-size';
  import toggleShape from './toggle-shape';
  import toggleType from './toggle-type';

  export default {
    components: {
      codeView,
    },
    data() {
      return {
        componentList: [
          {
            url: './guide/views/examples/toggle/toggle-default.vue',
            component: toggleDefault,
            description: '토글은 on-off와 같은 서로다른 두 상태를 스위칭하는 대표적인 컴포넌트입니다.',
            title: 'Default',
          },
          {
            url: './guide/views/examples/toggle/toggle-size.vue',
            component: toggleSize,
            description: '사이즈를 크게 또는 작게 설정할 수 있습니다.',
            descriptionEng: 'Set the size to large or small by custom style of toggle.',
            title: 'Size',
          },
          {
            url: './guide/views/examples/toggle/toggle-shape.vue',
            component: toggleShape,
            description: '모양을 변화시킬 수 있습니다.',
            descriptionEng: 'Set the shape to circle or square by custom style of toggle.',
            title: 'Shape',
          },
          {
            url: './guide/views/examples/toggle/toggle-type.vue',
            component: toggleType,
            description: '스위치형, 슬라이드형, 버튼형 타입을 설정할 수 있습니다.',
            title: 'Type',
          },
        ],
      };
    },
  };
</script>
