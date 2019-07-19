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
      :url="'./docs/pages/toggle/api/toggle.md'"
    />
  </div>
</template>
<script>
  import Default from './examples/default';
  import Size from './examples/size';
  import Shape from './examples/shape';
  import Type from './examples/type';

  export default {
    data() {
      return {
        title: 'Toggle',
        components: [{
          title: 'Default',
          component: Default,
          url: './docs/pages/toggle/examples/default.vue',
          description: '토글은 on-off와 같은 서로다른 두 상태를 스위칭하는 대표적인 컴포넌트입니다.',
        }, {
          title: 'Size',
          component: Size,
          url: './docs/pages/toggle/examples/size.vue',
          description: '사이즈를 크게 또는 작게 설정할 수 있습니다.',
          descriptionEng: 'Set the size to large or small by custom style of toggle.',
        }, {
          title: 'Shape',
          component: Shape,
          url: './docs/pages/toggle/examples/shape.vue',
          description: '모양을 변화시킬 수 있습니다.',
          descriptionEng: 'Set the shape to circle or square by custom style of toggle.',
        }, {
          title: 'Type',
          component: Type,
          url: './docs/pages/toggle/examples/type.vue',
          description: '스위치형, 슬라이드형, 버튼형 타입을 설정할 수 있습니다.',
        }],
      };
    },
  };
</script>
